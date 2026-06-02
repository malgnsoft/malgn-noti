<template>
  <UApp :locale="ko" :toaster="toasterConfig">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { ko } from '@nuxt/ui/locale'

const toasterConfig = {
  position: 'bottom-left' as const,
  expand: true,
  duration: 5000,
}
</script>
