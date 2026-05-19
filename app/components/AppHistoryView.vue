<script setup lang="ts">
const props = withDefaults(defineProps<{
  defaultChannel?: string
  crumb?: string
  title?: string
}>(), { defaultChannel: 'all', crumb: '발송 관리 · 발송 조회', title: '발송 조회' })

const router = useRouter()

interface Row {
  id: string, ch: string, title: string, recipient: string, phone: string
  st: 'success' | 'failed' | 'pending', time: string, price: string
}

const DATA: Row[] = [
  { id: 'MSG-20260518-0142', ch: 'SMS', title: '[몰리몰리] 주문이 출고되었습니다.', recipient: '이수민', phone: '010-2345-6789', st: 'success', time: '2026-05-18 14:23', price: '9.9 C' },
  { id: 'MSG-20260518-0141', ch: '알림톡', title: '주문 완료 안내 (K001)', recipient: '박지훈', phone: '010-9876-5432', st: 'success', time: '2026-05-18 14:22', price: '8.0 C' },
  { id: 'MSG-20260518-0140', ch: 'SMS', title: '[몰리몰리] 결제가 완료되었습니다.', recipient: '최예진', phone: '010-3344-5566', st: 'success', time: '2026-05-18 13:58', price: '9.9 C' },
  { id: 'MSG-20260518-0139', ch: '이메일', title: '5월 가정의 달 특별 혜택 안내', recipient: '정민호', phone: 'minho.jeong@…', st: 'success', time: '2026-05-18 13:30', price: '0.65 C' },
  { id: 'MSG-20260518-0138', ch: 'PUSH', title: '타임세일 시작!', recipient: '한지영', phone: 'Token-9d7…', st: 'success', time: '2026-05-18 12:00', price: '0.0 C' },
  { id: 'MSG-20260518-0137', ch: 'SMS', title: '(광고) VIP 회원 전용 30% 할인', recipient: '김도현', phone: '010-5566-7788', st: 'failed', time: '2026-05-18 11:45', price: '9.9 C' },
  { id: 'MSG-20260518-0136', ch: 'RCS', title: 'VIP 등급 안내', recipient: '윤서연', phone: '010-1122-3344', st: 'success', time: '2026-05-18 11:00', price: '12.0 C' },
  { id: 'MSG-20260518-0135', ch: '알림톡', title: '배송 시작 안내 (K002)', recipient: '강민재', phone: '010-9988-7766', st: 'pending', time: '2026-05-18 10:30', price: '8.0 C' },
  { id: 'MSG-20260518-0134', ch: 'SMS', title: '[몰리몰리] 주문이 접수되었습니다.', recipient: '이수민', phone: '010-2345-6789', st: 'success', time: '2026-05-18 10:12', price: '9.9 C' },
  { id: 'MSG-20260518-0133', ch: '이메일', title: '장바구니에 담아두신 상품이 있어요', recipient: '박지훈', phone: 'park.jihoon@…', st: 'success', time: '2026-05-18 09:30', price: '0.65 C' },
  { id: 'MSG-20260518-0132', ch: 'SMS', title: '[몰리몰리] 비밀번호 재설정 인증', recipient: '신규고객', phone: '010-1234-5678', st: 'success', time: '2026-05-18 09:00', price: '9.9 C' },
  { id: 'MSG-20260518-0131', ch: '알림톡', title: '회원가입 환영 (K003)', recipient: '최예진', phone: '010-3344-5566', st: 'success', time: '2026-05-18 08:55', price: '8.0 C' }
]

const period = ref('7d')
const fCh = ref(props.defaultChannel)
const fStatus = ref('all')
const q = ref('')
const selected = ref<string[]>([])

const filtered = computed(() => DATA.filter(r =>
  (fCh.value === 'all' || r.ch === fCh.value)
  && (fStatus.value === 'all' || r.st === fStatus.value)
  && (!q.value || (r.title + r.recipient + r.id).toLowerCase().includes(q.value.toLowerCase()))
))

