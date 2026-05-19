<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: '이메일 발송' })
const toast = useToast()
const router = useRouter()

const sample: Recipient[] = [
  { id: 1, name: '이수민', email: 'soomin.lee@example.com', vars: { 이름: '이수민' } },
  { id: 2, name: '박지훈', email: 'park.jihoon@example.com', vars: { 이름: '박지훈' } },
  { id: 3, name: '최예진', email: 'yejin.choi@example.com', vars: { 이름: '최예진' } },
  { id: 4, name: '정민호', email: 'minho.jeong@example.com', vars: { 이름: '정민호' } },
  { id: 5, name: '한지영', email: 'jiyoung.han@example.com', vars: { 이름: '한지영' } }
]

const from = ref('noreply@malgnsoft.com')
const purpose = ref('info')
const subject = ref('[몰리몰리] 5월 가정의 달 특별 혜택 안내')
const body = ref('안녕하세요, #{이름}님.\n\n5월 가정의 달을 맞아 준비한 특별 혜택을 안내해 드립니다.\n\n• 전 상품 최대 40% 할인\n• 무료 배송 쿠폰 제공\n• 신규 회원 추가 10% 할인\n\n적용 기간: 2026년 5월 31일까지\n\n감사합니다.')
const files = ref<{ name: string }[]>([])
const recipients = ref<Recipient[]>([...sample])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)
const openAi = ref(false)

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
      <AppRecipientCard
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        key-column="email"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <AppSendFormCard step="1" title="발신 정보" required>
        <AppFormRow label="보낸 사람" required>
          <input v-model="from" class="input" style="max-width: 360px">
        </AppFormRow>
        <AppFormRow label="발송 목적">
          <AppRadioGroup
            v-model="purpose"
            :options="[{ value: 'info', label: '정보성' }, { value: 'ad', label: '광고성' }]"
          />
        </AppFormRow>
      </AppSendFormCard>

      <AppSendFormCard step="3" title="메시지" required>
        <div class="msg-grid">
          <div>
            <AppFormRow label="제목" required>
              <div style="position: relative">
                <input v-model="subject" class="input" style="padding-right: 110px">
                <AppByteCounter :value="subject" :max="1000" unit="char" />
              </div>
            </AppFormRow>
            <AppFormRow label="본문 (HTML)" required>
              <textarea v-model="body" class="textarea" rows="10" />
              <div class="row" style="margin-top: 8px; gap: 6px">
                <button type="button" class="btn btn-outline btn-sm" @click="openAi = true">
                  <UIcon name="i-lucide-sparkles" class="text-[12px]" style="color: var(--accent-ink)" /> AI 문장 다듬기
                </button>
                <span class="muted" style="font-size: 12px; margin-left: auto">치환자 사용 가능 #{{ '{이름}' }}</span>
              </div>
            </AppFormRow>
            <AppFormRow label="첨부파일" help="any · 최대 10개 · 총 30MB · .js .exe 금지">
              <div class="row" style="flex-wrap: wrap; gap: 6px">
                <div v-for="(f, i) in files" :key="i" class="file-chip">
                  <UIcon name="i-lucide-paperclip" class="text-[12px]" />{{ f.name }}
                  <span class="remove" @click="files = files.filter((_, j) => j !== i)">
                    <UIcon name="i-lucide-x" class="text-[12px]" />
                  </span>
                </div>
                <button
                  v-if="files.length < 10"
                  type="button"
                  class="btn btn-outline btn-sm"
                  @click="files = [...files, { name: `첨부파일-${files.length + 1}.pdf` }]"
                >
                  <UIcon name="i-lucide-upload" class="text-[12px]" /> 파일 선택
                </button>
              </div>
            </AppFormRow>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <AppEmailPreview :from="from" :subject="subject" :body="body" />
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
      @confirm="() => { recipients = []; openReset = false }"
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
.msg-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
</style>
