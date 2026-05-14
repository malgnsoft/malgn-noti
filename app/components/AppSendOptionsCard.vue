<script setup lang="ts">
const mode = defineModel<'now' | 'reserve'>('mode', { default: 'now' })
const reserveAt = defineModel<string>('reserveAt', { default: '' })
</script>

<template>
  <AppSendFormCard title="발송 옵션">
    <div class="form-row">
      <label class="form-label">발송 시점 <span class="required">*</span></label>
      <div class="form-control">
        <div class="radio-group">
          <label class="radio">
            <input v-model="mode" type="radio" value="now">
            <span>즉시 발송</span>
          </label>
          <label class="radio">
            <input v-model="mode" type="radio" value="reserve">
            <span>예약 발송</span>
          </label>
        </div>
      </div>
    </div>
    <div v-if="mode === 'reserve'" class="form-row">
      <label class="form-label">예약 일시</label>
      <div class="form-control">
        <AppDateTimePicker v-model="reserveAt" />
      </div>
    </div>
  </AppSendFormCard>
</template>

<style scoped>
.form-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}
.required {
  color: #ef4444;
  margin-left: 2px;
}
.radio-group {
  display: flex;
  gap: 24px;
}
.radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--gray-700);
}
.radio input[type='radio'] {
  accent-color: var(--primary-color);
  cursor: pointer;
}
</style>
