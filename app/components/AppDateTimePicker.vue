<script setup lang="ts">
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'

withDefaults(defineProps<{
  placeholder?: string
  disablePast?: boolean
}>(), {
  placeholder: '연도-월-일 시:분',
  disablePast: true,
})

// v-model: ISO local datetime string (e.g., '2026-05-13T09:30')
const value = defineModel<string>({ default: '' })

const open = ref(false)

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

const hourItems = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minuteItems = ['00', '10', '20', '30', '40', '50']
const minDate = computed(() => today(getLocalTimeZone()))
</script>

<template>
  <UPopover v-model:open="open">
    <UInput
      :model-value="displayValue"
      :placeholder="placeholder"
      readonly
      icon="i-lucide-calendar"
      class="w-64"
    />
    <template #content>
      <div class="datetime-popover">
        <UCalendar
          v-model="date"
          :min-value="disablePast ? minDate : undefined"
          locale="ko-KR"
        />
        <div class="time-row">
          <span class="time-label">시간</span>
          <USelect v-model="hour" :items="hourItems" class="w-20" />
          <span class="time-sep">:</span>
          <USelect v-model="minute" :items="minuteItems" class="w-20" />
          <UButton color="primary" size="sm" class="ml-auto" @click="open = false">
            확인
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<style scoped>
.datetime-popover {
  padding: 12px;
  min-width: 280px;
}
.time-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--gray-200);
}
.time-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}
.time-sep {
  color: var(--gray-500);
  font-weight: 600;
}
</style>
