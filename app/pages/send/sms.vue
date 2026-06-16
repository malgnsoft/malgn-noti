<script setup lang="ts">
import type { Recipient } from '~/types/recipient'
import type { SmsSendRecipient, SmsSendResult } from '~/types/send'

useHead({ title: '문자메시지 발송' })

const toast = useToast()
const router = useRouter()
const api = useApi()

interface Tpl { id: number, name: string, subject?: string, body: string, vars: string[], type?: string, images?: { name: string, size: number }[] }

// 발신번호 — GET /sender-phones 실데이터
const { phones: senderPhones, load: loadSenderPhones, pending: sendersPending, error: sendersError } = useSenderPhones()
const senderPhoneId = ref<number | null>(null)
const selectedSender = computed(() => senderPhones.value.find(p => p.id === senderPhoneId.value) ?? null)
onMounted(loadSenderPhones)
const useTemplate = ref<'off' | 'on'>('off')
const template = ref<Tpl | null>(null)
const purpose = ref<'info' | 'ad' | 'auth'>('info')
const smsType = ref<'sms' | 'lms' | 'mms'>('sms')
const subject = ref('')
const body = ref('')
const files = ref<{ name: string, size: number }[]>([])
const adNumber = ref<string | null>(null)
const substitutionMode = ref<'common' | 'individual'>('common')
const commonVars = ref<Record<string, string>>({})

const recipients = ref<Recipient[]>([])
// 주소록 '선택 발송'으로 인계된 수신자 반영
const pendingRecipients = useState<Recipient[]>('sendRecipients', () => [])
onMounted(() => {
  if (pendingRecipients.value.length) {
    recipients.value = [...pendingRecipients.value]
    pendingRecipients.value = []
  }
})
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '2026-05-19', hour: '10', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openTpl = ref(false)
const openAi = ref(false)
const openAd = ref(false)
const openConfirm = ref(false)
const openReset = ref(false)

