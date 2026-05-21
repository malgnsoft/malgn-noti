<script setup lang="ts">
import type { EmailSample } from '~/components/AppEmailSampleDialog.vue'

useHead({ title: '이메일 템플릿' })
const toast = useToast()

type Kind = 'root' | 'category' | 'template'
type Purpose = 'info' | 'auth' | 'ad'

interface Attachment { name: string, size: number }
interface ETplNode {
  id: string
  name: string
  kind: Kind
  children?: ETplNode[]
  code?: string
  purpose?: Purpose
  from?: string
  subject?: string
  body?: string
  attachments?: Attachment[]
  createdAt?: string
  updatedAt?: string
}

const PURPOSE_LABEL: Record<Purpose, string> = { info: '일반용', auth: '인증용', ad: '광고용' }
const FROM_DEFAULT = 'no-reply@wecandeo.com'

/* ── 트리 데이터(목업) ───────────────────────────────────────────── */
const tree = reactive<ETplNode>({
  id: 'root',
  name: 'Root Category',
  kind: 'root',
  children: [
    {
      id: 'uFu6iHB3',
      name: '비디오팩_상품개설',
      kind: 'category',
      children: [
        { id: 't1', name: '01_비디오팩생성', kind: 'template', code: '5dtZtAWb', purpose: 'info', from: FROM_DEFAULT, subject: '[위캔디오] 비디오팩이 생성되었습니다.', body: '#{name}님, 신청하신 비디오팩이 정상적으로 생성되었습니다.\n콘솔에서 바로 확인해 보세요.', attachments: [], createdAt: '2026-04-13 13:52', updatedAt: '2026-04-13 14:24' },
        { id: 't2', name: '02-1_비디오팩생성2일경과', kind: 'template', code: 'Qm3kP9zX', purpose: 'info', from: FROM_DEFAULT, subject: '[위캔디오] 첫 영상 업로드를 기다리고 있어요', body: '#{name}님, 비디오팩 첫 영상 업로드를 아직 진행하지 않으셨어요.\n지금 바로 시작해 보세요.', attachments: [], createdAt: '2026-04-13 13:55', updatedAt: '2026-04-13 13:55' },
      ],
    },
    {
      id: 'cat2',
      name: '비디오팩_알림',
      kind: 'category',
      children: [
        { id: 't3', name: '01_월간리포트안내', kind: 'template', code: 'Rp2cN8jW', purpose: 'info', from: FROM_DEFAULT, subject: '[위캔디오] 2026년 4월 리포트 안내', body: '이번 달 리포트가 도착했습니다. 마이페이지에서 확인해 주세요.', attachments: [], createdAt: '2026-04-20 10:30', updatedAt: '2026-04-20 10:30' },
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

function findNode(id: string, node: ETplNode = tree): ETplNode | null {
  if (node.id === id) return node
  for (const c of node.children ?? []) {
    const r = findNode(id, c)
    if (r) return r
  }
  return null
}
function findParent(id: string, node: ETplNode = tree): ETplNode | null {
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
  function dfs(node: ETplNode): boolean {
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
const flat = computed<{ node: ETplNode, depth: number }[]>(() => {
  const out: { node: ETplNode, depth: number }[] = []
  const q = search.value.trim()
  const vis = q ? computeVisible(q) : null
  function walk(node: ETplNode, depth: number) {
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
  purpose: 'info' as Purpose,
  from: '',
  subject: '',
  body: '',
  attachments: [] as Attachment[],
})
let formTargetCatId = 'root'
let formEditId = ''

function openForm(mode: 'create' | 'edit') {
  formMode.value = mode
  if (mode === 'edit' && selectedNode.value?.kind === 'template') {
    const t = selectedNode.value
    formEditId = t.id
    form.name = t.name
    form.purpose = t.purpose ?? 'info'
    form.from = t.from ?? ''
    form.subject = t.subject ?? ''
    form.body = t.body ?? ''
    form.attachments = (t.attachments ?? []).map(a => ({ ...a }))
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
    form.purpose = 'info'
    form.from = ''
    form.subject = ''
    form.body = ''
    form.attachments = []
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
  if (!form.from.trim()) {
    toast.add({ title: '발신 메일을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!form.subject.trim()) {
    toast.add({ title: '제목을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!form.body.trim()) {
    toast.add({ title: '내용을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  const patch = {
    name: form.name.trim(),
    purpose: form.purpose,
    from: form.from.trim(),
    subject: form.subject.trim(),
    body: form.body,
    attachments: form.attachments.map(a => ({ ...a })),
  }
  if (formMode.value === 'edit') {
    const t = findNode(formEditId)
    if (t) {
      Object.assign(t, patch)
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
      kind: 'template',
      code: randomCode(),
      createdAt: stamp,
      updatedAt: stamp,
      ...patch,
    })
    expanded.value = new Set([...expanded.value, cat.id])
    selectedId.value = id
    toast.add({ title: '템플릿을 등록했습니다.', icon: 'i-lucide-circle-check' })
  }
  view.value = 'manage'
}

/* ── 첨부파일 ────────────────────────────────────────────────────── */
const fileInput = ref<HTMLInputElement | null>(null)
function onPickFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files ?? [])
  input.value = ''
  for (const f of picked) {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'jpg' && ext !== 'jpeg') {
      toast.add({ title: `${f.name}: .jpg/.jpeg 파일만 첨부할 수 있습니다.`, icon: 'i-lucide-octagon-alert' })
      continue
    }
    if (f.name.length > 45) {
      toast.add({ title: '파일 이름은 최대 45자까지 가능합니다.', icon: 'i-lucide-octagon-alert' })
      continue
    }
    if (form.attachments.length >= 3) {
      toast.add({ title: '첨부파일은 최대 3개까지 가능합니다.', icon: 'i-lucide-triangle-alert' })
      break
    }
    if (f.size > 300_000) {
      toast.add({ title: `${f.name}: 1개당 300KB 이내여야 합니다.`, icon: 'i-lucide-octagon-alert' })
      continue
    }
    if (form.attachments.reduce((s, x) => s + x.size, 0) + f.size > 800_000) {
      toast.add({ title: '첨부 합산 용량 800KB를 초과했습니다.', icon: 'i-lucide-octagon-alert' })
      break
    }
    form.attachments.push({ name: f.name, size: f.size })
  }
}
function removeFile(i: number) {
  form.attachments.splice(i, 1)
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
function onSamplePick(t: EmailSample) {
  if (view.value === 'manage') openForm('create')
  form.purpose = t.purpose
  form.subject = t.subject
  form.body = t.body
  if (!form.from) form.from = FROM_DEFAULT
  if (!form.name) form.name = t.name
}

const aiOpen = ref(false)
function onAiApply(p: { subject: string, body: string }) {
  form.subject = p.subject
  form.body = p.body
}

const attachNames = computed(() => form.attachments.map(a => a.name))
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 관리 · 이메일
      </div>
      <h1>이메일 템플릿</h1>
      <p>카테고리별로 이메일 템플릿을 등록하고 관리합니다.</p>
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
                  <dt>발송 목적</dt>
                  <dd>: {{ PURPOSE_LABEL[selectedNode.purpose ?? 'info'] }}</dd>
                </div>
                <div class="info-row">
                  <dt>발신 메일</dt>
                  <dd>: {{ selectedNode.from || '-' }}</dd>
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
              <div class="tpl-info-preview">
                <AppEmailPreview
                  :subject="selectedNode.subject || ''"
                  :from="selectedNode.from || ''"
                  :heading="selectedNode.subject || ''"
                  :body="selectedNode.body || ''"
                  :attachments="(selectedNode.attachments || []).map(a => a.name)"
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

        <div class="ef-grid">
          <div class="ef-form">
            <div class="ef-row">
              <label class="ef-label">템플릿 이름 <em>*</em></label>
              <div class="ef-input-wrap">
                <input v-model="form.name" class="input" maxlength="50" placeholder="템플릿 이름을 입력하세요.">
                <span class="ef-count">{{ form.name.length }}/50</span>
              </div>
            </div>
            <div class="ef-row">
              <label class="ef-label">발송 목적 <em>*</em></label>
              <div class="ef-field">
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
            <div class="ef-row">
              <label class="ef-label">발신 메일 <em>*</em></label>
              <div class="ef-field">
                <input v-model="form.from" class="input" type="email" placeholder="example@yourdomain.com">
              </div>
            </div>
            <div class="ef-row">
              <label class="ef-label">제목 <em>*</em></label>
              <div class="ef-input-wrap">
                <input v-model="form.subject" class="input" maxlength="1000" placeholder="제목을 입력하세요.">
                <span class="ef-count">{{ form.subject.length }}/1000</span>
              </div>
            </div>
            <div class="ef-row">
              <label class="ef-label">내용 <em>*</em></label>
              <div class="ef-field">
                <textarea
                  v-model="form.body"
                  class="textarea"
                  rows="11"
                  placeholder="내용을 입력하세요."
                />
              </div>
            </div>
            <div class="ef-row">
              <label class="ef-label">첨부파일 <em>*</em></label>
              <div class="ef-field">
                <div class="ef-file-row">
                  <div class="ef-filebox">
                    <span v-if="!form.attachments.length" class="ef-fileph">파일을 업로드하세요.</span>
                    <span
                      v-for="(f, i) in form.attachments"
                      :key="i"
                      class="ef-filechip"
                    >
                      <UIcon name="i-lucide-image" class="text-[length:var(--fz-sm)]" />
                      {{ f.name }}
                      <button type="button" aria-label="삭제" @click="removeFile(i)">
                        <UIcon name="i-lucide-x" class="text-[length:var(--fz-sm)]" />
                      </button>
                    </span>
                  </div>
                  <input ref="fileInput" type="file" accept=".jpg,.jpeg" multiple class="ef-file-hidden" @change="onPickFiles">
                  <button type="button" class="btn btn-primary" @click="fileInput?.click()">
                    <UIcon name="i-lucide-paperclip" class="text-[length:var(--fz-sm)]" /> 파일 선택
                  </button>
                </div>
                <ul class="ef-hint">
                  <li>첨부 가능 파일 수: 최대 3개</li>
                  <li>지원 파일 형식: .jpg, .jpeg</li>
                  <li>파일 크기: 1개당 300KB 이하, 1개 이상인 경우 합산 800KB 이하</li>
                  <li>해상도: 가로 1000px, 세로 1000px 이하</li>
                  <li>파일 이름 길이: 최대 45자</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="ef-preview">
            <AppEmailPreview
              :subject="form.subject"
              :from="form.from"
              :heading="form.subject"
              :body="form.body"
              :attachments="attachNames"
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

    <AppEmailSampleDialog
      :open="sampleOpen"
      :title="view === 'manage' ? '샘플 템플릿 보기' : '샘플 템플릿 선택'"
      @close="sampleOpen = false"
      @pick="onSamplePick"
    />

    <AppEmailAiDialog
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
  grid-template-columns: 1fr 460px;
  gap: 24px;
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
.tpl-info-preview {
  min-width: 0;
}
.info-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  align-items: center;
}
.info-row dt {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.info-row dd {
  font-size: var(--fz-sm);
  color: var(--ink-900);
}

/* 폼 뷰 */
.ef-grid {
  display: grid;
  grid-template-columns: 1fr 460px;
  gap: 24px;
  padding: 24px 20px;
}
@media (max-width: 1023px) {
  .ef-grid { grid-template-columns: 1fr; }
}
.ef-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ef-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 14px;
  align-items: flex-start;
}
.ef-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  padding-top: 8px;
}
.ef-label em {
  color: var(--danger-ink, #e0364a);
  font-style: normal;
  margin-left: 2px;
}
.ef-field {
  min-width: 0;
}
.ef-field .input,
.ef-field .textarea {
  width: 100%;
}
.ef-input-wrap {
  position: relative;
}
.ef-input-wrap .input {
  width: 100%;
  padding-right: 64px;
}
.ef-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.ef-file-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.ef-filebox {
  flex: 1;
  min-width: 0;
  min-height: 38px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
}
.ef-fileph {
  font-size: var(--fz-sm);
  color: var(--ink-400);
}
.ef-filechip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px 3px 8px;
  background: var(--ink-50);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  font-size: var(--fz-xs);
  color: var(--ink-700);
}
.ef-filechip button {
  border: 0;
  background: none;
  padding: 0;
  color: var(--ink-400);
  cursor: pointer;
}
.ef-filechip button:hover {
  color: var(--ink-800);
}
.ef-file-hidden {
  display: none;
}
.ef-hint {
  margin: 8px 0 0;
  padding-left: 16px;
  list-style: disc;
}
.ef-hint li {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.7;
}
.ef-preview {
  min-width: 0;
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
