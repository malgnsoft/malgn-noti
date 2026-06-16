<script setup lang="ts">
interface Opt { value: string, label: string, disabled?: boolean, hint?: string }
defineProps<{
  modelValue: string
  options: Opt[]
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="radio-group">
    <label
      v-for="opt in options"
      :key="opt.value"
      class="radio"
      :class="{ 'radio-disabled': disabled || opt.disabled }"
    >
      <input
        type="radio"
        :checked="modelValue === opt.value"
        :disabled="disabled || opt.disabled"
        @change="!(disabled || opt.disabled) && emit('update:modelValue', opt.value)"
      >
      {{ opt.label }}
      <span v-if="opt.hint" class="radio-hint">{{ opt.hint }}</span>
    </label>
  </div>
</template>

<style scoped>
.radio-disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.radio-hint {
  margin-left: 4px;
  font-size: var(--fz-2xs);
  color: var(--ink-400);
}
</style>
