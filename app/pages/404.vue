<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '페이지를 찾을 수 없습니다' })
</script>

<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="text-center">
      <div class="text-7xl font-extrabold text-primary-500 mb-2">404</div>
      <h1 class="text-xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
      <p class="text-sm text-neutral-500 mb-6">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <UButton to="/home" icon="i-lucide-home">홈으로</UButton>
    </div>
  </div>
</template>
