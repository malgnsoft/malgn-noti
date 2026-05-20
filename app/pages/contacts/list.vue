<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: '주소록 관리' })
const toast = useToast()
const router = useRouter()

const DATA = reactive([
  { id: 1, name: '이수민', phone: '010-2345-6789', email: 'soomin.lee@example.com', group: 'VIP 고객', joined: '2024-09-12', token: true },
  { id: 2, name: '박지훈', phone: '010-9876-5432', email: 'park.jihoon@example.com', group: '신규 가입', joined: '2026-05-15', token: false },
  { id: 3, name: '최예진', phone: '010-3344-5566', email: 'yejin.choi@example.com', group: 'VIP 고객', joined: '2024-03-04', token: true },
  { id: 4, name: '정민호', phone: '010-7788-9900', email: 'minho.jeong@example.com', group: '휴면 회원', joined: '2023-08-20', token: false },
  { id: 5, name: '한지영', phone: '010-2233-4455', email: 'jiyoung.han@example.com', group: '신규 가입', joined: '2026-05-12', token: true },
  { id: 6, name: '김도현', phone: '010-5566-7788', email: 'dohyun.kim@example.com', group: 'VIP 고객', joined: '2024-11-08', token: true },
  { id: 7, name: '윤서연', phone: '010-1122-3344', email: 'seoyeon.yoon@example.com', group: '활성 고객', joined: '2025-02-14', token: false },
  { id: 8, name: '강민재', phone: '010-9988-7766', email: 'minjae.kang@example.com', group: '활성 고객', joined: '2025-06-22', token: true },
  { id: 9, name: '조하늘', phone: '010-4433-2211', email: 'haneul.cho@example.com', group: '수신거부', joined: '2024-05-30', token: false },
])
const GROUP_NAMES = ['VIP 고객', '신규 가입', '활성 고객', '휴면 회원', '수신거부']
const groups = computed(() => [
  { id: 'all', name: '전체 연락처', count: DATA.length },
  ...GROUP_NAMES.map(n => ({ id: n, name: n, count: DATA.filter(c => c.group === n).length })),
])

const activeGroup = ref('all')
const search = ref('')
const selected = ref<number[]>([])
const page = ref(1)
const pageSize = 10

const filtered = computed(() => DATA.filter(c =>
  (activeGroup.value === 'all' || c.group === activeGroup.value)
  && (!search.value || (c.name + c.phone + c.email).includes(search.value)),
))
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const allChecked = computed(() => paged.value.length > 0 && paged.value.every(c => selected.value.includes(c.id)))

watch([activeGroup, search], () => { page.value = 1 })
watch(pageCount, () => { if (page.value > pageCount.value) page.value = pageCount.value })

