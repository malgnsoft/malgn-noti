<script setup lang="ts">
const props = defineProps<{ kind: 'phone' | 'email' | 'token' }>()
const toast = useToast()

interface NoticeItem {
  text: string
  subs?: string[]
}
interface OptoutRow {
  id: string
  value: string
  item?: string
  createdAt: string
}

/* 발신 정보 등록 화면에서 들어오는 값(목업) */
const PHONE_080 = ['080-1234-5678']
const EMAIL_DOMAINS = ['mail.malgn.example']

const CONF = {
  phone: {
    pageTitle: '수신 거부 관리 (휴대폰)',
    notice: [
      {
        text: '광고성 정보를 포함한 메시지 발송 시 수신자가 수신을 거부할 수 있도록 설정할 수 있습니다.',
        subs: [
          '수신 거부는 광고 메시지만 거부됩니다. (일반, 인증 메시지는 수신 가능)',
          '080 수신 거부 번호를 선택하고 수신 거부할 번호를 추가해야 합니다.',
          '080 수신 거부 번호를 기준으로 수신 거부를 요청한 번호 목록을 조회할 수 있습니다.',
        ],
      },
    ] as NoticeItem[],
    downloadLabel: '목록 다운로드 요청',
    searchPlaceholder: '수신 거부 번호를 입력하세요.',
    valueHead: '수신 거부 번호',
    addLabel: '수신 거부 번호 등록',
    bulkLabel: '수신 거부 번호 일괄 등록',
    releaseLabel: '수신 거부 번호 해지',
    addKind: 'number' as const,
    selectOptions: PHONE_080,
    selectPlaceholder: '080 수신 거부 번호 선택',
  },
  email: {
    pageTitle: '수신 거부 관리 (이메일)',
    notice: [
      {
        text: '이메일 발송 시 수신자가 수신을 거부할 수 있도록 설정할 수 있습니다.',
        subs: [
          '수신 거부는 광고 메시지만 거부됩니다. (일반, 인증 메시지는 수신 가능)',
          '이메일 도메인을 선택하고 수신 거부할 이메일을 추가해야 합니다.',
          '이메일 도메인을 기준으로 수신 거부를 요청한 이메일 목록을 조회할 수 있습니다.',
        ],
      },
    ] as NoticeItem[],
    downloadLabel: '목록 다운로드 요청',
    searchPlaceholder: '수신 거부 이메일을 입력하세요.',
    valueHead: '수신 거부 이메일',
    addLabel: '수신 거부 이메일 등록',
    bulkLabel: '수신 거부 이메일 일괄 등록',
    releaseLabel: '수신 거부 이메일 해지',
    addKind: 'email' as const,
    selectOptions: EMAIL_DOMAINS,
    selectPlaceholder: '이메일 도메인 선택',
  },
  token: {
    pageTitle: '수신 거부 관리 (토큰)',
    notice: [
      { text: '토큰 등록 시 수신자가 PUSH(알림, 광고, 야간광고) 수신을 거부할 수 있습니다.' },
      { text: '수신 거부를 설정한 토큰 목록을 조회할 수 있습니다.' },
    ] as NoticeItem[],
    downloadLabel: '목록 다운로드 요청',
    searchPlaceholder: '수신 거부 토큰을 입력하세요.',
    valueHead: '수신 거부 토큰',
    addLabel: undefined,
    bulkLabel: undefined,
    releaseLabel: undefined,
    addKind: undefined,
    selectOptions: undefined as string[] | undefined,
    selectPlaceholder: undefined,
  },
}

const conf = computed(() => CONF[props.kind])
const isToken = computed(() => props.kind === 'token')
const hasCheckbox = computed(() => !isToken.value)

const rows = ref<OptoutRow[]>([])
const search = ref('')
const selected = ref<string[]>([])
const senderFilter = ref('')
const page = ref(1)
const PAGE_SIZE = 10

const filtered = computed(() =>
  rows.value.filter(r => !search.value.trim() || r.value === search.value.trim()))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(r => selected.value.includes(r.id)))
const colCount = computed(() => (hasCheckbox.value ? 1 : 0) + (isToken.value ? 2 : 1) + 1)

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

function nowStr() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

/* ── 수신 거부 항목 등록 ─────────────────────────────────────────── */
const addOpen = ref(false)
const bulkOpen = ref(false)
function onAddSubmit(values: string[]) {
  if (!values.length) return
  const now = nowStr()
  const newRows: OptoutRow[] = values.map((v, i) => ({ id: `r${Date.now()}${i}`, value: v, createdAt: now }))
  rows.value = [...newRows, ...rows.value]
  page.value = 1
}

/* ── 해지 ────────────────────────────────────────────────────────── */
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
  toast.add({ title: conf.value.releaseLabel ?? '해지', description: `${n}건의 수신 거부를 해지했습니다.`, icon: 'i-lucide-info' })
}

/* ── 다운로드 요청 ───────────────────────────────────────────────── */
const downloadConfirmOpen = ref(false)
const exportListOpen = ref(false)
function onDownloadConfirm() {
  downloadConfirmOpen.value = false
  toast.add({ title: '다운로드 요청', description: '다운로드 요청이 접수되었습니다. [다운로드 요청 목록]에서 확인하세요.', icon: 'i-lucide-circle-check' })
}

