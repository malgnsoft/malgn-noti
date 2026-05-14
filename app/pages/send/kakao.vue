<script setup lang="ts">
import type { AddressBookItem, AddressBookGroup } from '~/components/AppAddressBookDialog.vue'
import type { RecipientRow } from '~/components/AppRecipientTable.vue'
import type { KakaoFormValue } from '~/components/KakaoMessageBody.vue'
import type { SenderOption } from '~/components/AppSenderSearchSelect.vue'

useHead({ title: '알림톡 발송 - 맑은 메시징' })

const meta = useChannelMeta('kakao')

// ---- 폼 상태 ----
const senderProfile = ref('')
const selectedTemplateId = ref<string | null>(null)
const substitutionMode = ref<'individual' | 'common'>('common')
const commonSubstitution = ref('')

const recipients = ref<RecipientRow[]>([])
const selectedRecipientIds = ref<string[]>([])

const sendMode = ref<'now' | 'reserve'>('now')
const reserveAt = ref('')

const kakaoForm = ref<KakaoFormValue>({
  templateCode: '',
  kakaoTemplateCode: '',
  purpose: '일반용',
  messageType: 'basic',
  emphasisType: '선택 안함',
  body: { templateText: '', variables: {} },
  securityTemplate: '미설정',
})

// ---- 더미 데이터 ----
const senderProfiles: SenderOption[] = [
  { value: '@위캔디오', label: '@위캔디오' },
  { value: '@맑은소프트', label: '@맑은소프트' },
  { value: '@쏠쏠', label: '@쏠쏠' },
]

interface KakaoTemplate {
  id: string
  name: string
  meta: Omit<KakaoFormValue, 'body'>
  body: string
  extra?: string
  links?: { mobile?: string; pc?: string }
  buttons?: { label: string; type: 'web' | 'app' | 'phone' | 'message' }[]
}

const kakaoTemplates: KakaoTemplate[] = [
  {
    id: 'k1', name: '01_비디오팩생성',
    meta: {
      templateCode: '01', kakaoTemplateCode: '01',
      purpose: '일반용', messageType: 'extra', emphasisType: '선택 안함',
      securityTemplate: '미설정',
    },
    body: '#{name}님, 비디오팩을 시작할 준비가 끝났어요.\n바로 "첫 재생"까지 가는 가장 쉬운 3단계만 안내드릴게요.\n\n1. 영상 업로드\n2. 인코딩 요청\n3. 재생 링크/임베드 복사\n\n▶ 시작 가이드\nhttps://support.wecandeo.com/docs/videopack-guide-quick-start\n\n※ 본 메시지는 위캔디오에서 플랜 신청 후 상품이 생성된 고객에게 발송되는 이용 시작 안내입니다.',
    extra: '▶ 아래 버튼에서 시작 가이드를 확인해 주세요.\n궁금한 점은 문의로 남겨주세요.',
    links: { mobile: 'https://www.wecandeo.com', pc: 'https://www.wecandeo.com' },
    buttons: [
      { label: '👉 시작 가이드', type: 'web' },
      { label: '💬 문의하기', type: 'message' },
    ],
  },
  {
    id: 'k2', name: '02-1_비디오팩생성2일경과',
    meta: {
      templateCode: '02', kakaoTemplateCode: '02',
      purpose: '일반용', messageType: 'basic', emphasisType: '선택 안함',
      securityTemplate: '미설정',
    },
    body: '#{name}님, 비디오팩 생성 후 2일이 지났습니다.\n\n아직 첫 영상을 등록하지 않으셨다면 시작 가이드를 확인해 주세요.',
  },
  {
    id: 'k3', name: '02-2_비디오팩생성2일경과',
    meta: {
      templateCode: '02', kakaoTemplateCode: '02',
      purpose: '일반용', messageType: 'basic', emphasisType: '선택 안함',
      securityTemplate: '미설정',
    },
    body: '#{name}님, 비디오팩 시작 가이드를 다시 확인해 보세요.',
  },
]

