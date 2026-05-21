<script setup lang="ts">
import type { RcsButton } from '~/components/AppRcsButtonDialog.vue'
import type { RcsSample } from '~/components/AppRcsSampleDialog.vue'

useHead({ title: 'RCS 템플릿' })
const toast = useToast()

type Kind = 'root' | 'category' | 'template'
type Purpose = 'info' | 'auth' | 'ad'
type MsgType = 'sms' | 'lms' | 'mms'
type Delivery = 'standalone' | 'conversation'
type Fallback = 'sms' | 'integrated'
type ReviewStatus = '승인' | '검수중' | '반려'

interface RTplNode {
  id: string
  name: string
  kind: Kind
  children?: RTplNode[]
  code?: string
  bizCode?: string
  brand?: string
  chatroom?: string
  purpose?: Purpose
  msgType?: MsgType
  delivery?: Delivery
  fallback?: Fallback
  body?: string
  buttons?: RcsButton[]
  status?: ReviewStatus
  approvedAt?: string
}

const BRANDS = ['위캔디오', '맑은소프트', '쏠쏠']
const CHATROOMS = ['1588-1234', '02-555-1234', '031-444-5678']

const PURPOSE_LABEL: Record<Purpose, string> = { info: '일반용', auth: '인증용', ad: '광고용' }
const MSGTYPE_LABEL: Record<MsgType, string> = { sms: 'SMS', lms: 'LMS', mms: 'MMS' }
const DELIVERY_LABEL: Record<Delivery, string> = { standalone: '스탠드얼론', conversation: '대화형' }
const FALLBACK_LABEL: Record<Fallback, string> = { sms: 'SMS', integrated: '통합' }

/* ── 트리 데이터(목업) ───────────────────────────────────────────── */
const tree = reactive<RTplNode>({
  id: 'root',
  name: 'Root Category',
  kind: 'root',
  children: [
    {
      id: 'uFu6iHB3',
      name: '비디오팩_상품개설',
      kind: 'category',
      children: [
        {
          id: 't1',
          name: '01_비디오팩생성',
          kind: 'template',
          code: 'rk7SpbwY',
          bizCode: 'LBR.4wb1ika561-87DIa83M00ZR3GiE8gle4cyR2',
          brand: '위캔디오',
          chatroom: '1588-1234',
          purpose: 'info',
          msgType: 'sms',
          delivery: 'standalone',
          fallback: 'sms',
          body: '[Web 발신]\n비디오팩이 생성되었습니다. 마이페이지에서 확인해 주세요.',
          buttons: [{ type: 'URL 연결하기', label: '시작 가이드', url: 'https://www.wecandeo.com' }],
          status: '승인',
          approvedAt: '2026-03-30 15:13',
        },
        {
          id: 't2',
          name: '02-1_비디오팩생성2일경과',
          kind: 'template',
          code: 'Qm3kP9zX',
          bizCode: 'LBR.2ab9kc771-31FEb27N91PQ6TzX2hkm9wPq',
          brand: '위캔디오',
          chatroom: '1588-1234',
          purpose: 'info',
          msgType: 'sms',
          delivery: 'standalone',
          fallback: 'sms',
          body: '비디오팩 생성 후 2일이 지났습니다. 지금 확인해 보세요.',
          buttons: [],
          status: '검수중',
          approvedAt: '-',
        },
      ],
    },
    {
      id: 'cat2',
      name: '비디오팩_알림',
      kind: 'category',
      children: [
        {
          id: 't3',
          name: '01_월간리포트안내',
          kind: 'template',
          code: 'Rp2cN8jW',
          bizCode: 'LBR.7cd3le882-42GHc38O02RS7UaY3imn0xQr',
          brand: '맑은소프트',
          chatroom: '02-555-1234',
          purpose: 'info',
          msgType: 'lms',
          delivery: 'standalone',
          fallback: 'integrated',
          body: '이번 달 리포트가 도착했습니다. 마이페이지에서 확인해 주세요.',
          buttons: [],
          status: '승인',
          approvedAt: '2026-04-20 10:30',
        },
      ],
    },
  ],
})