function chTone(ch: string) {
  return ch === 'SMS' ? 'primary' : ch === '알림톡' ? 'warning' : ch === 'RCS' ? 'sky' : ch === '이메일' ? 'neutral' : 'primary'
}
function toggleAll(e: Event) {
  selected.value = (e.target as HTMLInputElement).checked ? filtered.value.map(r => r.id) : []
}
function toggleOne(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
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
          <button class="btn btn-outline btn-sm">
            <UIcon name="i-lucide-download" class="text-[12px]" /> CSV 다운로드
          </button>
          <button class="btn btn-primary btn-sm" @click="router.push('/send/sms')">
            <UIcon name="i-lucide-send" class="text-[12px]" /> 새 발송
          </button>
        </div>
      </div>
    </div>

    <div class="grid-cards grid-4" style="margin-bottom: 16px">
      <div class="stat-card">
        <div class="label">
          <UIcon name="i-lucide-send" class="text-[12px]" /> 총 발송
        </div>
        <div class="value">
          6,284
        </div>
        <div class="delta up">
          <UIcon name="i-lucide-trending-up" class="text-[12px]" /> +12.4% 지난주
        </div>
      </div>
      <div class="stat-card">
        <div class="label" style="color: var(--accent-ink)">
          <UIcon name="i-lucide-circle-check" class="text-[12px]" /> 성공
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
          <UIcon name="i-lucide-octagon-alert" class="text-[12px]" /> 실패
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
          <UIcon name="i-lucide-clock" class="text-[12px]" /> 대기 / 예약
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
      <AppSegmented
        v-model="period"
        :options="[
          { value: '1d', label: '오늘' },
          { value: '7d', label: '7일' },
          { value: '30d', label: '30일' },
          { value: 'custom', label: '기간 지정' },
        ]"
      />
      <select v-model="fCh" class="select" style="max-width: 140px">
        <option value="all">
          전체 채널
        </option>
        <option>SMS</option><option>알림톡</option><option>RCS</option><option>이메일</option><option>PUSH</option>
      </select>
      <select v-model="fStatus" class="select" style="max-width: 140px">
        <option value="all">
          전체 상태
        </option>
        <option value="success">
          성공
        </option>
        <option value="failed">
          실패
        </option>
        <option value="pending">
          대기
        </option>
      </select>
      <div style="position: relative; flex: 1; max-width: 280px">
        <UIcon name="i-lucide-search" class="text-sm" style="position: absolute; left: 10px; top: 11px; color: var(--ink-400)" />
        <input v-model="q" class="input" placeholder="제목 / 수신자 / 메시지 ID" style="padding-left: 32px">
      </div>
      <button class="btn btn-soft btn-sm">
        <UIcon name="i-lucide-filter" class="text-[12px]" /> 적용
      </button>
    </div>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px">
              <label class="checkbox"><input type="checkbox" @change="toggleAll"></label>
            </th>
            <th>채널</th><th>메시지 ID</th><th>제목 / 내용</th><th>수신자</th><th>발송시각</th><th>상태</th>
            <th style="text-align: right">
              비용
            </th>
            <th style="width: 48px" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id" :class="{ selected: selected.includes(r.id) }">
            <td>
              <label class="checkbox"><input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)"></label>
            </td>
            <td><AppBadge :tone="chTone(r.ch) as any">{{ r.ch }}</AppBadge></td>
            <td class="cell-mono" style="font-size: 11px; color: var(--ink-500)">
              {{ r.id }}
            </td>
            <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ink-900)">
              {{ r.title }}
            </td>
            <td>
              <div style="font-size: 13px">
                {{ r.recipient }}
              </div>
              <div class="cell-mono muted" style="font-size: 11px">
                {{ r.phone }}
              </div>
            </td>
            <td class="muted">
              {{ r.time }}
            </td>
            <td>
              <AppBadge v-if="r.st === 'success'" tone="success" dot>
                발송 완료
              </AppBadge>
              <AppBadge v-else-if="r.st === 'failed'" tone="error" dot>
                실패
              </AppBadge>
              <AppBadge v-else tone="warning" dot>
                대기 중
              </AppBadge>
            </td>
            <td class="cell-mono" style="text-align: right">
              {{ r.price }}
            </td>
            <td>
              <button class="btn btn-ghost btn-sm btn-icon" aria-label="더보기">
                <UIcon name="i-lucide-ellipsis-vertical" class="text-sm" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="row" style="justify-content: space-between; margin-top: 16px">
      <div class="muted" style="font-size: 12px">
        전체 {{ filtered.length.toLocaleString() }}건 중 1–{{ filtered.length }}
      </div>
      <div class="row" style="gap: 4px">
        <button class="btn btn-outline btn-sm btn-icon" disabled>
          <UIcon name="i-lucide-chevron-left" class="text-sm" />
        </button>
        <button
          v-for="n in 5"
          :key="n"
          :class="n === 1 ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'"
          style="min-width: 32px; padding: 0"
        >
          {{ n }}
        </button>
        <button class="btn btn-outline btn-sm btn-icon">
          <UIcon name="i-lucide-chevron-right" class="text-sm" />
        </button>
      </div>
    </div>
  </div>
</template>
