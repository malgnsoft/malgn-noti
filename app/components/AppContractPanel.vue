<script setup lang="ts">
const toast = useToast()
const api = useApi()
const auth = useAuthStore()
const approvalState = computed(() => auth.tenant?.approvalState ?? 'approved')

/* 사업자등록증 파일의 심사 상태 — 회사 단위 approval_state를 그대로 매핑.
 * pending: 아직 첨부 전이라 파일 자체가 없음 → 배지 표시 안 함
 * reviewing / approved / rejected: 같은 사업자등록증 묶음의 모든 파일에 동일 배지 */
type BizStatus = 'reviewing' | 'approved' | 'rejected' | null
const bizStatus = computed<BizStatus>(() => {
  const s = approvalState.value
  if (s === 'reviewing' || s === 'approved' || s === 'rejected') return s
  return null
})
const BIZ_STATUS_LABEL: Record<NonNullable<BizStatus>, string> = {
  reviewing: '심사 중',
  approved: '승인',
  rejected: '반려',
}

type ContractState = 'initial' | 'done' | 'renew' | 'expired'
const STATE_META: Record<ContractState, { label: string, icon: string }> = {
  initial: { label: '최초계약', icon: 'i-lucide-square-pen' },
  done: { label: '체결완료', icon: 'i-lucide-circle-check' },
  renew: { label: '계약갱신', icon: 'i-lucide-circle-alert' },
  expired: { label: '만료', icon: 'i-lucide-archive' },
}

interface Meta {
  text: string
  danger?: boolean
}
interface Contract {
  id: number
  status: ContractState
  statusLabel: string
  icon: string
  title: string
  version: string
  metas: Meta[]
  canSign: boolean
}

interface ContractRow {
  id: number
  title: string
  version: string
  contractState: ContractState
  signerUserId: number | null
  signedAt: string | null
  expiresAt: string | null
  createdAt: string
}

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}
function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function toContract(row: ContractRow): Contract {
  const meta = STATE_META[row.contractState]
  const metas: Meta[] = []
  if (row.contractState === 'initial') {
    metas.push({ text: '회원가입 후 최초 1회 체결이 필요합니다.' })
    metas.push({ text: `요청일 ${fmtDateTime(row.createdAt)}` })
  }
  else if (row.contractState === 'done') {
    if (row.signedAt) metas.push({ text: `체결 ${fmtDateTime(row.signedAt)}` })
    if (row.expiresAt) metas.push({ text: `만료 ${fmtDate(row.expiresAt)}` })
  }
  else if (row.contractState === 'renew') {
    metas.push({ text: `요청일 ${fmtDateTime(row.createdAt)}` })
  }
  else if (row.contractState === 'expired') {
    if (row.expiresAt) metas.push({ text: `만료 ${fmtDate(row.expiresAt)}` })
  }
  return {
    id: row.id,
    status: row.contractState,
    statusLabel: meta.label,
    icon: meta.icon,
    title: row.title,
    version: row.version,
    metas,
    canSign: row.contractState === 'initial' || row.contractState === 'renew',
  }
}

const contracts = ref<Contract[]>([])

interface FileRow {
  id: number
  contractId: number
  name: string
  sizeBytes: number
  uploadedAt: string
}
interface DocFile {
  id: number
  contractId: number
  name: string
  size: string
  at: string
}

const bizFiles = ref<DocFile[]>([])
const loanFiles = ref<DocFile[]>([])
const insuranceFiles = ref<DocFile[]>([])

function classify(name: string): 'biz' | 'loan' | 'insurance' | null {
  if (name.startsWith('사업자등록증_')) return 'biz'
  if (name.startsWith('대부업등록증_')) return 'loan'
  if (name.startsWith('지급이행보증보험증권_')) return 'insurance'
  return null
}
function toDocFile(row: FileRow): DocFile {
  // 표시명에서 종류 접두사 제거
  const stripped = row.name.replace(/^(사업자등록증|대부업등록증|지급이행보증보험증권)_/, '')
  return {
    id: row.id,
    contractId: row.contractId,
    name: stripped,
    size: fmtSize(row.sizeBytes),
    at: fmtDateTime(row.uploadedAt),
  }
}

