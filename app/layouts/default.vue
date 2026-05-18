<template>
  <div class="layout-default">
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
}
.layout-main {
  flex: 1;
  width: 100%;
}
</style>
