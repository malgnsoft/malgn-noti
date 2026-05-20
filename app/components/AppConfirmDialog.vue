<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  danger?: boolean
}>(), { title: '확인', confirmLabel: '확인' })

const emit = defineEmits<{ close: [], confirm: [] }>()
</script>

<template>
  <AppModal :open="open" :title="title" :width="400" @close="emit('close')">
    <div style="font-size: var(--fz-md); color: var(--ink-700); line-height: 1.6; white-space: pre-line">
      {{ message }}
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button
        type="button"
        :class="danger ? 'btn btn-error-solid' : 'btn btn-primary'"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </button>
    </template>
  </AppModal>
</template>
