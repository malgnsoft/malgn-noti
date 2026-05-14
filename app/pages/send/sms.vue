<script setup lang="ts">
import type { AddressBookItem, AddressBookGroup } from '~/components/AppAddressBookDialog.vue'
import type { RecipientRow } from '~/components/AppRecipientTable.vue'
import type { ChatMessage } from '~/components/AppAIRewriteDialog.vue'
import type { TemplateTab } from '~/components/AppTemplatePickerDialog.vue'
import type { SmsFormValue } from '~/components/SmsMessageBody.vue'

useHead({ title: '문자메시지 발송 - 맑은 메시징' })

const meta = useChannelMeta('sms')

// ---- 폼 상태 ----
const useTemplate = ref<'no' | 'yes'>('no')
const selectedTemplateName = ref('')
const substitutionMode = ref<'individual' | 'common'>('common')
const commonSubstitution = ref('')

const recipients = ref<RecipientRow[]>([])
const selectedRecipientIds = ref<string[]>([])

const sendMode = ref<'now' | 'reserve'>('now')
const reserveAt = ref('')

const smsForm = ref<SmsFormValue>({
  senderNumber: '',
  purpose: 'general',
  smsType: 'sms',
  subject: '',
  body: '',
  attachments: [],
})

const ad080Number = ref('')

// ---- 파생 ----
const templateUsed = computed(() => useTemplate.value === 'yes')
const substitutionActive = computed(() => isSubstitutionActive(meta, templateUsed.value))

const recipientCount = computed(() => recipients.value.length)
const estimatedCost = computed(() => recipientCount.value * meta.pricePerUnit)
const currentBalance = 120_000

// ---- 모달 ----
const recipientFormOpen = ref(false)
const recipientFormValue = ref<{ alias?: string; phone?: string; substitution?: string }>({})
const recipientFormMode = ref<'add' | 'edit'>('add')

const addressBookOpen = ref(false)
const addressBookSelectedItemIds = ref<string[]>([])
const addressBookSelectedGroupIds = ref<string[]>([])

const sendConfirmOpen = ref(false)
const resetConfirmOpen = ref(false)
const adNoticeOpen = ref(false)
const templatePickerOpen = ref(false)
const templatePickerSelectedId = ref<string | null>(null)
const templatePickerActiveTab = ref('sms')
const aiRewriteOpen = ref(false)
const aiMessages = ref<ChatMessage[]>([])
const aiInputText = ref('')

// ---- 더미 데이터 ----
const senderOptions = ['1644-7143', '02-1234-5678', '010-1234-5678']
const ad080Options = ['080-123-4567', '080-987-6543']

const addressBookItems: AddressBookItem[] = [
  { id: 'r1', alias: 'CDNETWORKS', keyValue: '010-0000-0001' },
  { id: 'r2', alias: 'CDNW',       keyValue: '010-0000-0002' },
  { id: 'r3', alias: '강주영',     keyValue: '010-2345-6789' },
  { id: 'r4', alias: '강태미',     keyValue: '010-1111-2222' },
  { id: 'r5', alias: '권지혜',     keyValue: '010-2222-3333' },
  { id: 'r6', alias: '김건',       keyValue: '010-3333-4444' },
  { id: 'r7', alias: '김규필',     keyValue: '010-4444-5555' },
  { id: 'r8', alias: '김덕조',     keyValue: '010-5555-6666' },
]

const addressBookGroups: AddressBookGroup[] = [
  { id: 'g1', name: '위캔디오_V4공지_고객용', count: 0 },
  { id: 'g2', name: '트래픽_알림_오발송',     count: 8 },
  { id: 'g3', name: '위캔디오_업무_소통방',   count: 10 },
  { id: 'g4', name: '맑은소프트_전체',         count: 7 },
  { id: 'g5', name: 'CDN_파트너',              count: 4 },
]

const templateTabs: TemplateTab[] = [
  { key: 'sms', label: 'SMS', sublabel: '(단문)' },
  { key: 'lms', label: 'LMS', sublabel: '(장문)' },
  { key: 'mms', label: 'MMS', sublabel: '(포토)' },
]

interface SampleTemplate {
  id: string
  name: string
  text: string
  byte: number
  type: 'sms' | 'lms' | 'mms'
}

