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
  /** 광고 수신 상태를 마지막으로 변경한 일시 (서버 ISO 문자열). 한 번도 변경한 적이 없으면 null. */
  adReceiveAt?: string | null
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

export type TwoFactorMethod = 'email' | 'sms'

/**
 * 보안로그인(2단계 인증) 챌린지 — 백엔드 계약 정본.
 * 2FA가 켜진 계정이 1차(아이디·비번) 인증을 통과하면 백엔드가 토큰 대신
 * 이 페이로드를 내려준다. `pendingToken`(stage='2fa', 수명 10분)은 **body로만** 보관·전달하며
 * Authorization 헤더로는 거부된다. 이 토큰으로 2차 verify를 호출해야 정식 토큰이 발급된다.
 */
export interface TwoFactorChallenge {
  twoFactorRequired: true
  pendingToken: string
  method: TwoFactorMethod
  sentTo: string
  expiresAt: string
  /** 개발(mock) 모드에서만 노출되는 인증코드. */
  mockCode?: string
}

interface TwoFactorChallengeResponse {
  data: TwoFactorChallenge
}

/** 2FA 코드 재발송 응답. pendingToken 수명은 연장되지 않는다. */
export interface TwoFactorResend {
  sent: true
  method: TwoFactorMethod
  sentTo: string
  expiresAt: string
  mockCode?: string
}

/** loginByEmail 결과 — 즉시 로그인 완료(false) 또는 2FA 챌린지 필요. */
export type LoginResult = { twoFactorRequired: false } | TwoFactorChallenge

function isTwoFactorChallenge(data: AuthResponse['data'] | TwoFactorChallenge): data is TwoFactorChallenge {
  // token 부재 + twoFactorRequired 마커로 분기.
  return (data as TwoFactorChallenge).twoFactorRequired === true
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

    /**
     * 로그인 — 성공 시 토큰 저장 + /me로 풀 컨텍스트 페치.
     * loginByEmail과 동일하게 2FA 챌린지를 가드한다(챌린지면 hydrate하지 않고 반환).
     */
    async login(payload: LoginPayload): Promise<LoginResult> {
      const api = useApi()
      const res = await api<AuthResponse | TwoFactorChallengeResponse>('/auth/login', {
        method: 'POST',
        body: payload,
      })
      if (isTwoFactorChallenge(res.data)) {
        return res.data
      }
      hydrateFromAuth(this.$state, res as AuthResponse)
      await this.fetchMe()
      return { twoFactorRequired: false }
    },

    /**
     * 이메일·아이디로 직접 로그인.
     * `loginid`가 전역 UNIQUE이므로 항상 단일 매치 → 토큰 발급 + /me 페치.
     *
     * 2FA가 켜진 계정이면 토큰 대신 {@link TwoFactorChallenge}가 내려온다 — 이 경우
     * 하이드레이트하지 않고 챌린지를 그대로 반환해 호출부가 /login/security로 보낸다.
     * 백엔드가 2FA를 내려주지 않으면 항상 `{ twoFactorRequired: false }` → 기존 동작 그대로.
     */
    async loginByEmail(payload: { email: string, password: string }): Promise<LoginResult> {
      const api = useApi()
      const res = await api<AuthResponse | TwoFactorChallengeResponse>('/auth/login-by-email', {
        method: 'POST',
        body: payload,
      })
      if (isTwoFactorChallenge(res.data)) {
        return res.data
      }
      hydrateFromAuth(this.$state, res as AuthResponse)
      await this.fetchMe()
      return { twoFactorRequired: false }
    },

    /**
     * 보안로그인 2차 코드 검증 — 성공 시 정식 토큰 발급 + /me 페치로 로그인 완료.
     * pendingToken 은 body로 전달한다(Authorization 헤더로는 거부됨). 실패 시 401.
     */
    async verifyTwoFactor(payload: { pendingToken: string, code: string }) {
      const api = useApi()
      const res = await api<AuthResponse>('/auth/2fa/verify', {
        method: 'POST',
        body: payload,
      })
      hydrateFromAuth(this.$state, res)
      await this.fetchMe()
    },

    /**
     * 보안로그인 2차 코드 재발송. pendingToken 수명은 연장되지 않으며,
     * 응답의 expiresAt(만료)·method/sentTo(재안내)·mockCode(개발)를 호출부가 활용한다.
     */
    async resendTwoFactor(payload: { pendingToken: string }): Promise<TwoFactorResend> {
      const api = useApi()
      const res = await api<{ data: TwoFactorResend }>('/auth/2fa/resend', {
        method: 'POST',
        body: payload,
      })
      return res.data
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
     * **user.email 만** 변경된다. loginid 는 가입 시 식별자로 고정되어 그대로 유지 —
     * 즉 다음 로그인 아이디는 변하지 않고, 알림·연락처용 이메일만 새 주소로 교체된다.
     */
    async changeEmail(payload: { newEmail: string, code: string, password: string }) {
      const api = useApi()
      const res = await api<MeResponse>('/me/email-change', { method: 'POST', body: payload })
      this.user = res.data.user
      this.tenant = res.data.company
    },

    /**
     * 로그인 비밀번호 변경 — 현재 비밀번호 검증 후 새 비밀번호로 교체.
     * 본인 인증된 self-service 변경이므로 `/me/password`(인증 컨텍스트)로 호출한다.
     * email 변경의 `/me/email-change`와 동일 계열. 토큰/세션은 그대로 유지된다.
     * TODO(api): 백엔드 `POST /me/password` 신설 필요 (현재 미존재 — 호출부만 선반영).
     */
    async changePassword(payload: { currentPassword: string, newPassword: string }) {
      const api = useApi()
      await api('/me/password', { method: 'POST', body: payload })
    },

    /**
     * 회원 탈퇴 — 본인 계정을 비활성(soft-delete)으로 전환한다.
     * 데이터 모델 규약상 백엔드는 status=-1(탈퇴)로 천이(하드 삭제 아님).
     * 성공 시 로그아웃과 동일하게 토큰·메모리를 비우고 /login으로 이동한다.
     * 영구·복구불가 액션이므로 본인 비밀번호 재인증을 필수로 동반한다(백엔드 verify).
     * TODO(api): 백엔드 `POST /me/withdraw` 신설 필요 (현재 미존재 — 호출부만 선반영).
     */
    async withdraw(payload: { password: string, reason?: string }) {
      const api = useApi()
      await api('/me/withdraw', { method: 'POST', body: payload })
      useAuthToken().value = null
      this.user = null
      this.tenant = null
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
