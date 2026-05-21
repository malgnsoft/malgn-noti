<script setup lang="ts">
useHead({ title: '문자메시지 템플릿' })
const toast = useToast()

type Kind = 'root' | 'category' | 'template'
type Purpose = 'info' | 'auth' | 'ad'
type SmsType = 'sms' | 'lms' | 'mms'

interface TplNode {
  id: string
  name: string
  kind: Kind
  children?: TplNode[]
  code?: string
  sender?: string
  purpose?: Purpose
  smsType?: SmsType
  subject?: string
  body?: string
  createdAt?: string
  updatedAt?: string
}

interface SampleTpl { name: string, subject?: string, body: string, type?: string }

/* ── 트리 데이터(목업) ───────────────────────────────────────────── */
const tree = reactive<TplNode>({
  id: 'root',
  name: 'Root Category',
  kind: 'root',
  children: [
    {
      id: 'uFu6iHB3',
      name: '비디오팩_상품개설',
      kind: 'category',
      children: [
        { id: 't1', name: '01_비디오팩생성', kind: 'template', code: '5dtZtAWb', sender: '1588-1234', purpose: 'info', smsType: 'sms', body: '비디오팩이 생성되었습니다. 마이페이지에서 확인해 주세요.', createdAt: '2026-04-13 13:52', updatedAt: '2026-04-13 14:24' },
        { id: 't2', name: '02-1_비디오팩생성2일경과', kind: 'template', code: 'Qm3kP9zX', sender: '1588-1234', purpose: 'info', smsType: 'sms', body: '비디오팩 생성 후 2일이 지났습니다. 지금 확인해 보세요.', createdAt: '2026-04-13 13:55', updatedAt: '2026-04-13 13:55' },
        { id: 't3', name: '02-2_비디오팩생성2일경과', kind: 'template', code: 'Lw7nB2cR', sender: '1588-1234', purpose: 'info', smsType: 'sms', body: '아직 확인하지 않은 비디오팩이 있습니다. 잊지 말고 확인해 주세요.', createdAt: '2026-04-13 13:58', updatedAt: '2026-04-14 09:10' },
        { id: 't4', name: '03-1_비디오팩생성5일경과', kind: 'template', code: 'Ha9sV4dE', sender: '1588-1234', purpose: 'info', smsType: 'sms', body: '비디오팩 생성 후 5일이 지났습니다.', createdAt: '2026-04-13 14:02', updatedAt: '2026-04-13 14:02' },
        { id: 't5', name: '03-2_비디오팩생성5일경과', kind: 'template', code: 'Zt6yU1gM', sender: '1588-1234', purpose: 'info', smsType: 'sms', body: '비디오팩을 아직 확인하지 않으셨네요. 지금 확인해 보세요.', createdAt: '2026-04-13 14:05', updatedAt: '2026-04-13 14:05' },
      ],
    },
    {
      id: 'cat2',
      name: '비디오팩_알림',
      kind: 'category',
      children: [
        { id: 't6', name: '01_월간리포트안내', kind: 'template', code: 'Rp2cN8jW', sender: '1588-1234', purpose: 'info', smsType: 'lms', subject: '월간 리포트 안내', body: '이번 달 리포트가 도착했습니다. 마이페이지에서 확인해 주세요.', createdAt: '2026-04-20 10:30', updatedAt: '2026-04-20 10:30' },
      ],
    },
  ],
})

const SENDER_NUMBERS = ['1588-1234', '02-555-1234', '031-444-5678']

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

/* ── 트리 조작 ───────────────────────────────────────────────────── */
const expanded = ref<Set<string>>(new Set(['root', 'uFu6iHB3']))
const selectedId = ref<string | null>(null)
const search = ref('')

