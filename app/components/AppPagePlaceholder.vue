<script setup lang="ts">
defineProps<{
  title: string
  category?: string
  description?: string
}>()
</script>

<template>
  <div class="p-6 lg:p-8">
    <div class="mb-6">
      <div v-if="category" class="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
        {{ category }}
      </div>
      <h1 class="text-2xl font-bold tracking-tight">
        {{ title }}
      </h1>
      <p v-if="description" class="text-sm text-neutral-500 mt-1">
        {{ description }}
      </p>
    </div>
    <UCard>
      <div class="py-10 text-center text-neutral-500">
        <UIcon name="i-lucide-construction" class="text-3xl mb-2 inline-block" />
        <div class="text-sm">아직 구현되지 않은 페이지입니다.</div>
      </div>
    </UCard>
  </div>
</template>
