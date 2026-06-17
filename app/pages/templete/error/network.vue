<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '네트워크 오류' })

function retry() {
  if (import.meta.client) window.location.reload()
}
</script>

<template>
  <AppSystemMessage
    tone="warning"
    icon="i-lucide-wifi-off"
    eyebrow="NETWORK ERROR"
    badge="연결 실패"
    title="네트워크 연결을 확인해 주세요"
    description="서버에 연결할 수 없습니다. 인터넷 연결 상태를 확인한 뒤 다시 시도해 주세요."
  >
    <template #actions>
      <button type="button" class="btn btn-primary" @click="retry">
        <UIcon name="i-lucide-refresh-cw" />
        다시 시도
      </button>
    </template>
  </AppSystemMessage>
</template>
