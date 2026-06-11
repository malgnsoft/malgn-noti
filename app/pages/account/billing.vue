<script setup lang="ts">
useHead({ title: '나의 페이지 — 결제 내역' })

const api = useApi()
const auth = useAuthStore()
const toast = useToast()

type BillingStatus = 'paid' | 'cancelled' | 'partial_refund'
interface BillingRow {
  id: string | number
  at: string
  item: string
  amount: number
  status: BillingStatus
  hasReceipt: boolean
}
/* 서버 원장(TB_CREDIT_LEDGER, charge 한정) */
interface LedgerRow {
  id: number
  entryType: string
  amount: string
  description: string | null
  createdAt: string
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* 결제(충전) 내역 — GET /credit-ledger?entryType=charge (커서 누적, 최대 5페이지) */
const ledger = ref<LedgerRow[]>([])
async function loadCharges() {
  const all: LedgerRow[] = []
  let cursor: string | null = null
  for (let i = 0; i < 5; i++) {
    const q = new URLSearchParams({ limit: '100', entryType: 'charge' })
    if (cursor) q.set('cursor', cursor)
    const res = await api<{ data: LedgerRow[], nextCursor: string | null }>(`/credit-ledger?${q.toString()}`)
    all.push(...res.data)
    cursor = res.nextCursor
    if (!cursor) break
  }
  ledger.value = all
}

// SSR에서 실패해도 죽지 않도록 swallow — client mount 시 재시도.
try { await Promise.all([loadCharges(), auth.fetchMe()]) }
catch { /* ignore */ }
onMounted(() => {
  if (ledger.value.length === 0) loadCharges().catch(() => { /* ignore */ })
})

const billingRows = computed<BillingRow[]>(() => ledger.value.map(r => ({
  id: r.id,
  at: fmtDateTime(r.createdAt),
  item: r.description || '크레딧 충전',
  amount: Math.abs(Number(r.amount)),
  // 단건 충전 원장 행에는 취소/부분환불 상태가 없어 결제완료로 표기(별도 cancel/refund 행 미반영).
  status: 'paid',
  hasReceipt: true,
}))
)
const thisMonthTotal = computed(() => {
  const now = new Date()
  return ledger.value.reduce((sum, r) => {
    const d = new Date(r.createdAt)
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      return sum + Math.abs(Number(r.amount))
    }
    return sum
  }, 0)
})
const billingEmail = computed(() => auth.tenant?.billingEmail ?? '')

/* 결제 이메일 변경 — PATCH /me/company { billingEmail } (api-dev 계약) */
const emailOpen = ref(false)
const newEmail = ref('')
const savingEmail = ref(false)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailValid = computed(() => EMAIL_RE.test(newEmail.value.trim()))

function openEmail() {
  newEmail.value = auth.tenant?.billingEmail ?? ''
  emailOpen.value = true
}
async function saveEmail() {
  if (!emailValid.value || savingEmail.value) return
  savingEmail.value = true
  try {
    await auth.updateCompany({ billingEmail: newEmail.value.trim() })
    emailOpen.value = false
    toast.add({ title: '결제 이메일이 변경되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch {
    toast.add({ title: '결제 이메일 변경에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    savingEmail.value = false
  }
}
</script>

<template>
  <AppMyPageShell>
    <AppBillingPanel
      :billing-email="billingEmail"
      :rows="billingRows"
      :this-month-amount="thisMonthTotal"
      @change-email="openEmail"
    />

    <!-- 결제 이메일 변경 -->
    <AppModal :open="emailOpen" title="결제 이메일 변경" :width="400" @close="emailOpen = false">
      <p class="be-desc">결제·세금계산서 안내를 받을 이메일 주소를 입력해 주세요.</p>
      <input
        v-model="newEmail"
        type="email"
        class="input be-input"
        placeholder="billing@company.com"
        autocomplete="email"
        @keyup.enter="saveEmail"
      >
      <template #footer>
        <button type="button" class="btn btn-outline-dark" @click="emailOpen = false">
          취소
        </button>
        <button type="button" class="btn btn-primary" :disabled="!emailValid || savingEmail" @click="saveEmail">
          변경
        </button>
      </template>
    </AppModal>
  </AppMyPageShell>
</template>

<style scoped>
.be-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 14px;
}
.be-input { width: 100%; }
</style>
