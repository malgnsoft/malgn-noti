<template>
  <div class="layout-default">
    <AppApprovalBanner />
    <AppGnb />
    <main class="layout-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--paper);
  /* 가로 오버플로(넓은 표·미리보기 등)가 본문만 넓혀 헤더/푸터와
     어긋나는 것 방지. clip은 스크롤 컨테이너를 만들지 않아 sticky 유지. */
  overflow-x: clip;
}
.layout-main {
  flex: 1;
  width: 100%;
  min-width: 0;
}
</style>
