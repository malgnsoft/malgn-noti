<script setup lang="ts">
const toast = useToast()
const api = useApi()
const auth = useAuthStore()

/* 보유 크레딧 — auth store가 정본(/me) */
const balance = computed(() => auth.creditBalance)

/* 서버 원장(TB_CREDIT_LEDGER) 원형 — amount는 부호 있는 DECIMAL 문자열 */
type EntryType = 'charge' | 'consume' | 'refund' | 'cancel' | 'admin_grant' | 'expire' | 'hold' | 'hold_release'
interface LedgerRow {
  id: number
  entryType: EntryType
  amount: string
  balanceAfter: string
  description: string | null
  bonusYn: 'Y' | 'N'
  expireAt: string | null
  createdAt: string
}

const ENTRY_LABEL: Record<EntryType, string> = {
  charge: '충전', consume: '사용', refund: '환불', cancel: '취소',
  admin_grant: '관리자 지급', expire: '소멸', hold: '홀드', hold_release: '홀드 해제',
}
/* 구분 필터(한글) → entryType 서버 파라미터 */
const TYPE_TO_ENTRY: Record<string, EntryType | undefined> = {
  전체구분: undefined, 충전: 'charge', '관리자 지급': 'admin_grant', 취소: 'cancel', 사용: 'consume', 소멸: 'expire',
}

interface CreditRow {
  id: number
  at: string
  type: string
  desc: string
  receipt: boolean
  delta: number
  expireAt: string
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '-'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function toCreditRow(r: LedgerRow): CreditRow {
  return {
    id: r.id,
    at: fmtDateTime(r.createdAt),
    type: ENTRY_LABEL[r.entryType] ?? r.entryType,
    desc: r.description ?? '',
    receipt: r.entryType === 'charge',
    delta: Number(r.amount),
    expireAt: fmtDateTime(r.expireAt),
  }
}

/* 기간 필터 */
const PRESETS = [
  { key: 'today', label: '오늘' },
  { key: 'week', label: '1주일' },
  { key: 'month', label: '이번 달' },
  { key: 'quarter', label: '3개월' },
]
const preset = ref('month')
const fromDate = ref('')
const toDate = ref('')
const keyword = ref('')

function toISO(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
/* 프리셋 클릭 시 시작·마감일 자동 설정 */
function applyPreset(key: string) {
  preset.value = key
  const today = new Date()
  const from = new Date(today)
  if (key === 'week') from.setDate(from.getDate() - 7)
  else if (key === 'month') from.setDate(1)
  else if (key === 'quarter') from.setMonth(from.getMonth() - 3)
  fromDate.value = toISO(from)
  toDate.value = toISO(today)
}
applyPreset('month')

/* 구분 필터 */
const TYPES = ['전체구분', '충전', '관리자 지급', '취소', '사용', '소멸'] as const
const typeFilter = ref<typeof TYPES[number]>('전체구분')

const PAGE_SIZES = [30, 50, 100]
const pageSize = ref(30)

/* 충전·사용 내역 — 서버 원장 로드(커서 페이징, 최대 5페이지 누적) */
const ledger = ref<LedgerRow[]>([])
const loading = ref(false)

function dayStartISO(d: string): string | undefined {
  if (!d) return undefined
  const dt = new Date(`${d}T00:00:00`)
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString()
}
function dayEndISO(d: string): string | undefined {
  if (!d) return undefined
  const dt = new Date(`${d}T23:59:59.999`)
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString()
}

async function loadLedger() {
  if (loading.value) return
  loading.value = true
  try {
    const entryType = TYPE_TO_ENTRY[typeFilter.value]
    const from = dayStartISO(fromDate.value)
    const to = dayEndISO(toDate.value)
    const all: LedgerRow[] = []
    let cursor: string | null = null
    for (let i = 0; i < 5; i++) {
      const q = new URLSearchParams({ limit: '100' })
      if (entryType) q.set('entryType', entryType)
      if (from) q.set('from', from)
      if (to) q.set('to', to)
      if (cursor) q.set('cursor', cursor)
      const res = await api<{ data: LedgerRow[], nextCursor: string | null }>(`/credit-ledger?${q.toString()}`)
      all.push(...res.data)
      cursor = res.nextCursor
      if (!cursor) break
    }
    ledger.value = all
  }
  catch {
    toast.add({ title: '크레딧 내역을 불러오지 못했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    loading.value = false
  }
}

// SSR에서 실패해도 죽지 않도록 swallow — client mount 시 재시도.
try { await Promise.all([loadLedger(), auth.fetchMe()]) }
catch { /* ignore */ }
onMounted(() => {
  if (ledger.value.length === 0) loadLedger()
})

/* 보유 크레딧 요약 — 별도 집계 엔드포인트가 없어 로드된 원장 기준 best-effort */
const STATS = computed(() => {
  const now = new Date()
  let charged = 0
  let bonus = 0
  let usedThisMonth = 0
  for (const r of ledger.value) {
    const amt = Number(r.amount)
    if (r.entryType === 'charge') charged += amt
    if (r.bonusYn === 'Y') bonus += amt
    if (r.entryType === 'consume') {
      const d = new Date(r.createdAt)
      if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) usedThisMonth += Math.abs(amt)
    }
  }
  return [
    { label: '총 충전한 크레딧', value: charged },
    { label: '보너스 크레딧', value: bonus },
    { label: '이번 달 사용 크레딧', value: usedThisMonth },
  ]
})

/* 검색 조건 — 검색하기 클릭 시점에 적용(키워드는 client-side 필터) */
const applied = ref({ keyword: '' })
const rows = computed(() => ledger.value.map(toCreditRow))
const filteredRows = computed(() => rows.value.filter((r) => {
  if (applied.value.keyword && !r.desc.includes(applied.value.keyword)) return false
  return true
}))

/* 페이지네이션 */
const page = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))
const pagedRows = computed(() =>
  filteredRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value),
)
watch([applied, pageSize], () => { page.value = 1 })
watch(pageCount, () => { if (page.value > pageCount.value) page.value = pageCount.value })

