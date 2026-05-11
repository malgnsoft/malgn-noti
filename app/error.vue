<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

function handleHome() {
  clearError({ redirect: '/home' })
}
</script>

<template>
  <div class="min-h-screen grid place-items-center bg-neutral-50 dark:bg-neutral-950 px-4 py-16">
    <div class="text-center max-w-md">
      <div v-if="error.statusCode === 404">
        <div class="text-7xl font-extrabold text-primary-500 mb-2">404</div>
        <h1 class="text-xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
        <p class="text-sm text-neutral-500 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>
      <div v-else>
        <UIcon name="i-lucide-alert-triangle" class="text-6xl text-warning-500 mb-3" />
        <h1 class="text-xl font-bold mb-2">오류가 발생했습니다</h1>
        <p class="text-sm text-neutral-500 mb-6">
          {{ error.message || '잠시 후 다시 시도해 주세요.' }}
        </p>
      </div>
      <UButton icon="i-lucide-home" @click="handleHome">
        홈으로
      </UButton>
    </div>
  </div>
</template>