const addressBookItems: AddressBookItem[] = [
  { id: 'r1', alias: 'CDNETWORKS', keyValue: '010-0000-0001' },
  { id: 'r2', alias: 'CDNW',       keyValue: '010-0000-0002' },
  { id: 'r3', alias: '강주영',     keyValue: '010-2345-6789' },
  { id: 'r4', alias: '강태미',     keyValue: '010-1111-2222' },
  { id: 'r5', alias: '권지혜',     keyValue: '010-2222-3333' },
]
const addressBookGroups: AddressBookGroup[] = [
  { id: 'g1', name: '위캔디오_V4공지_고객용', count: 0 },
  { id: 'g2', name: '트래픽_알림_오발송',     count: 8 },
  { id: 'g3', name: '맑은소프트_전체',         count: 7 },
]

// ---- 파생 (점진적 disclosure) ----
const senderFilled = computed(() => !!senderProfile.value)
const templateFilled = computed(() => !!selectedTemplateId.value)

const recipientCardLocked = computed(
  () => !isCardUnlocked(meta, 'recipient', { sender: senderFilled.value, template: templateFilled.value }),
)
const messageCardLocked = computed(
  () => !isCardUnlocked(meta, 'message', { sender: senderFilled.value, template: templateFilled.value }),
)

const substitutionActive = computed(() => isSubstitutionActive(meta, templateFilled.value))

const recipientCount = computed(() => recipients.value.length)
const estimatedCost = computed(() => recipientCount.value * meta.pricePerUnit)
const currentBalance = 120_000

const selectedTemplate = computed(() =>
  kakaoTemplates.find(t => t.id === selectedTemplateId.value),
)

const selectedTemplateName = computed(() => selectedTemplate.value?.name ?? '')

// 템플릿 선택 시 폼에 반영
watch(selectedTemplate, (t) => {
  if (!t) return
  kakaoForm.value = {
    ...t.meta,
    body: { templateText: t.body, variables: {} },
    extra: t.extra,
    links: t.links,
    buttons: t.buttons,
  }
}, { immediate: true })

// ---- 모달 ----
const recipientFormOpen = ref(false)
const recipientFormValue = ref<{ alias?: string; phone?: string; substitution?: string }>({})
const recipientFormMode = ref<'add' | 'edit'>('add')

const addressBookOpen = ref(false)
const addressBookSelectedItemIds = ref<string[]>([])
const addressBookSelectedGroupIds = ref<string[]>([])

const sendConfirmOpen = ref(false)
const resetConfirmOpen = ref(false)
const templatePickerOpen = ref(false)
const templatePickerSearch = ref('')
const templatePickerSelectedId = ref<string | null>(null)

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
  sendConfirmOpen.value = true
}

function onSendConfirm() {
  sendConfirmOpen.value = false
  alert('알림톡 발송 요청이 접수되었습니다.')
}

function onReset() {
  resetConfirmOpen.value = true
}

function performReset() {
  senderProfile.value = ''
  selectedTemplateId.value = null
  substitutionMode.value = 'common'
  commonSubstitution.value = ''
  recipients.value = []
  selectedRecipientIds.value = []
  sendMode.value = 'now'
  reserveAt.value = ''
  resetConfirmOpen.value = false
}

function onTemplatePickerConfirm() {
  if (templatePickerSelectedId.value) {
    selectedTemplateId.value = templatePickerSelectedId.value
  }
}

// 본문 텍스트(변수 치환 결과) — 프리뷰용
const previewBody = computed(() => {
  const tpl = kakaoForm.value.body.templateText
  const vars = kakaoForm.value.body.variables
  return tpl.replace(/#\{([^}]+)\}|\{\{%([^%}]+)%\}\}/g, (_, a, b) => {
    const k = a ?? b
    return vars[k] || `#{${k}}`
  })
})
</script>

