/**
 * 멤버 최초 로그인 온보딩 게이트 — 글로벌 라우트 가드.
 *
 * owner가 추가한 멤버는 `joinState='invited'`(임시비번) 상태로 시작한다.
 * `joinState !== 'joined'` 인 사용자가 어떤 페이지에 진입하든 **`/onboarding`**
 * (약관 동의 + 회원정보 + 비밀번호 변경)로 강제 리다이렉트한다.
 *
 * 우선순위: approval(사업자 승인) 게이트보다 온보딩이 먼저 — approval.global.ts가
 * joinState!=='joined'일 때 조기 통과하도록 보강되어 충돌하지 않는다.
 *
 * SSR/CSR 호환: store 미하이드레이트 시점에는 user가 비어 joinState를 알 수 없다.
 * 그 경우 통과시키고(아래 `!js` 분기), 클라이언트 플러그인이 `/me`로 hydrate한 뒤
 * 재진입 시 가드가 작동한다(approval.global.ts와 동일한 관용).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.auth === false) return

  const auth = useAuthStore()
  const js = auth.user?.joinState
  // 미hydrate(토큰만 있고 user 비어있음) → 통과, hydrate 후 재진입 시 작동
  if (!js) return
  if (js === 'joined') return

  // 온보딩 화면 자체는 허용(리다이렉트 루프 방지)
  if (to.path === '/onboarding' || to.path.startsWith('/onboarding/')) return

  return navigateTo('/onboarding')
})
