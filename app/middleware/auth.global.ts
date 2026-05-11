export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.auth === false) return

  // 개발 단계 스텁: 실제 인증 검사 전까지 통과시킴.
  // TODO: useAuthStore() 또는 쿠키 기반 세션 검사로 교체.
  const isAuthed = true

  if (!isAuthed) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