<template>
  <div class="app-container py-10">
    <h1 class="page-title">알림톡 발송</h1>

    <!-- 1. 템플릿 선택 -->
    <AppSendFormCard title="템플릿 선택">
      <div class="form-row">
        <label class="form-label">발신 프로필 <span class="req">*</span></label>
        <div class="form-control">
          <AppSenderSearchSelect
            v-model:value="senderProfile"
            :items="senderProfiles"
            placeholder="발신 프로필 선택해 주세요"
          />
        </div>
      </div>
      <div class="form-row">
        <label class="form-label">템플릿 선택 <span class="req">*</span></label>
        <div class="form-control inline">
          <span v-if="selectedTemplateName" class="template-name">{{ selectedTemplateName }}</span>
          <button
            type="button"
            class="btn-template"
            :disabled="!senderFilled"
            @click="templatePickerOpen = true"
          >
            선택
          </button>
        </div>
      </div>
    </AppSendFormCard>

    <!-- 2. 수신자 설정 -->
    <AppSendFormCard
      title="수신자 설정"
      collapsible
      :locked="recipientCardLocked"
      locked-message="발신 프로필/템플릿 이름을 선택하세요."
    >
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
    <AppChannelMessageCard
      :meta="meta"
    >
      <template #body>
        <div v-if="messageCardLocked" class="message-locked">
          발신 프로필/템플릿 이름을 선택하세요.
        </div>
        <KakaoMessageBody
          v-else
          v-model:value="kakaoForm"
          :meta="meta"
        />
      </template>
      <template #preview>
        <AppPhonePreview
          v-if="!messageCardLocked"
          variant="kakao"
          header-name="맑은소프트"
        >
          <AppPhonePreviewKakaoBubble
            channel-name="맑은소프트"
            badge="알림톡 도착"
            :body="previewBody"
            :extra="kakaoForm.extra"
            :buttons="kakaoForm.buttons"
          />
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

    <!-- 템플릿 선택 모달 (좌측 row 리스트 + 우측 미리보기) -->
    <AppTemplatePickerDialog
      v-model:open="templatePickerOpen"
      v-model:selected-id="templatePickerSelectedId"
      v-model:search-query="templatePickerSearch"
      :items="kakaoTemplates"
      layout="rows"
      @confirm="onTemplatePickerConfirm"
    >
      <template #item-list="{ select, selectedId }">
        <button
          v-for="t in kakaoTemplates"
          :key="t.id"
          type="button"
          class="kakao-template-row"
          :class="{ 'is-active': selectedId === t.id }"
          @click="select(t.id)"
        >
          {{ t.name }}
        </button>
      </template>
      <template #preview>
        <AppPhonePreview
          v-if="templatePickerSelectedId"
          variant="kakao"
          header-name="맑은소프트"
        >
          <AppPhonePreviewKakaoBubble
            channel-name="맑은소프트"
            badge="알림톡 도착"
            :body="kakaoTemplates.find(t => t.id === templatePickerSelectedId)?.body ?? ''"
            :extra="kakaoTemplates.find(t => t.id === templatePickerSelectedId)?.extra"
            :buttons="kakaoTemplates.find(t => t.id === templatePickerSelectedId)?.buttons"
          />
        </AppPhonePreview>
        <div v-else class="picker-preview-empty">템플릿을 선택하면 미리보기가 표시됩니다.</div>
      </template>
    </AppTemplatePickerDialog>
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
.req { color: #ef4444; margin-left: 2px; }
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

.message-locked {
  text-align: center;
  color: var(--gray-500);
  font-size: 14px;
  padding: 64px 16px;
}

.kakao-template-row {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  background: white;
  border: 0;
  border-bottom: 1px solid var(--gray-200);
  font-size: 13px;
  color: var(--gray-800);
  cursor: pointer;
}
.kakao-template-row:hover {
  background: var(--gray-50);
}
.kakao-template-row.is-active {
  background: var(--color-sky-soft);
  color: var(--color-sky-vivid);
  font-weight: 600;
}

.picker-preview-empty {
  text-align: center;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
