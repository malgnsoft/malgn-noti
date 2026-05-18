<script setup lang="ts">
interface SendOptions { mode: 'now' | 'schedule', date?: string, hour?: string, minute?: string }

const props = withDefaults(defineProps<{
  modelValue: SendOptions
  step?: number
}>(), { step: 4 })

const emit = defineEmits<{ 'update:modelValue': [SendOptions] }>()

const minDate = new Date().toISOString().slice(0, 10)
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minutes = ['00', '10', '20', '30', '40', '50']

function patch(p: Partial<SendOptions>) {
  emit('update:modelValue', { ...props.modelValue, ...p })
}
</script>

<template>
  <AppSendFormCard :step="step" title="발송 옵션">
    <AppFormRow label="발송 시점" required>
      <AppRadioGroup
        :model-value="modelValue.mode"
        :options="[
          { value: 'now', label: '즉시 발송' },
          { value: 'schedule', label: '예약 발송' },
        ]"
        @update:model-value="patch({ mode: $event as SendOptions['mode'] })"
      />
      <div v-if="modelValue.mode === 'schedule'" style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap">
        <input
          type="date"
          class="input"
          style="max-width: 160px"
          :min="minDate"
          :value="modelValue.date || ''"
          @input="patch({ date: ($event.target as HTMLInputElement).value })"
        >
        <select
          class="select"
          style="max-width: 100px"
          :value="modelValue.hour ?? '09'"
          @change="patch({ hour: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="h in hours" :key="h" :value="h">
            {{ h }}시
          </option>
        </select>
        <select
          class="select"
          style="max-width: 100px"
          :value="modelValue.minute ?? '00'"
          @change="patch({ minute: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="m in minutes" :key="m" :value="m">
            {{ m }}분
          </option>
        </select>
        <div class="inline-help" style="align-self: center">
          KST 기준 · 과거 시각 불가
        </div>
      </div>
    </AppFormRow>
  </AppSendFormCard>
</template>