</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발송 관리 · 주소록
          </div>
          <h1>{{ conf.pageTitle }}</h1>
          <p>광고 메시지 수신을 거부할 대상을 등록하고 조회합니다.</p>
        </div>
        <div v-if="conf.addLabel" class="row" style="gap: 6px">
          <button type="button" class="btn btn-primary" @click="bulkOpen = true">
            <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> {{ conf.bulkLabel }}
          </button>
          <button type="button" class="btn btn-primary" @click="addOpen = true">
            <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> {{ conf.addLabel }}
          </button>
        </div>
      </div>
    </div>

    <!-- 안내 -->
    <ul class="notice">
      <li v-for="(n, i) in conf.notice" :key="i">
        {{ n.text }}
        <ul v-if="n.subs">
          <li v-for="(s, j) in n.subs" :key="j">
            {{ s }}
          </li>
        </ul>
      </li>
    </ul>

    <!-- C 테이블 스타일 — 액션 영역에 인라인 검색 (docs/DESIGN.md §6.5) -->
    <div class="list-card">
      <div class="list-toolbar">
        <div class="list-toolbar-l">
          <span class="toolbar-count">총 <strong>{{ filtered.length }}</strong>개</span>
          <span class="toolbar-sep">|</span>
          <select v-if="conf.selectOptions" v-model="senderFilter" class="select opt-select">
            <option value="">
              {{ conf.selectPlaceholder }}
            </option>
            <option v-for="o in conf.selectOptions" :key="o" :value="o">
              {{ o }}
            </option>
          </select>
          <div class="opt-search">
            <input v-model="search" class="input" :placeholder="conf.searchPlaceholder">
            <UIcon name="i-lucide-search" class="text-sm opt-search-icon" />
          </div>
        </div>
        <div class="list-toolbar-r">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="filtered.length === 0"
            @click="downloadConfirmOpen = true"
          >
            {{ conf.downloadLabel }}
          </button>
          <button type="button" class="btn btn-outline btn-sm" @click="exportListOpen = true">
            다운로드 요청 목록
          </button>
          <button
            v-if="conf.releaseLabel"
            type="button"
            class="btn btn-error btn-sm"
            :disabled="selected.length === 0"
            @click="onRelease"
          >
            {{ conf.releaseLabel }}
          </button>
        </div>
      </div>

      <div class="list-table-scroll">
        <table class="table" data-table-style="c">
          <thead>
            <tr>
              <th v-if="hasCheckbox" style="width: 36px">
                <label class="checkbox"><input type="checkbox" :checked="allChecked" @change="toggleAll"></label>
              </th>
              <th>{{ conf.valueHead }}</th>
              <th v-if="isToken">
                수신 거부 항목
              </th>
              <th style="width: 280px">
                등록 일시
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id" :class="{ selected: selected.includes(r.id) }">
              <td v-if="hasCheckbox">
                <label class="checkbox"><input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)"></label>
              </td>
              <td class="cell-mono" style="color: var(--ink-900)">
                {{ r.value }}
              </td>
              <td v-if="isToken">
                {{ r.item || '-' }}
              </td>
              <td class="cell-mono">
                {{ r.createdAt }}
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td :colspan="colCount" style="text-align: center; padding: 56px 12px; color: var(--ink-500)">
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

    <!-- 수신 거부 항목 등록 -->
    <AppOptoutAddDialog
      v-if="conf.addKind"
      :open="addOpen"
      :kind="conf.addKind"
      :select-options="conf.selectOptions ?? []"
      @close="addOpen = false"
      @submit="onAddSubmit"
    />

    <!-- 수신 거부 항목 일괄 등록 -->
    <AppOptoutBulkDialog
      v-if="conf.addKind"
      :open="bulkOpen"
      :kind="conf.addKind"
      :select-options="conf.selectOptions ?? []"
      @close="bulkOpen = false"
    />

    <!-- 다운로드 요청 목록 -->
    <AppExportListDialog :open="exportListOpen" :jobs="[]" @close="exportListOpen = false" />

    <!-- 다운로드 요청 확인 -->
    <AppConfirmDialog
      :open="downloadConfirmOpen"
      title="다운로드 요청"
      message="현재 검색 조건의 수신 거부 목록을 다운로드 요청하시겠습니까?"
      confirm-label="요청"
      @close="downloadConfirmOpen = false"
      @confirm="onDownloadConfirm"
    />

    <!-- 해지 확인 -->
    <AppConfirmDialog
      :open="releaseOpen"
      :title="conf.releaseLabel ?? '수신 거부 해지'"
      :message="`선택한 ${selected.length}건의 수신 거부를 해지하시겠습니까?\n해지 후에는 해당 대상이 다시 광고 메시지를 수신할 수 있습니다.`"
      confirm-label="해지"
      danger
      @close="releaseOpen = false"
      @confirm="onReleaseConfirm"
    />
  </div>
</template>

<style scoped>
/* 안내 */
.notice {
  margin: 0 0 16px;
  padding: 14px 18px 14px 34px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  list-style: disc;
}
.notice > li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.7;
}
.notice ul {
  margin: 2px 0;
  padding-left: 16px;
  list-style: '- ';
}
.notice ul li {
  font-size: var(--fz-sm);
  color: var(--ink-400);
  line-height: 1.7;
}

/* C 테이블 스타일 */
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
  gap: 10px;
  flex-wrap: nowrap;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.list-toolbar-l {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  flex: 1;
  min-width: 0;
}
.list-toolbar-r {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}
.list-toolbar-r .btn {
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
.toolbar-sep {
  color: var(--line);
  user-select: none;
}
.opt-select {
  height: 28px;
  font-size: var(--fz-sm);
  flex-shrink: 0;
  max-width: 200px;
}
.opt-search {
  position: relative;
  flex: none;
  width: 260px;
  max-width: 100%;
}
.opt-search .input {
  height: 28px;
  width: 100%;
  padding-right: 32px;
  font-size: var(--fz-sm);
}
.opt-search-icon {
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
