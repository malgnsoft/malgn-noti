/**
 * malgn-noti-api 호출용 $fetch 래퍼.
 *
 * - `NUXT_PUBLIC_API_BASE_URL` 환경변수로 베이스 URL 주입.
 * - `auth-token` 쿠키가 있으면 `Authorization: Bearer` 자동 첨부.
 * - 401 응답 시 토큰·사용자 상태 초기화 후 `/login`으로 이동.
 *
 * 토큰은 백엔드 응답 본문에 담겨 오므로(Set-Cookie 미사용) — HttpOnly 아님.
 * 향후 백엔드가 Set-Cookie + SameSite=Strict를 지원하면 그쪽으로 이관.
 */

const TOKEN_COOKIE = 'auth-token'
const LAST_COMPANY_COOKIE = 'last-company-id'

export function useAuthToken() {
  return useCookie<string | null>(TOKEN_COOKIE, {
    maxAge: 60 * 60 * 24 * 7, // 7일 (JWT TTL과 일치)
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    default: () => null,
  })
}

export function useLastCompanyId() {
  return useCookie<number | null>(LAST_COMPANY_COOKIE, {
    maxAge: 60 * 60 * 24 * 365, // 1년
    sameSite: 'lax',
    secure: import.meta.env.PROD,
    default: () => null,
  })
}

function createApiClient() {
  const config = useRuntimeConfig()

  return $fetch.create({
    baseURL: config.public.apiBaseUrl,
    retry: 0,
    onRequest({ options }) {
      options.headers = new Headers(options.headers)
      if (!options.headers.has('Accept')) {
        options.headers.set('Accept', 'application/json')
      }
      const token = useAuthToken().value
      if (token && !options.headers.has('Authorization')) {
        options.headers.set('Authorization', `Bearer ${token}`)
      }
    },
    onResponseError({ response }) {
      if (response?.status === 401 && import.meta.client) {
        useAuthToken().value = null
        const auth = useAuthStore()
        auth.user = null
        auth.tenant = null
        navigateTo('/login')
      }
    },
  })
}

let _apiClient: ReturnType<typeof createApiClient> | undefined

export function useApi() {
  if (!_apiClient) _apiClient = createApiClient()
  return _apiClient
}
