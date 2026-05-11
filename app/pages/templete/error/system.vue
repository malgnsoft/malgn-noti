<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '시스템 오류' })
</script>

<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="text-center max-w-md">
      <UIcon name="i-lucide-server-crash" class="text-6xl text-error-500 mb-3" />
      <h1 class="text-xl font-bold mb-2">시스템 오류가 발생했습니다</h1>
      <p class="text-sm text-neutral-500 mb-6">
        일시적인 시스템 오류로 요청을 처리할 수 없습니다.<br>
        잠시 후 다시 시도해 주세요.
      </p>
      <UButton to="/home" icon="i-lucide-home">홈으로</UButton>
    </div>
  </div>
</template>
