<script setup lang="ts">
const props = withDefaults(defineProps<{
  defaultChannel?: string
  crumb?: string
  title?: string
}>(), { defaultChannel: 'all', crumb: '발송 관리 · 발송 조회', title: '발송 조회' })

const router = useRouter()
const toast = useToast()

type SendSt = '발송 요청' | '발송 취소' | '발송 예약' | '발송 대기' | '발송 대기(플로우)' | '발송 중' | '발송 실패' | '발송 성공'
type RecvSt = 'success' | 'failed' | 'pending'
type Tone = 'success' | 'warning' | 'error' | 'primary' | 'sky' | 'neutral'

interface Row {
  id: string
  ch: string
  requestedAt: string
  timing: '즉시' | '예약'
  sender: string
  sendSt: SendSt
  purpose: '일반용' | '인증용' | '광고용'
  recipient: string
  recvSt: RecvSt
  reservedAt: string
  sentAt: string
  receivedAt: string
  templateName: string
  flowName: string
}

/* 조회 필드 추가 설정 — 체크 시 표의 추가 컬럼으로 노출 (발송 목적 ↔ 수신자 정보 사이) */
const FIELD_OPTIONS: { value: keyof Row, label: string }[] = [
  { value: 'reservedAt', label: '예약 일시' },
  { value: 'sentAt', label: '발송 일시' },
  { value: 'receivedAt', label: '수신 일시' },
  { value: 'templateName', label: '템플릿 이름' },
  { value: 'flowName', label: '플로우 이름' },
]
const DATE_FIELDS: (keyof Row)[] = ['reservedAt', 'sentAt', 'receivedAt']

/* ── 목업 데이터 (백엔드 연동 전 — NHN API 연동 시 교체) ───────────── */
const PHONE = ['010-1234-5678', '010-2345-6789', '010-3456-7890', '010-4567-8901', '010-5678-9012']
const SMS_SENDER = ['1644-7143', '02-1234-5678']
const EMAILS = ['minho.j@molly.co.kr', 'suji.kim@gmail.com', 'jihoon.park@naver.com', 'yebin.choi@daum.net', 'doyeon@kakao.com']
const TOKENS = ['Token-9d7a3f', 'Token-2b8e1c', 'Token-7c4f0a', 'Token-5e9d2b', 'Token-1a6c8f']
const SEND_SEQ: SendSt[] = ['발송 성공', '발송 성공', '발송 요청', '발송 성공', '발송 실패', '발송 취소', '발송 중', '발송 예약', '발송 대기', '발송 대기(플로우)']
const RECV_SEQ: RecvSt[] = ['success', 'success', 'failed', 'success', 'failed', 'success', 'pending', 'pending', 'success', 'success']
const PURPOSE_SEQ: Row['purpose'][] = ['일반용', '일반용', '인증용', '일반용', '광고용', '일반용', '일반용', '일반용', '인증용', '일반용']
const TEMPLATES = ['01_비디오팩생성', '02_회원가입환영', '-']
const FLOWS = ['-', 'FL_재구매유도', '-', 'FL_주문여정', '-']

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function fmtDt(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function genChannel(ch: string, count: number): Row[] {
  const base = new Date(2026, 4, 20, 13, 40, 4)
  const out: Row[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getTime() - i * 60000)
    const k = i % 10
    const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
    const suffix = (((i + 7) * 2654435761) >>> 0).toString(36).padStart(8, '0')
    const sendSt = SEND_SEQ[k]!
    const recvSt = RECV_SEQ[k]!
    const reserved = k === 4 || k === 7
    out.push({
      id: `${stamp}${suffix}`,
      ch,
      requestedAt: fmtDt(d),
      timing: reserved ? '예약' : '즉시',
      sender: ch === '이메일' ? 'noreply@molly.co.kr' : ch === 'PUSH' ? 'Molly App' : SMS_SENDER[i % 2]!,
      sendSt,
      purpose: PURPOSE_SEQ[k]!,
      recipient: ch === '이메일' ? EMAILS[i % 5]! : ch === 'PUSH' ? TOKENS[i % 5]! : PHONE[i % 5]!,
      recvSt,
      reservedAt: reserved ? fmtDt(new Date(d.getTime() + 3600_000)) : '-',
      sentAt: (sendSt === '발송 성공' || sendSt === '발송 실패' || sendSt === '발송 중') ? fmtDt(new Date(d.getTime() + 3000)) : '-',
      receivedAt: recvSt === 'pending' ? '-' : fmtDt(new Date(d.getTime() + 11_000)),
      templateName: TEMPLATES[i % 3]!,
      flowName: FLOWS[i % 5]!,
    })
  }
  return out
}
const DATA: Row[] = [
  ...genChannel('SMS', 24),
  ...genChannel('알림톡', 12),
  ...genChannel('RCS', 12),
  ...genChannel('이메일', 12),
  ...genChannel('PUSH', 12),
]

