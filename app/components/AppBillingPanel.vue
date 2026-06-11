<script setup lang="ts">
/* ────────────────────────────────────────────────────────
   AppBillingPanel — /account/billing 결제 내역 패널

   Props 설계 기준: GET /credit-ledger?entryType=charge
   결제 이메일: company.billingEmail (GET /me/company)
   ──────────────────────────────────────────────────────── */

type BillingStatus = 'paid' | 'cancelled' | 'partial_refund'

export interface BillingRow {
  /** 원장 항목 ID (영수증 조회 키) */
  id: string | number
  /** 표시용 일시 문자열 (예: "2026.05.20 14:32") */
  at: string
  /** 항목명 / 상품 설명 */
  item: string
  /** 결제 금액 — 양수, 단위: 원 */
  amount: number
  /** 결제 상태 */
  status: BillingStatus
  /** 영수증 버튼 노출 여부 */
  hasReceipt: boolean
}

const props = withDefaults(defineProps<{
  /** 결제 이메일 (company.billingEmail) */
  billingEmail?: string
  /** 결제 내역 목록 — 미전달 시 목업 데이터로 렌더 */
  rows?: BillingRow[]
  /** 이번 달 청구 합계 — 미전달 시 목업 합산 */
  thisMonthAmount?: number
}>(), {
  billingEmail: '',
  rows: undefined,
  thisMonthAmount: undefined,
})

const emit = defineEmits<{
  /** 결제 이메일 "변경" 버튼 클릭 */
  changeEmail: []
}>()

/* ── 목업 (백엔드 연동 시 props.rows / props.billingEmail 로 교체) ── */
const MOCK_EMAIL = 'billing@example.com'
const MOCK_ROWS: BillingRow[] = [
  { id: 'BL-20260520-0001', at: '2026.05.20 14:32', item: '크레딧 충전 10,000C', amount: 11000, status: 'paid', hasReceipt: true },
  { id: 'BL-20260515-0002', at: '2026.05.15 09:20', item: '크레딧 충전 50,000C', amount: 55000, status: 'cancelled', hasReceipt: false },
  { id: 'BL-20260413-0003', at: '2026.04.13 11:00', item: '크레딧 충전 100,000C', amount: 110000, status: 'paid', hasReceipt: true },
  { id: 'BL-20260310-0004', at: '2026.03.10 09:15', item: '크레딧 충전 20,000C', amount: 22000, status: 'partial_refund', hasReceipt: true },
  { id: 'BL-20260220-0005', at: '2026.02.20 16:48', item: '크레딧 충전 10,000C', amount: 11000, status: 'paid', hasReceipt: true },
]

const displayEmail = computed(() => props.billingEmail || MOCK_EMAIL)
const displayRows = computed(() => props.rows ?? MOCK_ROWS)
const displayMonthAmount = computed(() => {
  if (props.thisMonthAmount !== undefined) return props.thisMonthAmount
  // 목업 기준: 이번 달(2026-05) paid 합산
  return MOCK_ROWS.filter(r => r.at.startsWith('2026.05') && r.status === 'paid')
    .reduce((s, r) => s + r.amount, 0)
})

/* ── 페이지네이션 ── */
const PAGE_SIZES = [20, 50, 100] as const
const pageSize = ref<number>(PAGE_SIZES[0])
const page = ref(1)
const pageCount = computed(() => Math.max(1, Math.ceil(displayRows.value.length / pageSize.value)))
const pagedRows = computed(() =>
  displayRows.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value),
)
watch([displayRows, pageSize], () => { page.value = 1 })
watch(pageCount, () => { if (page.value > pageCount.value) page.value = pageCount.value })

/* ── 영수증 모달 ── */
const receiptOpen = ref(false)
const receiptTarget = ref<BillingRow | null>(null)
function openReceipt(row: BillingRow) {
  receiptTarget.value = row
  receiptOpen.value = true
}
/** AppReceiptDialog 호환 형식으로 변환 */
const receiptRow = computed(() => receiptTarget.value
  ? { at: receiptTarget.value.at, desc: receiptTarget.value.item, delta: receiptTarget.value.amount }
  : null,
)

/* ── 상태 표시 ── */
const STATUS_META: Record<BillingStatus, { label: string, badge: string }> = {
  paid: { label: '결제완료', badge: 'badge-success' },
  cancelled: { label: '취소', badge: 'badge-neutral' },
  partial_refund: { label: '부분취소', badge: 'badge-neutral' },
}

function won(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}
</script>

