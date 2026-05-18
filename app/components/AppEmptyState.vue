<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  desc?: string
}>(), { icon: 'i-lucide-inbox' })
</script>

<template>
  <div class="empty">
    <div class="icon">
      <UIcon :name="icon" class="text-[32px]" />
    </div>
    <h3>{{ title }}</h3>
    <p v-if="desc">
      {{ desc }}
    </p>
    <slot name="action" />
  </div>
</template>