/* ── 검색 필터 ───────────────────────────────────────────────────── */
const TIMING_OPTS = [
  { value: 'all', label: '발송 시점' },
  { value: '즉시', label: '즉시' },
  { value: '예약', label: '예약' },
]
const PURPOSE_OPTS = [
  { value: 'all', label: '발송 목적' },
  { value: '일반용', label: '일반용' },
  { value: '인증용', label: '인증용' },
  { value: '광고용', label: '광고용' },
]
const DEF_FROM = '2026-05-13T00:00'
const DEF_TO = '2026-05-20T23:59'

interface AppliedFilter {
  ch: string
  sendSt: string
  timing: string
  recvSt: string
  purpose: string
  from: string
  to: string
}

/* 폼 입력(draft) — '조회' 클릭 시 applied로 반영. 채널은 페이지 고정 */
const dSendSt = ref('all')
const dTiming = ref('all')
const dRecvSt = ref('all')
const dPurpose = ref('all')
const dFrom = ref(DEF_FROM)
const dTo = ref(DEF_TO)
const applied = ref<AppliedFilter>({
  ch: props.defaultChannel, sendSt: 'all', timing: 'all', recvSt: 'all', purpose: 'all', from: DEF_FROM, to: DEF_TO,
})

/* ── 페이징 ──────────────────────────────────────────────────────── */
const selected = ref<string[]>([])
const page = ref(1)
const pageSize = 10

/* 조회 필드 추가 설정 (다중 선택 드롭다운) */
const extraFields = ref<(keyof Row)[]>([])
const fieldMenuOpen = ref(false)
const fieldSelectEl = ref<HTMLElement | null>(null)

const activeFields = computed(() => FIELD_OPTIONS.filter(o => extraFields.value.includes(o.value)))
const fieldLabel = computed(() => {
  if (!activeFields.value.length) return '없음'
  const [first, ...rest] = activeFields.value
  return rest.length ? `${first!.label} 외 ${rest.length}` : first!.label
})
const colCount = computed(() => 10 + activeFields.value.length)

function fieldValue(r: Row, key: keyof Row) {
  return r[key]
}
function isDateField(key: keyof Row) {
  return DATE_FIELDS.includes(key)
}
function onDocClick(e: MouseEvent) {
  if (fieldSelectEl.value && !fieldSelectEl.value.contains(e.target as Node))
    fieldMenuOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

function toMs(s: string) {
  return new Date(s.replace(' ', 'T')).getTime()
}
function inDateRange(requestedAt: string, from: string, to: string) {
  const t = toMs(requestedAt)
  if (from && t < toMs(from)) return false
  if (to && t > toMs(to)) return false
  return true
}
const filtered = computed(() => {
  const a = applied.value
  return DATA.filter(r =>
    (a.ch === 'all' || r.ch === a.ch)
    && (a.sendSt === 'all' || r.sendSt === a.sendSt)
    && (a.timing === 'all' || r.timing === a.timing)
    && (a.recvSt === 'all' || r.recvSt === a.recvSt)
    && (a.purpose === 'all' || r.purpose === a.purpose)
    && inDateRange(r.requestedAt, a.from, a.to),
  )
})
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))

watch(pageCount, () => { if (page.value > pageCount.value) page.value = pageCount.value })

function onSearch() {
  applied.value = {
    ch: props.defaultChannel,
    sendSt: dSendSt.value,
    timing: dTiming.value,
    recvSt: dRecvSt.value,
    purpose: dPurpose.value,
    from: dFrom.value,
    to: dTo.value,
  }
  page.value = 1
}
function onResetFilter() {
  dSendSt.value = 'all'
  dTiming.value = 'all'
  dRecvSt.value = 'all'
  dPurpose.value = 'all'
  dFrom.value = DEF_FROM
  dTo.value = DEF_TO
  onSearch()
}

