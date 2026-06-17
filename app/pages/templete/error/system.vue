<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '시스템 오류' })

function reload() {
  if (import.meta.client) window.location.reload()
}
</script>

<template>
  <AppSystemMessage
    tone="danger"
    icon="i-lucide-server-crash"
    eyebrow="ERROR 500"
    badge="시스템 오류"
    title="시스템 오류가 발생했습니다"
    description="일시적인 시스템 오류로 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요."
  >
    <template #actions>
      <button type="button" class="btn btn-neutral" @click="reload">
        <UIcon name="i-lucide-refresh-cw" />
        새로고침
      </button>
      <NuxtLink to="/home" class="btn btn-primary">
        <UIcon name="i-lucide-home" />
        홈으로
      </NuxtLink>
    </template>
  </AppSystemMessage>
</template>
