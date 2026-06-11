<script setup lang="ts">
const toast = useToast()
const api = useApi()

type Status = 'wait' | 'progress' | 'done'

const STATUS_META: Record<Status, { label: string, badge: string }> = {
  wait: { label: '답변대기', badge: 'badge-error' },
  progress: { label: '답변중', badge: 'badge-success' },
  done: { label: '답변완료', badge: 'badge-neutral' },
}

/* 문의 채널/유형 라벨 — productType 우선, 없으면 inquiryType */
const PRODUCT_LABEL: Record<string, string> = {
  all: '전체', sms: 'SMS', rcs: 'RCS', kakao: '카카오톡', email: '이메일', push: 'PUSH',
}
const TYPE_LABEL: Record<string, string> = {
  product: '상품', payment: '결제', partner: '제휴', etc: '기타',
}

/* 서버 응답(TB_INQUIRY) 원형 */
interface InquiryRow {
  id: number
  inquiryType: string
  productType: string | null
  title: string
  body: string
  answerState: Status
  createdAt: string
}
interface Inquiry {
  id: number
  status: Status
  channel: string
  title: string
  body: string
  time: string
}

function channelOf(r: InquiryRow): string {
  const product = r.productType && r.productType !== 'all' ? PRODUCT_LABEL[r.productType] : undefined
  if (product) return product
  return TYPE_LABEL[r.inquiryType] ?? '문의'
}
function relTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금 전'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}
function toInquiry(r: InquiryRow): Inquiry {
  return {
    id: r.id,
    status: r.answerState,
    channel: channelOf(r),
    title: r.title,
    body: r.body,
    time: relTime(r.createdAt),
  }
}

