<script setup lang="ts">
useHead({ title: '랜딩페이지' })
const toast = useToast()

interface Landing {
  id: string
  name: string
  published: boolean
  publishedAt: string
  manager: string
  formType: 'basic' | 'extended'
}

const rows = ref<Landing[]>([
  { id: 'lp1', name: '2026 SS 컬렉션 사전 예약 안내', published: true, publishedAt: '2026.04.21 오후 02:30', manager: '김도형(djkim)', formType: 'extended' },
  { id: 'lp2', name: '맑은 메시징 신규 회원 웰컴 패키지', published: true, publishedAt: '2026.04.18 오전 11:20', manager: '이수민(sumini)', formType: 'basic' },
  { id: 'lp3', name: '봄맞이 빅세일 · 전 상품 최대 50%', published: true, publishedAt: '2026.04.10 오후 05:45', manager: '박지훈(jhpark)', formType: 'extended' },
  { id: 'lp4', name: '비디오팩 2.0 브랜드 리뉴얼 사전 안내', published: false, publishedAt: '2026.04.05 오전 09:10', manager: '최민지(mjchoi)', formType: 'basic' },
  { id: 'lp5', name: 'VIP 고객 감사 사은품 신청', published: false, publishedAt: '2026.03.28 오후 04:00', manager: '정현우(hwjung)', formType: 'basic' },
  { id: 'lp6', name: '2025 연말 결산 · 한 해 동안의 우리', published: true, publishedAt: '2026.03.15 오전 10:25', manager: '한소영(syhan)', formType: 'extended' },
])

const search = ref('')
const publishFilter = ref<'all' | 'public' | 'private'>('all')
const selected = ref<string[]>([])
const page = ref(1)
const PAGE_SIZE = 10

const filtered = computed(() => rows.value.filter((r) => {
  if (search.value && !r.name.includes(search.value.trim())) return false
  if (publishFilter.value === 'public' && !r.published) return false
  if (publishFilter.value === 'private' && r.published) return false
  return true
}))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(r => selected.value.includes(r.id)))

watch([search, publishFilter], () => { page.value = 1 })
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

const openDelete = ref(false)

/* ── 페이지 등록 — 기본형/확장형 폼 뷰 전환 ──────────────────────── */
const view = ref<'list' | 'form'>('list')
const formType = ref<'basic' | 'extended'>('basic')
const editTarget = ref<Landing | null>(null)
const regMenuOpen = ref(false)
const regMenuEl = ref<HTMLElement | null>(null)

