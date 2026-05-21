<script setup lang="ts">
import type { KakaoButton } from '~/components/AppKakaoButtonDialog.vue'
import type { KakaoSample } from '~/components/AppKakaoSampleDialog.vue'

useHead({ title: '알림톡 템플릿' })
const toast = useToast()

type Kind = 'root' | 'category' | 'template'
type Purpose = 'info' | 'auth'
type MsgType = 'basic' | 'channel' | 'extra' | 'composite'
type Emphasis = 'none' | 'highlight' | 'image' | 'itemlist'
type ReviewStatus = '승인' | '검수중' | '반려'

interface RepLink {
  mobile: string
  pc: string
  android: string
  ios: string
}
interface KTplNode {
  id: string
  name: string
  kind: Kind
  children?: KTplNode[]
  code?: string
  tplCode?: string
  kakaoCode?: string
  profileType?: '일반' | '그룹'
  profile?: string
  purpose?: Purpose
  msgType?: MsgType
  emphasis?: Emphasis
  secure?: boolean
  cat1?: string
  cat2?: string
  body?: string
  extra?: string
  buttons?: KakaoButton[]
  repLink?: RepLink | null
  status?: ReviewStatus
  createdAt?: string
}

const PROFILES = ['@위캔디오', '@맑은소프트', '@쏠쏠']
const PROFILE_GROUPS = ['상품 알림 그룹', '마케팅 그룹']
const CAT1 = ['서비스이용', '거래', '배송', '리워드', '회원관리']
const CAT2 = ['이용안내/공지', '예약/신청', '발급', '변경/취소']

const PURPOSE_LABEL: Record<Purpose, string> = { info: '일반용', auth: '인증용' }
const MSGTYPE_LABEL: Record<MsgType, string> = { basic: '기본형', channel: '채널 추가형', extra: '부가 정보형', composite: '복합형' }
const EMPHASIS_LABEL: Record<Emphasis, string> = { none: '선택 안함', highlight: '강조 표기형', image: '이미지형', itemlist: '아이템 리스트형' }