function findNode(id: string, node: TplNode = tree): TplNode | null {
  if (node.id === id) return node
  for (const c of node.children ?? []) {
    const r = findNode(id, c)
    if (r) return r
  }
  return null
}
function findParent(id: string, node: TplNode = tree): TplNode | null {
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
  function dfs(node: TplNode): boolean {
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

const flat = computed<{ node: TplNode, depth: number }[]>(() => {
  const out: { node: TplNode, depth: number }[] = []
  const q = search.value.trim()
  const vis = q ? computeVisible(q) : null
  function walk(node: TplNode, depth: number) {
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

/* ── 폼 뷰 ───────────────────────────────────────────────────────── */
const view = ref<'manage' | 'form'>('manage')
const formMode = ref<'create' | 'edit'>('create')
const form = reactive({
  name: '',
  sender: '',
  purpose: 'info' as Purpose,
  smsType: 'sms' as SmsType,
  subject: '',
  body: '',
})
let formTargetCatId = 'root'
let formEditId = ''

const showSubject = computed(() => form.smsType === 'lms' || form.smsType === 'mms')
const counterMax = computed(() => form.smsType === 'sms' ? 90 : 2000)

function openForm(mode: 'create' | 'edit') {
  formMode.value = mode
  if (mode === 'edit' && selectedNode.value?.kind === 'template') {
    const t = selectedNode.value
    formEditId = t.id
    form.name = t.name
    form.sender = t.sender ?? ''
    form.purpose = t.purpose ?? 'info'
    form.smsType = t.smsType ?? 'sms'
    form.subject = t.subject ?? ''
    form.body = t.body ?? ''
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
    form.sender = ''
    form.purpose = 'info'
    form.smsType = 'sms'
    form.subject = ''
    form.body = ''
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
  if (!form.sender) {
    toast.add({ title: '발신 번호를 선택하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!form.body.trim()) {
    toast.add({ title: '내용을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (formMode.value === 'edit') {
    const t = findNode(formEditId)
    if (t) {
      t.name = form.name.trim()
      t.sender = form.sender
      t.purpose = form.purpose
      t.smsType = form.smsType
      t.subject = form.subject
      t.body = form.body
      t.updatedAt = nowStr()
    }
    toast.add({ title: '템플릿을 수정했습니다.', icon: 'i-lucide-circle-check' })
  }
  else {
    const cat = findNode(formTargetCatId) ?? tree
    const id = `t${Date.now()}`
    const stamp = nowStr()
    ;(cat.children ??= []).push({
      id,
      name: form.name.trim(),
      kind: 'template',
      code: randomCode(),
      sender: form.sender,
      purpose: form.purpose,
      smsType: form.smsType,
      subject: form.subject,
      body: form.body,
      createdAt: stamp,
      updatedAt: stamp,
    })
    expanded.value = new Set([...expanded.value, cat.id])
    selectedId.value = id
    toast.add({ title: '템플릿을 등록했습니다.', icon: 'i-lucide-circle-check' })
  }
  view.value = 'manage'
}

/* ── 카테고리 다이얼로그 ─────────────────────────────────────────── */
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
    toast.add({ title: '카테고리를 추가했습니다.', icon: 'i-lucide-circle-check' })
  }
  else if (selectedNode.value) {
    selectedNode.value.name = name
    toast.add({ title: '카테고리 이름을 수정했습니다.', icon: 'i-lucide-circle-check' })
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

/* ── 샘플 템플릿 ─────────────────────────────────────────────────── */
const sampleOpen = ref(false)
function onSamplePick(t: SampleTpl) {
  if (view.value === 'manage') openForm('create')
  form.smsType = (t.type as SmsType) ?? 'sms'
  form.body = t.body
  if (t.subject) form.subject = t.subject
  if (!form.name) form.name = t.name
}

/* ── AI 템플릿 ───────────────────────────────────────────────────── */
const aiOpen = ref(false)
function onAiApply(p: { smsType: SmsType, body: string }) {
  form.smsType = p.smsType
  form.body = p.body
}

const PURPOSE_LABEL: Record<Purpose, string> = { info: '일반용', auth: '인증용', ad: '광고용' }
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 관리 · 문자메시지
      </div>
      <h1>문자메시지 템플릿</h1>
      <p>카테고리별로 문자메시지 템플릿을 등록하고 관리합니다.</p>
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
              :class="{ 'tree-icon--tpl': node.kind === 'template' }"
            />
            <span class="tree-name">{{ node.name }}</span>
          </div>
        </div>

        <!-- 상세 / 미리보기 -->
        <div class="tpl-preview">
          <div v-if="selectedNode?.kind === 'template'" class="tpl-detail">
            <div class="tpl-detail-title">
              {{ selectedNode.name }}
            </div>
            <div class="tabs">
              <div class="tab active">
                기본 정보
              </div>
            </div>
            <div class="tpl-detail-body">
              <dl class="tpl-info">
                <div class="info-row">
                  <dt>템플릿 이름</dt>
                  <dd>: {{ selectedNode.name }}</dd>
                </div>
                <div class="info-row">
                  <dt>발송 목적</dt>
                  <dd>: {{ PURPOSE_LABEL[selectedNode.purpose ?? 'info'] }}</dd>
                </div>
                <div class="info-row">
                  <dt>등록 일시</dt>
                  <dd>: {{ selectedNode.createdAt || '-' }}</dd>
                </div>
                <div class="info-row">
                  <dt>수정 일시</dt>
                  <dd>: {{ selectedNode.updatedAt || '-' }}</dd>
                </div>
              </dl>
              <div class="tpl-detail-phone">
                <AppPhonePreview :sender-name="selectedNode.sender || '발신번호'" :message="selectedNode.body || ''" />
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

        <div class="tf-grid">
          <div class="tf-form">
            <div class="tf-row">
              <label class="tf-label">템플릿 이름 <em>*</em></label>
              <div class="tf-field">
                <div class="tf-input-wrap">
                  <input v-model="form.name" class="input" maxlength="50" placeholder="템플릿 이름을 입력하세요.">
                  <span class="tf-count">{{ form.name.length }}/50</span>
                </div>
              </div>
            </div>

            <div class="tf-row">
              <label class="tf-label">발신 번호 <em>*</em></label>
              <div class="tf-field">
                <select v-model="form.sender" class="select" style="max-width: 320px">
                  <option value="">
                    발신 번호 선택
                  </option>
                  <option v-for="s in SENDER_NUMBERS" :key="s" :value="s">
                    {{ s }}
                  </option>
                </select>
              </div>
            </div>

            <div class="tf-row">
              <label class="tf-label">발송 목적 <em>*</em></label>
              <div class="tf-field">
                <AppRadioGroup
                  v-model="form.purpose"
                  :options="[
                    { value: 'info', label: '일반용' },
                    { value: 'auth', label: '인증용' },
                    { value: 'ad', label: '광고용' },
                  ]"
                />
                <p class="tf-hint">
                  광고성 정보 발송 시 수신자가 수신 거부나 수신 동의의 철회를 무료로 할 수 있도록 무료 수신 거부 방법을 반드시 포함해야 합니다.
                </p>
              </div>
            </div>

            <div class="tf-row">
              <label class="tf-label">발송 유형 <em>*</em></label>
              <div class="tf-field">
                <AppRadioGroup
                  v-model="form.smsType"
                  :options="[
                    { value: 'sms', label: 'SMS' },
                    { value: 'lms', label: 'LMS' },
                    { value: 'mms', label: 'MMS' },
                  ]"
                />
              </div>
            </div>

            <div v-if="showSubject" class="tf-row">
              <label class="tf-label">제목 <em>*</em></label>
              <div class="tf-field">
                <div class="tf-input-wrap">
                  <input v-model="form.subject" class="input" placeholder="LMS/MMS 제목을 입력하세요.">
                </div>
              </div>
            </div>

            <div class="tf-row">
              <label class="tf-label">내용 <em>*</em></label>
              <div class="tf-field">
                <div class="tf-textarea-wrap">
                  <textarea
                    v-model="form.body"
                    class="textarea"
                    rows="9"
                    placeholder="내용을 입력하세요."
                  />
                  <div class="tf-counter">
                    <div>국내 SMS {{ byteLen(form.body) }}/{{ counterMax }}Bytes(EUC-KR)</div>
                    <div>국제 SMS {{ form.body.length }}/765자(GSM-7)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="tf-preview">
            <AppPhonePreview :sender-name="form.sender || '발신번호'" :message="form.body" />
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

    <AppSmsTemplateDialog
      :open="sampleOpen"
      :title="view === 'manage' ? '샘플 템플릿 보기' : '샘플 템플릿 선택'"
      @close="sampleOpen = false"
      @pick="onSamplePick"
    />

    <AppAiTemplateDialog
      :open="aiOpen"
      @close="aiOpen = false"
      @apply="onAiApply"
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

/* 툴바 */
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

/* 본문 — 트리 + 미리보기 */
.tpl-body {
  display: grid;
  grid-template-columns: 320px 1fr;
  min-height: 380px;
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
.tree-icon--tpl {
  color: var(--ink-300);
}
.tree-row.on .tree-icon {
  color: var(--accent-ink);
}
.tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tpl-preview {
  display: flex;
  padding: 24px;
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
.tpl-detail-body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  margin-top: 20px;
  align-items: start;
}
@media (max-width: 1023px) {
  .tpl-detail-body { grid-template-columns: 1fr; }
}
.tpl-info {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.info-row {
  display: grid;
  grid-template-columns: 130px 1fr;
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
}
.tpl-detail-phone {
  display: grid;
  place-items: start center;
}

/* 폼 뷰 */
.tf-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 28px;
  padding: 24px 20px;
}
@media (max-width: 1023px) {
  .tf-grid { grid-template-columns: 1fr; }
}
.tf-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.tf-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 14px;
  align-items: flex-start;
}
.tf-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  padding-top: 8px;
}
.tf-label em {
  color: var(--danger-ink, #e0364a);
  font-style: normal;
  margin-left: 2px;
}
.tf-field {
  min-width: 0;
}
.tf-input-wrap {
  position: relative;
}
.tf-input-wrap .input {
  width: 100%;
  padding-right: 52px;
}
.tf-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.tf-hint {
  margin-top: 8px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.6;
}
.tf-textarea-wrap {
  position: relative;
}
.tf-textarea-wrap .textarea {
  width: 100%;
  padding-bottom: 42px;
}
.tf-counter {
  position: absolute;
  right: 12px;
  bottom: 10px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  line-height: 1.5;
  color: var(--ink-400);
  pointer-events: none;
}
.tf-preview {
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
</style>
