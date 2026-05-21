<script setup lang="ts">
const props = defineProps<{
  label: string
  title: string
  bullets: string[]
  toggleLabel: string
}>()

const toast = useToast()
const expanded = ref(true)
const enabled = ref(false)

function onSave() {
  toast.add({
    title: props.title,
    description: enabled.value ? '인증 정보를 저장했습니다.' : '등록을 사용 안 함으로 저장했습니다.',
    icon: 'i-lucide-circle-check',
  })
}
function onCancel() {
  enabled.value = false
  toast.add({ title: '취소', description: '변경 사항을 취소했습니다.', icon: 'i-lucide-info' })
}
</script>

<template>
  <div class="pc-section">
    <div class="pc-label">
      {{ label }}
    </div>
    <div class="pc-card">
      <div class="pc-card-head">
        <span class="pc-title">{{ title }}</span>
        <button type="button" class="pc-collapse" @click="expanded = !expanded">
          {{ expanded ? '닫기' : '열기' }}
          <UIcon :name="expanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="text-[length:var(--fz-sm)]" />
        </button>
      </div>
      <div v-show="expanded" class="pc-card-body">
        <ul class="pc-bullets">
          <li v-for="(b, i) in bullets" :key="i">
            {{ b }}
          </li>
        </ul>

        <div class="pc-toggle-row">
          <span class="pc-toggle-label">{{ toggleLabel }}</span>
          <button
            type="button"
            class="pc-switch"
            :class="{ on: enabled }"
            role="switch"
            :aria-checked="enabled"
            @click="enabled = !enabled"
          >
            <span class="pc-switch-thumb" />
          </button>
        </div>

        <div v-show="enabled" class="pc-form">
          <slot />
        </div>

        <div class="pc-actions">
          <button type="button" class="btn btn-primary btn-sm" @click="onSave">
            저장
          </button>
          <button type="button" class="btn btn-neutral btn-sm" @click="onCancel">
            취소
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pc-section {
  display: grid;
  grid-template-columns: 116px 1fr;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--line);
}
.pc-section:first-child {
  border-top: 0;
  padding-top: 4px;
}
.pc-label {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-700);
  padding-top: 8px;
}
.pc-card {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  min-width: 0;
}
.pc-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}
.pc-title {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.pc-collapse {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: 0;
  padding: 0;
  font-size: var(--fz-sm);
  color: var(--accent-ink);
  cursor: pointer;
}
.pc-card-body {
  padding: 0 16px 16px;
}
.pc-bullets {
  margin: 0 0 14px;
  padding: 14px 16px 14px 32px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  list-style: disc;
}
.pc-bullets li {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
}
.pc-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.pc-toggle-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-700);
}
.pc-switch {
  width: 40px;
  height: 22px;
  border-radius: var(--r-full);
  border: 0;
  background: var(--ink-200);
  padding: 0;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}
.pc-switch.on {
  background: var(--accent);
}
.pc-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: var(--r-full);
  background: var(--white);
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s;
}
.pc-switch.on .pc-switch-thumb {
  transform: translateX(18px);
}
.pc-form {
  margin-bottom: 14px;
}
.pc-actions {
  display: flex;
  gap: 6px;
}
</style>