function fmt(n: number) {
  return Math.abs(n).toLocaleString('ko-KR')
}
async function search() {
  applied.value = { keyword: keyword.value.trim() }
  page.value = 1
  await loadLedger()
}
async function resetFilter() {
  keyword.value = ''
  typeFilter.value = '전체구분'
  applyPreset('month')
  applied.value = { keyword: '' }
  await loadLedger()
}
function goCharge() {
  navigateTo('/charge')
}

/* 영수증 모달 */
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
const receiptRow = ref<CreditRow | null>(null)
const receiptData = ref<ReceiptData | null>(null)
async function openReceipt(r: CreditRow) {
  receiptRow.value = r
  receiptData.value = null
  receiptOpen.value = true
  try {
    const res = await api<{ data: ReceiptData }>(`/credit-ledger/${r.id}/receipt`)
    receiptData.value = res.data
  }
  catch {
    toast.add({ title: '영수증을 불러오지 못했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>

<template>
  <div class="credit-panel">
    <section class="ms-sec">
      <div class="ms-head">
        <h3>크레딧 관리</h3>
      </div>

      <!-- 보유 크레딧 -->
      <div class="cr-balance">
        <div class="cr-balance-card">
          <span class="cr-avatar"><UIcon name="i-lucide-circle-user-round" /></span>
          <div class="cr-balance-info">
            <span class="cr-balance-label">보유 크레딧</span>
            <span class="cr-balance-amount">
              {{ balance.toLocaleString('ko-KR') }}<span class="cr-coin">C</span>
            </span>
          </div>
          <button type="button" class="btn btn-outline-dark cr-charge-btn" @click="goCharge">
            크레딧 충전
          </button>
        </div>
        <ul class="cr-stats">
          <li v-for="s in STATS" :key="s.label">
            <span class="cr-stat-label">{{ s.label }}</span>
            <span class="cr-stat-value">
              {{ s.value.toLocaleString('ko-KR') }}<span class="cr-coin sm">C</span>
            </span>
          </li>
        </ul>
      </div>

      <!-- 검색 필터 (A 테이블 스타일 — docs/DESIGN.md §6.5) -->
      <div class="filter-bar">
        <div class="cr-presets">
          <button
            v-for="p in PRESETS"
            :key="p.key"
            type="button"
            :class="{ active: preset === p.key }"
            @click="applyPreset(p.key)"
          >{{ p.label }}</button>
        </div>
        <div class="fb-daterange">
          <input v-model="fromDate" type="date" class="input cr-date">
          <span class="fb-tilde">~</span>
          <input v-model="toDate" type="date" class="input cr-date">
        </div>
        <select v-model="typeFilter" class="select fb-select">
          <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
        <div class="cr-search">
          <UIcon name="i-lucide-search" class="cr-search-icon" />
          <input v-model="keyword" class="input cr-search-input" placeholder="내용 입력" @keyup.enter="search">
        </div>
        <div class="fb-actions">
          <button type="button" class="btn btn-neutral btn-sm" @click="resetFilter">
            초기화
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="search">
            <UIcon name="i-lucide-search" class="text-[length:var(--fz-sm)]" /> 검색하기
          </button>
        </div>
      </div>

      <!-- 충전 및 사용 내역 -->
      <h4 class="cr-section-title">충전 및 사용 내역</h4>
      <div class="list-card">
        <div class="list-toolbar">
          <div class="tb-group">
            <span class="toolbar-count">총 <strong>{{ filteredRows.length.toLocaleString() }}</strong>건</span>
          </div>
          <div class="tb-group">
            <select v-model="pageSize" class="select cr-pagesize">
              <option v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n }}개씩</option>
            </select>
          </div>
        </div>

        <div class="list-table-scroll">
          <table class="table list-table" data-table-style="a">
            <thead>
              <tr>
                <th style="width: 188px">일시</th>
                <th style="width: 110px">구분</th>
                <th>내용</th>
                <th style="width: 150px" class="ta-right">크레딧</th>
                <th style="width: 188px">소멸일시</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in pagedRows" :key="i">
                <td class="cr-mono">{{ r.at }}</td>
                <td>{{ r.type }}</td>
                <td>
                  <span class="cr-desc">{{ r.desc }}</span>
                  <button v-if="r.receipt" type="button" class="cr-receipt" @click="openReceipt(r)">
                    영수증
                  </button>
                </td>
                <td class="ta-right">
                  <span class="cr-delta" :class="r.delta >= 0 ? 'plus' : 'minus'">
                    <UIcon :name="r.delta >= 0 ? 'i-lucide-circle-arrow-up' : 'i-lucide-circle-arrow-down'" />
                    {{ r.delta >= 0 ? '+' : '-' }}{{ fmt(r.delta) }}
                  </span>
                </td>
                <td class="cr-mono cr-expire">{{ r.expireAt }}</td>
              </tr>
              <tr v-if="!filteredRows.length">
                <td colspan="5" class="cr-empty">조회된 내역이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="list-pager">
          <button class="pager-btn" :disabled="page === 1" aria-label="처음" @click="page = 1">
            <UIcon name="i-lucide-chevrons-left" class="text-sm" />
          </button>
          <button class="pager-btn" :disabled="page === 1" aria-label="이전" @click="page--">
            <UIcon name="i-lucide-chevron-left" class="text-sm" />
          </button>
          <button
            v-for="n in pageCount"
            :key="n"
            class="pager-btn"
            :class="{ 'pager-btn--active': n === page }"
            @click="page = n"
          >
            {{ n }}
          </button>
          <button class="pager-btn" :disabled="page === pageCount" aria-label="다음" @click="page++">
            <UIcon name="i-lucide-chevron-right" class="text-sm" />
          </button>
          <button class="pager-btn" :disabled="page === pageCount" aria-label="마지막" @click="page = pageCount">
            <UIcon name="i-lucide-chevrons-right" class="text-sm" />
          </button>
        </div>
      </div>
    </section>

    <AppReceiptDialog
      :open="receiptOpen"
      :row="receiptRow"
      :receipt="receiptData"
      @close="receiptOpen = false"
    />
  </div>
</template>

<style scoped>
.ms-head {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}

/* 크레딧 단위 코인 */
.cr-coin {
  display: inline-grid;
  place-items: center;
  width: 17px;
  height: 17px;
  margin-left: 5px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--white);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  vertical-align: 1px;
}
.cr-coin.sm {
  width: 15px;
  height: 15px;
  font-size: 9px;
}

/* 보유 크레딧 */
.cr-balance {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
}
.cr-balance-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  background: var(--ink-50);
  border-radius: var(--r-md);
}
.cr-avatar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--white);
  color: var(--accent);
  font-size: var(--fz-2xl);
  flex-shrink: 0;
}
.cr-balance-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cr-balance-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.cr-balance-amount {
  font-family: var(--font-mono);
  font-size: var(--fz-2xl);
  font-weight: 700;
  color: var(--ink-900);
}
.cr-charge-btn {
  margin-left: 8px;
  flex-shrink: 0;
}

