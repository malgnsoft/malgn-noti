<script setup lang="ts">
import type { Recipient } from '~/types/recipient'
import type { RcsTpl } from '~/types/template'

useHead({ title: 'RCS 발송' })
const toast = useToast()
const router = useRouter()

const useTemplate = ref<'off' | 'on'>('off')
const brand = ref('')
const senderNumber = ref('')
const purpose = ref('info')
const msgType = ref('sms')
const deliveryType = ref('standalone')
const fallback = ref('sms')
const body = ref('')
const hasImage = ref(false)
const buttons = ref<{ type: string, label: string }[]>([])
const expiry = ref('24h')
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
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)
const openButton = ref(false)
const openTpl = ref(false)
const openAi = ref(false)

const brandName = computed(() => brand.value === 'molly' ? '몰리몰리' : brand.value === 'malgn-cs' ? '맑은소프트 고객센터' : '브랜드')

const rcsTemplateName = ref('')
function onPickRcsTpl(t: RcsTpl) {
  rcsTemplateName.value = t.name
  // 템플릿에 담긴 메시지 설정값으로 각 항목 자동 선택/채움
  if (t.purpose) purpose.value = t.purpose
  if (t.msgType) msgType.value = t.msgType
  if (t.deliveryType) deliveryType.value = t.deliveryType
  if (t.fallback) fallback.value = t.fallback
  if (t.expiry) expiry.value = t.expiry
  body.value = t.body ?? ''
  hasImage.value = t.hasImage ?? false
  buttons.value = t.buttons ? t.buttons.map(b => ({ ...b })) : []
  toast.add({ title: `"${t.name}" 템플릿을 선택했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}
interface RcsMessageSnapshot {
  purpose: string
  msgType: string
  deliveryType: string
  fallback: string
  body: string
  hasImage: boolean
  buttons: { type: string, label: string }[]
  expiry: string
}

// 메시지 설정 + 템플릿만 초기화 (수신자·발송설정·발신 브랜드/번호는 유지)
function resetMessage() {
  rcsTemplateName.value = ''
  purpose.value = 'info'
  msgType.value = 'sms'
  deliveryType.value = 'standalone'
  fallback.value = 'sms'
  body.value = ''
  hasImage.value = false
  buttons.value = []
  expiry.value = '24h'
}

// 템플릿 사용유무 토글: 사용→메시지 초기화, 사용 안 함→이전 입력 복원. 수신자는 항상 유지.
const { setSilently } = useTemplateToggle<RcsMessageSnapshot>({
  state: useTemplate,
  capture: () => ({
    purpose: purpose.value,
    msgType: msgType.value,
    deliveryType: deliveryType.value,
    fallback: fallback.value,
    body: body.value,
    hasImage: hasImage.value,
    buttons: buttons.value.map(b => ({ ...b })),
    expiry: expiry.value,
  }),
  restore: (s) => {
    purpose.value = s.purpose
    msgType.value = s.msgType
    deliveryType.value = s.deliveryType
    fallback.value = s.fallback
    body.value = s.body
    hasImage.value = s.hasImage
    buttons.value = s.buttons.map(b => ({ ...b }))
    expiry.value = s.expiry
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

function handleReset() {
  setSilently('off')
  resetMessage()
  recipients.value = []
  selectedRcpt.value = []
  sendOptions.value = { mode: 'now', date: '', hour: '09', minute: '00' }
  brand.value = ''
  senderNumber.value = ''
  openReset.value = false
  toast.add({ title: '입력 내용을 초기화했습니다.', color: 'info', icon: 'i-lucide-info' })
}

function onManualConfirm(r: Recipient) {
  recipients.value = editTarget.value
    ? recipients.value.map(x => x.id === r.id ? r : x)
    : [...recipients.value, r]
}
function send() {
  openConfirm.value = false
  toast.add({ title: 'RCS 발송 시작', color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/rcs'), 1000)
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · RCS
      </div>
      <h1>RCS 발송</h1>
      <p>인증된 발신자 · 이미지 · 버튼이 가능한 고급 메시지. 12.0 C부터.</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px">
      <!-- 템플릿 선택 -->
      <AppSendFormCard title="템플릿 선택">
        <AppFormRow label="템플릿 사용유무">
          <AppRadioGroup
            v-model="useTemplate"
            :options="[{ value: 'off', label: '사용 안 함' }, { value: 'on', label: '사용' }]"
          />
        </AppFormRow>
        <AppFormRow label="템플릿 선택">
          <div class="row" style="gap: 12px; flex-wrap: wrap">
            <span style="font-size: var(--fz-md); color: var(--ink-900)">
              {{ rcsTemplateName || '선택된 템플릿 없음' }}
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
        key-column="phone"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <!-- 메시지 설정 -->
      <AppSendFormCard title="메시지 설정" required>
        <div class="msg-grid">
          <div class="col">
            <AppFormRow
              label="발신 브랜드"
              required
              help="브랜드를 연동하고 발신 브랜드와 대화방(발신 번호)을 선택하여 메시지를 발송할 수 있습니다. [발신 정보 > 브랜드 관리] 메뉴에서 브랜드를 연동하세요."
            >
              <div class="row" style="gap: 8px; flex-wrap: wrap">
                <select v-model="brand" class="select" style="min-width: 220px; flex: 1">
                  <option value="">
                    발신 브랜드 선택
                  </option>
                  <option value="malgn-default">
                    맑은소프트 (인증완료)
                  </option>
                  <option value="molly">
                    몰리몰리 (인증완료)
                  </option>
                  <option value="malgn-cs">
                    맑은소프트 고객센터 (인증대기)
                  </option>
                </select>
                <select v-model="senderNumber" class="select" style="min-width: 200px; flex: 1">
                  <option value="">
                    발신 번호 선택
                  </option>
                  <option value="1588-1234">
                    1588-1234
                  </option>
                  <option value="02-555-1234">
                    02-555-1234
                  </option>
                </select>
              </div>
            </AppFormRow>
            <AppFormRow
              label="발송 목적"
              required
              help="광고성 정보 발송 시 수신자가 수신 거부나 수신 동의 철회를 무료로 할 수 있도록 무료 수신 거부 방법을 반드시 포함해야 합니다."
            >
              <AppRadioGroup
                v-model="purpose"
                :options="[
                  { value: 'info', label: '일반용' },
                  { value: 'auth', label: '인증용' },
                  { value: 'ad', label: '광고용' },
                ]"
              />
            </AppFormRow>
            <AppFormRow
              label="발송 유형"
              required
              help="광고성 정보 발송 시 수신자가 수신 거부나 수신 동의 철회를 무료로 할 수 있도록 무료 수신 거부 방법을 반드시 포함해야 합니다."
            >
              <div class="row" style="gap: 8px; flex-wrap: wrap">
                <select v-model="msgType" class="select" style="max-width: 160px">
                  <option value="sms">
                    SMS
                  </option>
                  <option value="lms">
                    LMS
                  </option>
                  <option value="mms">
                    MMS
                  </option>
                </select>
                <select v-model="deliveryType" class="select" style="max-width: 160px">
                  <option value="standalone">
                    스탠드얼론
                  </option>
                  <option value="conversation">
                    대화형
                  </option>
                </select>
                <select v-model="fallback" class="select" style="max-width: 160px">
                  <option value="sms">
                    SMS
                  </option>
                  <option value="integrated">
                    통합 SMS
                  </option>
                </select>
              </div>
            </AppFormRow>
            <AppFormRow label="내용" required>
              <div style="display: flex; justify-content: flex-end; margin-bottom: 8px">
                <button type="button" class="btn btn-outline btn-sm" @click="openAi = true">
                  <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-sm)]" style="color: var(--accent-ink)" /> AI 문장 다듬기
                </button>
              </div>
              <div style="position: relative">
                <textarea
                  v-model="body"
                  class="textarea"
                  rows="8"
                  placeholder="내용을 입력하세요."
                  style="padding-bottom: 28px"
                />
                <div class="rcs-counter">
                  {{ body.length }}/100
                </div>
              </div>
            </AppFormRow>
            <AppFormRow label="버튼" help="최대 4개까지 추가할 수 있습니다.">
              <div class="col" style="gap: 6px">
                <div v-for="(b, i) in buttons" :key="i" class="rcs-btn-row">
                  <UIcon
                    :name="b.type === 'web' ? 'i-lucide-external-link' : b.type === 'phone' ? 'i-lucide-phone' : 'i-lucide-message-square'"
                    class="text-[length:var(--fz-sm)]"
                  />
                  <span>{{ b.label }}</span>
                  <AppBadge tone="neutral" style="margin-left: auto">
                    {{ b.type }}
                  </AppBadge>
                  <button type="button" class="btn btn-ghost btn-sm" @click="buttons = buttons.filter((_, j) => j !== i)">
                    <UIcon name="i-lucide-trash-2" class="text-[length:var(--fz-sm)]" />
                  </button>
                </div>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  style="align-self: flex-start"
                  :disabled="buttons.length >= 4"
                  @click="openButton = true"
                >
                  <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
                </button>
              </div>
            </AppFormRow>
            <AppFormRow label="수신 대기 만료 기한" required>
              <select v-model="expiry" class="select" style="max-width: 200px">
                <option value="40s">
                  40초
                </option>
                <option value="3m">
                  3분
                </option>
                <option value="1h">
                  1시간
                </option>
                <option value="24h">
                  24시간
                </option>
              </select>
            </AppFormRow>
          </div>
          <div>
            <div style="font-size: var(--fz-sm); color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <div style="display: grid; place-items: center">
              <AppRcsPreview :brand-name="brandName" :body="body" :image="hasImage" :buttons="buttons" />
            </div>
          </div>
        </div>
      </AppSendFormCard>

      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="recipients.length === 0 || !body"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

    <AppModal :open="openButton" title="버튼 추가" :width="420" @close="openButton = false">
      <AppFormRow label="유형">
        <select class="select">
          <option>웹 링크</option>
          <option>전화 걸기</option>
          <option>메시지</option>
        </select>
      </AppFormRow>
      <AppFormRow label="라벨">
        <input class="input" placeholder="예: 자세히 보기">
      </AppFormRow>
      <AppFormRow label="URL / 번호">
        <input class="input" placeholder="https://… 또는 010-…">
      </AppFormRow>
      <template #footer>
        <button type="button" class="btn btn-outline-dark" @click="openButton = false">
          취소
        </button>
        <button type="button" class="btn btn-primary" @click="openButton = false">
          추가
        </button>
      </template>
    </AppModal>

    <AppRcsTemplateDialog :open="openTpl" @close="openTpl = false" @pick="onPickRcsTpl" />
    <AppAddressBookDialog
      :open="openAddrBook"
      key-column="phone"
      @close="openAddrBook = false"
      @confirm="(items) => recipients = [...recipients, ...items]"
    />
    <AppRecipientFormDialog
      :open="openManual"
      :edit="editTarget"
      key-column="phone"
      @close="openManual = false"
      @confirm="onManualConfirm"
    />
    <AppAIRewriteDialog
      :open="openAi"
      :value="body"
      @close="openAi = false"
      @apply="body = $event"
    />
    <AppConfirmDialog
      :open="openReset"
      title="초기화"
      message="입력 내용을 초기화하시겠습니까?"
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="handleReset"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      channel="RCS"
      :count="recipients.length"
      :price-per-unit="12"
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.msg-grid { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
.rcs-btn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  font-size: var(--fz-sm);
}
.rcs-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
  pointer-events: none;
}
</style>