function nowStr() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function randomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

/* ── 트리 ────────────────────────────────────────────────────────── */
const expanded = ref<Set<string>>(new Set(['root', 'uFu6iHB3']))
const selectedId = ref<string | null>(null)
const search = ref('')

function findNode(id: string, node: RTplNode = tree): RTplNode | null {
  if (node.id === id) return node
  for (const c of node.children ?? []) {
    const r = findNode(id, c)
    if (r) return r
  }
  return null
}
function findParent(id: string, node: RTplNode = tree): RTplNode | null {
  for (const c of node.children ?? []) {
    if (c.id === id) return node
    const r = findParent(id, c)
    if (r) return r
  }
  return null
}
const selectedNode = computed(() => selectedId.value ? findNode(selectedId.value) : null)

function computeVisible(q: string): Set<string> {
  const vis = new Set<string>()
  const lq = q.toLowerCase()
  function dfs(node: RTplNode): boolean {
    let any = false
    for (const c of node.children ?? []) if (dfs(c)) any = true
    if (node.name.toLowerCase().includes(lq) || any) {
      vis.add(node.id)
      return true
    }
    return false
  }
  dfs(tree)
  return vis
}
const flat = computed<{ node: RTplNode, depth: number }[]>(() => {
  const out: { node: RTplNode, depth: number }[] = []
  const q = search.value.trim()
  const vis = q ? computeVisible(q) : null
  function walk(node: RTplNode, depth: number) {
    out.push({ node, depth })
    const open = q ? true : expanded.value.has(node.id)
    if (node.children && open) {
      for (const c of node.children) {
        if (!vis || vis.has(c.id)) walk(c, depth + 1)
      }
    }
  }
  walk(tree, 0)
  return out
})
function isOpen(id: string) {
  return search.value.trim() ? true : expanded.value.has(id)
}
function toggle(id: string) {
  const s = new Set(expanded.value)
  s.has(id) ? s.delete(id) : s.add(id)
  expanded.value = s
}

function statusTone(s: ReviewStatus) {
  return s === '승인' ? 'success' : s === '반려' ? 'error' : 'warning'
}

/* ── 폼 뷰 ───────────────────────────────────────────────────────── */
const view = ref<'manage' | 'form'>('manage')
const formMode = ref<'create' | 'edit'>('create')
const form = reactive({
  name: '',
  brand: '',
  chatroom: '',
  purpose: 'info' as Purpose,
  msgType: 'sms' as MsgType,
  delivery: 'standalone' as Delivery,
  fallback: 'sms' as Fallback,
  body: '',
  buttons: [] as RcsButton[],
})
let formTargetCatId = 'root'
let formEditId = ''