<template>
  <div class="bl-panel">
    <section class="ms-sec">
      <div class="ms-head">
        <h3>결제 내역</h3>
      </div>

      <!-- 결제 이메일 정보 행 -->
      <div class="bl-info-rows">
        <div class="bl-info-row">
          <span class="bl-info-label">결제 이메일</span>
          <div class="bl-info-value">
            <span class="bl-email">{{ displayEmail || '—' }}</span>
            <button type="button" class="btn btn-outline-dark btn-sm" @click="emit('changeEmail')">
              변경
            </button>
          </div>
        </div>
      </div>

      <!-- 이번 달 청구액 stat -->
      <div class="bl-stat-row">
        <div class="bl-stat-card">
          <span class="bl-stat-icon">
            <UIcon name="i-lucide-receipt" />
          </span>
          <div class="bl-stat-body">
            <span class="bl-stat-label">이번 달 청구액</span>
            <span class="bl-stat-amount">{{ won(displayMonthAmount) }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 결제 내역 테이블 (B 테이블 스타일) -->
    <section class="ms-sec">
      <h4 class="bl-section-title">전체 결제 내역</h4>

      <div class="list-card">
        <!-- 툴바 -->
        <div class="list-toolbar">
          <div class="tb-group">
            <span class="toolbar-count">
              총 <strong>{{ displayRows.length.toLocaleString() }}</strong>건
            </span>
          </div>
          <div class="tb-group">
            <select v-model="pageSize" class="select bl-pagesize">
              <option v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n }}개씩</option>
            </select>
          </div>
        </div>

        <!-- 테이블 본체 -->
        <div class="list-table-scroll">
          <table class="table list-table" data-table-style="b">
            <thead>
              <tr>
                <th style="width: 188px">일시</th>
                <th>항목</th>
                <th style="width: 140px" class="ta-right">금액</th>
                <th style="width: 96px">상태</th>
                <th style="width: 80px" class="ta-center">영수증</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in pagedRows" :key="row.id">
                <td class="cell-mono">{{ row.at }}</td>
                <td class="bl-item">{{ row.item }}</td>
                <td class="ta-right cell-mono bl-amount">{{ won(row.amount) }}</td>
                <td>
                  <span class="badge" :class="STATUS_META[row.status].badge">
                    {{ STATUS_META[row.status].label }}
                  </span>
                </td>
                <td class="ta-center">
                  <button
                    v-if="row.hasReceipt"
                    type="button"
                    class="bl-receipt-btn"
                    aria-label="영수증 보기"
                    @click="openReceipt(row)"
                  >
                    <UIcon name="i-lucide-file-text" class="text-[length:var(--fz-sm)]" />
                    보기
                  </button>
                  <span v-else class="bl-no-receipt">—</span>
                </td>
              </tr>
              <tr v-if="!displayRows.length">
                <td colspan="5" class="bl-empty">결제 내역이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
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

    <!-- 기존 AppReceiptDialog 재사용 -->
    <AppReceiptDialog
      :open="receiptOpen"
      :row="receiptRow"
      @close="receiptOpen = false"
    />
  </div>
</template>

<style scoped>
.ms-sec + .ms-sec {
  margin-top: 32px;
}

/* 섹션 헤더 */
.ms-head {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}

/* 결제 이메일 행 */
.bl-info-rows {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.bl-info-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}
.bl-info-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
}
.bl-info-value {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.bl-email {
  font-size: var(--fz-md);
  color: var(--ink-800);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 이번 달 청구액 stat */
.bl-stat-row {
  margin-bottom: 4px;
}
.bl-stat-card {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: var(--ink-50);
  border-radius: var(--r-md);
  min-width: 220px;
}
.bl-stat-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--white);
  color: var(--ink-500);
  font-size: var(--fz-xl);
  flex-shrink: 0;
}
.bl-stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.bl-stat-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.bl-stat-amount {
  font-family: var(--font-mono);
  font-size: var(--fz-xl);
  font-weight: 700;
  color: var(--ink-900);
}

/* 섹션 타이틀 */
.bl-section-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 12px;
}

/* 테이블 카드 (B style — 툴바 + 테이블 + 페이저) */
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
.bl-pagesize { width: 110px; }

.list-table-scroll { overflow-x: auto; }
.list-table { width: 100%; }

.ta-right { text-align: right; }
.ta-center { text-align: center; }

.bl-item {
  color: var(--ink-800);
  font-size: var(--fz-md);
}
.bl-amount {
  color: var(--ink-900);
  font-weight: 600;
}

/* 영수증 버튼 */
.bl-receipt-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 24px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--ink-50);
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-600);
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}
.bl-receipt-btn:hover {
  border-color: var(--ink-300);
  color: var(--ink-900);
  background: var(--white);
}
.bl-no-receipt {
  color: var(--ink-300);
  font-size: var(--fz-sm);
}

/* 빈 상태 */
.bl-empty {
  text-align: center;
  color: var(--ink-400);
  padding: 48px 0;
  font-size: var(--fz-sm);
}

/* 페이지네이션 */
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

@media (max-width: 640px) {
  .bl-info-row { grid-template-columns: 1fr; gap: 4px; }
  .bl-stat-card { width: 100%; }
}
</style>
