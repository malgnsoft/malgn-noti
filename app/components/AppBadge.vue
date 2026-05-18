<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'success' | 'warning' | 'error' | 'primary' | 'sky' | 'neutral'
  dot?: boolean
}>(), { tone: 'neutral', dot: false })
</script>

<template>
  <span :class="['badge', 'badge-' + tone]">
    <span v-if="dot" class="badge-dot" />
    <slot />
  </span>
</template>
