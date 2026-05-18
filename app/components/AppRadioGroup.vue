<script setup lang="ts">
interface Opt { value: string, label: string }
defineProps<{
  modelValue: string
  options: Opt[]
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()
</script>

<template>
  <div class="radio-group">
    <label v-for="opt in options" :key="opt.value" class="radio">
      <input
        type="radio"
        :checked="modelValue === opt.value"
        :disabled="disabled"
        @change="!disabled && emit('update:modelValue', opt.value)"
      >
      {{ opt.label }}
    </label>
  </div>
</template>
