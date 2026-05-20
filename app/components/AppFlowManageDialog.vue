<script setup lang="ts">
interface FlowChannel { id: string, ch: string, template: string }
interface Flow {
  id: string
  name: string
  purpose: 'info' | 'auth' | 'ad'
  mode: 'sequential' | 'parallel'
  channels: FlowChannel[]
  createdAt: string
}
interface FlowDraft { id?: string, name: string, purpose: 'info' | 'auth' | 'ad', mode: 'sequential' | 'parallel', channels: FlowChannel[] }

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const toast = useToast()

const flows = ref<Flow[]>([
  {
    id: 'uX32yFWZ',
    name: 'djkim',
    purpose: 'info',
    mode: 'sequential',
    channels: [
      { id: 'c1', ch: '알림톡', template: '01_가입환영_알림톡' },
      { id: 'c2', ch: 'SMS', template: '01_비디오팩생성' }
    ],
    createdAt: '2026-04-23 10:01'
  }
])
const search = ref('')
const selected = ref<string[]>([])
// 등록/수정 다이얼로그 공용 상태
const openFlowDialog = ref(false)
const editingFlow = ref<FlowDraft | null>(null)

function purposeLabel(p: string) {
  return p === 'auth' ? '인증용' : p === 'ad' ? '광고용' : '일반용'
}
function channelsLabel(cs: FlowChannel[]) {
  return cs.map(c => c.ch).join(', ')
}
function nowStamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function newFlowId() {
  return Math.random().toString(36).slice(2, 10)
}
function startCreate() {
  editingFlow.value = null
  openFlowDialog.value = true
}
function editFlow(f: Flow) {
  editingFlow.value = {
    id: f.id,
    name: f.name,
    purpose: f.purpose,
    mode: f.mode,
    channels: f.channels.map(c => ({ ...c }))
  }
  openFlowDialog.value = true
}
function onFlowSaved(d: FlowDraft) {
  if (d.id) {
    flows.value = flows.value.map(x => x.id === d.id
      ? { ...x, name: d.name, purpose: d.purpose, mode: d.mode, channels: d.channels }
      : x)
    toast.add({ title: `"${d.name}" 플로우를 수정했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
  }
  else {
    flows.value = [...flows.value, {
      id: newFlowId(),
      name: d.name,
      purpose: d.purpose,
      mode: d.mode,
      channels: d.channels,
      createdAt: nowStamp()
    }]
    toast.add({ title: `"${d.name}" 플로우를 등록했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
  }
}

const filtered = computed(() => flows.value.filter(f =>
  !search.value || (f.id + f.name).toLowerCase().includes(search.value.toLowerCase())))

function toggleAll(e: Event) {
  selected.value = (e.target as HTMLInputElement).checked ? filtered.value.map(f => f.id) : []
}
function toggleOne(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}
function placeholder(msg: string) {
  toast.add({ title: msg, color: 'info', icon: 'i-lucide-info' })
}
</script>

<template>
  <AppModal :open="open" title="플로우 관리" :width="920" @close="emit('close')">
    <div class="fm-info">
      <div>· 플로우 발송을 하려면 플로우를 먼저 생성해야 합니다.</div>
      <div>· 발송할 메시지 채널과 템플릿을 선택하고 발송 순서를 지정한 플로우를 생성하세요.</div>
    </div>

    <div class="fm-bar">
      <button type="button" class="btn btn-primary btn-sm" @click="startCreate">
        <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 플로우 등록
      </button>
      <button
        type="button"
        class="btn btn-error btn-sm"
        :disabled="selected.length === 0"
        @click="flows = flows.filter(f => !selected.includes(f.id)); selected = []"
      >
        플로우 삭제
      </button>
      <div style="position: relative; flex: 1; max-width: 240px">
        <input v-model="search" class="input" placeholder="플로우 이름을 입력하세요." style="padding-right: 30px">
        <UIcon name="i-lucide-search" class="text-sm" style="position: absolute; right: 10px; top: 11px; color: var(--ink-400)" />
      </div>
      <button type="button" class="btn btn-outline btn-sm" @click="placeholder('새로고침했습니다.')">
        <UIcon name="i-lucide-refresh-cw" class="text-[length:var(--fz-sm)]" /> 새로고침
      </button>
      <button type="button" class="btn btn-outline btn-sm" disabled>
        ‹ 이전
      </button>
      <button type="button" class="btn btn-outline btn-sm" disabled>
        다음 ›
      </button>
      <span class="muted" style="font-size: var(--fz-sm)">총 {{ filtered.length }}개</span>
    </div>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px">
              <label class="checkbox">
                <input
                  type="checkbox"
                  :checked="selected.length === filtered.length && filtered.length > 0"
                  @change="toggleAll"
                >
              </label>
            </th>
            <th>플로우 아이디</th>
            <th>플로우 이름</th>
            <th>발송 목적</th>
            <th>메시지 채널</th>
            <th>생성 일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in filtered" :key="f.id" :class="{ selected: selected.includes(f.id) }">
            <td>
              <label class="checkbox">
                <input type="checkbox" :checked="selected.includes(f.id)" @change="toggleOne(f.id)">
              </label>
            </td>
            <td class="cell-mono">
              {{ f.id }}
            </td>
            <td>
              <button type="button" class="fm-name-btn" @click="editFlow(f)">
                {{ f.name }}
              </button>
            </td>
            <td>{{ purposeLabel(f.purpose) }}</td>
            <td>{{ channelsLabel(f.channels) }}</td>
            <td class="muted">
              {{ f.createdAt }}
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="muted" style="text-align: center; padding: 32px 0">
              생성된 플로우가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppModal>

  <AppFlowCreateDialog
    :open="openFlowDialog"
    :edit="editingFlow"
    @close="openFlowDialog = false"
    @confirm="onFlowSaved"
  />
</template>

<style scoped>
.fm-info {
  background: var(--ink-50);
  border-radius: var(--r-md);
  padding: 12px 14px;
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
  margin-bottom: 14px;
}
.fm-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.fm-name-btn {
  background: none;
  border: 0;
  padding: 0;
  color: var(--accent-ink);
  font-weight: 600;
  cursor: pointer;
  font: inherit;
  text-align: left;
}
.fm-name-btn:hover {
  text-decoration: underline;
}
</style>
