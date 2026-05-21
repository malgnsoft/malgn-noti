<script setup lang="ts">
import Chart from 'chart.js/auto'

useHead({ title: '통계' })

const toast = useToast()

/* ── 통계 데이터 (백엔드 연동 전 목업) ──────────────────────────── */
type NumKey = 'req' | 'reqCancel' | 'sent' | 'sentFail' | 'recv' | 'recvFail' | 'notSent'

interface StatRow {
  date: string
  req: number
  reqCancel: number
  sent: number
  sentFail: number
  recv: number
  recvFail: number
  notSent: number
}

const STAT_ROWS: StatRow[] = [
  { date: '2026-05-13', req: 49, reqCancel: 0, sent: 47, sentFail: 0, recv: 35, recvFail: 12, notSent: 0 },
  { date: '2026-05-14', req: 89, reqCancel: 0, sent: 87, sentFail: 0, recv: 70, recvFail: 17, notSent: 0 },
  { date: '2026-05-15', req: 92, reqCancel: 0, sent: 90, sentFail: 0, recv: 72, recvFail: 18, notSent: 0 },
  { date: '2026-05-16', req: 157, reqCancel: 0, sent: 155, sentFail: 0, recv: 130, recvFail: 25, notSent: 0 },
  { date: '2026-05-17', req: 197, reqCancel: 0, sent: 181, sentFail: 0, recv: 160, recvFail: 21, notSent: 0 },
  { date: '2026-05-18', req: 175, reqCancel: 0, sent: 168, sentFail: 0, recv: 147, recvFail: 21, notSent: 0 },
  { date: '2026-05-19', req: 185, reqCancel: 0, sent: 161, sentFail: 0, recv: 137, recvFail: 24, notSent: 0 },
  { date: '2026-05-20', req: 103, reqCancel: 0, sent: 91, sentFail: 0, recv: 72, recvFail: 19, notSent: 0 },
]

// 시리즈 = 차트 데이터셋 + 표 컬럼 공통 정의 (7종 상태)
const SERIES: { key: NumKey, label: string, color: string }[] = [
  { key: 'req', label: '요청', color: '#60a5fa' },
  { key: 'reqCancel', label: '요청 취소', color: '#f59e0b' },
  { key: 'sent', label: '발송', color: '#ef4444' },
  { key: 'sentFail', label: '발송 실패', color: '#22c55e' },
  { key: 'recv', label: '수신', color: '#8b5cf6' },
  { key: 'recvFail', label: '수신 실패', color: '#ec4899' },
  { key: 'notSent', label: '실발송', color: '#9ca3af' },
]

const totals = computed(() => {
  const t: Record<NumKey, number> = { req: 0, reqCancel: 0, sent: 0, sentFail: 0, recv: 0, recvFail: 0, notSent: 0 }
  for (const r of STAT_ROWS)
    for (const s of SERIES) t[s.key] += r[s.key]
  return t
})

/* ── 검색 필터 ───────────────────────────────────────────────────── */
const DEF = { channel: 'all', period: '지정', from: '2026-05-13T00:00', to: '2026-05-20T23:59' }

const fChannel = ref(DEF.channel)
const fPeriod = ref(DEF.period)
const fFrom = ref(DEF.from)
const fTo = ref(DEF.to)

