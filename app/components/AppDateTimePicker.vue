<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

withDefaults(defineProps<{
  placeholder?: string
  disablePast?: boolean
  width?: number
}>(), {
  placeholder: '연도-월-일 시:분',
  disablePast: true,
  width: 256,
})

// v-model: ISO local datetime string (e.g., '2026-05-13T09:30') — 24시간제
const value = defineModel<string>({ default: '' })

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)

function parseDate(iso: string): CalendarDate | undefined {
  if (!iso || iso.length < 10) return undefined
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new CalendarDate(y, m, d)
}

const date = computed<DateValue | undefined>({
  get: () => parseDate(value.value),
  set: (v) => {
    if (!v) return
    const hh = value.value.slice(11, 13) || '09'
    const mm = value.value.slice(14, 16) || '00'
    value.value = `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}T${hh}:${mm}`
  },
})

const hour = computed({
  get: () => value.value.slice(11, 13) || '09',
  set: (v) => {
    const d = value.value.slice(0, 10) || dateToString(today(getLocalTimeZone()))
    const mm = value.value.slice(14, 16) || '00'
    value.value = `${d}T${v}:${mm}`
  },
})

const minute = computed({
  get: () => value.value.slice(14, 16) || '00',
  set: (v) => {
    const d = value.value.slice(0, 10) || dateToString(today(getLocalTimeZone()))
    const hh = value.value.slice(11, 13) || '09'
    value.value = `${d}T${hh}:${v}`
  },
})

function dateToString(d: DateValue) {
  return `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

const displayValue = computed(() => {
  if (!value.value) return ''
  const date = value.value.slice(0, 10)
  const time = value.value.slice(11, 16)
  if (!date || !time) return ''
  return `${date} ${time}`
})

// 24시간제: 00 ~ 23
const hourItems = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minuteItems = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const minDate = computed(() => today(getLocalTimeZone()))

function onDocClick(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) open.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="rootEl" class="dtp" @keydown.escape="open = false">
    <button
      type="button"
      class="input dtp-trigger"
      :style="{ width: width + 'px' }"
      @click="open = !open"
    >
      <UIcon name="i-lucide-calendar" class="dtp-icon" />
      <span class="dtp-value" :class="{ 'dtp-placeholder': !displayValue }">
        {{ displayValue || placeholder }}
      </span>
    </button>
    <div v-if="open" class="dtp-popover">
      <UCalendar
        v-model="date"
        :min-value="disablePast ? minDate : undefined"
        locale="ko-KR"
      />
      <div class="time-row">
        <span class="time-label">시간</span>
        <select v-model="hour" class="select dtp-time">
          <option v-for="h in hourItems" :key="h" :value="h">
            {{ h }}
          </option>
        </select>
        <span class="time-sep">:</span>
        <select v-model="minute" class="select dtp-time">
          <option v-for="m in minuteItems" :key="m" :value="m">
            {{ m }}
          </option>
        </select>
        <button type="button" class="btn btn-primary btn-sm dtp-confirm" @click="open = false">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dtp {
  position: relative;
  display: inline-block;
}
.dtp-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  text-align: left;
}
.dtp-icon {
  flex: none;
  font-size: var(--fz-lg);
  color: var(--ink-400);
}
.dtp-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--fz-md);
}
.dtp-placeholder {
  color: var(--ink-400);
}
.dtp-popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  padding: 12px;
  min-width: 280px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-popover);
}
.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}
.time-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-700);
}
.dtp-time {
  width: 72px;
}
.time-sep {
  color: var(--ink-500);
  font-weight: 600;
}
.dtp-confirm {
  margin-left: auto;
}
</style>
