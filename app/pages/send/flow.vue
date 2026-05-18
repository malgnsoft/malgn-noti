<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: '복합 플로우 발송' })
const toast = useToast()
const router = useRouter()

const sample: Recipient[] = [
  { id: 1, name: '이수민', phone: '010-2345-6789' },
  { id: 2, name: '박지훈', phone: '010-9876-5432' },
  { id: 3, name: '최예진', phone: '010-3344-5566' },
  { id: 4, name: '정민호', phone: '010-7788-9900' },
  { id: 5, name: '한지영', phone: '010-2233-4455' }
]

const flow = {
  name: '주문 → 배송 알림 시퀀스',
  nodes: [
    { ch: 'kakao', label: '알림톡 — 주문 완료', tag: 'K' },
    { ch: 'sms', label: 'SMS — 출고 안내', tag: 'S' },
    { ch: 'email', label: '이메일 — 영수증', tag: 'E' }
  ]
}

const activeNode = ref(0)
const recipients = ref<Recipient[]>([...sample])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)

const node = computed(() => flow.nodes[activeNode.value])
const nodeBody = computed(() => {
  const ch = node.value.ch
  return ch === 'kakao'
    ? '안녕하세요 #{이름}님, 주문이 접수되었습니다.\n주문번호: #{주문번호}'
    : ch === 'sms'
      ? '[몰리몰리] #{이름}님, 상품이 출고되었습니다. 운송장 #{운송장번호}'
      : '주문하신 상품의 영수증을 첨부합니다.'
})

function onManualConfirm(r: Recipient) {
  recipients.value = editTarget.value
    ? recipients.value.map(x => x.id === r.id ? r : x)
    : [...recipients.value, r]
}
function send() {
  openConfirm.value = false
  toast.add({ title: '플로우 발송 시작', color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/sms'), 1000)
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · 복합 플로우
      </div>
      <h1>복합 플로우 발송</h1>
      <p>여러 채널을 순서대로 발송. 노드별 단가가 합산됩니다.</p>
    </div>

    <div class="flow-info">
      <UIcon name="i-lucide-info" class="text-base" style="color: var(--accent-ink)" />
      <span>플로우 발송은 미리 정의된 채널 순서로 메시지를 발송합니다. 각 노드의 본문은 플로우 관리에서 편집할 수 있습니다.</span>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px">
      <AppSendFormCard step="1" title="플로우 선택" required>
        <AppFormRow label="플로우" required>
          <div class="row" style="gap: 8px; flex-wrap: wrap">
            <button type="button" class="btn btn-outline" style="flex: 1; max-width: 360px; justify-content: space-between">
              <span><strong>{{ flow.name }}</strong> · {{ flow.nodes.length }}개 노드</span>
              <UIcon name="i-lucide-chevron-down" class="text-sm" />
            </button>
            <button type="button" class="btn btn-soft btn-sm">
              <UIcon name="i-lucide-settings" class="text-[12px]" /> 플로우 관리
            </button>
          </div>
        </AppFormRow>
      </AppSendFormCard>

      <AppRecipientCard
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        key-column="phone"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <AppSendFormCard step="3" title="메시지 시퀀스 (읽기 전용)">
        <div class="flow-chips">
          <template v-for="(n, i) in flow.nodes" :key="i">
            <div
              class="flow-chip"
              :class="{ active: activeNode === i }"
              @click="activeNode = i"
            >
              <span :class="['ch-tile', n.ch]" style="width: 18px; height: 18px; border-radius: 4px; font-size: 10px">
                {{ n.tag }}
              </span>
              {{ n.label }}
            </div>
            <span v-if="i < flow.nodes.length - 1" class="flow-arrow">
              <UIcon name="i-lucide-chevron-right" class="text-sm" />
            </span>
          </template>
        </div>
        <div class="flow-node">
          <div>
            <AppBadge tone="neutral">
              <UIcon name="i-lucide-lock" class="text-[10px]" /> 읽기 전용
            </AppBadge>
            <div style="font-size: 15px; font-weight: 700; margin-top: 8px; color: var(--ink-900)">
              {{ node.label }}
            </div>
            <div style="font-size: 13px; color: var(--ink-600); margin-top: 10px; line-height: 1.6; white-space: pre-wrap">
              {{ nodeBody }}
            </div>
          </div>
          <div style="display: grid; place-items: center">
            <AppKakaoPreview v-if="node.ch === 'kakao'" body="주문이 접수되었습니다." />
            <AppPhonePreview v-else-if="node.ch === 'sms'" sender-name="1588-1234" message="[몰리몰리] 상품이 출고되었습니다." />
            <AppEmailPreview v-else subject="주문 영수증" body="영수증을 첨부합니다." />
          </div>
        </div>
      </AppSendFormCard>

      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="recipients.length === 0"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

    <AppAddressBookDialog
      :open="openAddrBook"
      key-column="phone"
      @close="openAddrBook = false"
      @confirm="(items) => recipients = [...recipients, ...items]"
    />
    <AppRecipientFormDialog
      :open="openManual"
      :edit="editTarget"
      key-column="phone"
      @close="openManual = false"
      @confirm="onManualConfirm"
    />
    <AppConfirmDialog
      :open="openReset"
      title="초기화"
      message="입력 초기화"
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="() => { recipients = []; openReset = false }"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      :channel="`Flow (${flow.nodes.length}개 노드)`"
      :count="recipients.length"
      :price-per-unit="29.9"
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.flow-info {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-soft);
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: var(--r-lg);
  padding: 14px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--ink-700);
}
.flow-node {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  margin-top: 16px;
  padding: 16px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
}
@media (max-width: 1023px) { .flow-node { grid-template-columns: 1fr; } }
</style>
