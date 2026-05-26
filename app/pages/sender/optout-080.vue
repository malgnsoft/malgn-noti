<script setup lang="ts">
useHead({ title: '080 수신 거부 번호 관리' })
const toast = useToast()

interface Optout080 {
  id: string
  number: string
  company: string
  requestedAt: string
  openedAt: string
  status: string
}
const rows = ref<Optout080[]>([])

const search = ref('')
const selected = ref<string[]>([])
const page = ref(1)
const PAGE_SIZE = 10

const filtered = computed(() => rows.value.filter(r => !search.value || r.number.includes(search.value.trim())))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(r => selected.value.includes(r.id)))

watch(search, () => { page.value = 1 })
watch(pageCount, () => { if (page.value > pageCount.value) page.value = pageCount.value })

function toggleAll() {
  const ids = paged.value.map(r => r.id)
  if (allChecked.value) {
    const s = new Set(ids)
    selected.value = selected.value.filter(id => !s.has(id))
  }
  else {
    selected.value = [...new Set([...selected.value, ...ids])]
  }
}
function toggleOne(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}
function statusTone(s: string) {
  return s === '사용중' ? 'success' : s === '개통 대기' ? 'warning' : s === '해지 완료' ? 'neutral' : 'neutral'
}
function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/* ── 080 수신 거부 번호 신청 ──────────────────────────────────────── */
const applyOpen = ref(false)
const company = ref('')
watch(applyOpen, (v) => {
  if (v) company.value = ''
})
function onApplyConfirm() {
  if (!company.value.trim()) {
    toast.add({ title: '회사명을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  const d = new Date()
  rows.value = [
    {
      id: `o${Date.now()}`,
      number: '배정 예정',
      company: company.value.trim(),
      requestedAt: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
      openedAt: '-',
      status: '개통 대기',
    },
    ...rows.value,
  ]
  page.value = 1
  applyOpen.value = false
  toast.add({ title: '080 수신 거부 번호 신청', description: '신청이 접수되었습니다. 영업일 기준 약 3~4일 소요됩니다.', icon: 'i-lucide-circle-check' })
}

/* ── 이용 해지 ───────────────────────────────────────────────────── */
const releaseOpen = ref(false)
function onRelease() {
  if (selected.value.length) releaseOpen.value = true
}
function onReleaseConfirm() {
  const n = selected.value.length
  const s = new Set(selected.value)
  rows.value = rows.value.filter(r => !s.has(r.id))
  selected.value = []
  releaseOpen.value = false
  toast.add({ title: '080 수신 거부 번호 이용 해지', description: `${n}개 번호의 이용 해지를 요청했습니다.`, icon: 'i-lucide-info' })
}

</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발신 정보 · 080 수신 거부
          </div>
          <h1>080 수신 거부 번호 관리</h1>
        </div>
        <button type="button" class="btn btn-primary" @click="applyOpen = true">
          <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 080 수신 거부 번호 신청
        </button>
      </div>
    </div>

    <ul class="notice">
      <li>광고성 메시지 발송 시 수신자가 수신 거부나 수신 동의의 철회를 무료로 할 수 있도록 무료 수신 거부 방법을 반드시 기재해야 합니다. 이를 어기는 경우 '정보통신망 이용촉진 및 정보보호 등에 관한 법률'에 의거하여 3,000만 원 이하의 과태료가 부과될 수 있습니다.</li>
      <li>'사용중 · 외부 등록, 사용중 · 공유 번호' 상태인 080 번호는 080 수신 거부 번호 이용 해지가 불가능합니다.</li>
    </ul>

    <div class="list-card">
      <!-- C 테이블 스타일 — 액션 영역에 검색란 포함 (doc/DESIGN.md §6.5) -->
      <div class="list-toolbar">
        <div class="row" style="gap: 10px; flex-wrap: wrap">
          <span class="toolbar-count">총 <strong>{{ filtered.length }}</strong>건</span>
          <div class="o8-search">
            <input v-model="search" class="input" placeholder="080 수신 거부 번호를 입력하세요.">
            <UIcon name="i-lucide-search" class="text-sm o8-search-icon" />
          </div>
        </div>
        <div class="row" style="gap: 6px; flex-wrap: wrap">
          <span v-if="selected.length > 0" class="muted" style="font-size: var(--fz-sm)">{{ selected.length }}개 선택됨</span>
          <button
            type="button"
            class="btn btn-error btn-sm"
            :disabled="selected.length === 0"
            @click="onRelease"
          >
            080 수신 거부 번호 이용 해지
          </button>
        </div>
      </div>

      <div class="list-table-scroll">
        <table class="table" data-table-style="c">
          <thead>
            <tr>
              <th style="width: 36px">
                <label class="checkbox"><input type="checkbox" :checked="allChecked" @change="toggleAll"></label>
              </th>
              <th>080 수신 거부 번호</th>
              <th>회사명</th>
              <th>신청 일시</th>
              <th>개통 일시</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id" :class="{ selected: selected.includes(r.id) }">
              <td>
                <label class="checkbox"><input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)"></label>
              </td>
              <td class="cell-mono" style="color: var(--ink-900)">
                {{ r.number }}
              </td>
              <td>{{ r.company }}</td>
              <td class="cell-mono">
                {{ r.requestedAt }}
              </td>
              <td class="cell-mono">
                {{ r.openedAt }}
              </td>
              <td>
                <AppBadge :tone="statusTone(r.status)">
                  {{ r.status }}
                </AppBadge>
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td colspan="6" style="text-align: center; padding: 48px 12px; color: var(--ink-500)">
                표시할 항목이 없습니다.
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

    <!-- 080 수신 거부 번호 신청 -->
    <AppModal :open="applyOpen" title="080 수신 거부 번호 신청" :width="540" @close="applyOpen = false">
      <ul class="o8-modal-notice">
        <li>080 수신 거부는 회선 개통이 필요합니다.</li>
        <li>080 수신 거부 번호 신청 후, 영업일 기준으로 약 3~4일이 소요됩니다. (주말 및 공휴일 제외)</li>
        <li>080 수신 거부 번호 신청 후에는 완료되기 전까지 신청을 취소할 수 없습니다.</li>
        <li>회선 개통 완료 후에는 24시간이 지난 뒤부터 회선을 해지할 수 있습니다.</li>
      </ul>
      <div class="o8-row">
        <label class="o8-label">회사명</label>
        <div class="o8-input-wrap">
          <input v-model="company" class="input" maxlength="100" placeholder="회사명" @keyup.enter="onApplyConfirm">
          <span class="o8-count">{{ company.length }}/100</span>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-dark" @click="applyOpen = false">
          취소
        </button>
        <button type="button" class="btn btn-primary" @click="onApplyConfirm">
          저장
        </button>
      </template>
    </AppModal>

    <!-- 이용 해지 확인 -->
    <AppConfirmDialog
      :open="releaseOpen"
      title="080 수신 거부 번호 이용 해지"
      :message="`선택한 080 수신 거부 번호 ${selected.length}개의 이용을 해지하시겠습니까?\n해지 후에는 해당 번호를 수신 거부 용도로 사용할 수 없습니다.`"
      confirm-label="이용 해지"
      danger
      @close="releaseOpen = false"
      @confirm="onReleaseConfirm"
    />
  </div>
</template>

<style scoped>
.notice {
  margin: 0 0 16px;
  padding: 14px 18px 14px 34px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  list-style: disc;
}
.notice li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.7;
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
.o8-search {
  position: relative;
  width: 260px;
  max-width: 100%;
}
.o8-search .input {
  height: 28px;
  padding-right: 32px;
  font-size: var(--fz-sm);
}
.o8-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
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
.list-table-scroll {
  overflow-x: auto;
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
  color: var(--ink-600);
  font-size: var(--fz-sm);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
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

/* 신청 모달 */
.o8-modal-notice {
  margin: 0 0 16px;
  padding: 14px 16px 14px 30px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  list-style: disc;
}
.o8-modal-notice li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.7;
}
.o8-row {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
}
.o8-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
}
.o8-input-wrap {
  position: relative;
}
.o8-input-wrap .input {
  width: 100%;
  padding-right: 52px;
}
.o8-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
</style>