async function loadContracts() {
  const res = await api<{ data: ContractRow[] }>('/contracts')
  contracts.value = res.data.map(toContract)
}
async function loadFiles() {
  const res = await api<{ data: FileRow[] }>('/contracts/files')
  const biz: DocFile[] = []
  const loan: DocFile[] = []
  const insurance: DocFile[] = []
  for (const row of res.data) {
    const kind = classify(row.name)
    if (kind === 'biz') biz.push(toDocFile(row))
    else if (kind === 'loan') loan.push(toDocFile(row))
    else if (kind === 'insurance') insurance.push(toDocFile(row))
  }
  bizFiles.value = biz
  loanFiles.value = loan
  insuranceFiles.value = insurance
}

// SSR에서 실패해도 페이지가 죽지 않도록 swallow — 실패하면 빈 목록으로 시작.
// client mount 시 한 번 더 재시도.
try { await Promise.all([loadContracts(), loadFiles()]) }
catch { /* ignore — onMounted에서 재시도 */ }
onMounted(async () => {
  if (contracts.value.length === 0 && bizFiles.value.length === 0) {
    try { await Promise.all([loadContracts(), loadFiles()]) }
    catch { /* ignore */ }
  }
})

/* 해당 여부 체크박스 — 첨부가 있으면 자동 활성화 */
const loanApplicable = ref(loanFiles.value.length > 0)
const insuranceApplicable = ref(insuranceFiles.value.length > 0)

/* 활성 계약(initial 또는 renew) — 새 첨부는 여기에 묶음 */
const activeContractId = computed(() => {
  return contracts.value.find(c => c.status === 'initial' || c.status === 'renew')?.id
    ?? contracts.value[0]?.id
})