/* ── 상태 배지 ──────────────────────────────────────────────────── */
const SEND_TONE: Record<SendSt, Tone> = {
  '발송 요청': 'neutral',
  '발송 취소': 'neutral',
  '발송 예약': 'warning',
  '발송 대기': 'primary',
  '발송 대기(플로우)': 'primary',
  '발송 중': 'primary',
  '발송 실패': 'error',
  '발송 성공': 'success',
}
function sendBadge(st: SendSt): { tone: Tone, label: string } {
  return { tone: SEND_TONE[st], label: st }
}
function recvBadge(st: RecvSt): { tone: Tone, label: string } {
  if (st === 'success') return { tone: 'success', label: '수신 성공' }
  if (st === 'failed') return { tone: 'error', label: '수신 실패' }
  return { tone: 'primary', label: '수신 대기' }
}

/* ── 선택 / 액션 ────────────────────────────────────────────────── */
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(r => selected.value.includes(r.id)))
function toggleAll() {
  const ids = paged.value.map(r => r.id)
  if (allChecked.value) {
    const set = new Set(ids)
    selected.value = selected.value.filter(id => !set.has(id))
  }
  else {
    selected.value = [...new Set([...selected.value, ...ids])]
  }
}
function toggleOne(id: string) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter(x => x !== id)
    : [...selected.value, id]
}
function openDetail(id: string) {
  toast.add({ title: '메시지 상세', description: `${id} · 상세 화면은 준비 중입니다.`, icon: 'i-lucide-info' })
}
/* 발송 취소 가능 상태 — 발송 대기·예약 건만 취소 가능 */
const CANCELABLE: SendSt[] = ['발송 예약', '발송 대기', '발송 대기(플로우)']
const selectedCancelableCount = computed(() =>
  DATA.filter(r => selected.value.includes(r.id) && CANCELABLE.includes(r.sendSt)).length,
)
const SELECTED_CANCEL_MSG = "선택한 건 중 발송 상태가 '발송 예약 또는 발송 대기'인 건을 발송 취소할 수 있습니다.\n선택한 발송을 취소하시겠습니까?"
const selectedCancelOpen = ref(false)
function onSelectedCancel() {
  selectedCancelOpen.value = true
}
function onSelectedCancelConfirm() {
  selectedCancelOpen.value = false
  toast.add({ title: '선택 취소', description: `선택한 발송 예약·대기 ${selectedCancelableCount.value}건의 발송 취소를 요청했습니다.`, icon: 'i-lucide-circle-x' })
  selected.value = []
}

