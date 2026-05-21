<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: '그룹 관리' })
const toast = useToast()
const router = useRouter()

interface Group {
  id: number
  name: string
  groupId: string
  count: number
  createdAt: string
}
const DATA = reactive<Group[]>([
  { id: 1, name: '위캔디오_V4공지_고객용', groupId: 'gzQmmRIP', count: 0, createdAt: '2026-04-02 17:18' },
  { id: 2, name: '트래픽_알림_오발송', groupId: 'aldkBP47', count: 25, createdAt: '2026-03-20 19:18' },
  { id: 3, name: '위캔디오_업무_소통방', groupId: 'r2szwrkQ', count: 26, createdAt: '2026-03-16 14:20' },
])

const SEND_CHANNELS = [
  { label: '문자메시지', to: '/send/sms' },
  { label: '알림톡 / 친구톡', to: '/send/kakao' },
  { label: 'RCS', to: '/send/rcs' },
  { label: '이메일', to: '/send/email' },
  { label: 'PUSH', to: '/send/push' },
]
const NAMES = ['김민준', '이서연', '박도윤', '최서아', '정하준', '강지유', '윤시우', '임하은', '한지호', '오예린']

const search = ref('')
const selected = ref<number[]>([])
const page = ref(1)
const pageSize = 10

const filtered = computed(() => DATA.filter(g => !search.value || g.name.includes(search.value)))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(g => selected.value.includes(g.id)))

watch(search, () => { page.value = 1 })
watch(pageCount, () => { if (page.value > pageCount.value) page.value = pageCount.value })

function toggleAll() {
  const ids = paged.value.map(g => g.id)
  if (allChecked.value) {
    const s = new Set(ids)
    selected.value = selected.value.filter(id => !s.has(id))
  }
  else {
    selected.value = [...new Set([...selected.value, ...ids])]
  }
}
function toggleOne(id: number) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}

function onRefresh() {
  toast.add({ title: '새로고침', description: '그룹 목록을 새로고침했습니다.', icon: 'i-lucide-refresh-cw' })
}

/* ── 그룹 등록 / 수정 ────────────────────────────────────────────── */
const groupFormOpen = ref(false)
const editGroup = ref<Group | null>(null)
function pad2(n: number) {
  return String(n).padStart(2, '0')
}
function onAddGroup() {
  editGroup.value = null
  groupFormOpen.value = true
}
function onEditGroup(g: Group) {
  editGroup.value = g
  groupFormOpen.value = true
}
function onGroupFormSubmit(name: string) {
  if (editGroup.value) {
    const g = DATA.find(x => x.id === editGroup.value!.id)
    if (g) g.name = name
  }
  else {
    const d = new Date()
    DATA.unshift({
      id: Math.max(0, ...DATA.map(g => g.id)) + 1,
      name,
      groupId: Math.random().toString(36).slice(2, 10),
      count: 0,
      createdAt: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
    })
  }
}

/* ── 그룹 삭제 ───────────────────────────────────────────────────── */
const deleteOpen = ref(false)
const deleteMsg = computed(() =>
  `선택한 ${selected.value.length}개 그룹을 삭제하시겠습니까?\n그룹에 속한 연락처는 삭제되지 않습니다.`,
)
function onDeleteGroups() {
  if (selected.value.length) deleteOpen.value = true
}
function onDeleteConfirm() {
  const ids = new Set(selected.value)
  for (let i = DATA.length - 1; i >= 0; i--) {
    if (ids.has(DATA[i]!.id)) DATA.splice(i, 1)
  }
  deleteOpen.value = false
  toast.add({ title: '그룹 삭제', description: `${ids.size}개 그룹을 삭제했습니다.`, icon: 'i-lucide-trash-2' })
  selected.value = []
}