async function pickFile(target: 'biz' | 'loan' | 'insurance', e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    toast.add({ title: 'PDF 파일만 첨부할 수 있습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
    input.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.add({ title: '파일 크기는 최대 10MB까지 가능합니다.', color: 'error', icon: 'i-lucide-circle-alert' })
    input.value = ''
    return
  }
  const cid = activeContractId.value
  if (!cid) {
    toast.add({ title: '활성 계약을 찾을 수 없습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
    input.value = ''
    return
  }
  const form = new FormData()
  form.append('contractId', String(cid))
  form.append('kind', target)
  form.append('file', file)
  try {
    await api('/contracts/files', { method: 'POST', body: form })
    await loadFiles()
    // 사업자등록증 첨부 시 백엔드가 회사 상태를 pending/rejected → reviewing으로 자동 전이.
    // store를 갱신해 글로벌 띠·페이지 배너의 안내 문구가 즉시 "심사 중"으로 바뀐다.
    if (target === 'biz') await auth.fetchMe()
    toast.add({
      title: target === 'biz' && approvalState.value === 'reviewing'
        ? '사업자등록증이 제출되었습니다. 심사가 진행됩니다.'
        : '서류가 첨부되었습니다.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }
  catch {
    toast.add({ title: '업로드에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  input.value = ''
}

/* 첨부 파일 삭제 — 사업자등록증은 '반려' 상태에서만 호출됨(템플릿 v-if로 가드).
 * 대부업·보험 등 다른 종류는 별도 정책 없이 항상 삭제 가능. */
async function removeFile(id: number) {
  try {
    await api(`/contracts/files/${id}`, { method: 'DELETE' })
    await loadFiles()
    toast.add({ title: '첨부가 삭제되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch {
    toast.add({ title: '삭제에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

/* 업로드 안내 모달 → 확인 시 파일 선택 창 열기 */
type UploadTarget = 'biz' | 'loan' | 'insurance'
const UPLOAD_LABELS: Record<UploadTarget, string> = {
  biz: '사업자등록증',
  loan: '대부업등록증',
  insurance: '보험증권',
}
const bizInput = ref<HTMLInputElement>()
const loanInput = ref<HTMLInputElement>()
const insuranceInput = ref<HTMLInputElement>()

const uploadGuideOpen = ref(false)
const uploadTarget = ref<UploadTarget>('biz')

function requestUpload(target: UploadTarget) {
  uploadTarget.value = target
  uploadGuideOpen.value = true
}
function confirmUpload() {
  uploadGuideOpen.value = false
  const inputs: Record<UploadTarget, Ref<HTMLInputElement | undefined>> = {
    biz: bizInput,
    loan: loanInput,
    insurance: insuranceInput,
  }
  inputs[uploadTarget.value].value?.click()
}

/* 첨부 서류 미리보기 모달 — iframe은 Authorization 헤더를 못 싣기 때문에
 * 인증된 fetch로 blob을 받아 object URL로 표시. */
const previewOpen = ref(false)
const previewLabel = ref('')
const previewFile = ref<(DocFile & { url?: string }) | null>(null)
let lastObjectUrl: string | null = null
async function openPreview(label: string, f: DocFile) {
  previewLabel.value = label
  previewFile.value = { ...f }
  previewOpen.value = true
  try {
    const blob = await api<Blob>(`/contracts/files/${f.id}/download`, { responseType: 'blob' })
    if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = URL.createObjectURL(blob)
    previewFile.value = { ...f, url: lastObjectUrl }
  }
  catch {
    toast.add({ title: '파일을 불러오지 못했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
watch(previewOpen, (v) => {
  if (!v && lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = null
  }
})

/* 계약서 확인 / 체결 모달 */
const viewOpen = ref(false)
const viewTitle = ref('')
const signOpen = ref(false)
const signTarget = ref<Contract | null>(null)

function viewContract(c: Contract) {
  viewTitle.value = c.title
  viewOpen.value = true
}
function signContract(c: Contract) {
  signTarget.value = c
  signOpen.value = true
}
async function onSignCompleted() {
  const c = signTarget.value
  if (!c) return
  const wasRenewal = c.status === 'renew'
  try {
    await api(`/contracts/${c.id}/sign`, { method: 'POST' })
    await loadContracts()
    toast.add({
      title: wasRenewal
        ? '갱신 계약 체결로 기존 계약이 만료 처리되었습니다.'
        : '이용계약서 체결이 완료되었습니다.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
  }
  catch {
    toast.add({ title: '체결 처리에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  signTarget.value = null
}

function save() {
  toast.add({ title: '계약 관리 정보가 저장되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}
</script>

<template>
  <div class="ct-panel">
    <!-- 승인 상태 안내 카드 -->
    <div
      v-if="approvalState !== 'approved'"
      class="state-card"
      :class="approvalState"
    >
      <UIcon
        :name="approvalState === 'rejected' ? 'i-lucide-circle-x' : approvalState === 'reviewing' ? 'i-lucide-loader-circle' : 'i-lucide-clock'"
        class="state-icon"
      />
      <div class="state-text">
        <strong v-if="approvalState === 'pending'">사업자등록증을 등록해 주세요</strong>
        <strong v-else-if="approvalState === 'reviewing'">사업자등록증 심사 중입니다</strong>
        <strong v-else>사업자등록증 심사가 반려되었습니다</strong>
        <p v-if="approvalState === 'pending'">
          가입서류 첨부 영역에서 사업자등록증(PDF, 최대 10MB)을 업로드하시면 심사가 시작됩니다.
        </p>
        <p v-else-if="approvalState === 'reviewing'">
          영업일 기준 1~2일 내에 심사 결과를 안내드립니다. 추가 서류 첨부가 필요하면 가입서류 영역에서 진행할 수 있습니다.
        </p>
        <p v-else>
          반려 사유: <em>{{ auth.tenant?.rejectedReason || '관리자에게 문의해 주세요.' }}</em><br>
          사업자등록증을 새로 첨부하면 심사가 다시 시작됩니다.
        </p>
      </div>
    </div>

    <!-- 이용계약 체결 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>이용계약 체결</h3>
        <span class="ms-head-desc">
          전자계약 방식의 이용계약서 목록입니다. 좌측 아이콘으로 체결 상태를 확인하실 수 있습니다.
        </span>
      </div>

      <div class="ct-list">
        <div
          v-for="c in contracts"
          :key="c.title"
          class="ct-card"
          :class="c.status"
        >
          <div class="cc-status">
            <span class="cc-icon"><UIcon :name="c.icon" /></span>
            <span class="cc-status-label">{{ c.statusLabel }}</span>
          </div>

          <div class="cc-body">
            <span class="cc-title">{{ c.title }}</span>
            <div class="cc-metas">
              <span class="cc-ver">{{ c.version }}</span>
              <span
                v-for="(m, i) in c.metas"
                :key="i"
                class="cc-meta"
                :class="{ danger: m.danger }"
              >{{ m.text }}</span>
            </div>
          </div>

          <div class="cc-actions">
            <button type="button" class="btn btn-outline-dark btn-sm" @click="viewContract(c)">
              <UIcon name="i-lucide-search" class="text-[length:var(--fz-sm)]" /> 계약서 확인
            </button>
            <button
              v-if="c.canSign"
              type="button"
              class="btn btn-primary btn-sm"
              @click="signContract(c)"
            >
              <UIcon name="i-lucide-file-pen" class="text-[length:var(--fz-sm)]" /> 계약체결하기
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 가입서류 첨부 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>가입서류 첨부</h3>
        <span class="ms-head-desc">PDF 파일만 첨부 가능합니다 · 최대 10MB</span>
      </div>

      <!-- 사업자등록증 -->
      <div class="doc-block">
        <div class="doc-head">
          <span class="doc-label">사업자등록증</span>
          <span class="badge badge-error">필수</span>
          <div class="doc-head-actions">
            <button type="button" class="btn btn-primary btn-sm doc-upload" @click="requestUpload('biz')">
              <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 사업자등록증 업로드
            </button>
          </div>
          <input ref="bizInput" type="file" accept="application/pdf" hidden @change="pickFile('biz', $event)">
        </div>
        <div class="doc-files">
          <div v-for="f in bizFiles" :key="f.id" class="doc-file">
            <UIcon name="i-lucide-file-text" class="df-icon" />
            <span class="df-info">
              <span class="df-name">{{ f.name }}</span>
              <span class="df-meta">{{ f.size }} · 첨부일자 {{ f.at }}</span>
            </span>
            <span v-if="bizStatus" class="df-status" :class="bizStatus">
              <UIcon
                :name="bizStatus === 'approved' ? 'i-lucide-circle-check' : bizStatus === 'rejected' ? 'i-lucide-circle-x' : 'i-lucide-loader-circle'"
              />
              {{ BIZ_STATUS_LABEL[bizStatus] }}
            </span>
            <button type="button" class="btn btn-outline-dark btn-sm" @click="openPreview('사업자등록증', f)">확인</button>
            <button
              v-if="bizStatus === 'rejected'"
              type="button"
              class="btn btn-sm df-remove"
              @click="removeFile(f.id)"
            >
              삭제
            </button>
          </div>
          <p v-if="!bizFiles.length" class="doc-empty">첨부된 사업자등록증이 없습니다.</p>
        </div>
      </div>

      <!-- 대부업등록증 -->
      <div class="doc-block">
        <div class="doc-head">
          <span class="doc-label">대부업등록증</span>
          <span class="badge badge-neutral">해당업체</span>
          <div class="doc-head-actions">
            <label class="doc-check">
              <input v-model="loanApplicable" type="checkbox" class="checkbox">
              <span>대부업 해당</span>
            </label>
            <button
              v-if="loanApplicable"
              type="button"
              class="btn btn-primary btn-sm doc-upload"
              @click="requestUpload('loan')"
            >
              <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 대부업등록증 업로드
            </button>
          </div>
          <input ref="loanInput" type="file" accept="application/pdf" hidden @change="pickFile('loan', $event)">
        </div>
        <div v-if="!loanApplicable" class="doc-note">
          <UIcon name="i-lucide-info" class="dn-icon" />
          대부업에 해당하는 업체만 등록증을 첨부하시면 됩니다. 우측 체크박스를 선택하여 첨부 인터페이스를 활성화해 주세요.
        </div>
        <div v-else class="doc-files">
          <div v-for="f in loanFiles" :key="f.name + f.at" class="doc-file">
            <UIcon name="i-lucide-file-text" class="df-icon" />
            <span class="df-info">
              <span class="df-name">{{ f.name }}</span>
              <span class="df-meta">{{ f.size }} · 첨부일자 {{ f.at }}</span>
            </span>
            <button type="button" class="btn btn-outline-dark btn-sm" @click="openPreview('대부업등록증', f)">확인</button>
          </div>
          <p v-if="!loanFiles.length" class="doc-empty">첨부된 대부업등록증이 없습니다.</p>
        </div>
      </div>

      <!-- 지급이행보증보험증권 -->
      <div class="doc-block">
        <div class="doc-head">
          <span class="doc-label">지급이행보증보험증권</span>
          <span class="badge badge-neutral">해당업체</span>
          <div class="doc-head-actions">
            <label class="doc-check">
              <input v-model="insuranceApplicable" type="checkbox" class="checkbox">
              <span>후불 정산 해당</span>
            </label>
            <button
              v-if="insuranceApplicable"
              type="button"
              class="btn btn-primary btn-sm doc-upload"
              @click="requestUpload('insurance')"
            >
              <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 지급이행보증보험증권 업로드
            </button>
          </div>
          <input ref="insuranceInput" type="file" accept="application/pdf" hidden @change="pickFile('insurance', $event)">
        </div>
        <div v-if="!insuranceApplicable" class="doc-note">
          <UIcon name="i-lucide-info" class="dn-icon" />
          후불 정산을 이용하는 업체만 보험증권을 첨부하시면 됩니다. 우측 체크박스를 선택하여 첨부 인터페이스를 활성화해 주세요.
        </div>
        <div v-else class="doc-files">
          <div v-for="f in insuranceFiles" :key="f.name + f.at" class="doc-file">
            <UIcon name="i-lucide-file-text" class="df-icon" />
            <span class="df-info">
              <span class="df-name">{{ f.name }}</span>
              <span class="df-meta">{{ f.size }} · 첨부일자 {{ f.at }}</span>
            </span>
            <button type="button" class="btn btn-outline-dark btn-sm" @click="openPreview('지급이행보증보험증권', f)">확인</button>
          </div>
          <p v-if="!insuranceFiles.length" class="doc-empty">첨부된 보험증권이 없습니다.</p>
        </div>
      </div>
    </section>

    <div class="ms-actions">
      <button type="button" class="btn btn-primary btn-lg save-btn" @click="save">
        저장하기
      </button>
    </div>

    <AppUploadGuideDialog
      :open="uploadGuideOpen"
      :doc-label="UPLOAD_LABELS[uploadTarget]"
      @close="uploadGuideOpen = false"
      @confirm="confirmUpload"
    />

    <AppFilePreviewDialog
      :open="previewOpen"
      :doc-label="previewLabel"
      :file="previewFile"
      @close="previewOpen = false"
    />

    <AppContractViewDialog
      :open="viewOpen"
      :title="viewTitle"
      @close="viewOpen = false"
    />
    <AppContractSignDialog
      :open="signOpen"
      title="표준 이용계약서"
      @close="signOpen = false"
      @completed="onSignCompleted"
    />
  </div>
</template>

<style scoped>
/* 승인 상태 카드 */
.state-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 18px;
  margin-bottom: 24px;
  border: 1px solid var(--warning-line);
  border-radius: var(--r-md);
  background: var(--warning-soft);
}
.state-card.reviewing {
  border-color: var(--info-line);
  background: var(--info-soft);
}
.state-card.rejected {
  border-color: var(--danger);
  background: #fef2f2;
}
.state-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--warning-ink);
}
.state-card.reviewing .state-icon { color: var(--info-ink); }
.state-card.rejected .state-icon { color: var(--danger-ink); }
.state-text { flex: 1; min-width: 0; }
.state-text strong {
  display: block;
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 4px;
}
.state-text p {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.55;
  margin: 0;
}
.state-text em {
  font-style: normal;
  font-weight: 600;
  color: var(--danger-ink);
}

.ms-sec + .ms-sec { margin-top: 40px; }
.ms-head {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding-bottom: 12px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.ms-head-desc {
  margin-left: auto;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  text-align: right;
}

/* 계약 카드 */
.ct-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ct-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
}
.ct-card.initial {
  background: var(--info-soft);
  border-color: var(--info-line);
}
.ct-card.renew {
  background: var(--warning-soft);
  border-color: var(--warning-line);
}
.ct-card.expired {
  background: var(--ink-50);
}

.cc-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 64px;
  flex-shrink: 0;
}
.cc-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-md);
  background: var(--white);
  border: 1px solid var(--line);
  font-size: var(--fz-xl);
  color: var(--ink-500);
}
.ct-card.initial .cc-icon { color: var(--info); border-color: var(--info-line); }
.ct-card.done .cc-icon { color: var(--success); border-color: var(--accent); }
.ct-card.renew .cc-icon { color: var(--warning); border-color: var(--warning-line); }
.ct-card.expired .cc-icon { color: var(--ink-400); }
.cc-status-label {
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-500);
}
.ct-card.initial .cc-status-label { color: var(--info-ink); }
.ct-card.done .cc-status-label { color: var(--success-ink); }
.ct-card.renew .cc-status-label { color: var(--warning-ink); }
.ct-card.expired .cc-status-label { color: var(--ink-400); }
.ct-card.expired .cc-title { color: var(--ink-500); }

.cc-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cc-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}
.cc-metas {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 12px;
}
.cc-ver {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: var(--r-full);
  background: var(--ink-100);
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  font-weight: 600;
  color: var(--ink-600);
}
.cc-meta {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.cc-meta.danger {
  color: var(--danger-ink);
  font-weight: 600;
}

.cc-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 가입서류 첨부 */
.doc-block + .doc-block {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}
.doc-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.doc-label {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.doc-head-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.doc-upload {
  cursor: pointer;
}
.doc-check {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--fz-sm);
  color: var(--ink-700);
  cursor: pointer;
}

.doc-files {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.doc-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
.df-icon {
  font-size: var(--fz-xl);
  color: var(--danger);
  flex-shrink: 0;
}
.df-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.df-name {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.df-meta {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.df-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: var(--r-full);
  font-size: var(--fz-xs);
  font-weight: 600;
  line-height: 1;
}
.df-status :deep(svg), .df-status :deep(span > svg) {
  width: 14px;
  height: 14px;
}
.df-status.reviewing {
  background: var(--info-soft);
  color: var(--info-ink);
}
.df-status.approved {
  background: var(--accent-soft);
  color: var(--success-ink);
}
.df-status.rejected {
  background: #fef2f2;
  color: var(--danger-ink);
}
.df-remove {
  border: 1px solid var(--danger);
  color: var(--danger-ink);
  background: var(--white);
}
.df-remove:hover {
  background: #fef2f2;
}
.doc-empty {
  padding: 22px 12px;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-400);
  border: 1px dashed var(--line);
  border-radius: var(--r-md);
  margin: 0;
}

.doc-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 13px 14px;
  border-radius: var(--r-md);
  background: var(--ink-50);
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.55;
}
.dn-icon {
  font-size: var(--fz-md);
  color: var(--ink-400);
  flex-shrink: 0;
  margin-top: 1px;
}

.ms-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}
.save-btn {
  min-width: 160px;
  font-weight: 600;
}

@media (max-width: 720px) {
  .ct-card { flex-wrap: wrap; }
  .cc-actions { width: 100%; justify-content: flex-end; }
  .ms-head { flex-wrap: wrap; }
  .ms-head-desc { margin-left: 0; text-align: left; }
}
</style>