const BULK_CANCEL_MSG = "검색한 결과에서 발송 상태가 '발송 예약 또는 발송 대기'인 건을 일괄로 취소할 수 있습니다.\n발송을 일괄 취소하시겠습니까?"
const bulkCancelOpen = ref(false)
function onBulkCancel() {
  bulkCancelOpen.value = true
}
function onBulkCancelConfirm() {
  bulkCancelOpen.value = false
  toast.add({ title: '일괄 취소', description: '발송 예약·대기 건의 일괄 취소를 요청했습니다.', icon: 'i-lucide-circle-x' })
}
const EXPORT_CONFIRM_MSG = '목록 다운로드 요청 시 조회한 결과 목록이 다운로드됩니다.\n다운로드를 진행하시겠습니까?\n\n다운로드 요청 후 진행 상태는 [다운로드 요청 목록]에서 확인 가능합니다.'
const exportConfirmOpen = ref(false)
function onExportRequest() {
  exportConfirmOpen.value = true
}
function onExportConfirm() {
  exportConfirmOpen.value = false
  toast.add({ title: '다운로드 요청', description: `검색 결과 ${filtered.value.length.toLocaleString()}건의 다운로드를 요청했습니다.`, icon: 'i-lucide-download' })
}
const exportListOpen = ref(false)
function onExportList() {
  exportListOpen.value = true
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            {{ crumb }}
          </div>
          <h1>{{ title }}</h1>
          <p>최근 발송한 메시지의 이력과 상태를 조회합니다.</p>
        </div>
        <div class="row" style="gap: 6px">
          <button class="btn btn-primary btn-sm" @click="router.push('/send/sms')">
            <UIcon name="i-lucide-send" class="text-[length:var(--fz-sm)]" /> 새 발송
          </button>
        </div>
      </div>
    </div>

    <div class="grid-cards grid-4" style="margin-bottom: 16px">
      <div class="stat-card">
        <div class="label">
          <UIcon name="i-lucide-send" class="text-[length:var(--fz-sm)]" /> 총 발송
        </div>
        <div class="value">
          6,284
        </div>
        <div class="delta up">
          <UIcon name="i-lucide-trending-up" class="text-[length:var(--fz-sm)]" /> +12.4% 지난주
        </div>
      </div>
      <div class="stat-card">
        <div class="label" style="color: var(--accent-ink)">
          <UIcon name="i-lucide-circle-check" class="text-[length:var(--fz-sm)]" /> 성공
        </div>
        <div class="value">
          6,196
        </div>
        <div class="delta">
          98.7% 성공률
        </div>
      </div>
      <div class="stat-card">
        <div class="label" style="color: var(--danger-ink)">
          <UIcon name="i-lucide-octagon-alert" class="text-[length:var(--fz-sm)]" /> 실패
        </div>
        <div class="value">
          62
        </div>
        <div class="delta down">
          발신 차단 · 번호 오류
        </div>
      </div>
      <div class="stat-card">
        <div class="label" style="color: var(--warning-ink)">
          <UIcon name="i-lucide-clock" class="text-[length:var(--fz-sm)]" /> 대기 / 예약
        </div>
        <div class="value">
          26
        </div>
        <div class="delta">
          예약 발송 포함
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <select v-model="dSendSt" class="select fb-select">
        <option value="all">
          발송 상태
        </option>
        <option value="발송 요청">
          발송 요청
        </option>
        <option value="발송 취소">
          발송 취소
        </option>
        <option value="발송 예약">
          발송 예약
        </option>
        <option value="발송 대기">
          발송 대기
        </option>
        <option value="발송 대기(플로우)">
          발송 대기(플로우)
        </option>
        <option value="발송 중">
          발송 중
        </option>
        <option value="발송 실패">
          발송 실패
        </option>
        <option value="발송 성공">
          발송 성공
        </option>
      </select>
      <select v-model="dTiming" class="select fb-select">
        <option v-for="o in TIMING_OPTS" :key="o.value" :value="o.value">
          {{ o.label }}
        </option>
      </select>
      <select v-model="dRecvSt" class="select fb-select">
        <option value="all">
          수신 상태
        </option>
        <option value="success">
          수신 성공
        </option>
        <option value="failed">
          수신 실패
        </option>
        <option value="pending">
          수신 대기
        </option>
      </select>
      <select v-model="dPurpose" class="select fb-select">
        <option v-for="o in PURPOSE_OPTS" :key="o.value" :value="o.value">
          {{ o.label }}
        </option>
      </select>
      <div class="fb-daterange">
        <AppDateTimePicker v-model="dFrom" :disable-past="false" :width="190" placeholder="요청 일시 시작" />
        <span class="fb-tilde">~</span>
        <AppDateTimePicker v-model="dTo" :disable-past="false" :width="190" placeholder="요청 일시 종료" />
      </div>
      <div class="fb-actions">
        <button type="button" class="btn btn-neutral btn-sm" @click="onResetFilter">
          초기화
        </button>
        <button type="button" class="btn btn-primary btn-sm" @click="onSearch">
          <UIcon name="i-lucide-search" class="text-[length:var(--fz-sm)]" /> 검색하기
        </button>
      </div>
    </div>

    <div class="list-card">
      <div class="list-toolbar">
        <div class="row" style="gap: 10px; flex-wrap: wrap">
          <span class="toolbar-count">총 <strong>{{ filtered.length.toLocaleString() }}</strong>건</span>
        </div>
        <div class="row" style="gap: 6px; flex-wrap: wrap">
          <button class="btn btn-outline btn-sm" @click="onExportRequest">
            <UIcon name="i-lucide-download" class="text-[length:var(--fz-sm)]" /> 목록 다운로드 요청
          </button>
          <button class="btn btn-outline btn-sm" @click="onExportList">
            <UIcon name="i-lucide-list" class="text-[length:var(--fz-sm)]" /> 다운로드 요청 목록
          </button>
          <div class="toolbar-field">
            <span class="toolbar-label">조회 필드 추가 :</span>
            <div ref="fieldSelectEl" class="field-select" @keydown.escape="fieldMenuOpen = false">
              <button
                type="button"
                class="field-select-trigger"
                :class="{ 'field-select-trigger--open': fieldMenuOpen }"
                aria-haspopup="true"
                :aria-expanded="fieldMenuOpen"
                @click="fieldMenuOpen = !fieldMenuOpen"
              >
                <span :class="{ 'field-select-placeholder': !activeFields.length }">{{ fieldLabel }}</span>
                <UIcon :name="fieldMenuOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="text-[length:var(--fz-md)]" />
              </button>
              <div v-if="fieldMenuOpen" class="field-menu" role="group" aria-label="조회 필드 추가">
                <label v-for="opt in FIELD_OPTIONS" :key="opt.value" class="checkbox field-option">
                  <input v-model="extraFields" type="checkbox" :value="opt.value">
                  <span>{{ opt.label }}</span>
                </label>
              </div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" @click="onBulkCancel">
            일괄 취소 <UIcon name="i-lucide-circle-help" class="th-help" />
          </button>
          <button class="btn btn-outline btn-sm" :disabled="!selectedCancelableCount" @click="onSelectedCancel">
            선택 취소 <UIcon name="i-lucide-circle-help" class="th-help" />
          </button>
        </div>
      </div>

      <div class="list-table-scroll">
        <!-- A 테이블 스타일 — 조회·관리 목록 표준 (docs/DESIGN.md §6.5) -->
        <table class="table list-table" data-table-style="a">
          <thead>
            <tr>
              <th style="width: 36px">
                <label class="checkbox"><input type="checkbox" :checked="allChecked" @change="toggleAll"></label>
              </th>
              <th>메시지 아이디</th>
              <th>메시지 채널</th>
              <th>요청 일시</th>
              <th>발송 시점</th>
              <th>발신 정보</th>
              <th>발송 상태</th>
              <th>발송 목적</th>
              <th v-for="f in activeFields" :key="f.value">
                {{ f.label }}
              </th>
              <th>수신자 정보</th>
              <th>수신 상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id" :class="{ selected: selected.includes(r.id) }">
              <td>
                <label class="checkbox"><input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)"></label>
              </td>
              <td>
                <button type="button" class="msg-id-link" @click="openDetail(r.id)">
                  {{ r.id }}
                </button>
              </td>
              <td>{{ r.ch }}</td>
              <td class="cell-mono">
                {{ r.requestedAt }}
              </td>
              <td>{{ r.timing }}</td>
              <td class="cell-mono">
                {{ r.sender }}
              </td>
              <td>
                <AppBadge :tone="sendBadge(r.sendSt).tone">
                  {{ sendBadge(r.sendSt).label }}
                </AppBadge>
              </td>
              <td>{{ r.purpose }}</td>
              <td
                v-for="f in activeFields"
                :key="f.value"
                :class="{ 'cell-mono': isDateField(f.value) }"
              >
                {{ fieldValue(r, f.value) }}
              </td>
              <td class="cell-mono">
                {{ r.recipient }}
              </td>
              <td>
                <AppBadge :tone="recvBadge(r.recvSt).tone">
                  {{ recvBadge(r.recvSt).label }}
                </AppBadge>
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td :colspan="colCount" style="text-align: center; padding: 40px 12px; color: var(--ink-500)">
                조회된 발송 이력이 없습니다.
              </td>
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

    <AppConfirmDialog
      :open="exportConfirmOpen"
      title="알림"
      :message="EXPORT_CONFIRM_MSG"
      confirm-label="확인"
      @close="exportConfirmOpen = false"
      @confirm="onExportConfirm"
    />

    <AppExportListDialog :open="exportListOpen" @close="exportListOpen = false" />

    <AppConfirmDialog
      :open="bulkCancelOpen"
      title="알림"
      :message="BULK_CANCEL_MSG"
      confirm-label="확인"
      @close="bulkCancelOpen = false"
      @confirm="onBulkCancelConfirm"
    />

    <AppConfirmDialog
      :open="selectedCancelOpen"
      title="알림"
      :message="SELECTED_CANCEL_MSG"
      confirm-label="확인"
      @close="selectedCancelOpen = false"
      @confirm="onSelectedCancelConfirm"
    />
  </div>
</template>

<style scoped>
.fb-select {
  width: 120px;
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
.toolbar-field {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 4px;
}
.toolbar-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  white-space: nowrap;
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
.th-help {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin-left: 1px;
}
.field-select {
  position: relative;
}
.field-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 28px;
  min-width: 134px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  font-size: var(--fz-sm);
  color: var(--ink-700);
  cursor: pointer;
  transition: border-color 0.12s;
}
.field-select-trigger:hover,
.field-select-trigger--open {
  border-color: var(--ink-300);
}
.field-select-placeholder {
  color: var(--ink-400);
}
.field-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 41;
  min-width: 168px;
  padding: 6px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-popover);
}
.field-option {
  display: flex;
  width: 100%;
  padding: 7px 8px;
  border-radius: var(--r-sm);
}
.field-option:hover {
  background: var(--ink-50);
}

.list-table-scroll {
  overflow-x: auto;
}
.list-table th,
.list-table td {
  white-space: nowrap;
}

.msg-id-link {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--accent-ink);
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
}
.msg-id-link:hover {
  text-decoration: underline;
}

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
</style>
