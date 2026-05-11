<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '네트워크 오류' })
</script>

<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="text-center max-w-md">
      <UIcon name="i-lucide-wifi-off" class="text-6xl text-warning-500 mb-3" />
      <h1 class="text-xl font-bold mb-2">네트워크 연결을 확인해 주세요</h1>
      <p class="text-sm text-neutral-500 mb-6">
        서버에 연결할 수 없습니다. 네트워크 상태를 확인 후 다시 시도해 주세요.
      </p>
      <UButton icon="i-lucide-refresh-cw" @click="$router.go(0)">다시 시도</UButton>
    </div>
  </div>
</template>
