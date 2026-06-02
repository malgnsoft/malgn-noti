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
  role: 'owner' | 'admin' | 'member'
  joinState: string
  status: number
}

export interface AuthCompany {
  id: number
  name: string
  creditBalance: number | string
  status: number
}

interface AuthState {
  user: AuthUser | null
  tenant: AuthCompany | null
}

interface SignupPayload {
  companyName: string
  loginid: string
  password: string
  name?: string
  email?: string
  phone?: string
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
     * 이메일·아이디로 직접 로그인 — companyId UX 개선.
     *
     * 반환:
     *   - `null`: 단일 매치, 로그인 완료(토큰 저장 + /me 페치 끝)
     *   - `Company[]`: 복수 매치, 호출자가 회사 선택 → login() 재호출 필요
     */
    async loginByEmail(payload: { email: string, password: string }): Promise<{ id: number, name: string }[] | null> {
      const api = useApi()
      const res = await api<{ data: AuthResponse['data'] | { multipleCompanies: true, companies: { id: number, name: string }[] } }>(
        '/auth/login-by-email',
        { method: 'POST', body: payload },
      )
      if ('multipleCompanies' in res.data && res.data.multipleCompanies) {
        return res.data.companies
      }
      hydrateFromAuth(this.$state, res as AuthResponse)
      await this.fetchMe()
      return null
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

    /** 로그아웃 — 토큰 삭제 + 메모리 클리어 + /login 이동. */
    async logout() {
      useAuthToken().value = null
      this.user = null
      this.tenant = null
      await navigateTo('/login')
    },
  },
})
