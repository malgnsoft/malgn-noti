/**
 * 클라이언트 인증 부트스트랩.
 *
 * 페이지 첫 진입 시(또는 새로고침 시) 토큰 쿠키가 있고 스토어가 비어 있으면
 * `/me`를 호출해 사용자/고객사 컨텍스트를 채운다. 토큰이 만료/위조된 경우
 * fetchMe가 토큰을 정리하고 false를 반환 — 다음 라우트 가드에서 `/login`으로 리다이렉트.
 *
 * 미들웨어가 아니라 플러그인으로 둔 이유: Pinia action 안에서 `useCookie()`를
 * 호출하면 SSR 미들웨어 컨텍스트가 끊겨 "composable was called outside of …" 에러가
 * 발생함. 클라이언트 부트스트랩 1회만 fetchMe를 돌리는 게 안전.
 */
export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  const token = useAuthToken().value
  if (token && !auth.user) {
    await auth.fetchMe()
  }
})