function openForm(mode: 'create' | 'edit') {
  formMode.value = mode
  if (mode === 'edit' && selectedNode.value?.kind === 'template') {
    const t = selectedNode.value
    formEditId = t.id
    form.name = t.name
    form.brand = t.brand ?? ''
    form.chatroom = t.chatroom ?? ''
    form.purpose = t.purpose ?? 'info'
    form.msgType = t.msgType ?? 'sms'
    form.delivery = t.delivery ?? 'standalone'
    form.fallback = t.fallback ?? 'sms'
    form.body = t.body ?? ''
    form.buttons = (t.buttons ?? []).map(b => ({ ...b }))
  }
  else {
    formEditId = ''
    const sel = selectedNode.value
    formTargetCatId = sel?.kind === 'category'
      ? sel.id
      : sel?.kind === 'template'
        ? (findParent(sel.id)?.id ?? 'root')
        : 'root'
    form.name = ''
    form.brand = ''
    form.chatroom = ''
    form.purpose = 'info'
    form.msgType = 'sms'
    form.delivery = 'standalone'
    form.fallback = 'sms'
    form.body = ''
    form.buttons = []
  }
  view.value = 'form'
}
function cancelForm() {
  view.value = 'manage'
}
function saveForm() {
  if (!form.name.trim()) {
    toast.add({ title: '템플릿 이름을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!form.brand) {
    toast.add({ title: '발신 브랜드를 선택하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!form.body.trim()) {
    toast.add({ title: '내용을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  const patch = {
    name: form.name.trim(),
    brand: form.brand,
    chatroom: form.chatroom,
    purpose: form.purpose,
    msgType: form.msgType,
    delivery: form.delivery,
    fallback: form.fallback,
    body: form.body,
    buttons: form.buttons.map(b => ({ ...b })),
  }
  if (formMode.value === 'edit') {
    const t = findNode(formEditId)
    if (t) Object.assign(t, patch)
    toast.add({ title: '템플릿을 수정했습니다.', icon: 'i-lucide-circle-check' })
  }
  else {
    const cat = findNode(formTargetCatId) ?? tree
    const id = `t${Date.now()}`
    ;(cat.children ??= []).push({
      id,
      kind: 'template',
      code: randomCode(),
      bizCode: `LBR.${randomCode()}${randomCode()}`,
      status: '검수중',
      approvedAt: '-',
      ...patch,
    })
    expanded.value = new Set([...expanded.value, cat.id])
    selectedId.value = id
    toast.add({ title: '템플릿을 등록했습니다. (검수 요청)', icon: 'i-lucide-circle-check' })
  }
  view.value = 'manage'
}

/* ── 버튼 ────────────────────────────────────────────────────────── */
const btnDialogOpen = ref(false)
const btnEditIndex = ref(-1)
const btnEditValue = ref<RcsButton | null>(null)
function openBtnAdd() {
  btnEditIndex.value = -1
  btnEditValue.value = null
  btnDialogOpen.value = true
}
function openBtnEdit(i: number) {
  btnEditIndex.value = i
  btnEditValue.value = { ...form.buttons[i]! }
  btnDialogOpen.value = true
}
function onBtnSubmit(b: RcsButton) {
  if (btnEditIndex.value >= 0) form.buttons[btnEditIndex.value] = b
  else form.buttons.push(b)
}
function removeBtn(i: number) {
  form.buttons.splice(i, 1)
}
function moveBtn(i: number, dir: -1 | 1) {
  const j = i + dir
  if (j < 0 || j >= form.buttons.length) return
  const arr = form.buttons
  ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
}

/* ── 카테고리 ────────────────────────────────────────────────────── */
const catDialogOpen = ref(false)
const catMode = ref<'add' | 'edit'>('add')
const catParentName = computed(() => {
  const sel = selectedNode.value
  if (sel?.kind === 'category') return sel.name
  if (sel?.kind === 'template') return findParent(sel.id)?.name ?? 'Root Category'
  return 'Root Category'
})
function openCatAdd() {
  catMode.value = 'add'
  catDialogOpen.value = true
}
function openCatEdit() {
  if (selectedNode.value?.kind !== 'category') return
  catMode.value = 'edit'
  catDialogOpen.value = true
}
function onCatSubmit(name: string) {
  if (catMode.value === 'add') {
    const sel = selectedNode.value
    const parent = sel?.kind === 'category'
      ? sel
      : sel?.kind === 'template'
        ? (findParent(sel.id) ?? tree)
        : tree
    const id = `c${Date.now()}`
    ;(parent.children ??= []).push({ id, name, kind: 'category', children: [] })
    expanded.value = new Set([...expanded.value, parent.id])
    selectedId.value = id
    toast.add({ title: '카테고리를 등록했습니다.', icon: 'i-lucide-circle-check' })
  }
  else if (selectedNode.value) {
    selectedNode.value.name = name
    toast.add({ title: '카테고리를 수정했습니다.', icon: 'i-lucide-circle-check' })
  }
}

/* ── 삭제 ────────────────────────────────────────────────────────── */
const deleteOpen = ref(false)
const deleteDisabled = computed(() => !selectedNode.value || selectedNode.value.kind === 'root')
function onDeleteConfirm() {
  const n = selectedNode.value
  deleteOpen.value = false
  if (!n || n.kind === 'root') return
  const p = findParent(n.id)
  if (p?.children) p.children = p.children.filter(c => c.id !== n.id)
  selectedId.value = null
  toast.add({ title: `'${n.name}'을(를) 삭제했습니다.`, icon: 'i-lucide-info' })
}

/* ── 샘플 / AI ───────────────────────────────────────────────────── */
const sampleOpen = ref(false)
function onSamplePick(t: RcsSample) {
  if (view.value === 'manage') openForm('create')
  form.msgType = t.msgType
  form.body = t.body
  if (!form.name) form.name = t.name
}

const aiOpen = ref(false)
function onAiApply(p: { msgType: MsgType, delivery: Delivery, fallback: Fallback, body: string }) {
  form.msgType = p.msgType
  form.delivery = p.delivery
  form.fallback = p.fallback
  form.body = p.body
}

/* ── 상세 보기 모달 ─────────────────────────────────────────────── */
const detailModalOpen = ref(false)
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 관리 · RCS
      </div>
      <h1>RCS 템플릿</h1>
      <p>카테고리별로 RCS 템플릿을 등록하고 검수 상태를 관리합니다.</p>
    </div>

    <!-- ───────── 관리 뷰 ───────── -->
    <div v-if="view === 'manage'" class="tpl-card">
      <div class="tpl-toolbar">
        <div class="tpl-toolbar-l">
          <button type="button" class="btn btn-primary btn-sm" @click="openCatAdd">
            <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 카테고리 등록
          </button>
          <button
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="selectedNode?.kind !== 'category'"
            @click="openCatEdit"
          >
            카테고리 수정
          </button>
          <span class="tpl-toolbar-sep">|</span>
          <button type="button" class="btn btn-primary btn-sm" @click="openForm('create')">
            <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 템플릿 등록
          </button>
          <button
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="selectedNode?.kind !== 'template'"
            @click="openForm('edit')"
          >
            템플릿 수정
          </button>
          <button
            type="button"
            class="btn btn-error btn-sm"
            :disabled="deleteDisabled"
            @click="deleteOpen = true"
          >
            삭제
          </button>
        </div>
        <div class="tpl-toolbar-r">
          <div class="tpl-search">
            <input v-model="search" class="input" placeholder="카테고리/템플릿 이름을 입력하세요.">
            <UIcon name="i-lucide-search" class="text-sm tpl-search-icon" />
          </div>
          <button type="button" class="btn btn-primary btn-sm" @click="sampleOpen = true">
            샘플 템플릿 보기
          </button>
        </div>
      </div>

      <div class="tpl-body">
        <!-- 트리 -->
        <div class="tpl-tree">
          <div
            v-for="{ node, depth } in flat"
            :key="node.id"
            class="tree-row"
            :class="{ on: selectedId === node.id }"
            :style="{ paddingLeft: depth * 18 + 8 + 'px' }"
            @click="selectedId = node.id"
          >
            <button
              v-if="node.children && node.children.length"
              type="button"
              class="tree-toggle"
              :aria-label="isOpen(node.id) ? '접기' : '펼치기'"
              @click.stop="toggle(node.id)"
            >
              <UIcon :name="isOpen(node.id) ? 'i-lucide-square-minus' : 'i-lucide-square-plus'" class="text-[length:var(--fz-md)]" />
            </button>
            <span v-else class="tree-toggle-spacer" />
            <UIcon
              :name="node.kind === 'template' ? 'i-lucide-file-text' : 'i-lucide-folder'"
              class="tree-icon text-[length:var(--fz-md)]"
            />
            <span class="tree-name">{{ node.name }}</span>
          </div>
        </div>

        <!-- 상세 -->
        <div class="tpl-detail-pane">
          <div v-if="selectedNode?.kind === 'template'" class="tpl-detail">
            <div class="tpl-detail-title">
              {{ selectedNode.name }}
            </div>
            <div class="tabs">
              <div class="tab active">
                기본 정보
              </div>
            </div>

            <div class="tpl-info-tab">
              <dl class="tpl-info">
                <div class="info-row">
                  <dt>템플릿 이름</dt>
                  <dd>: {{ selectedNode.name }}</dd>
                </div>
                <div class="info-row">
                  <dt>RCS Bizcenter 템플릿 아이디</dt>
                  <dd class="info-mono">
                    : {{ selectedNode.bizCode || '-' }}
                  </dd>
                </div>
                <div class="info-row">
                  <dt>발신 브랜드</dt>
                  <dd>: {{ selectedNode.brand || '-' }}</dd>
                </div>
                <div class="info-row">
                  <dt>발송 목적</dt>
                  <dd>: {{ PURPOSE_LABEL[selectedNode.purpose ?? 'info'] }}</dd>
                </div>
                <div class="info-row">
                  <dt>템플릿 상태</dt>
                  <dd>
                    <span>:</span>
                    <AppBadge :tone="statusTone(selectedNode.status ?? '검수중')">
                      {{ selectedNode.status ?? '검수중' }}
                    </AppBadge>
                  </dd>
                </div>
                <div class="info-row">
                  <dt>승인 일시</dt>
                  <dd>: {{ selectedNode.approvedAt || '-' }}</dd>
                </div>
              </dl>
              <div class="tpl-info-preview">
                <AppRcsPreview
                  :brand-name="selectedNode.brand || 'RCS 브랜드'"
                  :body="selectedNode.body || ''"
                  :buttons="selectedNode.buttons || []"
                />
              </div>
            </div>
          </div>
          <div v-else class="tpl-empty">
            템플릿 이름을 선택하세요.
          </div>
        </div>
      </div>
    </div>

    <!-- ───────── 등록/수정 뷰 ───────── -->
    <template v-else>
      <div class="tpl-card">
        <div class="tpl-card-head">
          <h2>{{ formMode === 'create' ? '템플릿 등록' : '템플릿 수정' }}</h2>
          <div class="row" style="gap: 6px">
            <button type="button" class="btn btn-primary btn-sm" @click="sampleOpen = true">
              샘플 템플릿 선택
            </button>
            <button type="button" class="btn btn-outline btn-sm" @click="aiOpen = true">
              <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-sm)]" style="color: var(--accent-ink)" /> AI 템플릿 만들기
            </button>
          </div>
        </div>

        <div class="rf-grid">
          <div class="rf-form">
            <div class="rf-row">
              <label class="rf-label">템플릿 이름 <em>*</em></label>
              <div class="rf-input-wrap">
                <input v-model="form.name" class="input" maxlength="50" placeholder="템플릿 이름을 입력하세요.">
                <span class="rf-count">{{ form.name.length }}/50</span>
              </div>
            </div>
            <div class="rf-row">
              <label class="rf-label">발신 브랜드 <em>*</em></label>
              <div class="rf-field">
                <div class="row" style="gap: 8px; flex-wrap: wrap">
                  <select v-model="form.brand" class="select" style="min-width: 200px">
                    <option value="">
                      브랜드 선택
                    </option>
                    <option v-for="b in BRANDS" :key="b" :value="b">
                      {{ b }}
                    </option>
                  </select>
                  <select v-model="form.chatroom" class="select" style="min-width: 220px">
                    <option value="">
                      대화방(발신 번호) 선택
                    </option>
                    <option v-for="c in CHATROOMS" :key="c" :value="c">
                      {{ c }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="rf-row">
              <label class="rf-label">발송 목적 <em>*</em></label>
              <div class="rf-field">
                <AppRadioGroup
                  v-model="form.purpose"
                  :options="[
                    { value: 'info', label: '일반용' },
                    { value: 'auth', label: '인증용' },
                    { value: 'ad', label: '광고용' },
                  ]"
                />
              </div>
            </div>
            <div class="rf-row">
              <label class="rf-label">발송 유형 <em>*</em></label>
              <div class="rf-field">
                <div class="row" style="gap: 14px; flex-wrap: wrap">
                  <AppRadioGroup
                    v-model="form.msgType"
                    :options="[
                      { value: 'sms', label: 'SMS' },
                      { value: 'lms', label: 'LMS' },
                      { value: 'mms', label: 'MMS' },
                    ]"
                  />
                  <select v-model="form.delivery" class="select" style="min-width: 150px">
                    <option value="standalone">
                      스탠드얼론
                    </option>
                    <option value="conversation">
                      대화형
                    </option>
                  </select>
                  <select v-model="form.fallback" class="select" style="min-width: 130px">
                    <option value="sms">
                      SMS
                    </option>
                    <option value="integrated">
                      통합
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="rf-row">
              <label class="rf-label">내용 <em>*</em></label>
              <div class="rf-field">
                <div class="rf-textarea-wrap">
                  <textarea
                    v-model="form.body"
                    class="textarea"
                    rows="8"
                    placeholder="내용을 입력하세요."
                  />
                  <span class="rf-textarea-count">{{ form.body.length }}/100</span>
                </div>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="rf-row">
              <label class="rf-label">버튼</label>
              <div class="rf-field">
                <table v-if="form.buttons.length" class="table rf-subtable">
                  <thead>
                    <tr>
                      <th style="width: 48px" />
                      <th>버튼 유형</th>
                      <th>버튼 이름</th>
                      <th style="width: 80px; text-align: center">
                        수정/삭제
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(b, i) in form.buttons" :key="i">
                      <td style="text-align: center">
                        <div class="rf-move">
                          <button type="button" aria-label="위로" :disabled="i === 0" @click="moveBtn(i, -1)">
                            <UIcon name="i-lucide-chevron-up" class="text-[length:var(--fz-sm)]" />
                          </button>
                          <button type="button" aria-label="아래로" :disabled="i === form.buttons.length - 1" @click="moveBtn(i, 1)">
                            <UIcon name="i-lucide-chevron-down" class="text-[length:var(--fz-sm)]" />
                          </button>
                        </div>
                      </td>
                      <td style="text-align: center">
                        {{ b.type }}
                      </td>
                      <td style="text-align: center">
                        {{ b.label }}
                      </td>
                      <td style="text-align: center">
                        <button type="button" class="rf-iconbtn" aria-label="수정" @click="openBtnEdit(i)">
                          <UIcon name="i-lucide-pencil" class="text-[length:var(--fz-md)]" />
                        </button>
                        <button type="button" class="rf-iconbtn" aria-label="삭제" @click="removeBtn(i)">
                          <UIcon name="i-lucide-x" class="text-[length:var(--fz-md)]" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <button type="button" class="btn btn-primary btn-sm rf-add" @click="openBtnAdd">
                  <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
                </button>
              </div>
            </div>
          </div>

          <div class="rf-preview">
            <AppRcsPreview
              :brand-name="form.brand || 'RCS 브랜드'"
              :body="form.body"
              :buttons="form.buttons"
            />
          </div>
        </div>
      </div>

      <div class="tf-actionbar">
        <button type="button" class="btn btn-outline-dark tf-action-btn" @click="cancelForm">
          취소
        </button>
        <button type="button" class="btn btn-primary tf-action-btn" @click="saveForm">
          저장하기
        </button>
      </div>
    </template>

    <!-- 다이얼로그 -->
    <AppTemplateCategoryDialog
      :open="catDialogOpen"
      :mode="catMode"
      :parent-name="catParentName"
      :current-name="selectedNode?.kind === 'category' ? selectedNode.name : ''"
      @close="catDialogOpen = false"
      @submit="onCatSubmit"
    />

    <AppRcsSampleDialog
      :open="sampleOpen"
      :title="view === 'manage' ? '샘플 템플릿 보기' : '샘플 템플릿 선택'"
      @close="sampleOpen = false"
      @pick="onSamplePick"
    />

    <AppRcsAiDialog
      :open="aiOpen"
      @close="aiOpen = false"
      @apply="onAiApply"
    />

    <AppRcsButtonDialog
      :open="btnDialogOpen"
      :edit="btnEditValue"
      @close="btnDialogOpen = false"
      @submit="onBtnSubmit"
    />

    <AppConfirmDialog
      :open="deleteOpen"
      title="삭제"
      :message="`'${selectedNode?.name ?? ''}'을(를) 삭제하시겠습니까?\n하위 항목이 있으면 함께 삭제됩니다.`"
      confirm-label="삭제"
      danger
      @close="deleteOpen = false"
      @confirm="onDeleteConfirm"
    />

    <!-- 템플릿 상세 보기 -->
    <AppModal
      v-if="selectedNode?.kind === 'template'"
      :open="detailModalOpen"
      title="템플릿 상세 보기"
      :width="520"
      @close="detailModalOpen = false"
    >
      <dl class="dv-list">
        <div class="dv-row">
          <dt>템플릿 이름</dt>
          <dd>{{ selectedNode.name }}</dd>
        </div>
        <div class="dv-row">
          <dt>발신 브랜드</dt>
          <dd>{{ selectedNode.brand || '-' }}</dd>
        </div>
        <div class="dv-row">
          <dt>템플릿 상태</dt>
          <dd>
            <AppBadge :tone="statusTone(selectedNode.status ?? '검수중')">
              {{ selectedNode.status ?? '검수중' }}
            </AppBadge>
          </dd>
        </div>
        <div class="dv-row">
          <dt>템플릿 아이디</dt>
          <dd>{{ selectedNode.code || '-' }}</dd>
        </div>
        <div class="dv-row">
          <dt>RCS Bizcenter 아이디</dt>
          <dd class="dv-mono">
            {{ selectedNode.bizCode || '-' }}
          </dd>
        </div>
        <div class="dv-row">
          <dt>발송 목적</dt>
          <dd>{{ PURPOSE_LABEL[selectedNode.purpose ?? 'info'] }}</dd>
        </div>
        <div class="dv-row">
          <dt>발송 유형</dt>
          <dd>{{ MSGTYPE_LABEL[selectedNode.msgType ?? 'sms'] }} · {{ DELIVERY_LABEL[selectedNode.delivery ?? 'standalone'] }} · 대체발송 {{ FALLBACK_LABEL[selectedNode.fallback ?? 'sms'] }}</dd>
        </div>
        <div class="dv-row dv-row--body">
          <dt>내용</dt>
          <dd>
            <div class="dv-body">
              {{ selectedNode.body }}
            </div>
          </dd>
        </div>
      </dl>
      <template #footer>
        <button type="button" class="btn btn-primary" style="width: 100%" @click="detailModalOpen = false">
          확인
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.tpl-card {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  overflow: hidden;
}
.tpl-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}
.tpl-card-head h2 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
}

.tpl-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
}
.tpl-toolbar-l {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.tpl-toolbar-r {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tpl-toolbar-sep {
  color: var(--line);
  user-select: none;
  margin: 0 2px;
}
.tpl-search {
  position: relative;
  width: 280px;
  max-width: 100%;
}
.tpl-search .input {
  width: 100%;
  height: 32px;
  padding-right: 34px;
  font-size: var(--fz-sm);
}
.tpl-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
}

.tpl-body {
  display: grid;
  grid-template-columns: 300px 1fr;
  min-height: 420px;
}
@media (max-width: 1023px) {
  .tpl-body { grid-template-columns: 1fr; }
}
.tpl-tree {
  border-right: 1px solid var(--line);
  padding: 12px 8px;
  overflow: auto;
}
@media (max-width: 1023px) {
  .tpl-tree { border-right: 0; border-bottom: 1px solid var(--line); }
}
.tree-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 8px;
  border-radius: var(--r-sm);
  cursor: pointer;
  font-size: var(--fz-sm);
  color: var(--ink-700);
  white-space: nowrap;
}
.tree-row:hover {
  background: var(--ink-50);
}
.tree-row.on {
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-weight: 600;
}
.tree-toggle {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: 0;
  background: none;
  padding: 0;
  color: var(--ink-400);
  cursor: pointer;
  flex-shrink: 0;
}
.tree-toggle:hover {
  color: var(--ink-700);
}
.tree-toggle-spacer {
  width: 18px;
  flex-shrink: 0;
}
.tree-icon {
  color: var(--ink-400);
  flex-shrink: 0;
}
.tree-row.on .tree-icon {
  color: var(--accent-ink);
}
.tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tpl-detail-pane {
  padding: 24px;
  display: flex;
}
.tpl-empty {
  margin: auto;
  font-size: var(--fz-md);
  color: var(--ink-400);
}
.tpl-detail {
  flex: 1;
  min-width: 0;
}
.tpl-detail-title {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 14px;
}
.tpl-info-tab {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 28px;
  margin-top: 22px;
  align-items: start;
}
@media (max-width: 1023px) {
  .tpl-info-tab { grid-template-columns: 1fr; }
}
.tpl-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}
.info-row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 10px;
  align-items: center;
}
.info-row dt {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.info-row dd {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fz-sm);
  color: var(--ink-900);
  min-width: 0;
}
.info-mono {
  font-family: var(--font-mono);
  word-break: break-all;
}
.tpl-info-preview {
  display: grid;
  place-items: start center;
}