// 기간 프리셋 ↔ 날짜 범위 동기화
function fmtDay(d: Date, end = false) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}T${end ? '23:59' : '00:00'}`
}
let syncingPeriod = false
watch(fPeriod, (p) => {
  if (p === '지정') return
  const now = new Date()
  const start = new Date(now)
  if (p === '최근 7일') start.setDate(start.getDate() - 7)
  else if (p === '최근 30일') start.setDate(start.getDate() - 30)
  // '오늘' → start = now (당일)
  syncingPeriod = true
  fFrom.value = fmtDay(start)
  fTo.value = fmtDay(now, true)
  nextTick(() => { syncingPeriod = false })
})
// 날짜를 직접 수정하면 기간 셀렉트는 '지정'으로
watch([fFrom, fTo], () => {
  if (!syncingPeriod) fPeriod.value = '지정'
})

function onReset() {
  fChannel.value = DEF.channel
  fPeriod.value = DEF.period
  fFrom.value = DEF.from
  fTo.value = DEF.to
}
function onSearch() {
  toast.add({ title: '통계 조회', description: '조회 조건을 적용했습니다.', icon: 'i-lucide-chart-line' })
}
function onDownload() {
  toast.add({ title: '다운로드', description: '통계 데이터 다운로드를 요청했습니다.', icon: 'i-lucide-download' })
}

/* ── 차트 (Chart.js) ─────────────────────────────────────────────── */
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

onMounted(() => {
  if (!chartCanvas.value) return
  chart = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: STAT_ROWS.map(r => r.date),
      datasets: SERIES.map(s => ({
        label: s.label,
        data: STAT_ROWS.map(r => r[s.key]),
        backgroundColor: s.color,
        borderColor: s.color,
        borderWidth: 0,
        borderRadius: 3,
        maxBarThickness: 14,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: '건수', color: '#71717a', font: { size: 11 } },
          grid: { color: '#ececec' },
          border: { display: false },
          ticks: { color: '#a1a1aa', font: { family: 'JetBrains Mono', size: 11 } },
        },
        x: {
          title: { display: true, text: '일시', color: '#71717a', font: { size: 11 }, align: 'end' },
          grid: { display: false },
          border: { color: '#ececec' },
          ticks: { color: '#a1a1aa', font: { family: 'JetBrains Mono', size: 11 } },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, boxHeight: 12, padding: 16, color: '#3f3f46', font: { size: 12 } },
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#0a0a0a',
          bodyColor: '#3f3f46',
          borderColor: '#ececec',
          borderWidth: 1,
          padding: 10,
          boxPadding: 4,
        },
      },
    },
  })
})
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        발송 관리 · 통계
      </div>
      <h1>통계</h1>
      <p>발송 통계를 채널·기간별로 조회합니다.</p>
    </div>

    <!-- 검색 필터 -->
    <div class="filter-bar stats-card">
      <select v-model="fChannel" class="select fb-select">
        <option value="all">
          메시지 채널
        </option>
        <option>SMS</option><option>알림톡</option><option>RCS</option><option>이메일</option><option>PUSH</option>
      </select>
      <select v-model="fPeriod" class="select fb-period">
        <option>오늘</option><option>최근 7일</option><option>최근 30일</option><option>지정</option>
      </select>
      <div class="fb-daterange">
        <AppDateTimePicker v-model="fFrom" :disable-past="false" :width="190" />
        <span class="fb-tilde">~</span>
        <AppDateTimePicker v-model="fTo" :disable-past="false" :width="190" />
      </div>
      <div class="fb-actions">
        <button type="button" class="btn btn-neutral btn-sm" @click="onReset">
          초기화
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="onSearch">
          <UIcon name="i-lucide-search" class="text-[length:var(--fz-sm)]" /> 검색하기
        </button>
      </div>
    </div>

    <!-- 차트 -->
    <div class="card stats-card">
      <div class="card-header">
        <span class="title">메시지</span>
      </div>
      <div class="card-body">
        <div class="chart-box">
          <canvas ref="chartCanvas" />
        </div>
      </div>
    </div>

    <!-- 데이터 테이블 -->
    <div class="card stats-card">
      <div class="data-head">
        <button type="button" class="btn btn-outline btn-sm" @click="onDownload">
          <UIcon name="i-lucide-download" class="text-[length:var(--fz-sm)]" /> 다운로드
        </button>
      </div>
      <table class="table stats-table">
        <thead>
          <tr>
            <th>이벤트 일시</th>
            <th v-for="s in SERIES" :key="s.key" class="num">
              {{ s.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in STAT_ROWS" :key="r.date">
            <td>{{ r.date }}</td>
            <td v-for="s in SERIES" :key="s.key" class="cell-mono num">
              {{ r[s.key].toLocaleString() }}
            </td>
          </tr>
          <tr class="stats-total">
            <td>합계</td>
            <td v-for="s in SERIES" :key="s.key" class="cell-mono num">
              {{ totals[s.key].toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.stats-card {
  margin-bottom: 20px;
}

/* 필터 (한 줄 가로 바) */
.fb-select {
  width: 130px;
}
.fb-period {
  width: 112px;
}
.fb-daterange {
  display: flex;
  align-items: center;
  gap: 6px;
}
.fb-tilde {
  color: var(--ink-400);
}
.fb-actions {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

/* 차트 */
.chart-box {
  position: relative;
  height: 380px;
}

/* 데이터 테이블 */
.data-head {
  display: flex;
  justify-content: flex-end;
  padding: 14px 20px;
}
.stats-table .num {
  text-align: center;
}
.stats-total td {
  font-weight: 700;
  color: var(--ink-900);
  background: var(--ink-50);
}
</style>
