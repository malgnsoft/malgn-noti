<script setup lang="ts">
const toast = useToast()

/* 보유 크레딧 (목업 — 백엔드 연동 시 교체) */
const balance = 300000
const STATS = [
  { label: '총 충전한 크레딧', value: 300000 },
  { label: '보너스 크레딧', value: 1000 },
  { label: '이번 달 사용 크레딧', value: 5000 },
]

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

interface CreditRow {
  at: string
  type: '충전' | '관리자 지급' | '취소' | '사용' | '소멸'
  desc: string
  receipt?: boolean
  delta: number
  expireAt: string
}

/* 충전·사용 내역 (목업) */
const ROWS: CreditRow[] = [
  { at: '2026.05.20 14:32', type: '충전', desc: '크레딧 구매', receipt: true, delta: 10000, expireAt: '2027.05.20 14:32' },
  { at: '2026.05.18 10:05', type: '관리자 지급', desc: '이벤트 당첨 10,000 크레딧 충전', delta: 10000, expireAt: '2027.05.18 10:05' },
  { at: '2026.05.15 09:20', type: '취소', desc: '환불 차감', delta: 10000, expireAt: '2027.05.15 09:20' },
  { at: '2026.05.12 16:48', type: '사용', desc: '결제 취소', delta: -2000, expireAt: '-' },
  { at: '2026.05.10 11:30', type: '소멸', desc: '이메일 전송', delta: -2000, expireAt: '-' },
]

/* 검색 조건 — 검색하기 클릭 시점에 적용 */
const applied = ref({ keyword: '', type: '전체구분' as typeof TYPES[number] })
const filteredRows = computed(() => ROWS.filter((r) => {
  if (applied.value.type !== '전체구분' && r.type !== applied.value.type) return false
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
function search() {
  applied.value = { keyword: keyword.value.trim(), type: typeFilter.value }
}
function resetFilter() {
  keyword.value = ''
  typeFilter.value = '전체구분'
  applyPreset('month')
  applied.value = { keyword: '', type: '전체구분' }
}
function onRefresh() {
  toast.add({ title: '내역을 새로고침했습니다.', color: 'info', icon: 'i-lucide-refresh-cw' })
}
function goCharge() {
  navigateTo('/charge')
}
/* 영수증 모달 */
const receiptOpen = ref(false)
const receiptRow = ref<CreditRow | null>(null)
function openReceipt(r: CreditRow) {
  receiptRow.value = r
  receiptOpen.value = true
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

      <!-- 검색 필터 (A 테이블 스타일 — doc/DESIGN.md §6.5) -->
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
            <span class="toolbar-sep">|</span>
            <button type="button" class="toolbar-refresh" @click="onRefresh">
              <UIcon name="i-lucide-refresh-cw" class="text-[length:var(--fz-sm)]" /> 새로고침
            </button>
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
.toolbar-sep {
  color: var(--line);
  user-select: none;
}
.toolbar-refresh {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-size: var(--fz-sm);
  color: var(--ink-600);
  cursor: pointer;
}
.toolbar-refresh:hover { color: var(--ink-900); }
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
