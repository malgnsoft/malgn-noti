<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: string
  max: number
  unit?: 'byte' | 'char'
}>(), { unit: 'byte' })

const len = computed(() => props.unit === 'byte' ? byteLen(props.value || '') : (props.value || '').length)
const over = computed(() => len.value > props.max)
</script>

<template>
  <div class="byte-counter" :style="{ color: over ? 'var(--danger-ink)' : 'var(--ink-400)' }">
    {{ len.toLocaleString() }} / {{ max.toLocaleString() }} {{ unit === 'byte' ? 'byte' : '자' }}
  </div>
</template>