/* ── 그룹 메시지 발송 — 채널 선택 → 그룹 명단을 수신자로 인계 ──────── */
const pendingRecipients = useState<Recipient[]>('sendRecipients', () => [])
const sendMenuFor = ref<number | null>(null)
function toggleSendMenu(id: number) {
  sendMenuFor.value = sendMenuFor.value === id ? null : id
}
function groupRecipients(g: Group): Recipient[] {
  return Array.from({ length: g.count }, (_, i) => ({
    id: `${g.groupId}-${i + 1}`,
    name: NAMES[i % NAMES.length]!,
    phone: `010-${String(3100 + i * 7).slice(-4)}-${String(2400 + g.id * 31 + i * 13).slice(-4)}`,
  }))
}
function onGroupSend(g: Group, to: string) {
  sendMenuFor.value = null
  if (g.count === 0) {
    toast.add({ title: '그룹에 연락처가 없습니다.', icon: 'i-lucide-circle-alert' })
    return
  }
  pendingRecipients.value = groupRecipients(g)
  router.push(to)
}
function onSendDocClick() {
  sendMenuFor.value = null
}
onMounted(() => document.addEventListener('click', onSendDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onSendDocClick))
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발송 관리 · 주소록
          </div>
          <h1>그룹 관리</h1>
          <p>연락처 그룹을 만들고 그룹별로 연락처를 관리합니다.</p>
        </div>
        <div class="row" style="gap: 6px">
          <button class="btn btn-primary btn-sm" @click="onAddGroup">
            <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 그룹 등록
          </button>
        </div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="gp-search">
        <UIcon name="i-lucide-search" class="text-sm gp-search-icon" />
        <input v-model="search" class="input" placeholder="그룹 이름 검색" style="padding-left: 32px">
      </div>
      <template v-if="selected.length > 0">
        <span class="muted" style="font-size: var(--fz-sm)">{{ selected.length }}개 선택됨</span>
        <button class="btn btn-error btn-sm" @click="onDeleteGroups">
          <UIcon name="i-lucide-trash-2" class="text-[length:var(--fz-sm)]" /> 선택 삭제
        </button>
      </template>
      <button class="btn btn-ghost btn-sm" @click="onRefresh">
        <UIcon name="i-lucide-refresh-cw" class="text-[length:var(--fz-sm)]" /> 새로고침
      </button>
      <span class="gp-count">총 <strong>{{ filtered.length }}</strong>개</span>
    </div>

    <div class="gp-board">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px">
              <label class="checkbox"><input type="checkbox" :checked="allChecked" @change="toggleAll"></label>
            </th>
            <th>그룹 이름</th>
            <th class="gp-num">
              주소록 수
            </th>
            <th>등록 일시</th>
            <th style="width: 150px">
              메시지 발송
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in paged" :key="g.id" :class="{ selected: selected.includes(g.id) }">
            <td>
              <label class="checkbox"><input type="checkbox" :checked="selected.includes(g.id)" @change="toggleOne(g.id)"></label>
            </td>
            <td>
              <button type="button" class="gp-name-btn" @click="onEditGroup(g)">
                {{ g.name }}
              </button>
            </td>
            <td class="cell-mono gp-num">
              {{ g.count.toLocaleString() }}
            </td>
            <td class="muted">
              {{ g.createdAt }}
            </td>
            <td>
              <div class="gp-send-wrap">
                <button type="button" class="btn btn-soft btn-sm" @click.stop="toggleSendMenu(g.id)">
                  <UIcon name="i-lucide-send" class="text-[length:var(--fz-2xs)]" /> 메시지 발송
                  <UIcon :name="sendMenuFor === g.id ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="text-[length:var(--fz-2xs)]" />
                </button>
                <div v-if="sendMenuFor === g.id" class="gp-send-menu" @click.stop>
                  <button
                    v-for="ch in SEND_CHANNELS"
                    :key="ch.to"
                    type="button"
                    class="gp-send-item"
                    @click="onGroupSend(g, ch.to)"
                  >
                    {{ ch.label }}
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="!paged.length">
            <td colspan="5" style="text-align: center; padding: 40px 12px; color: var(--ink-500)">
              조건에 맞는 그룹이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="gp-pager">
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

    <AppGroupFormDialog
      :open="groupFormOpen"
      :edit="editGroup"
      @close="groupFormOpen = false"
      @submit="onGroupFormSubmit"
    />

    <AppConfirmDialog
      :open="deleteOpen"
      title="그룹 삭제"
      :message="deleteMsg"
      confirm-label="삭제"
      danger
      @close="deleteOpen = false"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.gp-search {
  position: relative;
  flex: 1;
}
.gp-search-icon {
  position: absolute;
  left: 10px;
  top: 11px;
  color: var(--ink-400);
}
.gp-count {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  white-space: nowrap;
  padding-left: 2px;
}
.gp-count strong {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--ink-900);
}

.gp-board {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
}

.gp-name-btn {
  background: none;
  border: 0;
  padding: 0;
  font-size: inherit;
  font-weight: 600;
  color: var(--accent-ink);
  cursor: pointer;
}
.gp-name-btn:hover {
  text-decoration: underline;
}
.gp-num {
  text-align: center;
}

.gp-send-wrap {
  position: relative;
}
.gp-send-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  min-width: 168px;
  padding: 4px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-popover);
}
.gp-send-item {
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
.gp-send-item:hover {
  background: var(--ink-50);
}

.gp-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
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