const sampleTemplates: SampleTemplate[] = [
  { id: 't1', type: 'sms', name: '웃음 3월', byte: 86,
    text: '웃음의 분량이 곧 행복의 분량입니다^^ 오늘도 실컷 웃고 행복하세요^......^\n멋진 3월(^o^)' },
  { id: 't2', type: 'sms', name: '3월의 활기', byte: 89,
    text: '새로운 세상이 눈앞에 펼쳐지는 설렘 가득한 3월입니다. 봄의 활기를 한껏 즐기는 하루 되세요~' },
  { id: 't3', type: 'sms', name: '3월 중순', byte: 90,
    text: '언뜻 달력을 보니 벌써 3월 중순을 향해 달려가고 있어요. 곧 벚꽃이 만개한 봄이 다가오겠네요.' },
  { id: 't4', type: 'sms', name: '봄기운 3월', byte: 90,
    text: '얼었던 땅이 녹으면 봄나물들이 올라와 봄기운을 한층 북돋아줍니다.\n봄처럼활기넘치는3월되세요' },
]

const filteredTemplates = computed(() =>
  sampleTemplates.filter(t => t.type === templatePickerActiveTab.value),
)

const selectedTemplate = computed(() =>
  sampleTemplates.find(t => t.id === templatePickerSelectedId.value),
)

// ---- 핸들러 ----
function openDirectInput() {
  recipientFormMode.value = 'add'
  recipientFormValue.value = {}
  recipientFormOpen.value = true
}

function onRecipientFormConfirm(value: { alias?: string; phone?: string; substitution?: string }) {
  if (recipientFormMode.value === 'edit') {
    const id = selectedRecipientIds.value[0]
    const row = recipients.value.find(r => r.id === id)
    if (row) {
      row.alias = value.alias
      row.keyValue = value.phone ?? ''
      row.substitution = value.substitution
    }
  } else {
    recipients.value.push({
      id: Math.random().toString(36).slice(2),
      alias: value.alias,
      keyValue: value.phone ?? '',
      substitution: value.substitution,
    })
  }
}

function openAddressBook() {
  addressBookSelectedItemIds.value = []
  addressBookSelectedGroupIds.value = []
  addressBookOpen.value = true
}

function onAddressBookConfirm() {
  const existingIds = new Set(recipients.value.map(r => r.id))
  for (const id of addressBookSelectedItemIds.value) {
    if (existingIds.has(id)) continue
    const item = addressBookItems.find(i => i.id === id)
    if (item) {
      recipients.value.push({ id: item.id, alias: item.alias, keyValue: item.keyValue })
    }
  }
}

function onEditSelected() {
  if (selectedRecipientIds.value.length !== 1) return
  const id = selectedRecipientIds.value[0]
  const row = recipients.value.find(r => r.id === id)
  if (!row) return
  recipientFormMode.value = 'edit'
  recipientFormValue.value = {
    alias: row.alias,
    phone: row.keyValue,
    substitution: row.substitution,
  }
  recipientFormOpen.value = true
}

function onDeleteSelected() {
  recipients.value = recipients.value.filter(r => !selectedRecipientIds.value.includes(r.id))
  selectedRecipientIds.value = []
}

function onSubmit() {
  if (recipientCount.value === 0) {
    alert('수신자를 추가해 주세요.')
    return
  }
  if (smsForm.value.purpose === 'ad') {
    adNoticeOpen.value = true
    return
  }
  sendConfirmOpen.value = true
}

function onAdNoticeConfirm(num: string) {
  ad080Number.value = num
  sendConfirmOpen.value = true
}

function onSendConfirm() {
  sendConfirmOpen.value = false
  alert('발송 요청이 접수되었습니다.')
}

function onReset() {
  resetConfirmOpen.value = true
}

function performReset() {
  useTemplate.value = 'no'
  selectedTemplateName.value = ''
  smsForm.value = {
    senderNumber: '',
    purpose: 'general',
    smsType: 'sms',
    subject: '',
    body: '',
    attachments: [],
  }
  substitutionMode.value = 'common'
  commonSubstitution.value = ''
  recipients.value = []
  selectedRecipientIds.value = []
  sendMode.value = 'now'
  reserveAt.value = ''
  resetConfirmOpen.value = false
}

