<script setup lang="ts">
withDefaults(defineProps<{
  loading?: boolean
  canSubmit?: boolean
  resetLabel?: string
  submitLabel?: string
}>(), {
  loading: false,
  canSubmit: true,
  resetLabel: '초기화',
  submitLabel: '발송하기',
})

defineEmits<{
  reset: []
  submit: []
}>()
</script>

<template>
  <div class="app-send-actions-bar">
    <button
      type="button"
      class="btn-reset"
      :disabled="loading"
      @click="$emit('reset')"
    >
      {{ resetLabel }}
    </button>
    <button
      type="button"
      class="btn-submit"
      :disabled="loading || canSubmit === false"
      @click="$emit('submit')"
    >
      {{ submitLabel }}
    </button>
  </div>
</template>

<style scoped>
.app-send-actions-bar {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  margin-top: 24px;
}
.btn-reset,
.btn-submit {
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
  transition: background-color 0.15s, opacity 0.15s;
}
.btn-reset {
  background: var(--gray-900);
  color: white;
}
.btn-reset:hover:not(:disabled) {
  background: var(--gray-800);
}
.btn-submit {
  background: var(--primary-color);
  color: white;
}
.btn-submit:hover:not(:disabled) {
  background: var(--primary-hover);
}
.btn-reset:disabled,
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
