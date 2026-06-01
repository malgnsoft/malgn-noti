/**
 * 글로벌 인증 가드.
 *
 * - `meta.auth === false`인 라우트는 토큰 검사 없이 통과.
 * - 토큰 쿠키가 없으면 `/login`으로 리다이렉트(원래 경로는 `?redirect`로 보존).
 * - 토큰 쿠키가 있으면 일단 통과 — 실제 `/me` 검증은 클라이언트 플러그인(`plugins/auth.client.ts`)에서 수행.
 *   (Pinia action 내부 `useCookie` 호출이 SSR 컨텍스트를 잃어 SSR에서 fetchMe 직접 호출 불가)
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.auth === false) return

  const token = useAuthToken().value
  if (!token) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
