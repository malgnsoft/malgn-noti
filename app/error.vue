<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error.statusCode === 404)

function goHome() {
  clearError({ redirect: '/home' })
}

function retry() {
  clearError({ redirect: useRoute().fullPath })
}
</script>

<template>
  <AppSystemMessage
    v-if="isNotFound"
    code="404"
    eyebrow="ERROR 404"
    title="페이지를 찾을 수 없습니다"
    description="요청하신 페이지가 존재하지 않거나 이동되었습니다. 주소를 다시 확인해 주세요."
  >
    <template #actions>
      <NuxtLink to="/home" class="btn btn-primary" @click.prevent="goHome">
        <UIcon name="i-lucide-home" />
        홈으로
      </NuxtLink>
    </template>
  </AppSystemMessage>

  <AppSystemMessage
    v-else
    tone="danger"
    icon="i-lucide-server-crash"
    :eyebrow="`ERROR ${error.statusCode || 500}`"
    badge="시스템 오류"
    title="오류가 발생했습니다"
    :description="error.message || '일시적인 시스템 오류로 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.'"
  >
    <template #actions>
      <button type="button" class="btn btn-neutral" @click="retry">
        <UIcon name="i-lucide-refresh-cw" />
        다시 시도
      </button>
      <button type="button" class="btn btn-primary" @click="goHome">
        <UIcon name="i-lucide-home" />
        홈으로
      </button>
    </template>
  </AppSystemMessage>
</template>
