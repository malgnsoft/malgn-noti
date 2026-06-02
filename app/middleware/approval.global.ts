/**
 * 사업자등록증 심사 승인 게이트 — 글로벌 라우트 가드.
 *
 * 회사 `approvalState !== 'approved'` 인 사용자가 차단 페이지에 진입하면
 * `/account/settings` (회원 정보 화면)로 리다이렉트.
 *
 * 허용 페이지:
 *   - 인증 라우트(`meta.auth === false`)는 가드 미적용
 *   - `/account/*` — 회원 정보 화면(승인 정보·재제출 안내)
 *   - `/home` — 대시보드(승인 안내 카드 노출)
 *   - `/help`, `/guide`, `/wbs`, `/inquiry`, `/account/inquiry` — 도움말·문의 등
 *   - 그 외 모든 라우트(`/send`, `/history`, `/contacts`, `/sender`, `/manage`,
 *     `/campaign`, `/charge` 등)는 차단 → `/account/settings`로 이동
 *
 * SSR/CSR 호환: store 미하이드레이트 시점에는 토큰만 있고 user/tenant는 비어 있을 수 있음.
 * 그 경우 가드는 통과시키고 클라이언트 플러그인이 hydrate한 뒤 재진입 시 작동.
 */
const ALLOWED_PREFIXES = ['/account', '/home', '/help', '/guide', '/wbs', '/inquiry']

function isAllowed(path: string): boolean {
  return ALLOWED_PREFIXES.some(p => path === p || path.startsWith(`${p}/`))
}

export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.auth === false) return

  const auth = useAuthStore()
  const state = auth.tenant?.approvalState
  // 미hydrate면 통과 — 클라이언트 hydrate 후 재진입 시 작동
  if (!state || state === 'approved') return

  if (isAllowed(to.path)) return

  // 차단 → /account/settings로 리다이렉트
  return navigateTo('/account/settings')
})
