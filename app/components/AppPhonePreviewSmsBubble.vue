<script setup lang="ts">
defineProps<{
  subject?: string
  text?: string
}>()
</script>

<template>
  <div v-if="subject || text" class="bubble">
    <div v-if="subject" class="subject">[{{ subject }}]</div>
    <div class="text">{{ text }}</div>
  </div>
</template>

<style scoped>
.bubble {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  padding: 12px;
  font-size: var(--fz-md);
  color: var(--gray-800);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.subject {
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--gray-900);
}
</style>
