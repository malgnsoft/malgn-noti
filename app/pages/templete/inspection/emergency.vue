<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '긴급 점검 안내' })
</script>

<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="text-center max-w-md">
      <UIcon name="i-lucide-alert-octagon" class="text-6xl text-error-500 mb-3" />
      <h1 class="text-xl font-bold mb-2">긴급 점검 중입니다</h1>
      <p class="text-sm text-neutral-500">
        보다 나은 서비스를 위해 긴급 점검을 진행하고 있습니다.<br>
        이용에 불편을 드려 죄송합니다.
      </p>
    </div>
  </div>
</template>