function openForm(t: 'basic' | 'extended') {
  editTarget.value = null
  formType.value = t
  regMenuOpen.value = false
  view.value = 'form'
}
function openEditForm(r: Landing) {
  editTarget.value = r
  formType.value = r.formType
  view.value = 'form'
}
function onFormSave(d: { id?: string, type: 'basic' | 'extended', public: boolean, name: string }) {
  if (d.id) {
    rows.value = rows.value.map(r => r.id === d.id
      ? { ...r, name: d.name, published: d.public, formType: d.type }
      : r)
    toast.add({ title: `"${d.name}" 랜딩페이지를 수정했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
  }
  else {
    rows.value = [
      { id: `lp${Date.now()}`, name: d.name, published: d.public, publishedAt: '-', manager: '관리자', formType: d.type },
      ...rows.value,
    ]
    toast.add({ title: `"${d.name}" 랜딩페이지를 저장했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
  }
  view.value = 'list'
  page.value = 1
}
function onRegDocClick(e: MouseEvent) {
  if (regMenuEl.value && !regMenuEl.value.contains(e.target as Node)) regMenuOpen.value = false
}
onMounted(() => document.addEventListener('click', onRegDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onRegDocClick))
function onCopy() {
  const n = selected.value.length
  const src = rows.value.filter(r => selected.value.includes(r.id))
  const copies: Landing[] = src.map((r, i) => ({
    ...r,
    id: `lp${Date.now()}-${i}`,
    name: `${r.name} (복사본)`,
    published: false,
    publishedAt: '-',
  }))
  rows.value = [...copies, ...rows.value]
  selected.value = []
  page.value = 1
  toast.add({ title: `랜딩페이지 ${n}개를 복사했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}
function onDeleteConfirm() {
  const n = selected.value.length
  const s = new Set(selected.value)
  rows.value = rows.value.filter(r => !s.has(r.id))
  selected.value = []
  openDelete.value = false
  toast.add({ title: `랜딩페이지 ${n}개를 삭제했습니다.`, color: 'info', icon: 'i-lucide-info' })
}
function onRefresh() {
  selected.value = []
  page.value = 1
  toast.add({ title: '목록을 새로고침했습니다.', color: 'info', icon: 'i-lucide-rotate-cw' })
}
/* 미리보기 — 공개·비공개 모두 가능 */
const openPreview = ref(false)
const previewRow = ref<Landing | null>(null)
function onPreview(r: Landing) {
  previewRow.value = r
  openPreview.value = true
}

/* URL 복사 — 공개 페이지만 (목록 버튼은 공개일 때만 노출) */
const openUrl = ref(false)
const urlValue = ref('')
async function onCopyUrl(r: Landing) {
  const u = `https://lp.malgn.so/p/${r.id}`
  urlValue.value = u
  try {
    await navigator.clipboard.writeText(u)
  }
  catch {
    // 클립보드 권한이 없으면 모달에서 다시 복사할 수 있음
  }
  openUrl.value = true
}
</script>

<template>
  <div class="app-container page-body">
    <template v-if="view === 'list'">
      <div class="page-header">
        <div class="row" style="justify-content: space-between; align-items: flex-end">
          <div>
            <div class="crumb">
              메시지 관리 · 랜딩페이지
            </div>
            <h1>랜딩페이지</h1>
          </div>
          <div ref="regMenuEl" class="reg-menu-wrap">
            <button type="button" class="btn btn-primary" @click.stop="regMenuOpen = !regMenuOpen">
              <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 페이지 등록
              <UIcon :name="regMenuOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="text-[length:var(--fz-2xs)]" />
            </button>
            <div v-if="regMenuOpen" class="reg-menu">
              <button type="button" class="reg-menu-item" @click="openForm('basic')">
                기본형
              </button>
              <button type="button" class="reg-menu-item" @click="openForm('extended')">
                확장형
              </button>
            </div>
          </div>
        </div>
      </div>

      <ul class="notice">
        <li>외부에서 랜딩페이지 용도로 사용하실 수 있는 웹페이지를 생성, 수정하실 수 있습니다.</li>
      </ul>

      <div class="list-card">
      <!-- C 테이블 스타일 — 액션 영역에 검색란 포함 (doc/DESIGN.md §6.5) -->
      <div class="list-toolbar">
        <div class="row" style="gap: 10px; flex-wrap: wrap">
          <span class="toolbar-count">총 <strong>{{ filtered.length }}</strong>개</span>
          <span class="toolbar-sep">|</span>
          <button type="button" class="toolbar-refresh" @click="onRefresh">
            <UIcon name="i-lucide-rotate-cw" class="text-[length:var(--fz-sm)]" /> 새로고침
          </button>
          <select v-model="publishFilter" class="select ln-filter">
            <option value="all">
              공개여부
            </option>
            <option value="public">
              공개
            </option>
            <option value="private">
              비공개
            </option>
          </select>
          <div class="ln-search">
            <input v-model="search" class="input" placeholder="랜딩페이지명으로 검색">
            <UIcon name="i-lucide-search" class="text-sm ln-search-icon" />
          </div>
        </div>
        <div class="row" style="gap: 6px; flex-wrap: wrap">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="selected.length === 0"
            @click="onCopy"
          >
            선택 복사
          </button>
          <button
            type="button"
            class="btn btn-error btn-sm"
            :disabled="selected.length === 0"
            @click="openDelete = true"
          >
            선택 삭제
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
              <th>랜딩페이지명</th>
              <th class="ln-mid" style="width: 120px">
                공개 여부
              </th>
              <th style="width: 190px">
                최종 발행일
              </th>
              <th style="width: 150px">
                관리자
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id" :class="{ selected: selected.includes(r.id) }">
              <td>
                <label class="checkbox"><input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)"></label>
              </td>
              <td>
                <div class="ln-name-cell">
                  <button type="button" class="ln-name" @click="openEditForm(r)">
                    {{ r.name }}
                  </button>
                  <button type="button" class="ln-mini" @click="onPreview(r)">
                    미리보기
                  </button>
                  <button v-if="r.published" type="button" class="ln-mini" @click="onCopyUrl(r)">
                    URL 복사
                  </button>
                </div>
              </td>
              <td class="ln-mid">
                <AppBadge :tone="r.published ? 'sky' : 'neutral'">
                  {{ r.published ? '공개' : '비공개' }}
                </AppBadge>
              </td>
              <td class="cell-mono muted">
                {{ r.publishedAt }}
              </td>
              <td>{{ r.manager }}</td>
            </tr>
            <tr v-if="!paged.length">
              <td colspan="5" style="text-align: center; padding: 48px 12px; color: var(--ink-500)">
                {{ search || publishFilter !== 'all' ? '조건에 맞는 랜딩페이지가 없습니다.' : '등록된 랜딩페이지가 없습니다.' }}
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
    </template>

    <AppLandingForm
      v-else
      :type="formType"
      :edit="editTarget"
      @back="view = 'list'"
      @save="onFormSave"
    />

    <AppConfirmDialog
      :open="openDelete"
      title="랜딩페이지 삭제"
      :message="`선택한 랜딩페이지 ${selected.length}개를 삭제하시겠습니까?\n공개 중인 페이지는 즉시 접근이 차단됩니다.`"
      confirm-label="삭제"
      danger
      @close="openDelete = false"
      @confirm="onDeleteConfirm"
    />

    <AppLandingPreviewDialog
      :open="openPreview"
      :type="previewRow?.formType ?? 'basic'"
      @close="openPreview = false"
    />

    <AppLandingUrlDialog
      :open="openUrl"
      :url="urlValue"
      @close="openUrl = false"
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

.reg-menu-wrap {
  position: relative;
}
.reg-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 50;
  min-width: 140px;
  padding: 4px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-popover);
}
.reg-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border: 0;
  background: none;
  border-radius: var(--r-sm);
  font-size: var(--fz-sm);
  color: var(--ink-700);
  cursor: pointer;
}
.reg-menu-item:hover {
  background: var(--ink-50);
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
.toolbar-refresh:hover {
  color: var(--ink-900);
}
.ln-filter {
  height: 28px;
  font-size: var(--fz-sm);
  width: 120px;
}
.ln-search {
  position: relative;
  width: 260px;
  max-width: 100%;
}
.ln-search .input {
  height: 28px;
  padding-right: 32px;
  font-size: var(--fz-sm);
}
.ln-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
}
.list-table-scroll {
  overflow-x: auto;
}
.ln-mid {
  text-align: center;
}
.ln-name-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.ln-name {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--accent-ink);
  cursor: pointer;
  text-align: left;
}
.ln-name:hover {
  text-decoration: underline;
}
.ln-mini {
  height: 22px;
  padding: 0 8px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--white);
  font-size: var(--fz-2xs);
  color: var(--ink-600);
  cursor: pointer;
  white-space: nowrap;
}
.ln-mini:hover {
  background: var(--ink-50);
  border-color: var(--ink-200);
  color: var(--ink-900);
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
</style>
