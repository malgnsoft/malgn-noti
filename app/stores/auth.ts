/**
 * 인증·테넌트 상태 (Pinia).
 *
 * 백엔드 `malgn-noti-api`의 `/auth/signup`·`/auth/login`·`/me`와 연동.
 * 토큰은 `useAuthToken()`(쿠키)에 저장, 본 스토어는 사용자·고객사 메모리.
 */
import { defineStore } from 'pinia'

export interface AuthUser {
  id: number
  loginid: string
  email: string | null
  name: string | null
  phone: string | null
  birthdate?: string | null
  gender?: string | null
  nationalInfo?: string | null
  mobileCo?: string | null
  role: 'owner' | 'admin' | 'member'
  memberType?: string | null
  joinState: string
  status: number
}

export interface AuthCompany {
  id: number
  name: string
  companyType?: 'corp' | 'sole' | 'personal' | null
  approvalState?: 'pending' | 'reviewing' | 'approved' | 'rejected'
  rejectedReason?: string | null
  bizNo?: string | null
  bizType?: string | null
  ceoName?: string | null
  upTae?: string | null
  upJong?: string | null
  address?: string | null
  companyPhone?: string | null
  billingEmail?: string | null
  creditBalance: number | string
  adReceive?: 'agree' | 'reject'
  status: number
}

interface AuthState {
  user: AuthUser | null
  tenant: AuthCompany | null
}

interface SignupPayload {
  companyName: string
  companyType?: 'corp' | 'sole' | 'personal'
  loginid: string
  password: string
  name?: string
  email?: string
  phone?: string
  niceSession?: string
}

interface LoginPayload {
  companyId: number
  loginid: string
  password: string
}

interface MeResponse {
  data: {
    user: AuthUser
    company: AuthCompany
    ctxRole: AuthUser['role']
  }
}

interface AuthResponse {
  data: {
    user: { id: number, loginid: string, name: string | null, role: AuthUser['role'] }
    company: { id: number, name?: string }
    token: string
  }
}

function hydrateFromAuth(state: AuthState, res: AuthResponse, companyNameHint?: string) {
  useAuthToken().value = res.data.token
  useLastCompanyId().value = res.data.company.id
  state.user = {
    id: res.data.user.id,
    loginid: res.data.user.loginid,
    email: null,
    name: res.data.user.name,
    phone: null,
    role: res.data.user.role,
    joinState: 'joined',
    status: 1,
  }
  state.tenant = {
    id: res.data.company.id,
    name: res.data.company.name ?? companyNameHint ?? '',
    creditBalance: 0,
    status: 1,
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    tenant: null,
  }),
  getters: {
    isAuthed: (s): boolean => s.user !== null,
    creditBalance: (s): number => Number(s.tenant?.creditBalance ?? 0),
  },
  actions: {
    /** 회원가입 — 성공 시 토큰 저장 + 사용자/고객사 메모리 채움. */
    async signup(payload: SignupPayload) {
      const api = useApi()
      const res = await api<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: payload,
      })
      hydrateFromAuth(this.$state, res, payload.companyName)
    },

    /** 로그인 — 성공 시 토큰 저장 + /me로 풀 컨텍스트 페치. */
    async login(payload: LoginPayload) {
      const api = useApi()
      const res = await api<AuthResponse>('/auth/login', {
        method: 'POST',
        body: payload,
      })
      hydrateFromAuth(this.$state, res)
      await this.fetchMe()
    },

    /**
     * 이메일·아이디로 직접 로그인.
     * `loginid`가 전역 UNIQUE이므로 항상 단일 매치 → 토큰 발급 + /me 페치.
     */
    async loginByEmail(payload: { email: string, password: string }) {
      const api = useApi()
      const res = await api<AuthResponse>('/auth/login-by-email', {
        method: 'POST',
        body: payload,
      })
      hydrateFromAuth(this.$state, res)
      await this.fetchMe()
    },

    /** 토큰 쿠키가 있을 때 사용자/고객사 풀 컨텍스트 페치. */
    async fetchMe(): Promise<boolean> {
      const token = useAuthToken().value
      if (!token) return false
      try {
        const api = useApi()
        const res = await api<MeResponse>('/me')
        this.user = res.data.user
        this.tenant = res.data.company
        useLastCompanyId().value = res.data.company.id
        return true
      }
      catch {
        useAuthToken().value = null
        this.user = null
        this.tenant = null
        return false
      }
    },

    /** 사용자 본인 정보 변경 (name, phone). 성공 시 user/tenant 갱신. */
    async updateMe(patch: { name?: string, phone?: string }) {
      const api = useApi()
      const res = await api<MeResponse>('/me', { method: 'PATCH', body: patch })
      this.user = res.data.user
      this.tenant = res.data.company
    },

    /** 회사 정보 변경 (companyPhone, billingEmail, adReceive). owner/admin만. */
    async updateCompany(patch: { companyPhone?: string, billingEmail?: string, adReceive?: 'agree' | 'reject' }) {
      const api = useApi()
      const res = await api<MeResponse>('/me/company', { method: 'PATCH', body: patch })
      this.user = res.data.user
      this.tenant = res.data.company
    },

    /**
     * 서비스 담당자 이메일 변경 — 새 이메일에 발송된 OTP 코드 + 본인 비밀번호 검증.
     * 성공 시 user.email + user.loginid 모두 newEmail로 변경되고, 다음 로그인부터 새 이메일 사용.
     * (현재 발급된 JWT는 sub=userId라 즉시 invalidate되지 않음 — 토큰 재발급 정책은 후속.)
     */
    async changeEmail(payload: { newEmail: string, code: string, password: string }) {
      const api = useApi()
      const res = await api<MeResponse>('/me/email-change', { method: 'POST', body: payload })
      this.user = res.data.user
      this.tenant = res.data.company
    },

    /** 로그아웃 — 토큰 삭제 + 메모리 클리어 + /login 이동. */
    async logout() {
      useAuthToken().value = null
      this.user = null
      this.tenant = null
      await navigateTo('/login')
    },
  },
})