const varKeys = computed(() => {
  const found = body.value.match(/#\{([^}]+)\}/g) || []
  return [...new Set(found.map(s => s.slice(2, -1)))]
})
const showSubst = computed(() => useTemplate.value === 'on' && varKeys.value.length > 0)
const showSubject = computed(() => smsType.value === 'lms' || smsType.value === 'mms')
const showAttach = computed(() => smsType.value === 'mms')
const counterMax = computed(() => smsType.value === 'sms' ? 90 : 2000)
const tplLock = computed(() => useTemplate.value === 'on')
// MMS 템플릿이 적용되면 첨부 이미지는 템플릿 값으로 자동 설정 · 수정 불가
const attachLocked = computed(() => tplLock.value && template.value?.type === 'mms')
// 백엔드 SMS_PRICING 과 일치 (sms 9.9 / lms 30 / mms 100)
const pricePerUnit = computed(() => smsType.value === 'mms' ? 100 : smsType.value === 'lms' ? 30 : 9.9)

// SMS 90바이트 / LMS·MMS 제목 필수 — 백엔드 검증과 일치하는 인라인 안내
const bodyByteLen = computed(() => byteLen(body.value))
const smsOverByte = computed(() => smsType.value === 'sms' && bodyByteLen.value > 90)
const subjectMissing = computed(() => (smsType.value === 'lms' || smsType.value === 'mms') && !subject.value.trim())

// 발송 목적이 광고용이면 제목 앞에 (광고)를 자동·강제로 부착
const AD_PREFIX = '(광고)'
watch(purpose, (val, old) => {
  if (val === 'ad') {
    if (!subject.value.startsWith(AD_PREFIX)) subject.value = `${AD_PREFIX} ${subject.value}`.trimEnd()
  }
  else if (old === 'ad' && subject.value.startsWith(AD_PREFIX)) {
    subject.value = subject.value.slice(AD_PREFIX.length).replace(/^\s+/, '')
  }
})
watch(subject, (v) => {
  if (purpose.value === 'ad' && !v.startsWith(AD_PREFIX)) subject.value = `${AD_PREFIX} ${v}`.trimEnd()
})

function applyTemplate(t: Tpl) {
  template.value = t
  smsType.value = (t.type as 'sms' | 'lms' | 'mms') || 'sms'
  if (t.subject) subject.value = t.subject
  body.value = t.body
  // MMS 템플릿은 첨부 이미지를 템플릿 값으로 자동 설정, 그 외 유형은 첨부 비움
  files.value = t.type === 'mms' && t.images ? t.images.map(f => ({ ...f })) : []
  toast.add({ title: `"${t.name}" 템플릿을 적용했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}

interface SmsMessageSnapshot {
  purpose: 'info' | 'ad' | 'auth'
  smsType: 'sms' | 'lms' | 'mms'
  subject: string
  body: string
  files: { name: string, size: number }[]
  adNumber: string | null
}

// 메시지 설정 + 템플릿만 초기화 (수신자·치환자·발송설정·발신번호는 유지)
function resetMessage() {
  template.value = null
  purpose.value = 'info'
  smsType.value = 'sms'
  subject.value = ''
  body.value = ''
  files.value = []
  adNumber.value = null
}

// 템플릿 사용유무 토글: 사용→메시지 초기화, 사용 안 함→이전 입력 복원. 수신자는 항상 유지.
const { setSilently } = useTemplateToggle<SmsMessageSnapshot>({
  state: useTemplate,
  capture: () => ({
    purpose: purpose.value,
    smsType: smsType.value,
    subject: subject.value,
    body: body.value,
    files: [...files.value],
    adNumber: adNumber.value,
  }),
  restore: (s) => {
    purpose.value = s.purpose
    smsType.value = s.smsType
    subject.value = s.subject
    body.value = s.body
    files.value = [...s.files]
    adNumber.value = s.adNumber
  },
  reset: resetMessage,
  onToggle: to => toast.add({
    title: to === 'on'
      ? '템플릿 사용 — 메시지 설정을 초기화했습니다.'
      : '템플릿 사용 안 함 — 이전에 입력한 메시지 설정을 복원했습니다.',
    color: 'info',
    icon: 'i-lucide-info',
  }),
})

// 전체 초기화 (초기화 버튼)
function handleReset() {
  setSilently('off')
  resetMessage()
  recipients.value = []
  selectedRcpt.value = []
  substitutionMode.value = 'common'
  commonVars.value = {}
  sendOptions.value = { mode: 'now', date: '', hour: '09', minute: '00' }
  senderPhoneId.value = null
  openReset.value = false
  toast.add({ title: '입력 내용을 초기화했습니다.', color: 'info', icon: 'i-lucide-info' })
}

function onPurpose(p: string) {
  purpose.value = p as 'info' | 'ad' | 'auth'
  if (p === 'ad' && !adNumber.value) openAd.value = true
}

function onAddManual(target: Recipient | undefined) {
  editTarget.value = target || null
  openManual.value = true
}
function onManualConfirm(r: Recipient) {
  if (editTarget.value) {
    recipients.value = recipients.value.map(x => x.id === r.id ? r : x)
  }
  else {
    recipients.value = [...recipients.value, r]
  }
}
function onAddrBookConfirm(items: Recipient[]) {
  recipients.value = [...recipients.value, ...items]
  toast.add({ title: `${items.length}명을 추가했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}

const imgInput = ref<HTMLInputElement | null>(null)
function onPickImages(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files || [])
  input.value = ''
  for (const f of picked) {
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (ext !== 'jpg' && ext !== 'jpeg') {
      toast.add({ title: `${f.name}: JPG/JPEG 파일만 첨부할 수 있습니다.`, color: 'error', icon: 'i-lucide-octagon-alert' })
      continue
    }
    if (files.value.length >= 3) {
      toast.add({ title: '이미지는 최대 3장까지 첨부할 수 있습니다.', color: 'warning', icon: 'i-lucide-triangle-alert' })
      break
    }
    if (f.size > 300_000) {
      toast.add({ title: `${f.name}: 1장당 300KB 이내여야 합니다.`, color: 'error', icon: 'i-lucide-octagon-alert' })
      continue
    }
    if (files.value.reduce((s, x) => s + x.size, 0) + f.size > 800_000) {
      toast.add({ title: '첨부 합산 용량 800KB를 초과했습니다.', color: 'error', icon: 'i-lucide-octagon-alert' })
      break
    }
    files.value = [...files.value, { name: f.name, size: f.size }]
  }
}

// 수신자별 치환변수 매핑 — 공통/개별 모드 반영. 치환자가 없으면 vars 생략.
function buildVars(r: Recipient): Record<string, string> | undefined {
  if (varKeys.value.length === 0) return undefined
  const out: Record<string, string> = {}
  if (substitutionMode.value === 'common') {
    for (const k of varKeys.value) out[k] = commonVars.value[k] ?? ''
  }
  else {
    for (const k of varKeys.value) out[k] = r.vars?.[k] ?? ''
  }
  return out
}

interface ApiErrorData { code?: string, message?: string, details?: unknown }
function extractError(e: unknown): ApiErrorData {
  const data = (e as { data?: ApiErrorData })?.data
  return data ?? { message: '발송에 실패했습니다. 잠시 후 다시 시도하세요.' }
}

const sending = ref(false)

async function send() {
  if (sending.value) return

  // 프론트 선검증 (백엔드 검증과 일치)
  if (!senderPhoneId.value) {
    toast.add({ title: '발신 번호를 선택하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (smsType.value === 'mms') {
    toast.add({ title: 'MMS는 준비 중입니다. SMS 또는 LMS로 발송하세요.', color: 'warning', icon: 'i-lucide-triangle-alert' })
    return
  }
  if (subjectMissing.value) {
    toast.add({ title: 'LMS는 제목이 필요합니다.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (smsOverByte.value) {
    toast.add({ title: 'SMS는 90바이트 이하만 가능합니다. LMS로 전환하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }

  const payload = {
    senderPhoneId: senderPhoneId.value,
    purpose: purpose.value,
    smsType: smsType.value,
    subject: showSubject.value ? subject.value : undefined,
    body: body.value,
    hasAttachment: false,
    recipients: recipients.value
      .filter(r => !!r.phone)
      .map<SmsSendRecipient>(r => ({
        name: r.name || undefined,
        phone: r.phone as string,
        vars: buildVars(r),
      })),
  }

  if (payload.recipients.length === 0) {
    toast.add({ title: '휴대폰 번호가 있는 수신자가 없습니다.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }

  sending.value = true
  try {
    const res = await api<{ data: SmsSendResult }>('/send/sms', {
      method: 'POST',
      headers: { 'Idempotency-Key': crypto.randomUUID() },
      body: payload,
    })
    const r = res.data
    openConfirm.value = false
    const optoutNote = r.optoutFiltered > 0 ? ` (수신거부 ${r.optoutFiltered}건 제외)` : ''
    toast.add({
      title: `${r.recipientCount.toLocaleString()}명에게 발송 접수되었습니다${optoutNote}`,
      description: `차감 크레딧 ${r.totalCredit.toLocaleString()} C · 단가 ${r.unitPrice} C`,
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    setTimeout(() => router.push('/history/sms'), 1000)
  }
  catch (e) {
    const err = extractError(e)
    const detail = err.details && typeof err.details === 'object'
      ? Object.values(err.details as Record<string, string>)[0]
      : undefined
    toast.add({
      title: '발송 실패',
      description: detail || err.message || '발송에 실패했습니다.',
      color: 'error',
      icon: 'i-lucide-octagon-alert',
    })
  }
  finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · 문자메시지
      </div>
      <h1>문자메시지 발송</h1>
      <p>SMS · LMS · MMS 단발 발송. 한 건당 9.9 C부터.</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px">
      <!-- 템플릿 선택 -->
      <AppSendFormCard title="템플릿 선택">
        <AppFormRow label="템플릿 사용유무">
          <AppRadioGroup
            v-model="useTemplate"
            :options="[
              { value: 'off', label: '사용 안 함' },
              { value: 'on', label: '사용' },
            ]"
          />
        </AppFormRow>
        <AppFormRow label="템플릿 선택">
          <div class="row" style="gap: 12px; flex-wrap: wrap">
            <span style="font-size: var(--fz-md); color: var(--ink-900)">
              {{ template ? template.name : '선택된 템플릿 없음' }}
            </span>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="useTemplate === 'off'"
              @click="openTpl = true"
            >
              선택
            </button>
          </div>
        </AppFormRow>
      </AppSendFormCard>

      <!-- 수신자 설정 -->
      <AppRecipientCard
        title="수신자 설정"
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        v-model:substitution-mode="substitutionMode"
        v-model:common-vars="commonVars"
        key-column="phone"
        :show-vars="varKeys.length > 0"
        :var-keys="varKeys"
        :show-substitution="showSubst"
        @add-manual="onAddManual"
        @address-book="openAddrBook = true"
      />

      <!-- 메시지 설정 -->
      <AppSendFormCard title="메시지 설정" required>
        <template v-if="tplLock" #headerRight>
          <AppBadge tone="neutral">
            <UIcon name="i-lucide-lock" class="text-[length:var(--fz-2xs)]" /> 템플릿 잠금
          </AppBadge>
        </template>
        <div class="msg-grid">
          <div class="col">
            <AppFormRow
              label="발신 번호"
              required
              help="전기통신사업법 관련 고시 준수를 위해 발신 번호 등록 시 발신 번호에 대한 명의자 인증이 필요합니다. [발신 정보 > 발신 번호 관리] 메뉴에서 발신 번호를 사전 등록하세요."
            >
              <select
                class="select"
                style="max-width: 340px"
                :disabled="sendersPending"
                :value="senderPhoneId ?? ''"
                @change="senderPhoneId = Number(($event.target as HTMLSelectElement).value) || null"
              >
                <option value="">
                  {{ sendersPending ? '불러오는 중…' : '선택하세요' }}
                </option>
                <option
                  v-for="p in senderPhones"
                  :key="p.id"
                  :value="p.id"
                  :disabled="p.approvalState !== '승인'"
                >
                  {{ p.number }}{{ p.type ? ` (${p.type})` : '' }}{{ p.approvalState === '승인' ? '' : ` · ${p.approvalState}` }}
                </option>
              </select>
              <div v-if="sendersError" class="inline-help" style="color: var(--danger-ink); margin-top: 6px">
                {{ sendersError }}
              </div>
              <div v-else-if="!sendersPending && senderPhones.length === 0" class="inline-help" style="margin-top: 6px">
                등록된 발신 번호가 없습니다. [발신 정보 &gt; 발신 번호 관리]에서 먼저 등록하세요.
              </div>
            </AppFormRow>
            <AppFormRow
              label="발송 목적"
              required
              help="광고성 정보 발송 시 수신자가 수신 거부나 수신 동의 철회를 무료로 할 수 있도록 무료 수신 거부 방법을 반드시 포함해야 합니다."
            >
              <AppRadioGroup
                :model-value="purpose"
                :disabled="tplLock"
                :options="[
                  { value: 'info', label: '일반용' },
                  { value: 'auth', label: '인증용' },
                  { value: 'ad', label: '광고용' },
                ]"
                @update:model-value="onPurpose"
              />
              <div v-if="purpose === 'ad'" class="recipient-summary" style="margin-top: 8px">
                <UIcon name="i-lucide-megaphone" class="text-sm" />
                <span>광고 메시지 — 080 수신거부 번호 자동 부착됨</span>
                <button type="button" class="btn btn-ghost btn-sm" style="margin-left: auto" @click="openAd = true">
                  변경
                </button>
              </div>
            </AppFormRow>
            <AppFormRow
              label="발송 유형"
              required
              help="광고성 정보 발송 시 수신자가 수신 거부나 수신 동의 철회를 무료로 할 수 있도록 무료 수신 거부 방법을 반드시 포함해야 합니다."
            >
              <AppRadioGroup
                :model-value="smsType"
                :disabled="tplLock"
                :options="[
                  { value: 'sms', label: 'SMS' },
                  { value: 'lms', label: 'LMS' },
                  { value: 'mms', label: 'MMS', disabled: true, hint: '준비중' },
                ]"
                @update:model-value="(v) => { smsType = v as 'sms' | 'lms' | 'mms'; if (v !== 'mms') files = [] }"
              />
            </AppFormRow>
            <AppFormRow v-if="showSubject" label="제목" required>
              <div style="position: relative">
                <input v-model="subject" class="input" placeholder="LMS/MMS 제목 (40 byte 이내)" style="padding-right: 110px">
                <AppByteCounter :value="subject" :max="40" />
              </div>
              <div v-if="subjectMissing" class="inline-help" style="color: var(--danger-ink); margin-top: 6px">
                {{ smsType.toUpperCase() }}는 제목이 필요합니다.
              </div>
            </AppFormRow>
            <AppFormRow label="내용" required>
              <div style="display: flex; justify-content: flex-end; margin-bottom: 8px">
                <button type="button" class="btn btn-outline btn-sm" :disabled="tplLock" @click="openAi = true">
                  <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-sm)]" style="color: var(--accent-ink)" /> AI 문장 다듬기
                </button>
              </div>
              <div style="position: relative">
                <textarea
                  v-model="body"
                  class="textarea"
                  rows="10"
                  placeholder="내용을 입력하세요. 치환자는 #{이름}, #{주문번호} 형식으로 작성합니다."
                  style="padding-bottom: 42px"
                />
                <div class="sms-counter">
                  <div>국내 SMS {{ byteLen(body) }}/{{ counterMax }}Bytes(EUC-KR)</div>
                  <div>국제 SMS {{ body.length }}/765자(GSM-7)</div>
                </div>
              </div>
              <div v-if="smsOverByte" class="inline-help" style="color: var(--danger-ink); margin-top: 6px">
                SMS 본문이 90바이트({{ bodyByteLen }}B)를 초과했습니다. LMS로 전환하세요.
              </div>
            </AppFormRow>
            <AppFormRow
              v-if="showAttach"
              label="이미지 첨부"
              help="JPG/JPEG · 최대 3장 · 1장 300KB / 총 800KB 이내 · 1000×1000 이하"
            >
              <div class="row" style="flex-wrap: wrap; gap: 8px">
                <div v-for="(f, i) in files" :key="i" class="file-chip" :class="{ locked: attachLocked }">
                  <UIcon :name="attachLocked ? 'i-lucide-lock' : 'i-lucide-image'" class="text-[length:var(--fz-sm)]" />
                  {{ f.name }}
                  <span v-if="!attachLocked" class="remove" @click="files = files.filter((_, j) => j !== i)">
                    <UIcon name="i-lucide-x" class="text-[length:var(--fz-sm)]" />
                  </span>
                </div>
                <input
                  ref="imgInput"
                  type="file"
                  accept=".jpg,.jpeg,image/jpeg"
                  multiple
                  style="display: none"
                  @change="onPickImages"
                >
                <button
                  v-if="!attachLocked && files.length < 3"
                  type="button"
                  class="btn btn-outline btn-sm"
                  @click="imgInput?.click()"
                >
                  <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 이미지 선택
                </button>
              </div>
              <div v-if="attachLocked" class="attach-locked-hint">
                <UIcon name="i-lucide-lock" class="text-[length:var(--fz-xs)]" />
                템플릿에 포함된 이미지로 자동 설정되었습니다. (수정 불가)
              </div>
            </AppFormRow>
          </div>

          <div>
            <div style="font-size: var(--fz-sm); color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <div style="display: grid; place-items: center">
              <AppPhonePreview :sender-name="selectedSender?.number || '발신번호'" :message="body" :images="showAttach ? files : []" />
            </div>
            <div class="row" style="justify-content: center; margin-top: 10px; gap: 8px">
              <AppBadge :tone="smsType === 'sms' ? 'primary' : 'neutral'">
                SMS
              </AppBadge>
              <AppBadge :tone="smsType === 'lms' ? 'primary' : 'neutral'">
                LMS
              </AppBadge>
              <AppBadge :tone="smsType === 'mms' ? 'primary' : 'neutral'">
                MMS
              </AppBadge>
            </div>
          </div>
        </div>
      </AppSendFormCard>

      <!-- 발송 설정 (v1 — 예약 발송 준비중, 즉시 발송만) -->
      <AppSendOptionsCard v-model="sendOptions" :step="4" schedule-disabled />
    </div>

    <AppSendActionsBar
      :send-disabled="recipients.length === 0 || !body || !senderPhoneId || sending"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

    <!-- Modals -->
    <AppAddressBookDialog
      :open="openAddrBook"
      key-column="phone"
      @close="openAddrBook = false"
      @confirm="onAddrBookConfirm"
    />
    <AppRecipientFormDialog
      :open="openManual"
      :edit="editTarget"
      key-column="phone"
      :var-keys="substitutionMode === 'individual' ? varKeys : []"
      @close="openManual = false"
      @confirm="onManualConfirm"
    />
    <AppSmsTemplateDialog
      :open="openTpl"
      @close="openTpl = false"
      @pick="applyTemplate"
    />
    <AppAIRewriteDialog
      :open="openAi"
      :value="body"
      :sender-name="selectedSender?.number || ''"
      @close="openAi = false"
      @apply="body = $event"
    />
    <AppAdNoticeSms080Dialog
      :open="openAd"
      @close="openAd = false"
      @confirm="(n) => { adNumber = n; openAd = false; toast.add({ title: '광고 번호가 적용되었습니다.', color: 'success', icon: 'i-lucide-circle-check' }) }"
    />
    <AppConfirmDialog
      :open="openReset"
      title="입력 초기화"
      message="입력하신 모든 내용이 사라집니다. 정말 초기화하시겠습니까?"
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="handleReset"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      :channel="`SMS (${smsType.toUpperCase()})`"
      :count="recipients.length"
      :price-per-unit="pricePerUnit"
      :loading="sending"
      :schedule-at="null"
      @close="!sending && (openConfirm = false)"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.msg-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}
@media (max-width: 1023px) {
  .msg-grid { grid-template-columns: 1fr; }
}
.sms-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  line-height: 1.5;
  color: var(--ink-400);
  pointer-events: none;
}
.file-chip.locked {
  background: var(--ink-50);
  color: var(--ink-600);
  cursor: default;
}
.attach-locked-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
</style>
