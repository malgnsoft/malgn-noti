<script setup lang="ts">
withDefaults(defineProps<{
  sendDisabled?: boolean
  sendLabel?: string
}>(), { sendLabel: '발송하기' })

const emit = defineEmits<{ reset: [], send: [] }>()
</script>

<template>
  <div class="send-actions">
    <button type="button" class="btn btn-neutral" @click="emit('reset')">
      <UIcon name="i-lucide-refresh-cw" class="text-[14px]" />
      초기화
    </button>
    <button type="button" class="btn btn-primary btn-lg" :disabled="sendDisabled" @click="emit('send')">
      <UIcon name="i-lucide-send" class="text-[14px]" />
      {{ sendLabel }}
    </button>
  </div>
</template>