function groupTone(g: string) {
  return g === 'VIP 고객' ? 'warning' : g === '수신거부' ? 'error' : 'sky'
}
function toggleAll() {
  const ids = paged.value.map(c => c.id)
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

/* ── 그룹 이동 ───────────────────────────────────────────────────── */
const groupMoveOpen = ref(false)
const groupMoveTarget = ref('')
function onGroupMove() {
  groupMoveTarget.value = ''
  groupMoveOpen.value = true
}
function onGroupMoveConfirm() {
  if (!groupMoveTarget.value) return
  const target = groupMoveTarget.value
  const n = selected.value.length
  for (const c of DATA) {
    if (selected.value.includes(c.id)) c.group = target
  }
  groupMoveOpen.value = false
  toast.add({ title: '그룹 이동', description: `${n}명을 '${target}' 그룹으로 이동했습니다.`, icon: 'i-lucide-users' })
  selected.value = []
}

/* ── 주소록 등록 / 수정 ──────────────────────────────────────────── */
const contactFormOpen = ref(false)
const bulkDialogOpen = ref(false)
const editContact = ref<{ name: string, phone: string, email: string } | null>(null)
function openContactCreate() {
  editContact.value = null
  contactFormOpen.value = true
}
function openContactEdit(c: { name: string, phone: string, email: string }) {
  editContact.value = { name: c.name, phone: c.phone, email: c.email }
  contactFormOpen.value = true
}

/* ── 선택 발송 — 선택한 연락처를 채널별 발송 페이지로 인계 ───────── */
const SEND_CHANNELS = [
  { label: '문자메시지', to: '/send/sms' },
  { label: '알림톡 / 친구톡', to: '/send/kakao' },
  { label: 'RCS', to: '/send/rcs' },
  { label: '이메일', to: '/send/email' },
  { label: 'PUSH', to: '/send/push' },
]
const pendingRecipients = useState<Recipient[]>('sendRecipients', () => [])
const sendMenuOpen = ref(false)
const sendMenuEl = ref<HTMLElement | null>(null)
function onSelectSend(to: string) {
  if (selected.value.length) {
    pendingRecipients.value = DATA
      .filter(c => selected.value.includes(c.id))
      .map(c => ({ id: c.id, name: c.name, phone: c.phone, email: c.email }))
  }
  sendMenuOpen.value = false
  router.push(to)
}
function onSendDocClick(e: MouseEvent) {
  if (sendMenuEl.value && !sendMenuEl.value.contains(e.target as Node)) sendMenuOpen.value = false
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
          <h1>주소록 관리</h1>
          <p>연락처를 그룹으로 관리하고 발송 시 빠르게 선택합니다.</p>
        </div>
        <div class="row" style="gap: 6px">
          <button
            class="btn btn-primary btn-sm"
            @click="bulkDialogOpen = true"
          >
            <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 주소록 일괄 등록
          </button>
          <button
            class="btn btn-primary btn-sm"
            @click="openContactCreate"
          >
            <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 주소록 등록
          </button>
        </div>
      </div>
    </div>

    <div class="ct-grid">
      <aside>
        <div class="ct-aside-title">
          그룹
        </div>
        <div class="col" style="gap: 2px">
          <div
            v-for="g in groups"
            :key="g.id"
            class="ct-group"
            :class="{ on: activeGroup === g.id }"
            @click="activeGroup = g.id"
          >
            <span class="row" style="gap: 8px">
              <UIcon name="i-lucide-users" class="text-[length:var(--fz-lg)]" />{{ g.name }}
            </span>
            <span class="muted num" style="font-size: var(--fz-sm)">{{ g.count }}</span>
          </div>
          <div class="h-divider" />
          <button class="btn btn-ghost btn-sm" style="justify-content: flex-start">
            <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 새 그룹
          </button>
        </div>
      </aside>

      <div style="min-width: 0">
        <div class="filter-bar">
          <div style="position: relative; flex: 1">
            <UIcon name="i-lucide-search" class="text-sm" style="position: absolute; left: 10px; top: 11px; color: var(--ink-400)" />
            <input v-model="search" class="input" placeholder="이름 / 휴대폰 / 이메일 검색" style="padding-left: 32px">
          </div>
          <template v-if="selected.length > 0">
            <span class="muted" style="font-size: var(--fz-sm)">{{ selected.length }}명 선택됨</span>
            <button class="btn btn-outline btn-sm" @click="onGroupMove">
              <UIcon name="i-lucide-users" class="text-[length:var(--fz-sm)]" /> 그룹 이동
            </button>
            <button class="btn btn-error btn-sm">
              <UIcon name="i-lucide-trash-2" class="text-[length:var(--fz-sm)]" /> 삭제
            </button>
          </template>
          <div ref="sendMenuEl" class="send-menu-wrap">
            <button class="btn btn-soft btn-sm" @click="sendMenuOpen = !sendMenuOpen">
              <UIcon name="i-lucide-send" class="text-[length:var(--fz-sm)]" /> 선택 발송
              <UIcon :name="sendMenuOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="text-[length:var(--fz-sm)]" />
            </button>
            <div v-if="sendMenuOpen" class="send-menu">
              <button
                v-for="ch in SEND_CHANNELS"
                :key="ch.to"
                type="button"
                class="send-menu-item"
                @click="onSelectSend(ch.to)"
              >
                {{ ch.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 36px">
                  <label class="checkbox">
                    <input type="checkbox" :checked="allChecked" @change="toggleAll">
                  </label>
                </th>
                <th>이름</th><th>휴대폰</th><th>이메일</th><th>토큰</th><th>그룹</th><th>가입일</th>
                <th style="width: 48px" />
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in paged" :key="c.id" :class="{ selected: selected.includes(c.id) }">
                <td>
                  <label class="checkbox"><input type="checkbox" :checked="selected.includes(c.id)" @change="toggleOne(c.id)"></label>
                </td>
                <td>
                  <button type="button" class="ct-name-btn" @click="openContactEdit(c)">
                    {{ c.name }}
                  </button>
                </td>
                <td class="cell-mono">
                  {{ c.phone }}
                </td>
                <td class="cell-mono" style="font-size: var(--fz-sm)">
                  {{ c.email }}
                </td>
                <td :class="{ muted: !c.token }">
                  {{ c.token ? '있음' : '-' }}
                </td>
                <td><AppBadge :tone="groupTone(c.group) as any">{{ c.group }}</AppBadge></td>
                <td class="muted">
                  {{ c.joined }}
                </td>
                <td>
                  <button class="btn btn-ghost btn-sm btn-icon" aria-label="더보기">
                    <UIcon name="i-lucide-ellipsis-vertical" class="text-sm" />
                  </button>
                </td>
              </tr>
              <tr v-if="!paged.length">
                <td colspan="8" style="text-align: center; padding: 40px 12px; color: var(--ink-500)">
                  조건에 맞는 연락처가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="ct-pager">
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
    </div>

    <AppContactFormDialog :open="contactFormOpen" :edit="editContact" @close="contactFormOpen = false" />

    <AppContactBulkDialog :open="bulkDialogOpen" @close="bulkDialogOpen = false" />

    <AppModal :open="groupMoveOpen" title="그룹 이동" :width="400" @close="groupMoveOpen = false">
      <p class="gm-note">
        선택한 {{ selected.length }}명을 이동할 그룹을 선택하세요.
      </p>
      <div class="gm-list">
        <label
          v-for="g in GROUP_NAMES"
          :key="g"
          class="gm-option"
          :class="{ on: groupMoveTarget === g }"
        >
          <input v-model="groupMoveTarget" type="radio" name="group-move" :value="g">
          <span>{{ g }}</span>
        </label>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-dark" @click="groupMoveOpen = false">
          취소
        </button>
        <button type="button" class="btn btn-primary" :disabled="!groupMoveTarget" @click="onGroupMoveConfirm">
          이동
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.ct-grid {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
}
@media (max-width: 1023px) {
  .ct-grid { grid-template-columns: 1fr; }
}
.ct-aside-title {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-400);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin: 4px 4px 12px;
}
.ct-group {
  padding: 10px 12px;
  border-radius: var(--r-md);
  cursor: pointer;
  color: var(--ink-700);
  font-weight: 500;
  font-size: var(--fz-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.12s;
}
.ct-group:hover { background: var(--ink-50); }
.ct-group.on {
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-weight: 600;
}

.ct-name-btn {
  background: none;
  border: 0;
  padding: 0;
  font-size: inherit;
  font-weight: 600;
  color: var(--accent-ink);
  cursor: pointer;
}
.ct-name-btn:hover {
  text-decoration: underline;
}

.send-menu-wrap {
  position: relative;
}
.send-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 50;
  min-width: 208px;
  padding: 4px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-popover);
}
.send-menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 10px;
  border: 0;
  background: none;
  border-radius: var(--r-sm);
  font-size: var(--fz-md);
  color: var(--ink-700);
  cursor: pointer;
}
.send-menu-item:hover {
  background: var(--ink-50);
}

.ct-pager {
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

/* 그룹 이동 모달 */
.gm-note {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 12px;
}
.gm-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.gm-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  cursor: pointer;
  font-size: var(--fz-md);
  color: var(--ink-700);
  transition: background 0.12s, border-color 0.12s;
}
.gm-option:hover {
  background: var(--ink-50);
}
.gm-option.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-weight: 600;
}
</style>
