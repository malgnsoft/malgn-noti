<script setup lang="ts">
import type { PushAddPayload } from '~/components/AppPushAddDialog.vue'
import type { PushSample } from '~/components/AppPushSampleDialog.vue'

useHead({ title: 'PUSH 템플릿' })
const toast = useToast()

type Kind = 'root' | 'category' | 'template'
type Purpose = 'info' | 'ad'
type InputType = 'basic' | 'json'

interface PushButton { label: string, link: string }
interface PTplNode {
  id: string
  name: string
  kind: Kind
  children?: PTplNode[]
  code?: string
  purpose?: Purpose
  inputType?: InputType
  htmlStyle?: boolean
  title?: string
  body?: string
  badge?: string
  buttons?: PushButton[]
  media?: string
  androidMedia?: string
  iosMedia?: string
  androidIcon?: string
  group?: string
  json?: string
  createdAt?: string
  updatedAt?: string
}

const PURPOSE_LABEL: Record<Purpose, string> = { info: '일반용', ad: '광고용' }
const INPUT_LABEL: Record<InputType, string> = { basic: '기본', json: 'JSON' }

/* ── 트리 데이터(목업) ───────────────────────────────────────────── */
const tree = reactive<PTplNode>({
  id: 'root',
  name: 'Root Category',
  kind: 'root',
  children: [
    {
      id: 'cat1',
      name: '비디오팩_알림',
      kind: 'category',
      children: [
        {
          id: 't1',
          name: '01_업로드완료',
          kind: 'template',
          code: 'pTpl0001',
          purpose: 'info',
          inputType: 'basic',
          htmlStyle: true,
          title: '업로드가 완료되었습니다',
          body: '요청하신 파일 업로드가 정상적으로 완료되었습니다.',
          badge: '1',
          buttons: [],
          createdAt: '2026-04-13 14:00',
          updatedAt: '2026-04-13 14:00',
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
  return `pTpl${String(Math.floor(Math.random() * 9000) + 1000)}`
}

/* ── 트리 ────────────────────────────────────────────────────────── */
const expanded = ref<Set<string>>(new Set(['root', 'cat1']))
const selectedId = ref<string | null>(null)
const search = ref('')

function findNode(id: string, node: PTplNode = tree): PTplNode | null {
  if (node.id === id) return node
  for (const c of node.children ?? []) {
    const r = findNode(id, c)
    if (r) return r
  }
  return null
}
function findParent(id: string, node: PTplNode = tree): PTplNode | null {
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
  function dfs(node: PTplNode): boolean {
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
const flat = computed<{ node: PTplNode, depth: number }[]>(() => {
  const out: { node: PTplNode, depth: number }[] = []
  const q = search.value.trim()
  const vis = q ? computeVisible(q) : null
  function walk(node: PTplNode, depth: number) {
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
  inputType: 'basic' as InputType,
  htmlStyle: 'on' as 'on' | 'off',
  title: '',
  body: '',
  badge: '',
  buttons: [] as PushButton[],
  media: '',
  androidMedia: '',
  iosMedia: '',
  androidIcon: '',
  group: '',
  json: '',
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
    form.inputType = t.inputType ?? 'basic'
    form.htmlStyle = t.htmlStyle === false ? 'off' : 'on'
    form.title = t.title ?? ''
    form.body = t.body ?? ''
    form.badge = t.badge ?? ''
    form.buttons = (t.buttons ?? []).map(b => ({ ...b }))
    form.media = t.media ?? ''
    form.androidMedia = t.androidMedia ?? ''
    form.iosMedia = t.iosMedia ?? ''
    form.androidIcon = t.androidIcon ?? ''
    form.group = t.group ?? ''
    form.json = t.json ?? ''
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
    form.inputType = 'basic'
    form.htmlStyle = 'on'
    form.title = ''
    form.body = ''
    form.badge = ''
    form.buttons = []
    form.media = ''
    form.androidMedia = ''
    form.iosMedia = ''
    form.androidIcon = ''
    form.group = ''
    form.json = ''
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
  if (form.inputType === 'json') {
    if (!form.json.trim()) {
      toast.add({ title: 'JSON 내용을 입력하세요.', icon: 'i-lucide-circle-alert' })
      return
    }
  }
  else if (!form.title.trim() && !form.body.trim()) {
    toast.add({ title: '제목 또는 내용을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  const patch = {
    name: form.name.trim(),
    purpose: form.purpose,
    inputType: form.inputType,
    htmlStyle: form.htmlStyle === 'on',
    title: form.title,
    body: form.body,
    badge: form.badge,
    buttons: form.buttons.map(b => ({ ...b })),
    media: form.media,
    androidMedia: form.androidMedia,
    iosMedia: form.iosMedia,
    androidIcon: form.androidIcon,
    group: form.group,
    json: form.json,
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
    ;(cat.children ??= []).push({ id, kind: 'template', code: randomCode(), createdAt: stamp, updatedAt: stamp, ...patch })
    expanded.value = new Set([...expanded.value, cat.id])
    selectedId.value = id
    toast.add({ title: '템플릿을 등록했습니다.', icon: 'i-lucide-circle-check' })
  }
  view.value = 'manage'
}

/* ── 항목 추가(버튼·미디어·그룹) ──────────────────────────────────── */
const addOpen = ref(false)
const addKind = ref<'button' | 'media' | 'group'>('button')
const addMediaLabel = ref('')
let addMediaTarget: 'media' | 'androidMedia' | 'iosMedia' | 'androidIcon' = 'media'
function openAdd(kind: 'button' | 'media' | 'group', mediaTarget?: typeof addMediaTarget, mediaLabel?: string) {
  addKind.value = kind
  if (mediaTarget) addMediaTarget = mediaTarget
  addMediaLabel.value = mediaLabel ?? ''
  addOpen.value = true
}
function onAddSubmit(p: PushAddPayload) {
  if (addKind.value === 'button') {
    form.buttons.push({ label: p.label ?? '', link: p.link ?? '' })
  }
  else if (addKind.value === 'media') {
    form[addMediaTarget] = p.url ?? ''
  }
  else {
    form.group = p.value ?? ''
  }
}
function removeButton(i: number) {
  form.buttons.splice(i, 1)
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
function onSamplePick(t: PushSample) {
  if (view.value === 'manage') openForm('create')
  form.purpose = t.purpose
  form.title = t.title
  form.body = t.body
  if (!form.name) form.name = t.name
}

const aiOpen = ref(false)
function onAiApply(p: { title: string, body: string }) {
  form.title = p.title
  form.body = p.body
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 관리 · PUSH
      </div>
      <h1>PUSH 템플릿</h1>
      <p>카테고리별로 PUSH 템플릿을 등록하고 관리합니다.</p>
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
                  <dt>입력 유형</dt>
                  <dd>: {{ INPUT_LABEL[selectedNode.inputType ?? 'basic'] }}</dd>
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
                <div class="pf-previews">
                  <AppPushPreview
                    platform="android"
                    app-name="맑은 메시징"
                    :title="selectedNode.title ?? ''"
                    :body="selectedNode.body ?? ''"
                  />
                  <AppPushPreview
                    platform="ios"
                    app-name="맑은 메시징"
                    :title="selectedNode.title ?? ''"
                    :body="selectedNode.body ?? ''"
                  />
                </div>
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

        <div class="pf-grid">
          <div class="pf-form">
            <div class="pf-row">
              <label class="pf-label">템플릿 이름 <em>*</em></label>
              <div class="pf-input-wrap">
                <input v-model="form.name" class="input" maxlength="50" placeholder="템플릿 이름을 입력하세요.">
                <span class="pf-count">{{ form.name.length }}/50</span>
              </div>
            </div>
            <div class="pf-row">
              <label class="pf-label">발송 목적 <em>*</em></label>
              <div class="pf-field">
                <AppRadioGroup
                  v-model="form.purpose"
                  :options="[{ value: 'info', label: '일반용' }, { value: 'ad', label: '광고용' }]"
                />
              </div>
            </div>
            <div class="pf-row">
              <label class="pf-label">
                입력 유형
                <span class="pf-help" title="기본: 항목별 입력 / JSON: 페이로드 직접 작성">?</span>
              </label>
              <div class="pf-field">
                <AppRadioGroup
                  v-model="form.inputType"
                  :options="[{ value: 'basic', label: '기본' }, { value: 'json', label: 'JSON' }]"
                />
              </div>
            </div>

            <!-- 기본 입력 -->
            <div v-if="form.inputType === 'basic'" class="pf-basic">
              <div class="pf-brow">
                <label class="pf-label">
                  HTML스타일
                  <span class="pf-help" title="제목·내용에 HTML 스타일 적용 여부">?</span>
                </label>
                <div class="pf-field">
                  <AppRadioGroup
                    v-model="form.htmlStyle"
                    :options="[{ value: 'on', label: '사용' }, { value: 'off', label: '사용 안 함' }]"
                  />
                </div>
              </div>
              <div class="pf-brow">
                <label class="pf-label">제목</label>
                <input v-model="form.title" class="input" placeholder="제목을 입력하세요.">
              </div>
              <div class="pf-brow">
                <label class="pf-label">내용</label>
                <textarea v-model="form.body" class="textarea" rows="5" placeholder="내용을 입력하세요." />
              </div>
              <div class="pf-brow">
                <label class="pf-label">배지</label>
                <input v-model="form.badge" class="input" inputmode="numeric" placeholder="숫자만 입력">
              </div>

              <div class="pf-brow">
                <label class="pf-label">버튼</label>
                <div class="pf-field">
                  <table v-if="form.buttons.length" class="table pf-subtable">
                    <thead>
                      <tr>
                        <th>버튼 이름</th>
                        <th>링크</th>
                        <th style="width: 56px; text-align: center">
                          삭제
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(b, i) in form.buttons" :key="i">
                        <td>{{ b.label }}</td>
                        <td class="cell-mono" style="font-size: var(--fz-sm)">
                          {{ b.link || '-' }}
                        </td>
                        <td style="text-align: center">
                          <button type="button" class="pf-iconbtn" aria-label="삭제" @click="removeButton(i)">
                            <UIcon name="i-lucide-x" class="text-[length:var(--fz-md)]" />
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button type="button" class="btn btn-primary btn-sm" @click="openAdd('button')">
                    <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
                  </button>
                </div>
              </div>

              <div
                v-for="m in ([
                  { key: 'media', label: '미디어' },
                  { key: 'androidMedia', label: 'Android 미디어' },
                  { key: 'iosMedia', label: 'iOS 미디어' },
                  { key: 'androidIcon', label: 'Android 큰 아이콘' },
                ] as const)"
                :key="m.key"
                class="pf-brow"
              >
                <label class="pf-label">{{ m.label }}</label>
                <div class="pf-field pf-mediarow">
                  <span v-if="form[m.key]" class="pf-chip">
                    <UIcon name="i-lucide-image" class="text-[length:var(--fz-sm)]" />
                    {{ form[m.key] }}
                    <button type="button" aria-label="삭제" @click="form[m.key] = ''">
                      <UIcon name="i-lucide-x" class="text-[length:var(--fz-sm)]" />
                    </button>
                  </span>
                  <button type="button" class="btn btn-primary btn-sm" @click="openAdd('media', m.key, m.label)">
                    <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
                  </button>
                </div>
              </div>

              <div class="pf-brow">
                <label class="pf-label">그룹</label>
                <div class="pf-field pf-mediarow">
                  <span v-if="form.group" class="pf-chip">
                    <UIcon name="i-lucide-layers" class="text-[length:var(--fz-sm)]" />
                    {{ form.group }}
                    <button type="button" aria-label="삭제" @click="form.group = ''">
                      <UIcon name="i-lucide-x" class="text-[length:var(--fz-sm)]" />
                    </button>
                  </span>
                  <button type="button" class="btn btn-primary btn-sm" @click="openAdd('group')">
                    <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
                  </button>
                </div>
              </div>
            </div>

            <!-- JSON 입력 -->
            <div v-else class="pf-row">
              <label class="pf-label">JSON</label>
              <div class="pf-field">
                <textarea
                  v-model="form.json"
                  class="textarea"
                  rows="14"
                  placeholder='{ "title": "...", "body": "...", "badge": 1 }'
                  style="font-family: var(--font-mono); font-size: var(--fz-sm)"
                />
              </div>
            </div>
          </div>

          <div class="pf-preview">
            <div class="pf-previews">
              <AppPushPreview
                platform="android"
                app-name="맑은 메시징"
                :title="form.title"
                :body="form.body"
              />
              <AppPushPreview
                platform="ios"
                app-name="맑은 메시징"
                :title="form.title"
                :body="form.body"
              />
            </div>
            <p class="pf-preview-hint">
              디바이스에 따라 실제 메시지 수신 화면과 미리보기 화면이 다를 수 있으며, 일부 기능(애니메이션, 사운드 등)은 미리보기에서 지원되지 않을 수 있습니다.
            </p>
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

    <AppPushSampleDialog
      :open="sampleOpen"
      :title="view === 'manage' ? '샘플 템플릿 보기' : '샘플 템플릿 선택'"
      @close="sampleOpen = false"
      @pick="onSamplePick"
    />

    <AppPushAiDialog
      :open="aiOpen"
      @close="aiOpen = false"
      @apply="onAiApply"
    />

    <AppPushAddDialog
      :open="addOpen"
      :kind="addKind"
      :media-label="addMediaLabel"
      @close="addOpen = false"
      @submit="onAddSubmit"
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
  grid-template-columns: minmax(0, 1fr) 600px;
  gap: 24px;
  margin-top: 22px;
  align-items: start;
}
@media (max-width: 1100px) {
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
.pf-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 600px;
  gap: 24px;
  padding: 24px 20px;
}
@media (max-width: 1100px) {
  .pf-grid { grid-template-columns: 1fr; }
}
.pf-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pf-row,
.pf-brow {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 14px;
  align-items: flex-start;
}
.pf-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  padding-top: 8px;
}
.pf-label em {
  color: var(--danger-ink, #e0364a);
  font-style: normal;
  margin-left: 2px;
}
.pf-help {
  display: inline-grid;
  place-items: center;
  width: 14px;
  height: 14px;
  border-radius: var(--r-full);
  background: var(--ink-200);
  color: var(--white);
  font-size: var(--fz-2xs);
  cursor: help;
  margin-left: 2px;
}
.pf-field {
  min-width: 0;
}
.pf-field .input,
.pf-field .textarea {
  width: 100%;
}
.pf-input-wrap {
  position: relative;
}
.pf-input-wrap .input {
  width: 100%;
  padding-right: 56px;
}
.pf-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.pf-basic {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
}
.pf-brow .input,
.pf-brow .textarea {
  width: 100%;
}
.pf-mediarow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.pf-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  padding: 5px 8px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  font-size: var(--fz-xs);
  color: var(--ink-700);
  overflow: hidden;
}
.pf-chip button {
  border: 0;
  background: none;
  padding: 0;
  color: var(--ink-400);
  cursor: pointer;
}
.pf-chip button:hover {
  color: var(--ink-800);
}
.pf-subtable {
  margin-bottom: 10px;
}
.pf-iconbtn {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 0;
  background: none;
  color: var(--ink-400);
  cursor: pointer;
}
.pf-iconbtn:hover {
  color: var(--ink-800);
}

.pf-preview {
  min-width: 0;
}
.pf-previews {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
.pf-preview-hint {
  margin-top: 12px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.6;
  text-align: center;
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
