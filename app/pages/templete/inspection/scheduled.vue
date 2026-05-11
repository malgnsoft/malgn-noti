<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '정기 점검 안내' })
</script>

<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="text-center max-w-md">
      <UIcon name="i-lucide-calendar-clock" class="text-6xl text-warning-500 mb-3" />
      <h1 class="text-xl font-bold mb-2">정기 점검 중입니다</h1>
      <p class="text-sm text-neutral-500">
        예정된 정기 점검을 진행하고 있습니다.<br>
        점검 시간: <span class="font-medium">미정</span>
      </p>
    </div>
  </div>
</template>
