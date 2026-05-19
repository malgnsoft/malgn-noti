<template>
  <div class="auth-shell">
    <NuxtLink to="/home" class="auth-logo">
      <span class="logo-icon"><AppLogoMark :size="16" /></span>
      <span><strong style="font-weight: 700; color: var(--ink-900)">맑은</strong><span style="font-weight: 400; color: var(--ink-400)">message</span></span>
    </NuxtLink>
    <div class="auth-card">
      <slot />
    </div>
    <div class="auth-foot">
      © 2026 Malgn Soft Inc.
    </div>
  </div>
</template>