/* ── 트리 데이터(목업) ───────────────────────────────────────────── */
const tree = reactive<KTplNode>({
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
          code: '5dtZtAWb',
          tplCode: '01',
          kakaoCode: '01',
          profileType: '일반',
          profile: '@위캔디오',
          purpose: 'info',
          msgType: 'extra',
          emphasis: 'none',
          secure: false,
          cat1: '서비스이용',
          cat2: '이용안내/공지',
          body: '[위캔디오] 비디오팩 준비 완료 🎉\n\n#{name}님, 비디오팩을 시작할 준비가 끝났어요.\n바로 "첫 재생"까지 가는 가장 쉬운 3단계만 안내드릴게요.\n\n1. 영상 업로드\n2. 인코딩 요청\n3. 재생 링크/임베드 복사',
          extra: '▶ 아래 버튼에서 시작 가이드를 확인해 주세요.\n\n궁금한 점은 문의로 남겨주세요.',
          buttons: [
            { type: '웹 링크', label: '👋 시작 가이드', mobileUrl: 'https://www.wecandeo.com', pcUrl: 'https://www.wecandeo.com' },
            { type: '웹 링크', label: '💬 문의하기', mobileUrl: 'https://www.wecandeo.com', pcUrl: 'https://www.wecandeo.com' },
          ],
          repLink: { mobile: 'https://www.wecandeo.com', pc: 'https://www.wecandeo.com', android: '', ios: '' },
          status: '승인',
          createdAt: '2026-04-13 13:52',
        },
        {
          id: 't2',
          name: '02-1_비디오팩생성2일경과',
          kind: 'template',
          code: 'Qm3kP9zX',
          tplCode: '02',
          kakaoCode: '02',
          profileType: '일반',
          profile: '@위캔디오',
          purpose: 'info',
          msgType: 'basic',
          emphasis: 'none',
          secure: false,
          cat1: '서비스이용',
          cat2: '이용안내/공지',
          body: '#{name}님, 비디오팩 생성 후 2일이 지났어요. 지금 확인해 보세요.',
          buttons: [],
          repLink: null,
          status: '검수중',
          createdAt: '2026-04-14 09:10',
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
          tplCode: '10',
          kakaoCode: '10',
          profileType: '일반',
          profile: '@맑은소프트',
          purpose: 'info',
          msgType: 'basic',
          emphasis: 'highlight',
          secure: false,
          cat1: '서비스이용',
          cat2: '이용안내/공지',
          body: '이번 달 리포트가 도착했습니다. 마이페이지에서 확인해 주세요.',
          buttons: [],
          repLink: null,
          status: '승인',
          createdAt: '2026-04-20 10:30',
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
const filterProfileType = ref('')
const filterProfile = ref('')
const filterStatus = ref('')
const filterProfileOptions = computed(() =>
  filterProfileType.value === '그룹'
    ? PROFILE_GROUPS
    : filterProfileType.value === '일반'
      ? PROFILES
      : [...PROFILES, ...PROFILE_GROUPS])

function findNode(id: string, node: KTplNode = tree): KTplNode | null {
  if (node.id === id) return node
  for (const c of node.children ?? []) {
    const r = findNode(id, c)
    if (r) return r
  }
  return null
}
function findParent(id: string, node: KTplNode = tree): KTplNode | null {
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
  function dfs(node: KTplNode): boolean {
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
const flat = computed<{ node: KTplNode, depth: number }[]>(() => {
  const out: { node: KTplNode, depth: number }[] = []
  const q = search.value.trim()
  const vis = q ? computeVisible(q) : null
  function walk(node: KTplNode, depth: number) {
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

/* ── 상세 탭 ─────────────────────────────────────────────────────── */
const detailTab = ref<'info' | 'history'>('info')
watch(selectedId, () => { detailTab.value = 'info' })

const historyRows = computed(() => {
  const n = selectedNode.value
  if (n?.kind !== 'template') return []
  return [{
    id: `${n.id}-h1`,
    name: n.name,
    kakaoCode: n.kakaoCode ?? '-',
    status: n.status ?? '검수중',
    createdAt: n.createdAt ?? '-',
    dormant: '해제',
  }]
})

function statusTone(s: ReviewStatus) {
  return s === '승인' ? 'success' : s === '반려' ? 'error' : 'warning'
}

/* ── 폼 뷰 ───────────────────────────────────────────────────────── */
const view = ref<'manage' | 'form'>('manage')
const formMode = ref<'create' | 'edit'>('create')
const form = reactive({
  name: '',
  tplCode: '',
  kakaoCode: '',
  profileType: '일반' as '일반' | '그룹',
  profile: '',
  purpose: 'info' as Purpose,
  msgType: 'basic' as MsgType,
  emphasis: 'none' as Emphasis,
  body: '',
  extra: '',
  secure: 'off' as 'off' | 'on',
  cat1: '',
  cat2: '',
  buttons: [] as KakaoButton[],
  repLink: null as RepLink | null,
})
let formTargetCatId = 'root'
let formEditId = ''

const showExtra = computed(() => form.msgType === 'extra')
const profileOptions = computed(() => form.profileType === '그룹' ? PROFILE_GROUPS : PROFILES)

function openForm(mode: 'create' | 'edit') {
  formMode.value = mode
  if (mode === 'edit' && selectedNode.value?.kind === 'template') {
    const t = selectedNode.value
    formEditId = t.id
    form.name = t.name
    form.tplCode = t.tplCode ?? ''
    form.kakaoCode = t.kakaoCode ?? ''
    form.profileType = t.profileType ?? '일반'
    form.profile = t.profile ?? ''
    form.purpose = t.purpose ?? 'info'
    form.msgType = t.msgType ?? 'basic'
    form.emphasis = t.emphasis ?? 'none'
    form.body = t.body ?? ''
    form.extra = t.extra ?? ''
    form.secure = t.secure ? 'on' : 'off'
    form.cat1 = t.cat1 ?? ''
    form.cat2 = t.cat2 ?? ''
    form.buttons = (t.buttons ?? []).map(b => ({ ...b }))
    form.repLink = t.repLink ? { ...t.repLink } : null
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
    form.tplCode = ''
    form.kakaoCode = ''
    form.profileType = '일반'
    form.profile = ''
    form.purpose = 'info'
    form.msgType = 'basic'
    form.emphasis = 'none'
    form.body = ''
    form.extra = ''
    form.secure = 'off'
    form.cat1 = ''
    form.cat2 = ''
    form.buttons = []
    form.repLink = null
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
  if (!form.tplCode.trim() || !form.kakaoCode.trim()) {
    toast.add({ title: '템플릿 코드와 카카오톡 템플릿 코드를 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!form.profile) {
    toast.add({ title: '발신 프로필을 선택하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!form.body.trim()) {
    toast.add({ title: '내용을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  const patch = {
    name: form.name.trim(),
    tplCode: form.tplCode.trim(),
    kakaoCode: form.kakaoCode.trim(),
    profileType: form.profileType,
    profile: form.profile,
    purpose: form.purpose,
    msgType: form.msgType,
    emphasis: form.emphasis,
    body: form.body,
    extra: showExtra.value ? form.extra : '',
    secure: form.secure === 'on',
    cat1: form.cat1,
    cat2: form.cat2,
    buttons: form.buttons.map(b => ({ ...b })),
    repLink: form.repLink ? { ...form.repLink } : null,
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
      status: '검수중',
      createdAt: nowStr(),
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
const btnEditValue = ref<KakaoButton | null>(null)
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
function onBtnSubmit(b: KakaoButton) {
  if (btnEditIndex.value >= 0) form.buttons[btnEditIndex.value] = b
  else form.buttons.push(b)
}
function removeBtn(i: number) {
  form.buttons.splice(i, 1)
}

/* ── 대표 링크 ───────────────────────────────────────────────────── */
const linkDialogOpen = ref(false)
const linkDraft = reactive<RepLink>({ mobile: '', pc: '', android: '', ios: '' })
function openLinkDialog() {
  Object.assign(linkDraft, form.repLink ?? { mobile: '', pc: '', android: '', ios: '' })
  linkDialogOpen.value = true
}
function onLinkSubmit() {
  form.repLink = { ...linkDraft }
  linkDialogOpen.value = false
}
function removeRepLink() {
  form.repLink = null
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
function onSamplePick(t: KakaoSample) {
  if (view.value === 'manage') openForm('create')
  form.msgType = t.msgType
  form.emphasis = t.emphasis
  form.body = t.body
  form.extra = t.extra ?? ''
  if (!form.name) form.name = t.name
}

const aiOpen = ref(false)
function onAiApply(p: { msgType: MsgType, emphasis: Emphasis, body: string }) {
  form.msgType = p.msgType
  form.emphasis = p.emphasis
  form.body = p.body
}

/* ── 상세 보기 모달 ─────────────────────────────────────────────── */
const detailModalOpen = ref(false)
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 관리 · 알림톡
      </div>
      <h1>알림톡 템플릿</h1>
      <p>카테고리별로 알림톡 템플릿을 등록하고 검수 상태를 관리합니다.</p>
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
        <button type="button" class="btn btn-primary btn-sm" @click="sampleOpen = true">
          샘플 템플릿 보기
        </button>
      </div>

      <div class="tpl-filterbar">
        <div class="tpl-filter">
          <span class="tpl-filter-label">발신 프로필 :</span>
          <select
            v-model="filterProfileType"
            class="select tpl-filter-select"
            @change="filterProfile = ''"
          >
            <option value="">
              전체
            </option>
            <option value="일반">
              일반
            </option>
            <option value="그룹">
              그룹
            </option>
          </select>
          <select v-model="filterProfile" class="select tpl-filter-select">
            <option value="">
              전체
            </option>
            <option v-for="p in filterProfileOptions" :key="p" :value="p">
              {{ p }}
            </option>
          </select>
        </div>
        <div class="tpl-filter">
          <span class="tpl-filter-label">템플릿 상태 :</span>
          <select v-model="filterStatus" class="select tpl-filter-select">
            <option value="">
              전체
            </option>
            <option value="요청">
              요청
            </option>
            <option value="검수중">
              검수 중
            </option>
            <option value="승인">
              승인
            </option>
            <option value="반려">
              반려
            </option>
          </select>
        </div>
        <div class="tpl-search">
          <input v-model="search" class="input" placeholder="카테고리/템플릿 이름을 입력하세요.">
          <UIcon name="i-lucide-search" class="text-sm tpl-search-icon" />
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
              <div :class="['tab', { active: detailTab === 'info' }]" @click="detailTab = 'info'">
                기본 정보
              </div>
              <div :class="['tab', { active: detailTab === 'history' }]" @click="detailTab = 'history'">
                카카오톡 템플릿(생성 이력)
              </div>
            </div>

            <!-- 기본 정보 -->
            <div v-if="detailTab === 'info'" class="tpl-info-tab">
              <div class="tpl-info-grid">
                <dl class="tpl-info">
                  <div class="info-row">
                    <dt>템플릿 이름</dt>
                    <dd>: {{ selectedNode.name }}</dd>
                  </div>
                  <div class="info-row">
                    <dt>템플릿 코드</dt>
                    <dd>: {{ selectedNode.tplCode || '-' }}</dd>
                  </div>
                  <div class="info-row">
                    <dt>카카오톡 템플릿 코드</dt>
                    <dd>: {{ selectedNode.kakaoCode || '-' }}</dd>
                  </div>
                  <div class="info-row">
                    <dt>발신 프로필</dt>
                    <dd>: ({{ selectedNode.profileType || '일반' }}){{ selectedNode.profile || '-' }}</dd>
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
                    <dt>검수 상태</dt>
                    <dd>
                      <span>:</span>
                      <AppBadge :tone="statusTone(selectedNode.status ?? '검수중')">
                        {{ selectedNode.status ?? '검수중' }}
                      </AppBadge>
                    </dd>
                  </div>
                </dl>
              </div>
              <div class="tpl-info-preview">
                <AppKakaoPreview
                  :profile-name="selectedNode.profile || '맑은소프트'"
                  :body="selectedNode.body || ''"
                  :extra="selectedNode.extra || ''"
                  :buttons="selectedNode.buttons || []"
                />
              </div>
            </div>

            <!-- 생성 이력 -->
            <div v-else class="tpl-history">
              <ul class="notice">
                <li>템플릿 수정 이력을 확인할 수 있습니다. 가장 최근에 수정한 이력이 최상단에 표시됩니다.</li>
                <li>최근 승인된 템플릿으로만 발송할 수 있으며, 이전 템플릿은 조회만 가능합니다. 자세한 내용은 [사용자 가이드]를 참고하세요.</li>
              </ul>
              <div class="list-table-scroll">
                <table class="table" data-table-style="c">
                  <thead>
                    <tr>
                      <th>템플릿 이름</th>
                      <th>카카오톡 템플릿 코드</th>
                      <th>템플릿 상세 보기</th>
                      <th>검수 상태</th>
                      <th>검수 문의</th>
                      <th>등록 일시</th>
                      <th>휴면 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="h in historyRows" :key="h.id">
                      <td>{{ h.name }}</td>
                      <td class="cell-mono">
                        {{ h.kakaoCode }}
                      </td>
                      <td>
                        <button type="button" class="btn btn-outline btn-sm" @click="detailModalOpen = true">
                          확인
                        </button>
                      </td>
                      <td>
                        <span :style="{ color: h.status === '승인' ? 'var(--accent-ink)' : 'var(--ink-600)', fontWeight: 600 }">{{ h.status }}</span>
                      </td>
                      <td>
                        <button type="button" class="btn btn-outline btn-sm" disabled>
                          문의하기
                        </button>
                      </td>
                      <td class="cell-mono">
                        {{ h.createdAt }}
                      </td>
                      <td>{{ h.dormant }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="tpl-history-pager">
                <button class="pager-btn" disabled>
                  «
                </button>
                <button class="pager-btn" disabled>
                  ‹
                </button>
                <button class="pager-btn pager-btn--active">
                  1
                </button>
                <button class="pager-btn" disabled>
                  ›
                </button>
                <button class="pager-btn" disabled>
                  »
                </button>
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

        <div class="kf-grid">
          <div class="kf-form">
            <div class="kf-row">
              <label class="kf-label">템플릿 이름 <em>*</em></label>
              <div class="kf-input-wrap">
                <input v-model="form.name" class="input" maxlength="50" placeholder="템플릿 이름을 입력하세요.">
                <span class="kf-count">{{ form.name.length }}/50</span>
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">템플릿 코드 <em>*</em></label>
              <div class="kf-input-wrap">
                <input v-model="form.tplCode" class="input" maxlength="30" placeholder="템플릿 코드를 입력하세요.">
                <span class="kf-count">{{ form.tplCode.length }}/30</span>
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">카카오톡 템플릿 코드 <em>*</em></label>
              <div class="kf-input-wrap">
                <input v-model="form.kakaoCode" class="input" maxlength="30" placeholder="카카오톡 템플릿 코드를 입력하세요.">
                <span class="kf-count">{{ form.kakaoCode.length }}/30</span>
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">발신 프로필 <em>*</em></label>
              <div class="kf-field">
                <div class="row" style="gap: 14px; flex-wrap: wrap">
                  <AppRadioGroup
                    v-model="form.profileType"
                    :options="[{ value: '일반', label: '일반' }, { value: '그룹', label: '그룹' }]"
                    @update:model-value="form.profile = ''"
                  />
                  <select v-model="form.profile" class="select" style="min-width: 220px">
                    <option value="">
                      발신 프로필 선택
                    </option>
                    <option v-for="p in profileOptions" :key="p" :value="p">
                      {{ p }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">발송 목적 <em>*</em></label>
              <div class="kf-field">
                <AppRadioGroup
                  v-model="form.purpose"
                  :options="[{ value: 'info', label: '일반용' }, { value: 'auth', label: '인증용' }]"
                />
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">메시지 유형 <em>*</em></label>
              <div class="kf-field">
                <AppRadioGroup
                  v-model="form.msgType"
                  :options="[
                    { value: 'basic', label: '기본형' },
                    { value: 'channel', label: '채널 추가형' },
                    { value: 'extra', label: '부가 정보형' },
                    { value: 'composite', label: '복합형' },
                  ]"
                />
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">템플릿 강조 유형 <em>*</em></label>
              <div class="kf-field">
                <AppRadioGroup
                  v-model="form.emphasis"
                  :options="[
                    { value: 'none', label: '선택 안함' },
                    { value: 'highlight', label: '강조 표기형' },
                    { value: 'image', label: '이미지형' },
                    { value: 'itemlist', label: '아이템 리스트형' },
                  ]"
                />
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">내용 <em>*</em></label>
              <div class="kf-field">
                <div class="kf-textarea-wrap">
                  <textarea
                    v-model="form.body"
                    class="textarea"
                    rows="8"
                    maxlength="1300"
                    placeholder="한/영 구분 없이 치환 변수 및 URL 포함 가능&#10;변수는 #{변수} 형태로 띄어쓰기 없이 입력&#10;예: #{이름} 님의 택배가 오늘 #{00:00} 배달 예정입니다."
                  />
                  <span class="kf-textarea-count">{{ form.body.length }}/1300</span>
                </div>
              </div>
            </div>
            <div v-if="showExtra" class="kf-row">
              <label class="kf-label">부가정보 <em>*</em></label>
              <div class="kf-field">
                <div class="kf-textarea-wrap">
                  <textarea
                    v-model="form.extra"
                    class="textarea"
                    rows="3"
                    maxlength="500"
                    placeholder="부가정보를 입력하세요."
                  />
                  <span class="kf-textarea-count">{{ form.extra.length }}/500</span>
                </div>
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">보안 템플릿 여부 <em>*</em></label>
              <div class="kf-field">
                <AppRadioGroup
                  v-model="form.secure"
                  :options="[{ value: 'off', label: '선택 안함' }, { value: 'on', label: '설정' }]"
                />
              </div>
            </div>
            <div class="kf-row">
              <label class="kf-label">카테고리 <em>*</em></label>
              <div class="kf-field">
                <div class="row" style="gap: 8px; flex-wrap: wrap">
                  <select v-model="form.cat1" class="select" style="min-width: 200px">
                    <option value="">
                      대분류
                    </option>
                    <option v-for="c in CAT1" :key="c" :value="c">
                      {{ c }}
                    </option>
                  </select>
                  <select v-model="form.cat2" class="select" style="min-width: 200px">
                    <option value="">
                      중분류
                    </option>
                    <option v-for="c in CAT2" :key="c" :value="c">
                      {{ c }}
                    </option>
                  </select>
                </div>
                <p class="kf-hint">
                  적용 대상 템플릿 설명: 발급안내, 사용안내, 변동사항공지, 이용중인 서비스의 상태알림 등 이용과 관련한 안내 및 공지사항 템플릿이 대상입니다.
                </p>
              </div>
            </div>

            <!-- 대표 링크 -->
            <div class="kf-row">
              <label class="kf-label">대표 링크</label>
              <div class="kf-field">
                <button type="button" class="btn btn-primary btn-sm" @click="openLinkDialog">
                  <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
                </button>
                <table v-if="form.repLink" class="table kf-subtable">
                  <tbody>
                    <tr>
                      <td class="kf-subtable-key">
                        모바일
                      </td>
                      <td>{{ form.repLink.mobile || '-' }}</td>
                      <td rowspan="4" style="width: 64px; text-align: center; vertical-align: middle">
                        <button type="button" class="kf-iconbtn" aria-label="수정" @click="openLinkDialog">
                          <UIcon name="i-lucide-pencil" class="text-[length:var(--fz-md)]" />
                        </button>
                        <button type="button" class="kf-iconbtn" aria-label="삭제" @click="removeRepLink">
                          <UIcon name="i-lucide-trash-2" class="text-[length:var(--fz-md)]" />
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td class="kf-subtable-key">
                        PC
                      </td>
                      <td>{{ form.repLink.pc || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="kf-subtable-key">
                        Android
                      </td>
                      <td>{{ form.repLink.android || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="kf-subtable-key">
                        iOS
                      </td>
                      <td>{{ form.repLink.ios || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 버튼 -->
            <div class="kf-row">
              <label class="kf-label">버튼</label>
              <div class="kf-field">
                <button type="button" class="btn btn-primary btn-sm" @click="openBtnAdd">
                  <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
                </button>
                <table v-if="form.buttons.length" class="table kf-subtable">
                  <thead>
                    <tr>
                      <th>버튼 유형</th>
                      <th>버튼 이름</th>
                      <th style="width: 80px; text-align: center">
                        수정/삭제
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(b, i) in form.buttons" :key="i">
                      <td>{{ b.type }}</td>
                      <td>{{ b.label }}</td>
                      <td style="text-align: center">
                        <button type="button" class="kf-iconbtn" aria-label="수정" @click="openBtnEdit(i)">
                          <UIcon name="i-lucide-pencil" class="text-[length:var(--fz-md)]" />
                        </button>
                        <button type="button" class="kf-iconbtn" aria-label="삭제" @click="removeBtn(i)">
                          <UIcon name="i-lucide-trash-2" class="text-[length:var(--fz-md)]" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div class="kf-preview">
            <AppKakaoPreview
              :profile-name="form.profile || '맑은소프트'"
              :body="form.body"
              :extra="showExtra ? form.extra : ''"
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

    <AppKakaoSampleDialog
      :open="sampleOpen"
      :title="view === 'manage' ? '샘플 템플릿 보기' : '샘플 템플릿 선택'"
      @close="sampleOpen = false"
      @pick="onSamplePick"
    />

    <AppKakaoAiDialog
      :open="aiOpen"
      @close="aiOpen = false"
      @apply="onAiApply"
    />

    <AppKakaoButtonDialog
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

    <!-- 대표 링크 -->
    <AppModal :open="linkDialogOpen" title="대표 링크" :width="480" @close="linkDialogOpen = false">
      <div class="lk-row">
        <label class="lk-label">모바일</label>
        <input v-model="linkDraft.mobile" class="input" placeholder="https://">
      </div>
      <div class="lk-row">
        <label class="lk-label">PC</label>
        <input v-model="linkDraft.pc" class="input" placeholder="https://">
      </div>
      <div class="lk-row">
        <label class="lk-label">Android</label>
        <input v-model="linkDraft.android" class="input" placeholder="앱 스킴 또는 URL">
      </div>
      <div class="lk-row">
        <label class="lk-label">iOS</label>
        <input v-model="linkDraft.ios" class="input" placeholder="앱 스킴 또는 URL">
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-dark" @click="linkDialogOpen = false">
          취소
        </button>
        <button type="button" class="btn btn-primary" @click="onLinkSubmit">
          확인
        </button>
      </template>
    </AppModal>

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
          <dt>발신 프로필</dt>
          <dd>({{ selectedNode.profileType || '일반' }}){{ selectedNode.profile || '-' }}</dd>
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
          <dt>템플릿 코드</dt>
          <dd>{{ selectedNode.tplCode || '-' }}</dd>
        </div>
        <div class="dv-row">
          <dt>카카오톡 템플릿 코드</dt>
          <dd>{{ selectedNode.kakaoCode || '-' }}</dd>
        </div>
        <div class="dv-row">
          <dt>발송 목적</dt>
          <dd>{{ PURPOSE_LABEL[selectedNode.purpose ?? 'info'] }}</dd>
        </div>
        <div class="dv-row">
          <dt>메시지 유형</dt>
          <dd>{{ MSGTYPE_LABEL[selectedNode.msgType ?? 'basic'] }}</dd>
        </div>
        <div class="dv-row">
          <dt>메시지 강조 유형</dt>
          <dd>{{ EMPHASIS_LABEL[selectedNode.emphasis ?? 'none'] }}</dd>
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
.tpl-toolbar-sep {
  color: var(--line);
  user-select: none;
  margin: 0 2px;
}

/* 필터 바 */
.tpl-filterbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 20px;
  border-bottom: 1px solid var(--line);
  background: var(--paper);
}
.tpl-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tpl-filter-label {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  white-space: nowrap;
}
.tpl-filter-select {
  height: 32px;
  font-size: var(--fz-sm);
  min-width: 140px;
}
.tpl-search {
  position: relative;
  width: 280px;
  max-width: 100%;
  margin-left: auto;
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

/* 본문 */
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
.tpl-info-grid {
  min-width: 0;
}
.tpl-info-preview {
  display: grid;
  place-items: start center;
}
.tpl-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.info-row {
  display: grid;
  grid-template-columns: 140px 1fr;
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

/* 생성 이력 */
.tpl-history {
  margin-top: 18px;
}
.notice {
  margin: 0 0 16px;
  padding: 12px 16px 12px 30px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  list-style: disc;
}
.notice li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.7;
}
.list-table-scroll {
  overflow-x: auto;
}
.tpl-history-pager {
  display: flex;
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
  font-size: var(--fz-sm);
  color: var(--ink-600);
  cursor: pointer;
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

/* 폼 뷰 */
.kf-grid {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 28px;
  padding: 24px 20px;
}
@media (max-width: 1023px) {
  .kf-grid { grid-template-columns: 1fr; }
}
.kf-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.kf-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 14px;
  align-items: flex-start;
}
.kf-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  padding-top: 8px;
}
.kf-label em {
  color: var(--danger-ink, #e0364a);
  font-style: normal;
  margin-left: 2px;
}
.kf-field {
  min-width: 0;
}
.kf-input-wrap {
  position: relative;
}
.kf-input-wrap .input {
  width: 100%;
  padding-right: 56px;
}
.kf-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.kf-textarea-wrap {
  position: relative;
}
.kf-textarea-wrap .textarea {
  width: 100%;
  padding-bottom: 28px;
}
.kf-textarea-count {
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
  pointer-events: none;
}
.kf-hint {
  margin-top: 8px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.6;
}
.kf-subtable {
  margin-top: 10px;
}
.kf-subtable-key {
  width: 110px;
  background: var(--paper);
  color: var(--ink-600);
  font-weight: 500;
}
.kf-iconbtn {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 0;
  background: none;
  color: var(--ink-400);
  cursor: pointer;
}
.kf-iconbtn:hover {
  color: var(--ink-800);
}
.kf-preview {
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

/* 대표 링크 모달 */
.lk-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  align-items: center;
}
.lk-row + .lk-row {
  margin-top: 12px;
}
.lk-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
}
.lk-row .input {
  width: 100%;
}

/* 상세 보기 모달 */
.dv-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dv-row {
  display: grid;
  grid-template-columns: 120px 1fr;
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