/* 폼 뷰 */
.rf-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 28px;
  padding: 24px 20px;
}
@media (max-width: 1023px) {
  .rf-grid { grid-template-columns: 1fr; }
}
.rf-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.rf-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 14px;
  align-items: flex-start;
}
.rf-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  padding-top: 8px;
}
.rf-label em {
  color: var(--danger-ink, #e0364a);
  font-style: normal;
  margin-left: 2px;
}
.rf-field {
  min-width: 0;
}
.rf-input-wrap {
  position: relative;
}
.rf-input-wrap .input {
  width: 100%;
  padding-right: 56px;
}
.rf-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.rf-textarea-wrap {
  position: relative;
}
.rf-textarea-wrap .textarea {
  width: 100%;
  padding-bottom: 28px;
}
.rf-textarea-count {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
  pointer-events: none;
}
.rf-subtable {
  margin-bottom: 10px;
}
.rf-move {
  display: inline-flex;
  flex-direction: column;
}
.rf-move button {
  border: 0;
  background: none;
  padding: 0;
  color: var(--ink-300);
  cursor: pointer;
  line-height: 1;
}
.rf-move button:hover:not(:disabled) {
  color: var(--ink-700);
}
.rf-move button:disabled {
  color: var(--ink-200);
  cursor: not-allowed;
}
.rf-iconbtn {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 0;
  background: none;
  color: var(--ink-400);
  cursor: pointer;
}
.rf-iconbtn:hover {
  color: var(--ink-800);
}
.rf-preview {
  display: grid;
  place-items: start center;
}

.tf-actionbar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
}
.tf-action-btn {
  height: 36px;
  padding: 0 16px;
  font-size: var(--fz-md);
  font-weight: 500;
}

/* 상세 보기 모달 */
.dv-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dv-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  align-items: center;
}
.dv-row--body {
  align-items: start;
}
.dv-row dt {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.dv-row dd {
  font-size: var(--fz-sm);
  color: var(--ink-900);
  min-width: 0;
}
.dv-mono {
  font-family: var(--font-mono);
  word-break: break-all;
}
.dv-body {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  color: var(--ink-700);
}
</style>
