<template>
  <div class="auth-shell">
    <NuxtLink to="/home" class="auth-logo">
      <span class="logo-icon"><UIcon name="i-lucide-zap" class="text-base" /></span>
      <span>맑은 메시징</span>
    </NuxtLink>
    <div class="auth-card">
      <slot />
    </div>
    <div class="auth-foot">
      © 2026 Malgn Soft Inc.
    </div>
  </div>
</template>