function onTemplatePickerConfirm() {
  if (!selectedTemplate.value) return
  selectedTemplateName.value = selectedTemplate.value.name
  smsForm.value.body = selectedTemplate.value.text
  smsForm.value.smsType = selectedTemplate.value.type
}

function openAiRewrite() {
  aiInputText.value = ''
  aiMessages.value = smsForm.value.body
    ? [{ role: 'user', content: smsForm.value.body }]
    : []
  aiRewriteOpen.value = true
}

function onAiSend(prompt: string) {
  aiMessages.value.push({ role: 'user', content: prompt })
  setTimeout(() => {
    aiMessages.value.push({
      role: 'assistant',
      content: '(AI 응답 예시) 톤 다듬기 결과가 여기에 들어옵니다.',
    })
  }, 600)
}

function onAiApply() {
  const last = [...aiMessages.value].reverse().find(m => m.role === 'assistant')
  if (last) smsForm.value.body = last.content
}
</script>

<template>
  <div class="app-container py-10">
    <h1 class="page-title">문자 메시지 발송</h1>

    <!-- 1. 템플릿 선택 -->
    <AppSendFormCard title="템플릿 선택">
      <div class="form-row">
        <label class="form-label">템플릿 사용유무</label>
        <div class="form-control">
          <div class="radio-group">
            <label class="radio"><input v-model="useTemplate" type="radio" value="no"><span>사용 안함</span></label>
            <label class="radio"><input v-model="useTemplate" type="radio" value="yes"><span>사용</span></label>
          </div>
        </div>
      </div>
      <div class="form-row">
        <label class="form-label">템플릿 선택</label>
        <div class="form-control inline">
          <span v-if="selectedTemplateName" class="template-name">{{ selectedTemplateName }}</span>
          <button
            type="button"
            class="btn-template"
            :disabled="!templateUsed"
            @click="templatePickerOpen = true"
          >
            선택
          </button>
        </div>
      </div>
    </AppSendFormCard>

    <!-- 2. 수신자 설정 -->
    <AppSendFormCard title="수신자 설정" collapsible>
      <AppRecipientActions
        :can-edit="selectedRecipientIds.length === 1"
        :can-delete="selectedRecipientIds.length > 0"
        @direct-input="openDirectInput"
        @from-address-book="openAddressBook"
        @edit-selected="onEditSelected"
        @delete-selected="onDeleteSelected"
      />

      <div v-if="substitutionActive" class="substitution-panel">
        <div class="form-row">
          <label class="form-label">치환자 입력 방식</label>
          <div class="form-control">
            <div class="radio-group">
              <label class="radio"><input v-model="substitutionMode" type="radio" value="individual"><span>개별</span></label>
              <label class="radio"><input v-model="substitutionMode" type="radio" value="common"><span>공통</span></label>
            </div>
          </div>
        </div>
        <div v-if="substitutionMode === 'common'" class="form-row">
          <label class="form-label">공통 치환자</label>
          <div class="form-control">
            <UInput v-model="commonSubstitution" placeholder="{{%name%}}" class="w-full" />
          </div>
        </div>
      </div>

      <AppRecipientTable
        v-model:selected="selectedRecipientIds"
        :rows="recipients"
        key-column-label="휴대폰 번호"
        :show-substitution-column="substitutionActive && substitutionMode === 'individual'"
        substitution-placeholder="{{%name%}}"
      />
    </AppSendFormCard>

    <!-- 3. 메시지 설정 -->
    <AppChannelMessageCard :meta="meta">
      <template #body>
        <SmsMessageBody
          v-model:value="smsForm"
          :meta="meta"
          :template-used="templateUsed"
          :sender-options="senderOptions"
          @open-ai="openAiRewrite"
        />
      </template>
      <template #preview>
        <AppPhonePreview variant="sms" :header-name="smsForm.senderNumber">
          <AppPhonePreviewSmsBubble :subject="smsForm.subject" :text="smsForm.body" />
        </AppPhonePreview>
      </template>
    </AppChannelMessageCard>

    <!-- 4. 발송 옵션 -->
    <AppSendOptionsCard v-model:mode="sendMode" v-model:reserve-at="reserveAt" />

    <AppSendActionsBar @reset="onReset" @submit="onSubmit" />

    <!-- 모달들 -->
    <AppRecipientFormDialog
      v-model:open="recipientFormOpen"
      v-model:value="recipientFormValue"
      :fields="meta.recipientForm.fields"
      :title="recipientFormMode === 'add' ? '수신자 정보' : '수신자 정보 수정'"
      substitution-placeholder="{{%name%}}"
      @confirm="onRecipientFormConfirm"
    />

    <AppAddressBookDialog
      v-model:open="addressBookOpen"
      v-model:selected-item-ids="addressBookSelectedItemIds"
      v-model:selected-group-ids="addressBookSelectedGroupIds"
      :items="addressBookItems"
      :groups="addressBookGroups"
      key-column-label="휴대폰 번호"
      :right-panel="meta.recipientForm.addressBook.rightPanel"
      @confirm="onAddressBookConfirm"
    />

    <AppSendConfirmDialog
      v-model:open="sendConfirmOpen"
      :channels="[meta]"
      :recipient-count="recipientCount"
      :estimated-cost="estimatedCost"
      :current-balance="currentBalance"
      @confirm="onSendConfirm"
    />

    <AppConfirmDialog
      v-model:open="resetConfirmOpen"
      title="초기화"
      description="작성된 모든 내용이 초기화 됩니다. 초기화를 진행하시겠어요?"
      @confirm="performReset"
    />

    <AppAdNoticeSms080Dialog
      v-model:open="adNoticeOpen"
      v-model:selected-number="ad080Number"
      :option-numbers="ad080Options"
      @confirm="onAdNoticeConfirm"
    />

    <AppTemplatePickerDialog
      v-model:open="templatePickerOpen"
      v-model:active-tab="templatePickerActiveTab"
      v-model:selected-id="templatePickerSelectedId"
      :tabs="templateTabs"
      :items="filteredTemplates"
      layout="cards"
      @confirm="onTemplatePickerConfirm"
    >
      <template #item-list="{ select, selectedId }">
        <AppSmsTemplateCard
          v-for="t in filteredTemplates"
          :key="t.id"
          :name="t.name"
          :text="t.text"
          :byte-count="t.byte"
          :active="selectedId === t.id"
          @click="select(t.id)"
        />
      </template>
      <template #preview>
        <AppPhonePreview
          v-if="selectedTemplate"
          variant="sms"
          :header-name="smsForm.senderNumber || '16447143'"
        >
          <AppPhonePreviewSmsBubble :text="selectedTemplate.text" />
        </AppPhonePreview>
        <div v-else class="picker-preview-empty">템플릿을 선택하면 미리보기가 표시됩니다.</div>
      </template>
    </AppTemplatePickerDialog>

    <AppAIRewriteDialog
      v-model:open="aiRewriteOpen"
      v-model:messages="aiMessages"
      v-model:input-text="aiInputText"
      @send="onAiSend"
      @apply="onAiApply"
    >
      <template #preview>
        <AppPhonePreview variant="sms" :header-name="smsForm.senderNumber || '16447143'">
          <AppPhonePreviewSmsBubble
            :subject="smsForm.subject"
            :text="aiMessages.find(m => m.role === 'assistant')?.content ?? smsForm.body"
          />
        </AppPhonePreview>
      </template>
    </AppAIRewriteDialog>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.5px;
  color: var(--gray-900);
  margin-bottom: 32px;
}

.form-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: start;
  gap: 16px;
  padding: 12px 0;
}
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
  padding-top: 8px;
}
.form-control { display: flex; flex-direction: column; gap: 8px; }
.form-control.inline { flex-direction: row; align-items: center; gap: 12px; }
.template-name { color: var(--gray-900); font-weight: 500; font-size: 14px; }

.btn-template {
  padding: 8px 16px;
  background: var(--gray-900);
  color: white;
  border: 0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}
.btn-template:disabled {
  background: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
}
.btn-template:hover:not(:disabled) { background: var(--gray-800); }

.radio-group { display: flex; gap: 24px; padding: 6px 0; }
.radio { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px; color: var(--gray-700); }
.radio input[type='radio'] { accent-color: var(--primary-color); cursor: pointer; }

.substitution-panel {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 4px 16px;
  margin-top: 16px;
}
.substitution-panel .form-row { padding: 8px 0; }

.picker-preview-empty {
  text-align: center;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
