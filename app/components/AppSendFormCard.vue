<script setup lang="ts">
const props = defineProps<{
  title: string
  locked?: boolean
  lockedMessage?: string
  collapsible?: boolean
}>()

const collapsed = ref(false)

function toggleCollapsed() {
  if (props.collapsible) collapsed.value = !collapsed.value
}
</script>

<template>
  <section class="app-send-form-card">
    <header class="card-header">
      <h3 class="card-title">{{ title }}</h3>
      <button
        v-if="collapsible"
        type="button"
        class="card-collapse-toggle"
        @click="toggleCollapsed"
      >
        {{ collapsed ? '열기' : '닫기' }}
        <UIcon :name="collapsed ? 'i-bi-chevron-down' : 'i-bi-chevron-up'" class="size-3.5" />
      </button>
    </header>
    <div v-if="!collapsed" class="card-body">
      <div v-if="locked" class="card-locked">
        {{ lockedMessage ?? '먼저 윗단계를 완료해 주세요.' }}
      </div>
      <slot v-else />
    </div>
  </section>
</template>

<style scoped>
.app-send-form-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  margin-bottom: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--gray-200);
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.2px;
}
.card-collapse-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-sky-vivid);
  font-size: 13px;
  font-weight: 500;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.card-body {
  padding: 20px 24px;
}
.card-locked {
  text-align: center;
  color: var(--gray-500);
  font-size: 14px;
  padding: 64px 16px;
}
</style>