/* 문의 내역 — 커서 페이징으로 누적 로드 */
const items = ref<Inquiry[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(false)

async function load(reset = false) {
  if (loading.value) return
  loading.value = true
  try {
    const q = new URLSearchParams({ limit: '20' })
    if (!reset && nextCursor.value) q.set('cursor', nextCursor.value)
    const res = await api<{ data: InquiryRow[], nextCursor: string | null }>(`/inquiries?${q.toString()}`)
    const mapped = res.data.map(toInquiry)
    items.value = reset ? mapped : [...items.value, ...mapped]
    nextCursor.value = res.nextCursor
  }
  catch {
    if (reset) toast.add({ title: '문의 내역을 불러오지 못했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    loading.value = false
  }
}

// SSR에서 실패해도 페이지가 죽지 않도록 swallow — client mount 시 재시도.
try { await load(true) }
catch { /* ignore */ }
onMounted(() => {
  if (items.value.length === 0) load(true)
})

/* 상태 집계 — 별도 count 엔드포인트가 없어 로드된 항목 기준 best-effort */
const STATS = computed(() => ([
  { key: 'wait' as const, label: '답변대기', count: items.value.filter(i => i.status === 'wait').length, icon: 'i-lucide-clock', tone: 'danger' },
  { key: 'progress' as const, label: '답변중', count: items.value.filter(i => i.status === 'progress').length, icon: 'i-lucide-message-square-more', tone: 'accent' },
  { key: 'done' as const, label: '답변완료', count: items.value.filter(i => i.status === 'done').length, icon: 'i-lucide-circle-check', tone: 'ink' },
]))

const keyword = ref('')
const shown = computed(() => {
  const k = keyword.value.trim()
  if (!k) return items.value
  return items.value.filter(q => q.title.includes(k) || q.body.includes(k))
})
const hasMore = computed(() => !!nextCursor.value)

function showMore() {
  load(false)
}
function goDetail(q: Inquiry) {
  navigateTo(`/account/inquiries/${q.id}`)
}
function goWrite() {
  navigateTo('/account/inquiry')
}

/* ⋮ 드롭다운 메뉴 */
const openMenuId = ref<number | null>(null)
function toggleMenu(q: Inquiry) {
  openMenuId.value = openMenuId.value === q.id ? null : q.id
}
function closeMenu() {
  openMenuId.value = null
}
watch(openMenuId, (v) => {
  if (!import.meta.client) return
  if (v !== null) setTimeout(() => window.addEventListener('click', closeMenu), 0)
  else window.removeEventListener('click', closeMenu)
})
onBeforeUnmount(() => {
  if (import.meta.client) window.removeEventListener('click', closeMenu)
})

/* 문의 삭제 */
const deleteTarget = ref<Inquiry | null>(null)
function requestDelete(q: Inquiry) {
  openMenuId.value = null
  deleteTarget.value = q
}
async function confirmDelete() {
  const t = deleteTarget.value
  if (!t) return
  try {
    await api(`/inquiries/${t.id}`, { method: 'DELETE' })
    items.value = items.value.filter(x => x.id !== t.id)
    toast.add({ title: '문의가 삭제되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch {
    toast.add({ title: '문의 삭제에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  deleteTarget.value = null
}
</script>

<template>
  <div class="iq-panel">
    <section class="ms-sec">
      <div class="ms-head">
        <h3>문의 내역</h3>
        <button type="button" class="btn btn-primary btn-sm" @click="goWrite">
          <UIcon name="i-lucide-message-circle" class="text-[length:var(--fz-sm)]" /> 문의하기
        </button>
      </div>

      <!-- 상태 집계 -->
      <div class="iq-stats">
        <div v-for="s in STATS" :key="s.key" class="iq-stat" :class="`tone-${s.tone}`">
          <span class="iq-stat-icon">
            <UIcon :name="s.icon" />
          </span>
          <div class="iq-stat-text">
            <span class="iq-stat-label">{{ s.label }}</span>
            <span class="iq-stat-count">{{ s.count }}</span>
          </div>
        </div>
      </div>

      <!-- 검색 -->
      <div class="iq-search-row">
        <div class="iq-search">
          <input v-model="keyword" placeholder="제목 및 내용 검색">
          <UIcon name="i-lucide-search" class="iq-search-icon" />
        </div>
      </div>

      <!-- 문의 목록 -->
      <ul class="iq-list">
        <li v-for="q in shown" :key="q.id" class="iq-item" @click="goDetail(q)">
          <div class="iq-item-top">
            <span class="badge" :class="STATUS_META[q.status].badge">
              {{ STATUS_META[q.status].label }}
            </span>
            <div class="iq-menu-wrap" @click.stop>
              <button type="button" class="iq-menu" aria-label="더보기" @click="toggleMenu(q)">
                <UIcon name="i-lucide-ellipsis-vertical" />
              </button>
              <div v-if="openMenuId === q.id" class="iq-menu-pop">
                <button type="button" class="iq-menu-opt danger" @click="requestDelete(q)">
                  <UIcon name="i-lucide-trash-2" /> 삭제
                </button>
              </div>
            </div>
          </div>
          <p class="iq-title">
            <span class="iq-channel">{{ q.channel }}</span>
            {{ q.title }}
          </p>
          <p class="iq-body">{{ q.body }}</p>
          <div class="iq-meta">
            <span class="iq-meta-item">
              <UIcon name="i-lucide-clock" /> {{ q.time }}
            </span>
          </div>
        </li>
        <li v-if="!shown.length" class="iq-empty">
          조회된 문의 내역이 없습니다.
        </li>
      </ul>

      <button v-if="hasMore" type="button" class="iq-more" @click="showMore">
        더보기 <UIcon name="i-lucide-chevron-down" />
      </button>
    </section>

    <AppConfirmDialog
      :open="!!deleteTarget"
      title="문의 삭제"
      message="선택한 문의를 삭제하시겠습니까? 삭제한 문의는 복구할 수 없습니다."
      confirm-label="삭제"
      danger
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.ms-head {
  display: flex;
  align-items: center;
  gap: 12px;
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
.ms-head .btn { margin-left: auto; }

/* 상태 집계 */
.iq-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.iq-stat {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  transition: border-color 0.12s, box-shadow 0.12s;
}
.iq-stat:hover {
  border-color: var(--ink-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.iq-stat-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: var(--r-md);
  font-size: var(--fz-xl);
  flex-shrink: 0;
}
.iq-stat-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.iq-stat-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.iq-stat-count {
  font-family: var(--font-mono);
  font-size: var(--fz-2xl);
  font-weight: 700;
  line-height: 1;
}

/* 톤별 색상 */
.iq-stat.tone-danger .iq-stat-icon { background: var(--danger-soft); color: var(--danger); }
.iq-stat.tone-danger .iq-stat-count { color: var(--danger); }
.iq-stat.tone-accent .iq-stat-icon { background: var(--accent-soft); color: var(--accent-ink); }
.iq-stat.tone-accent .iq-stat-count { color: var(--accent-ink); }
.iq-stat.tone-ink .iq-stat-icon { background: var(--ink-100); color: var(--ink-700); }
.iq-stat.tone-ink .iq-stat-count { color: var(--ink-900); }

/* 검색 */
.iq-search-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
}
.iq-search {
  position: relative;
  width: 300px;
  max-width: 100%;
}
.iq-search input {
  width: 100%;
  height: 40px;
  padding: 0 32px 0 4px;
  border: 0;
  border-bottom: 1px solid var(--line);
  background: transparent;
  font-size: var(--fz-sm);
  color: var(--ink-900);
}
.iq-search input::placeholder { color: var(--ink-400); }
.iq-search input:focus {
  outline: none;
  border-bottom-color: var(--ink-900);
}
.iq-search-icon {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  font-size: var(--fz-md);
  pointer-events: none;
}

/* 문의 목록 */
.iq-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.iq-item {
  padding: 18px 4px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  transition: background 0.12s;
}
.iq-item:hover { background: var(--ink-50); }
.iq-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.iq-menu-wrap {
  position: relative;
}
.iq-menu {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-400);
  font-size: var(--fz-md);
}
.iq-menu:hover { background: var(--ink-100); color: var(--ink-900); }
.iq-menu-pop {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 10;
  min-width: 124px;
  padding: 4px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
.iq-menu-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: var(--r-sm);
  background: transparent;
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-700);
  text-align: left;
}
.iq-menu-opt:hover { background: var(--ink-50); }
.iq-menu-opt.danger { color: var(--danger); }
.iq-menu-opt.danger:hover { background: var(--danger-soft); }

.iq-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 6px;
}
.iq-channel {
  color: var(--accent-ink);
  margin-right: 4px;
}
.iq-body {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.iq-meta {
  display: flex;
  gap: 16px;
}
.iq-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

.iq-empty {
  padding: 48px 0;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-400);
}

/* 더보기 */
.iq-more {
  width: 100%;
  height: 48px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-600);
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.iq-more:hover {
  border-color: var(--ink-300);
  background: var(--ink-50);
  color: var(--ink-900);
}

@media (max-width: 640px) {
  .iq-stats { grid-template-columns: 1fr; }
}
</style>
