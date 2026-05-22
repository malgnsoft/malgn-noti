<script setup lang="ts">
const toast = useToast()

interface Meta {
  text: string
  danger?: boolean
}
interface Contract {
  status: 'initial' | 'done' | 'renew' | 'expired'
  statusLabel: string
  icon: string
  title: string
  version: string
  metas: Meta[]
  canSign: boolean
}

/* 이용계약 목록 (목업 — 백엔드 연동 시 교체) */
const contracts = ref<Contract[]>([
  {
    status: 'initial',
    statusLabel: '최초계약',
    icon: 'i-lucide-square-pen',
    title: '최초 이용계약 온라인체결',
    version: '신규',
    metas: [
      { text: '회원가입 후 최초 1회 체결이 필요합니다.' },
      { text: '요청일 2026.05.21 17:37' },
    ],
    canSign: true,
  },
  {
    status: 'done',
    statusLabel: '체결완료',
    icon: 'i-lucide-circle-check',
    title: '맑은소프트 메시징 이용계약서 (2022년 구표준)',
    version: 'v0.9',
    metas: [
      { text: '서명자 하근호' },
      { text: '체결 2022.06.02 09:30' },
      { text: '만료 2026.04.19' },
    ],
    canSign: false,
  },
  {
    status: 'renew',
    statusLabel: '계약갱신',
    icon: 'i-lucide-circle-alert',
    title: '맑은소프트 메시징 이용계약서 (2026년 신규)',
    version: 'v2.0',
    metas: [
      { text: '요청일 2026.05.01 09:00' },
      { text: '체결마감 2026.05.31', danger: true },
    ],
    canSign: true,
  },
])

interface DocFile {
  name: string
  size: string
  at: string
  url?: string
}

/* 사업자등록증 첨부 파일 */
const bizFiles = ref<DocFile[]>([
  { name: '사업자등록증_맑은소프트_20260521.pdf', size: '412.0 KB', at: '2026.05.21 17:37' },
  { name: '사업자등록증_맑은소프트_20230110.pdf', size: '412.0 KB', at: '2023.01.10 11:08' },
])
const loanFiles = ref<DocFile[]>([])
const insuranceFiles = ref<DocFile[]>([])

/* 해당 여부 체크박스 */
const loanApplicable = ref(false)
const insuranceApplicable = ref(false)

function nowStamp() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function expiryStamp() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 2)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

function pickFile(target: 'biz' | 'loan' | 'insurance', e: Event) {
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
  const entry: DocFile = {
    name: file.name,
    size: `${(file.size / 1024).toFixed(1)} KB`,
    at: nowStamp(),
    url: URL.createObjectURL(file),
  }
  const map = { biz: bizFiles, loan: loanFiles, insurance: insuranceFiles }
  map[target].value = [entry, ...map[target].value]
  input.value = ''
  toast.add({ title: '서류가 첨부되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
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

/* 첨부 서류 미리보기 모달 */
const previewOpen = ref(false)
const previewLabel = ref('')
const previewFile = ref<DocFile | null>(null)
function openPreview(label: string, f: DocFile) {
  previewLabel.value = label
  previewFile.value = f
  previewOpen.value = true
}

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
function onSignCompleted() {
  const c = signTarget.value
  if (c) {
    const wasRenewal = c.status === 'renew'
    c.status = 'done'
    c.statusLabel = '체결완료'
    c.icon = 'i-lucide-circle-check'
    c.canSign = false
    c.metas = [
      { text: '서명자 하근호' },
      { text: `체결 ${nowStamp()}` },
      { text: `만료 ${expiryStamp()}` },
    ]
    /* 갱신 계약 체결 시 기존 계약은 모두 만료 처리 */
    if (wasRenewal) {
      for (const other of contracts.value) {
        if (other === c || other.status === 'expired') continue
        other.status = 'expired'
        other.statusLabel = '만료'
        other.icon = 'i-lucide-archive'
        other.canSign = false
      }
      toast.add({ title: '갱신 계약 체결로 기존 계약이 만료 처리되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
      signTarget.value = null
      return
    }
  }
  signTarget.value = null
  toast.add({ title: '이용계약서 체결이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}

function save() {
  toast.add({ title: '계약 관리 정보가 저장되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}
</script>

<template>
  <div class="ct-panel">
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
          <div v-for="f in bizFiles" :key="f.name + f.at" class="doc-file">
            <UIcon name="i-lucide-file-text" class="df-icon" />
            <span class="df-info">
              <span class="df-name">{{ f.name }}</span>
              <span class="df-meta">{{ f.size }} · 첨부일자 {{ f.at }}</span>
            </span>
            <button type="button" class="btn btn-outline-dark btn-sm" @click="openPreview('사업자등록증', f)">확인</button>
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
