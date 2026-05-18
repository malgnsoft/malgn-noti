<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  channel?: string
  count?: number
  pricePerUnit?: number
  currentBalance?: number
  scheduleAt?: string | null
}>(), { channel: 'SMS', count: 0, pricePerUnit: 9.9, currentBalance: 245800, scheduleAt: null })

const emit = defineEmits<{ close: [], confirm: [] }>()

const total = computed(() => Math.round(props.count * props.pricePerUnit * 10) / 10)
const after = computed(() => props.currentBalance - total.value)

const cells = computed(() => [
  { label: '채널', value: props.channel },
  { label: '수신자', value: `${props.count.toLocaleString()}명` },
  { label: '예상 비용', value: `${total.value.toLocaleString()} C`, accent: true }
])
</script>

<template>
  <AppModal :open="open" title="발송 확인" :width="480" @close="emit('close')">
    <div class="scd-notice">
      <UIcon name="i-lucide-info" class="text-base" style="color: var(--accent-ink)" />
      <span>
        <template v-if="scheduleAt"><strong>{{ scheduleAt }}</strong>에 발송 예약됩니다.</template>
        <template v-else>즉시 발송됩니다. 한 번 시작하면 취소할 수 없습니다.</template>
      </span>
    </div>
    <div class="scd-grid">
      <div v-for="(c, i) in cells" :key="i" class="scd-cell" :class="{ 'scd-cell-br': i < 2 }">
        <div class="scd-label">
          {{ c.label }}
        </div>
        <div class="scd-value num" :style="{ color: c.accent ? 'var(--accent-ink)' : 'var(--ink-900)' }">
          {{ c.value }}
        </div>
      </div>
    </div>
    <div class="scd-foot">
      <span>발송 전 잔액: <span class="num">{{ currentBalance.toLocaleString() }}</span> C</span>
      <span>발송 후 잔액:
        <strong class="num" :style="{ color: after < 0 ? 'var(--danger-ink)' : 'var(--ink-700)' }">{{ after.toLocaleString() }} C</strong>
      </span>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" @click="emit('confirm')">
        발송하기
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.scd-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-soft);
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: var(--r-md);
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--ink-700);
}
.scd-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
  margin-bottom: 16px;
}
.scd-cell { padding: 16px; background: var(--white); }
.scd-cell-br { border-right: 1px solid var(--line); }
.scd-label { font-size: 11px; color: var(--ink-500); margin-bottom: 4px; }
.scd-value { font-size: 16px; font-weight: 600; }
.scd-foot {
  font-size: 12px;
  color: var(--ink-500);
  display: flex;
  justify-content: space-between;
}
</style>
