<script setup lang="ts">
import type { ChannelMeta } from '~/types/channel'

const props = defineProps<{
  channels: ChannelMeta[]            // Flow는 multi-channel, 단일 발송은 1개
  groupNames?: string[]
  recipientCount: number
  estimatedCost: number
  currentBalance: number
}>()

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const afterBalance = computed(() => props.currentBalance - props.estimatedCost)
const lacksCredit = computed(() => afterBalance.value < 0)

const channelLabel = computed(() => props.channels.map(c => c.label).join(', '))
const pricingLabel = computed(() =>
  props.channels.map(c => `${c.label} : ${c.pricePerUnit} C`).join('   '),
)

function fmt(n: number) {
  return n.toLocaleString('ko-KR')
}
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-3xl' }">
    <template #body>
      <div class="confirm-body">
        <h4 class="confirm-title">발송 확인</h4>
        <div class="info-block">
          <div v-if="groupNames?.length" class="info-row">
            <span class="info-label">선택된 그룹</span>
            <span class="info-value">{{ groupNames.join(', ') }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">총 수신자 수</span>
            <span class="info-value">{{ fmt(recipientCount) }}명</span>
          </div>
          <div class="info-row">
            <span class="info-label">채널</span>
            <span class="info-value">{{ channelLabel }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">건당 단가</span>
            <span class="info-value">{{ pricingLabel }}</span>
          </div>
        </div>

        <div class="cost-block">
          <div class="cost-cell">
            <span class="cost-label">예상 비용</span>
            <span class="cost-value">{{ fmt(estimatedCost) }} <i class="cost-c">C</i></span>
          </div>
          <div class="cost-cell">
            <span class="cost-label">현재 잔액</span>
            <span class="cost-value">{{ fmt(currentBalance) }} <i class="cost-c">C</i></span>
          </div>
          <div class="cost-cell">
            <span class="cost-label">발송 후 잔액</span>
            <span class="cost-value" :class="{ warn: lacksCredit }">
              {{ fmt(afterBalance) }} <i class="cost-c">C</i>
            </span>
          </div>
        </div>

        <p v-if="lacksCredit" class="notice">
          <UIcon name="i-lucide-info" class="size-4 shrink-0 mt-0.5" />
          <span>
            <strong>발송을 위해 크레딧 충전이 필요합니다.</strong>
            크레딧 충전은 <a href="/account/credit" class="link">크레딧 관리</a> 메뉴에서 가능합니다.
          </span>
        </p>
      </div>
    </template>
    <template #footer>
      <div class="footer-actions">
        <UButton color="neutral" variant="outline" @click="emit('cancel'); open = false">
          취소
        </UButton>
        <UButton class="btn-confirm" :disabled="lacksCredit" @click="emit('confirm')">
          발송하기
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.confirm-body {
  padding: 8px 0 16px;
}
.confirm-title {
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  color: var(--gray-900);
  margin-bottom: 24px;
}
.info-block {
  border-top: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
  padding: 16px 0;
  margin-bottom: 16px;
}
.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
}
.info-label {
  color: var(--gray-500);
  font-weight: 500;
}
.info-value {
  color: var(--gray-900);
  font-weight: 500;
}
.cost-block {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}
.cost-cell {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
.cost-label {
  display: block;
  font-size: 13px;
  color: var(--gray-500);
  margin-bottom: 8px;
}
.cost-value {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
}
.cost-value.warn {
  color: #ef4444;
}
.cost-c {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: var(--color-indigo);
  border-radius: 50%;
  font-style: normal;
  margin-left: 2px;
  vertical-align: middle;
}
.notice {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: var(--color-sky-soft);
  border-radius: 8px;
  color: var(--gray-700);
  font-size: 13px;
  line-height: 1.6;
}
.notice .link {
  color: var(--color-sky-vivid);
  text-decoration: underline;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
.btn-confirm {
  background: var(--color-sky-vivid);
  color: white;
}
.btn-confirm:hover:not(:disabled) {
  background: #016bda;
}
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
