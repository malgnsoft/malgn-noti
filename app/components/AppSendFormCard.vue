<script setup lang="ts">
const props = defineProps<{
  step?: number | string
  title: string
  required?: boolean
  hint?: string
  locked?: boolean
  lockedHint?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}>()

const open = ref(!props.defaultCollapsed)
function toggle() {
  open.value = !open.value
}
const showToggle = computed(() => props.collapsible && !props.locked)
</script>

<template>
  <div class="card">
    <div
      class="card-header card-header--accent"
      :class="{ 'card-header--toggle': showToggle }"
      @click="showToggle && toggle()"
    >
      <div class="title">
        {{ title }}<span v-if="required" class="required"> *</span>
      </div>
      <button
        v-if="showToggle"
        type="button"
        class="card-toggle"
        :aria-expanded="open"
        :aria-label="open ? '접기' : '펼치기'"
        @click.stop="toggle()"
      >
        <UIcon
          name="i-lucide-chevron-down"
          class="card-toggle-ico"
          :class="{ collapsed: !open }"
        />
      </button>
      <span v-if="hint" class="hint">{{ hint }}</span>
      <div v-if="$slots.headerRight" style="margin-left: auto">
        <slot name="headerRight" />
      </div>
    </div>
    <template v-if="locked">
      <div class="card-body">
        <div class="disclosure-hint">
          <span class="icn"><UIcon name="i-lucide-lock" class="text-lg" /></span>
          {{ lockedHint || '이전 단계를 먼저 완료해 주세요.' }}
        </div>
      </div>
    </template>
    <div v-else v-show="!collapsible || open" class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card-header--toggle {
  cursor: pointer;
  user-select: none;
}
.card-toggle {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--r-sm);
  color: var(--ink-400);
  flex-shrink: 0;
}
.card-toggle:hover {
  background: var(--ink-50);
  color: var(--ink-700);
}
.card-toggle-ico {
  font-size: 16px;
  transition: transform 0.15s ease;
}
.card-toggle-ico.collapsed {
  transform: rotate(-90deg);
}
</style>
