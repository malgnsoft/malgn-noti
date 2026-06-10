<script setup lang="ts">
useHead({ title: '이메일 도메인 관리' })
const toast = useToast()

interface Domain {
  id: string
  domain: string
  verified: boolean
  verifiedAt: string
}
const rows = ref<Domain[]>([
  { id: 'd1', domain: 'malgnsoft.com', verified: true, verifiedAt: '2026-02-23 23:47' },
  { id: 'd2', domain: 'wecandeo.com', verified: true, verifiedAt: '2026-02-12 15:48' },
])

const search = ref('')
const selected = ref<string[]>([])
const page = ref(1)
const PAGE_SIZE = 10

const filtered = computed(() => rows.value.filter(d => !search.value || d.domain.includes(search.value.trim().toLowerCase())))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(d => selected.value.includes(d.id)))

watch(search, () => { page.value = 1 })
watch(pageCount, () => { if (page.value > pageCount.value) page.value = pageCount.value })

function toggleAll() {
  const ids = paged.value.map(d => d.id)
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

/* ── 모달 ─────────────────────────────────────────────────────────── */
const openRegister = ref(false)
const openDkim = ref(false)
const openDelete = ref(false)
const dkimDomain = ref('')

function onRegistered(domain: string) {
  rows.value = [
    { id: `d${Date.now()}`, domain, verified: false, verifiedAt: '-' },
    ...rows.value,
  ]
  page.value = 1
}
function onDkim() {
  const row = rows.value.find(d => d.id === selected.value[0])
  if (!row) return
  dkimDomain.value = row.domain
  openDkim.value = true
}
function onDeleteConfirm() {
  const n = selected.value.length
  const s = new Set(selected.value)
  rows.value = rows.value.filter(d => !s.has(d.id))
  selected.value = []
  openDelete.value = false
  toast.add({ title: `도메인 ${n}개를 삭제했습니다.`, color: 'info', icon: 'i-lucide-info' })
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발신 정보 · 이메일 도메인
          </div>
          <h1>이메일 도메인 관리</h1>
        </div>
        <button type="button" class="btn btn-primary" @click="openRegister = true">
          <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 도메인 등록
        </button>
      </div>
    </div>

    <ul class="notice">
      <li>도메인 등록 후 도메인 소유권을 인증해야 합니다.</li>
      <li>도메인 인증 성공 후 SPF 레코드 인증, DMARC 인증, DKIM 사용 설정을 할 수 있습니다.</li>
    </ul>

    <div class="list-card">
      <!-- C 테이블 스타일 — 액션 영역에 검색란 포함 (docs/DESIGN.md §6.5) -->
      <div class="list-toolbar">
        <div class="row" style="gap: 10px; flex-wrap: wrap">
          <span class="toolbar-count">총 <strong>{{ filtered.length }}</strong>개</span>
          <div class="dm-search">
            <input v-model="search" class="input" placeholder="도메인을 입력하세요.">
            <UIcon name="i-lucide-search" class="text-sm dm-search-icon" />
          </div>
        </div>
        <div class="row" style="gap: 6px; flex-wrap: wrap">
          <button
            type="button"
            class="btn btn-outline-dark btn-sm"
            :disabled="selected.length !== 1"
            @click="onDkim"
          >
            DKIM 설정
          </button>
          <span v-if="selected.length > 0" class="muted" style="font-size: var(--fz-sm)">{{ selected.length }}개 선택됨</span>
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
              <th>도메인</th>
              <th class="dm-mid">
                도메인 소유 인증 상태
              </th>
              <th>인증 일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in paged" :key="d.id" :class="{ selected: selected.includes(d.id) }">
              <td>
                <label class="checkbox"><input type="checkbox" :checked="selected.includes(d.id)" @change="toggleOne(d.id)"></label>
              </td>
              <td class="cell-mono" style="color: var(--ink-900)">
                {{ d.domain }}
              </td>
              <td class="dm-mid">
                <span v-if="d.verified" class="dm-verified">완료</span>
                <span v-else class="muted">미인증</span>
              </td>
              <td class="cell-mono">
                {{ d.verifiedAt }}
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td colspan="4" style="text-align: center; padding: 48px 12px; color: var(--ink-500)">
                등록된 도메인이 없습니다.
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

    <AppDomainRegisterDialog
      :open="openRegister"
      @close="openRegister = false"
      @registered="onRegistered"
    />

    <AppDkimSettingsDialog
      :open="openDkim"
      :domain="dkimDomain"
      @close="openDkim = false"
    />

    <AppConfirmDialog
      :open="openDelete"
      title="도메인 삭제"
      :message="`선택한 도메인 ${selected.length}개를 삭제하시겠습니까?\n삭제된 도메인은 이메일 발신에 사용할 수 없습니다.`"
      confirm-label="삭제"
      danger
      @close="openDelete = false"
      @confirm="onDeleteConfirm"
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
.dm-search {
  position: relative;
  width: 260px;
  max-width: 100%;
}
.dm-search .input {
  height: 28px;
  padding-right: 32px;
  font-size: var(--fz-sm);
}
.dm-search-icon {
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
.dm-mid {
  text-align: center;
}
.dm-verified {
  color: var(--accent-ink);
  font-weight: 500;
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
