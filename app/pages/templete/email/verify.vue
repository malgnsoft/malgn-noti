<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '이메일 인증' })
</script>

<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="max-w-lg w-full bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-8 text-center">
      <UIcon name="i-lucide-mail-check" class="text-5xl text-primary-500 mb-3" />
      <h1 class="text-xl font-bold mb-2">이메일 주소를 확인해 주세요</h1>
      <p class="text-sm text-neutral-500 mb-6">
        아래 버튼을 눌러 이메일 인증을 완료해 주세요.
      </p>
      <UButton>이메일 인증 완료</UButton>
    </div>
  </div>
</template>
