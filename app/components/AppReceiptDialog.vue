<script setup lang="ts">
interface ReceiptRow {
  at: string
  desc: string
  delta: number
}

const props = defineProps<{
  open: boolean
  row?: ReceiptRow | null
}>()

const emit = defineEmits<{ close: [] }>()

/* 금액 계산 (크레딧 1 = 1원, 부가세 포함가 역산) */
const amount = computed(() => Math.abs(props.row?.delta ?? 0))
const supply = computed(() => Math.round(amount.value / 1.1))
const vat = computed(() => amount.value - supply.value)
const orderNo = computed(() => {
  const digits = (props.row?.at ?? '').replace(/\D/g, '')
  return `MNC-${digits.slice(0, 8) || '00000000'}-${digits.slice(8) || '0000'}`
})

function won(n: number) {
  return `${n.toLocaleString('ko-KR')}원`
}

let locked = false
function lock() {
  if (locked || !import.meta.client) return
  lockScroll()
  locked = true
}
function unlock() {
  if (!locked || !import.meta.client) return
  unlockScroll()
  locked = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
watch(() => props.open, (v) => {
  if (!import.meta.client) return
  if (v) {
    lock()
    window.addEventListener('keydown', onKey)
  }
  else {
    unlock()
    window.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  unlock()
  if (import.meta.client) window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open && row" class="modal-backdrop" @click="emit('close')">
      <div class="rc-modal" @click.stop>
        <!-- 헤더 -->
        <header class="rc-head">
          <div class="rc-head-main">
            <h2>영수증</h2>
            <p>{{ orderNo }}</p>
          </div>
          <button type="button" class="rc-x" aria-label="닫기" @click="emit('close')">
            <UIcon name="i-lucide-x" />
          </button>
        </header>

        <!-- 본문 -->
        <div class="rc-body">
          <div class="rc-doc">
            <div class="rc-doc-top">
              <h3>크레딧 충전 영수증</h3>
              <span class="rc-doc-amount">{{ won(amount) }}</span>
            </div>

            <table class="rc-table">
              <tbody>
                <tr><th>주문번호</th><td>{{ orderNo }}</td></tr>
                <tr><th>거래일시</th><td>{{ row.at }}</td></tr>
                <tr><th>상품명</th><td>{{ row.desc }} ({{ amount.toLocaleString('ko-KR') }} 크레딧)</td></tr>
                <tr><th>결제수단</th><td>신용카드 (**** **** **** 5547)</td></tr>
              </tbody>
            </table>

            <div class="rc-section-label">결제 금액</div>
            <table class="rc-table">
              <tbody>
                <tr><th>공급가액</th><td>{{ won(supply) }}</td></tr>
                <tr><th>부가세</th><td>{{ won(vat) }}</td></tr>
                <tr class="rc-total"><th>합계</th><td>{{ won(amount) }}</td></tr>
              </tbody>
            </table>

            <div class="rc-section-label">공급자 정보</div>
            <table class="rc-table">
              <tbody>
                <tr><th>상호</th><td>(주)맑은소프트</td></tr>
                <tr><th>사업자등록번호</th><td>110-86-39050</td></tr>
                <tr><th>대표자</th><td>하근호</td></tr>
                <tr><th>주소</th><td>서울특별시 구로구 디지털로 288, 1701호</td></tr>
              </tbody>
            </table>

            <p class="rc-note">
              <UIcon name="i-lucide-info" /> 본 영수증은 신용카드 매출전표로 영수증을 갈음합니다.
            </p>
          </div>
        </div>

        <!-- 푸터 -->
        <footer class="rc-foot">
          <button type="button" class="btn btn-outline-dark" @click="emit('close')">
            닫기
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.rc-modal {
  width: 480px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--r-lg);
  overflow: hidden;
}

/* 헤더 */
.rc-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.rc-head-main h2 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 3px;
}
.rc-head-main p {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0;
}
.rc-x {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-400);
  font-size: var(--fz-lg);
  flex-shrink: 0;
}
.rc-x:hover { background: var(--ink-50); color: var(--ink-900); }

/* 본문 */
.rc-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px;
  background: var(--paper, var(--ink-50));
}
.rc-doc {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 24px;
}
.rc-doc-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 2px solid var(--ink-900);
}
.rc-doc-top h3 {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.rc-doc-amount {
  font-family: var(--font-mono);
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
}

.rc-section-label {
  font-size: var(--fz-xs);
  font-weight: 700;
  color: var(--ink-500);
  margin: 18px 0 6px;
}
.rc-table {
  width: 100%;
  border-collapse: collapse;
}
.rc-table th,
.rc-table td {
  padding: 8px 2px;
  font-size: var(--fz-sm);
  text-align: left;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
.rc-table tr:last-child th,
.rc-table tr:last-child td { border-bottom: 0; }
.rc-table th {
  width: 116px;
  font-weight: 500;
  color: var(--ink-500);
}
.rc-table td {
  color: var(--ink-800);
}
.rc-total th,
.rc-total td {
  padding-top: 10px;
  font-weight: 700;
  color: var(--ink-900);
}
.rc-total td {
  font-family: var(--font-mono);
  font-size: var(--fz-md);
}

.rc-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 16px 0 0;
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

/* 푸터 */
.rc-foot {
  display: flex;
  justify-content: flex-end;
  padding: 14px 22px;
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
</style>
