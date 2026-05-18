<script setup lang="ts">
const props = withDefaults(defineProps<{
  body: string
  modelValue: Record<string, string>
}>(), { modelValue: () => ({}) })

const emit = defineEmits<{ 'update:modelValue': [Record<string, string>] }>()

const parts = computed(() =>
  props.body.split(/(#\{[^}]+\})/g).map((p, i) => {
    const m = p.match(/^#\{([^}]+)\}$/)
    return { i, p, key: m ? m[1] : null }
  })
)

function setVar(k: string, v: string) {
  emit('update:modelValue', { ...props.modelValue, [k]: v })
}
function widthCh(k: string) {
  const cur = props.modelValue?.[k] || `#{${k}}`
  return `calc(${Math.max(cur.length, 4)}ch + 16px)`
}
</script>

<template>
  <div class="tvt">
    <template v-for="part in parts" :key="part.i">
      <input
        v-if="part.key"
        class="tvt-input"
        :style="{ width: widthCh(part.key) }"
        :value="modelValue?.[part.key] || ''"
        :placeholder="`#{${part.key}}`"
        @input="setVar(part.key, ($event.target as HTMLInputElement).value)"
      >
      <span v-else>{{ part.p }}</span>
    </template>
  </div>
</template>

<style scoped>
.tvt {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 14px;
  min-height: 140px;
  font-size: 13px;
  line-height: 1.9;
  white-space: pre-wrap;
  color: var(--ink-800);
}
.tvt-input {
  display: inline-block;
  min-width: 90px;
  padding: 2px 8px;
  background: var(--white);
  border: 1px solid var(--accent);
  border-radius: var(--r-sm);
  font-family: inherit;
  font-size: 12px;
  color: var(--accent-ink);
  outline: none;
  margin: 0 2px;
}
</style>
