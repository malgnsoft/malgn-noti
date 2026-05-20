<script setup lang="ts">
import type { Recipient } from '~/types/recipient'
import type { EmailTpl } from '~/types/template'

useHead({ title: '이메일 발송' })
const toast = useToast()
const router = useRouter()

const useTemplate = ref<'off' | 'on'>('off')
const from = ref('')
const purpose = ref('info')
const subject = ref('')
const body = ref('')
const emailHeading = ref('')
const emailButtonLabel = ref('')
const files = ref<{ name: string }[]>([])
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
const openAi = ref(false)
const openTpl = ref(false)
const emailTemplateName = ref('')

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

function onPickEmailTpl(t: EmailTpl) {
  emailTemplateName.value = t.name
  from.value = t.from
  subject.value = t.subject
  body.value = t.body
  emailHeading.value = t.heading
  emailButtonLabel.value = t.buttonLabel ?? ''
  toast.add({ title: `"${t.name}" 템플릿을 적용했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}

interface EmailMessageSnapshot {
  from: string
  purpose: string
  subject: string
  body: string
  emailHeading: string
  emailButtonLabel: string
  files: { name: string }[]
}

// 메시지 설정 + 템플릿만 초기화 (수신자·발송설정은 유지)
function resetMessage() {
  emailTemplateName.value = ''
  from.value = ''
  purpose.value = 'info'
  subject.value = ''
  body.value = ''
  emailHeading.value = ''
  emailButtonLabel.value = ''
  files.value = []
}

// 템플릿 사용유무 토글: 사용→메시지 초기화, 사용 안 함→이전 입력 복원. 수신자는 항상 유지.
const { setSilently } = useTemplateToggle<EmailMessageSnapshot>({
  state: useTemplate,
  capture: () => ({
    from: from.value,
    purpose: purpose.value,
    subject: subject.value,
    body: body.value,
    emailHeading: emailHeading.value,
    emailButtonLabel: emailButtonLabel.value,
    files: [...files.value],
  }),
  restore: (s) => {
    from.value = s.from
    purpose.value = s.purpose
    subject.value = s.subject
    body.value = s.body
    emailHeading.value = s.emailHeading
    emailButtonLabel.value = s.emailButtonLabel
    files.value = [...s.files]
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
  toast.add({ title: '이메일 발송 시작', color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/email'), 1000)
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · 이메일
      </div>
      <h1>이메일 발송</h1>
      <p>트랜잭션 / 마케팅 이메일. 한 건당 0.65 C.</p>
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
              {{ emailTemplateName || '선택된 템플릿 없음' }}
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
        key-column="email"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <!-- 메시지 설정 -->
      <AppSendFormCard title="메시지 설정" required>
        <div class="msg-grid">
          <div class="col">
            <AppFormRow label="발송 목적" required>
              <AppRadioGroup
                v-model="purpose"
                :options="[
                  { value: 'info', label: '일반용' },
                  { value: 'auth', label: '인증용' },
                  { value: 'ad', label: '광고용' },
                ]"
              />
            </AppFormRow>
            <AppFormRow label="발신 메일" required>
              <input v-model="from" class="input" placeholder="example@domain.com">
            </AppFormRow>
            <AppFormRow label="제목" required>
              <div style="position: relative">
                <input v-model="subject" class="input" style="padding-right: 90px">
                <AppByteCounter :value="subject" :max="1000" unit="char" />
              </div>
            </AppFormRow>
            <AppFormRow label="내용" required>
              <div style="display: flex; justify-content: flex-end; margin-bottom: 8px">
                <button type="button" class="btn btn-outline btn-sm" @click="openAi = true">
                  <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-sm)]" style="color: var(--accent-ink)" /> AI 문장 다듬기
                </button>
              </div>
              <textarea v-model="body" class="textarea" rows="12" placeholder="내용을 입력하세요. 치환자는 #{이름} 형식으로 작성합니다." />
            </AppFormRow>
            <AppFormRow label="첨부파일" required>
              <div class="row" style="gap: 8px; flex-wrap: wrap">
                <input class="input readonly" style="flex: 1; min-width: 200px" value="" placeholder="파일을 업로드하세요." readonly>
                <button
                  type="button"
                  class="btn btn-primary btn-sm"
                  @click="files = [...files, { name: `첨부파일-${files.length + 1}.pdf` }]"
                >
                  <UIcon name="i-lucide-paperclip" class="text-[length:var(--fz-sm)]" /> 파일 선택
                </button>
              </div>
              <div v-if="files.length" class="row" style="flex-wrap: wrap; gap: 6px; margin-top: 8px">
                <div v-for="(f, i) in files" :key="i" class="file-chip">
                  <UIcon name="i-lucide-paperclip" class="text-[length:var(--fz-sm)]" />{{ f.name }}
                  <span class="remove" @click="files = files.filter((_, j) => j !== i)">
                    <UIcon name="i-lucide-x" class="text-[length:var(--fz-sm)]" />
                  </span>
                </div>
              </div>
              <div class="mail-help">
                <div>첨부 가능 파일 수: 최대 10개</div>
                <div>미지원 파일 형식: .js, .exe, .bat, .cmd, .com, .cpl, .scr, .vbs, .wsr</div>
                <div>파일 용량: 합산 30MB 이하</div>
                <div>파일 이름 길이: 최대 45자</div>
              </div>
            </AppFormRow>
          </div>
          <div>
            <div style="font-size: var(--fz-sm); color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <AppEmailPreview
              :subject="subject"
              :from="from"
              :attachments="files.map(f => f.name)"
              :heading="emailHeading"
              :body="body"
              :button-label="emailButtonLabel"
            />
          </div>
        </div>
      </AppSendFormCard>

      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="recipients.length === 0 || !subject || !body"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

    <AppEmailTemplateDialog :open="openTpl" @close="openTpl = false" @pick="onPickEmailTpl" />
    <AppAddressBookDialog
      :open="openAddrBook"
      key-column="email"
      @close="openAddrBook = false"
      @confirm="(items) => recipients = [...recipients, ...items]"
    />
    <AppRecipientFormDialog
      :open="openManual"
      :edit="editTarget"
      key-column="email"
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
      message="입력을 초기화합니다."
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="handleReset"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      channel="이메일"
      :count="recipients.length"
      :price-per-unit="0.65"
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.msg-grid { display: grid; grid-template-columns: 1fr 460px; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
.mail-help {
  margin-top: 8px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.7;
}
</style>
