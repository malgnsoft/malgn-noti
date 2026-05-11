<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '비밀번호 재설정' })
</script>

<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="max-w-lg w-full bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-8 text-center">
      <UIcon name="i-lucide-key-round" class="text-5xl text-primary-500 mb-3" />
      <h1 class="text-xl font-bold mb-2">비밀번호 재설정</h1>
      <p class="text-sm text-neutral-500 mb-6">
        아래 버튼을 눌러 비밀번호를 재설정해 주세요. 링크는 24시간 동안 유효합니다.
      </p>
      <UButton to="/reset-password/new">비밀번호 재설정하기</UButton>
    </div>
  </div>
</template>
