<template>
  <div class="layout-default">
    <AppGnb />
    <main class="page-content">
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
}

.page-content {
  flex: 1;
  width: 100%;
}
</style>
