<script setup lang="ts">
defineProps<{
  name: string
  text: string
  byteCount: number
  active?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="card"
    :class="{ 'is-active': active }"
    @click="$emit('click')"
  >
    <div class="card-name">{{ name }}</div>
    <div class="card-text">{{ text }}</div>
    <div class="card-byte">{{ byteCount }}byte</div>
  </button>
</template>

<style scoped>
.card {
  position: relative;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 110px;
}
.card:hover {
  border-color: var(--color-sky-vivid);
}
.card.is-active {
  background: var(--color-sky-soft);
  border-color: var(--color-sky-vivid);
}
.card-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-900);
}
.card-text {
  flex: 1;
  font-size: 12px;
  color: var(--gray-600);
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.card-byte {
  font-size: 11px;
  color: var(--color-sky-vivid);
  text-align: right;
  font-weight: 600;
}
</style>
