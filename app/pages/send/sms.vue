<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: '문자메시지 발송' })

const toast = useToast()
const router = useRouter()

interface Tpl { id: number, name: string, subject?: string, body: string, vars: string[], type?: string }

const senderNumber = ref('1588-1234')
const useTemplate = ref<'off' | 'on'>('off')
const template = ref<Tpl | null>(null)
const purpose = ref<'info' | 'ad' | 'auth'>('info')
const smsType = ref<'sms' | 'lms' | 'mms'>('sms')
const subject = ref('')
const body = ref('[몰리몰리] 안녕하세요! 주문하신 상품이 출고되었습니다.\n\n주문번호: #{주문번호}\n운송장: CJ대한통운\n\n빠른 배송으로 곧 만나뵙겠습니다.')
const files = ref<{ name: string, size: number }[]>([])
const adNumber = ref<string | null>(null)
const substitutionMode = ref<'common' | 'individual'>('common')
const commonVars = ref<Record<string, string>>({})

const recipients = ref<Recipient[]>([
  { id: 1, name: '이수민', phone: '010-2345-6789', email: 'soomin.lee@example.com', vars: { 이름: '이수민', 주문번호: 'ORD-20260518-0042' } },
  { id: 2, name: '박지훈', phone: '010-9876-5432', email: 'park.jihoon@example.com', vars: { 이름: '박지훈', 주문번호: 'ORD-20260518-0043' } },
  { id: 3, name: '최예진', phone: '010-3344-5566', email: 'yejin.choi@example.com', vars: { 이름: '최예진', 주문번호: 'ORD-20260518-0044' } },
  { id: 4, name: '정민호', phone: '010-7788-9900', email: 'minho.jeong@example.com', vars: { 이름: '정민호', 주문번호: 'ORD-20260518-0045' } },
  { id: 5, name: '한지영', phone: '010-2233-4455', email: 'jiyoung.han@example.com', vars: { 이름: '한지영', 주문번호: 'ORD-20260518-0046' } }
])
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
const pricePerUnit = computed(() => smsType.value === 'mms' ? 22 : smsType.value === 'lms' ? 14 : 9.9)