.cr-stats {
  flex: 1;
  min-width: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cr-stats li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.cr-stat-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.cr-stat-value {
  font-family: var(--font-mono);
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}

/* 검색 필터 바 (A) */
.cr-presets {
  display: flex;
  gap: 6px;
}
.cr-presets button {
  height: 34px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
  transition: all 0.12s;
}
.cr-presets button:hover { border-color: var(--ink-300); }
.cr-presets button.active {
  background: var(--ink-900);
  border-color: var(--ink-900);
  color: var(--white);
}
.fb-daterange {
  display: flex;
  align-items: center;
  gap: 6px;
}
.fb-tilde { color: var(--ink-400); }
.cr-date { width: 152px; }
.fb-select { width: 132px; }

.cr-search {
  position: relative;
  flex: 1;
  min-width: 180px;
}
.cr-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  font-size: var(--fz-md);
}
.cr-search-input {
  width: 100%;
  padding-left: 36px;
}
.fb-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

/* 내역 (A — list-card + 툴바) */
.cr-section-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 12px;
}
.list-card {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  overflow: hidden;
}
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.tb-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toolbar-count {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  white-space: nowrap;
}
.toolbar-count strong {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--ink-900);
}
.cr-pagesize { width: 110px; }

.list-table-scroll { overflow-x: auto; }
.list-table { width: 100%; }
.ta-right { text-align: right; }
.cr-mono {
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--ink-600);
}
.cr-expire { color: var(--ink-400); }
.cr-desc { color: var(--ink-800); }
.cr-receipt {
  margin-left: 8px;
  height: 20px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--ink-50);
  font-size: var(--fz-2xs);
  font-weight: 600;
  color: var(--ink-600);
  vertical-align: 1px;
}
.cr-receipt:hover { border-color: var(--ink-300); color: var(--ink-900); }

.cr-delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  font-weight: 700;
}
.cr-delta.plus { color: var(--accent-ink); }
.cr-delta.minus { color: var(--ink-500); }

.cr-empty {
  text-align: center;
  color: var(--ink-400);
  padding: 32px 0;
}

/* 페이지바 */
.list-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 12px;
  border-top: 1px solid var(--line);
}
.pager-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: var(--fz-sm);
  color: var(--ink-600);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}
.pager-btn:hover:not(:disabled):not(.pager-btn--active) {
  background: var(--ink-50);
  border-color: var(--ink-200);
}
.pager-btn:disabled {
  color: var(--ink-300);
  cursor: not-allowed;
}
.pager-btn--active {
  background: var(--ink-900);
  border-color: var(--ink-900);
  color: var(--white);
}

@media (max-width: 760px) {
  .cr-balance { flex-direction: column; align-items: stretch; gap: 16px; }
}
</style>
