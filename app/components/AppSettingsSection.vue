<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  open?: boolean
  modal?: boolean
}>(), { open: true, modal: false })
const emit = defineEmits<{ save: [], openModal: [] }>()

const expanded = ref(props.open)
</script>

<template>
  <div class="ss">
    <div class="ss-title">
      {{ title }}
    </div>
    <p class="ss-desc">
      <span v-if="description">{{ description }}</span>
      <button
        v-if="modal"
        type="button"
        class="ss-toggle"
        @click="emit('openModal')"
      >
        설정 변경
        <UIcon name="i-lucide-chevron-down" class="text-[length:var(--fz-sm)]" />
      </button>
      <button v-else-if="!expanded" type="button" class="ss-toggle" @click="expanded = true">
        설정 변경
        <UIcon name="i-lucide-chevron-down" class="text-[length:var(--fz-sm)]" />
      </button>
    </p>

    <div v-if="!modal && expanded" class="ss-box">
      <slot />
      <div class="ss-actions">
        <button type="button" class="btn btn-primary btn-sm" @click="emit('save')">
          저장
        </button>
        <button type="button" class="btn btn-outline btn-sm" @click="expanded = false">
          취소
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ss + .ss {
  margin-top: 22px;
}
.ss-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 4px;
}
.ss-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.ss-toggle {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--accent-ink);
  cursor: pointer;
}
.ss-box {
  margin-top: 12px;
  padding: 18px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
.ss-actions {
  display: flex;
  gap: 6px;
  margin-top: 16px;
}
</style>