function applyTemplate(t: Tpl) {
  template.value = t
  smsType.value = (t.type as 'sms' | 'lms' | 'mms') || 'sms'
  if (t.subject) subject.value = t.subject
  body.value = t.body
  toast.add({ title: `"${t.name}" 템플릿을 적용했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}

function handleReset() {
  senderNumber.value = '1588-1234'
  useTemplate.value = 'off'
  template.value = null
  purpose.value = 'info'
  smsType.value = 'sms'
  subject.value = ''
  body.value = ''
  files.value = []
  recipients.value = []
  selectedRcpt.value = []
  sendOptions.value = { mode: 'now', date: '', hour: '09', minute: '00' }
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

function send() {
  openConfirm.value = false
  toast.add({ title: `${recipients.value.length}명에게 SMS 발송을 시작했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/sms'), 1200)
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
      <!-- 수신자 -->
      <AppRecipientCard
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

      <!-- 발신 정보 -->
      <AppSendFormCard step="1" title="발신 정보" required>
        <template v-if="tplLock" #headerRight>
          <AppBadge tone="neutral">
            <UIcon name="i-lucide-lock" class="text-[10px]" /> 템플릿 잠금
          </AppBadge>
        </template>
        <AppFormRow label="발신번호" required>
          <select v-model="senderNumber" class="select" style="max-width: 280px" :disabled="tplLock">
            <option value="1588-1234">
              1588-1234 (몰리몰리 대표)
            </option>
            <option value="02-555-1234">
              02-555-1234 (서울 본사)
            </option>
            <option value="031-444-5678">
              031-444-5678 (분당 지점)
            </option>
          </select>
        </AppFormRow>
        <AppFormRow label="템플릿 사용" help="등록된 템플릿을 불러와서 사용합니다.">
          <div class="row" style="gap: 12px">
            <AppRadioGroup
              v-model="useTemplate"
              :options="[
                { value: 'off', label: '사용 안 함' },
                { value: 'on', label: '사용' },
              ]"
            />
            <button
              v-if="useTemplate === 'on'"
              type="button"
              class="btn btn-outline btn-sm"
              @click="openTpl = true"
            >
              <UIcon name="i-lucide-book-open" class="text-[12px]" />
              {{ template ? template.name : '템플릿 선택' }}
            </button>
          </div>
        </AppFormRow>
        <AppFormRow label="발송 목적" required>
          <AppRadioGroup
            :model-value="purpose"
            :disabled="tplLock"
            :options="[
              { value: 'info', label: '정보성' },
              { value: 'ad', label: '광고성' },
              { value: 'auth', label: '인증' },
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
        <AppFormRow label="발송 유형" required>
          <AppRadioGroup
            :model-value="smsType"
            :disabled="tplLock"
            :options="[
              { value: 'sms', label: 'SMS (단문 · 90byte)' },
              { value: 'lms', label: 'LMS (장문)' },
              { value: 'mms', label: 'MMS (포토)' },
            ]"
            @update:model-value="(v) => { smsType = v as 'sms' | 'lms' | 'mms'; if (v !== 'mms') files = [] }"
          />
        </AppFormRow>
      </AppSendFormCard>

      <!-- ③ 메시지 -->
      <AppSendFormCard step="3" title="메시지" required>
        <div class="msg-grid">
          <div class="col">
            <AppFormRow v-if="showSubject" label="제목" required>
              <div style="position: relative">
                <input
                  v-model="subject"
                  class="input"
                  placeholder="LMS/MMS 제목 (40 byte 이내)"
                  style="padding-right: 110px"
                >
                <AppByteCounter :value="subject" :max="40" />
              </div>
            </AppFormRow>
            <AppFormRow label="본문" required>
              <div style="position: relative">
                <textarea
                  v-model="body"
                  class="textarea"
                  rows="8"
                  placeholder="본문을 입력하세요. 치환자는 #{이름}, #{주문번호} 형식으로 작성합니다."
                  style="padding-right: 110px; padding-bottom: 28px"
                />
                <AppByteCounter :value="body" :max="counterMax" />
              </div>
              <div class="row" style="margin-top: 8px; gap: 6px; flex-wrap: wrap">
                <button
                  type="button"
                  class="btn btn-outline btn-sm"
                  :disabled="tplLock"
                  @click="openAi = true"
                >
                  <UIcon name="i-lucide-sparkles" class="text-[12px]" style="color: var(--accent-ink)" /> AI 문장 다듬기
                </button>
                <button type="button" class="btn btn-outline btn-sm" @click="body += ' #{이름}'">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 치환자 추가
                </button>
                <span class="muted" style="font-size: 12px; margin-left: auto">
                  SMS 90 byte / LMS · MMS 2,000 byte
                </span>
              </div>
            </AppFormRow>
            <AppFormRow
              v-if="showAttach"
              label="이미지 첨부"
              help="JPG/JPEG · 최대 3장 · 1장 300KB / 총 800KB 이내 · 1000×1000 이하"
            >
              <div class="row" style="flex-wrap: wrap; gap: 8px">
                <div v-for="(f, i) in files" :key="i" class="file-chip">
                  <UIcon name="i-lucide-image" class="text-[12px]" />
                  {{ f.name }}
                  <span class="remove" @click="files = files.filter((_, j) => j !== i)">
                    <UIcon name="i-lucide-x" class="text-[12px]" />
                  </span>
                </div>
                <button
                  v-if="files.length < 3"
                  type="button"
                  class="btn btn-outline btn-sm"
                  @click="files = [...files, { name: `image-${files.length + 1}.jpg`, size: 200000 }]"
                >
                  <UIcon name="i-lucide-upload" class="text-[12px]" /> 이미지 선택
                </button>
              </div>
            </AppFormRow>
          </div>

          <div>
            <div style="font-size: 12px; color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <div style="display: grid; place-items: center">
              <AppPhonePreview :sender-name="senderNumber" :message="body" />
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

      <!-- ④ 발송 옵션 -->
      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="recipients.length === 0 || !body"
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
      :sender-name="senderNumber"
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
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
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
</style>
