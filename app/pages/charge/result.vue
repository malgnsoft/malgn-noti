<script setup lang="ts">
useHead({ title: '충전 결과' })

const route = useRoute()
const api = useApi()
const toast = useToast()

const amount = Number(route.query.amount) || 0
const bonus = Number(route.query.bonus) || 0
const brand = (route.query.brand as string) || 'CARD'
const last4 = (route.query.last4 as string) || '----'
const before = Number(route.query.before) || 0
const afterQuery = Number(route.query.after)
const ledgerId = Number(route.query.ledgerId) || 0
const receiptNo = (route.query.receiptNo as string) || ''

const charged = amount + bonus
/* 결제 후 잔액 — 서버 balanceAfter 우선, 없으면 client 합산 */
const after = computed(() => (Number.isFinite(afterQuery) && afterQuery > 0 ? afterQuery : before + charged))
const paymentInfo = `${brand} (**********${last4}, 일시불)`

const orderNo = ref(receiptNo || '—')
const orderDate = ref('—')
const validUntil = ref('—')

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function fmtDateTime(d: Date) {
  const h = d.getHours()
  const ampm = h < 12 ? '오전' : '오후'
  const h12 = h % 12 || 12
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${ampm} ${pad(h12)}:${pad(d.getMinutes())}`
}

onMounted(() => {
  const now = new Date()
  if (!receiptNo) {
    orderNo.value = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${String(now.getTime()).slice(-10)}`
  }
  orderDate.value = fmtDateTime(now)
  const exp = new Date(now)
  exp.setFullYear(exp.getFullYear() + 1)
  validUntil.value = `${exp.getFullYear()}.${pad(exp.getMonth() + 1)}.${pad(exp.getDate())}`
})

/* 영수증 — GET /credit-ledger/:id/receipt → AppReceiptDialog */
interface ReceiptData {
  receiptNo: string
  issuedAt: string
  companyName: string | null
  bizNo: string | null
  amount: string
  balanceAfter: string
  memo: string | null
}
const receiptOpen = ref(false)
const receiptData = ref<ReceiptData | null>(null)
const receiptRow = computed(() => ({ at: orderDate.value, desc: '크레딧 충전', delta: amount }))
async function openReceipt() {
  if (!ledgerId) {
    toast.add({ title: '영수증 정보를 찾을 수 없습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  receiptOpen.value = true
  receiptData.value = null
  try {
    const res = await api<{ data: ReceiptData }>(`/credit-ledger/${ledgerId}/receipt`)
    receiptData.value = res.data
  }
  catch {
    toast.add({ title: '영수증을 불러오지 못했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>

<template>
  <div class="app-container page-body">
    <div class="result">
      <span class="result-check"><UIcon name="i-lucide-check" /></span>
      <h1 class="result-title">크레딧 결제가 완료되었습니다.</h1>

      <div class="detail-box">
        <div class="d-row">
          <span class="d-label">주문번호</span>
          <span class="d-value accent">{{ orderNo }}</span>
        </div>
        <div class="d-row">
          <span class="d-label">주문일시</span>
          <span class="d-value">{{ orderDate }}</span>
        </div>
        <div class="d-row">
          <span class="d-label">결제금액</span>
          <span class="d-value">{{ amount.toLocaleString() }}원 (VAT 포함)</span>
        </div>
        <div class="d-row">
          <span class="d-label">결제정보</span>
          <span class="d-value">{{ paymentInfo }}</span>
        </div>
        <div class="d-row">
          <span class="d-label">충전 크레딧</span>
          <span class="d-value">
            {{ charged.toLocaleString() }} <span class="cred-ico">C</span>
          </span>
        </div>
        <div class="d-row">
          <span class="d-label">크레딧 유효기간</span>
          <span v-if="bonus > 0" class="d-value">
            보너스 {{ bonus.toLocaleString() }} <span class="cred-ico">C</span>
            <span class="d-sub">({{ validUntil }} 까지)</span>
          </span>
          <span v-else class="d-value">충전 크레딧은 유효기간이 없습니다.</span>
        </div>
      </div>

      <div class="balance-flow">
        <div class="bf-col">
          <span class="bf-label">결제 전 크레딧</span>
          <span class="bf-value">{{ before.toLocaleString() }} <span class="cred-ico">C</span></span>
        </div>
        <span class="bf-arrow"><UIcon name="i-lucide-chevron-right" /></span>
        <div class="bf-col">
          <span class="bf-label">결제 후 크레딧</span>
          <span class="bf-value accent">{{ after.toLocaleString() }} <span class="cred-ico">C</span></span>
        </div>
      </div>

      <div class="result-actions">
        <button type="button" class="btn btn-outline-dark go-btn" @click="openReceipt">
          <UIcon name="i-lucide-receipt" class="text-[length:var(--fz-sm)]" /> 영수증 보기
        </button>
        <button type="button" class="btn btn-primary go-btn" @click="navigateTo('/account/credit')">
          크레딧 관리 바로가기
        </button>
      </div>
    </div>

    <AppReceiptDialog
      :open="receiptOpen"
      :row="receiptRow"
      :receipt="receiptData"
      @close="receiptOpen = false"
    />
  </div>
</template>

<style scoped>
.result {
  max-width: 540px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.result-check {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  font-size: var(--fz-4xl);
  color: var(--accent-ink);
}
.result-title {
  font-size: var(--fz-2xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 8px 0 24px;
  text-align: center;
}

/* 크레딧 단위 아이콘 */
.cred-ico {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--ink-900);
  color: var(--white);
  font-size: var(--fz-2xs);
  font-weight: 700;
  font-family: var(--font-mono);
  vertical-align: -3px;
}

/* 상세 박스 */
.detail-box {
  width: 100%;
  background: var(--ink-50);
  border-radius: var(--r-lg);
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.d-row {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 16px;
  align-items: baseline;
}
.d-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.d-value {
  font-size: var(--fz-md);
  color: var(--ink-800);
}
.d-value.accent {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--accent-ink);
}
.d-sub {
  color: var(--ink-400);
  font-size: var(--fz-sm);
  margin-left: 2px;
}

/* 결제 전/후 크레딧 */
.balance-flow {
  width: 100%;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
}
.bf-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bf-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.bf-value {
  font-family: var(--font-mono);
  font-size: var(--fz-xl);
  font-weight: 700;
  color: var(--ink-900);
}
.bf-value.accent { color: var(--accent-ink); }
.bf-arrow {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--r-full);
  border: 1px solid var(--line);
  color: var(--ink-400);
  flex-shrink: 0;
}

.result-actions {
  width: 100%;
  margin-top: 20px;
  display: flex;
  gap: 10px;
}
.go-btn {
  flex: 1;
  height: 48px;
  font-size: var(--fz-md);
  font-weight: 600;
}

@media (max-width: 480px) {
  .result-actions { flex-direction: column; }
}
</style>
