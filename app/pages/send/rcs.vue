<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: 'RCS 발송' })
const toast = useToast()
const router = useRouter()

const sample: Recipient[] = [
  { id: 1, name: '이수민', phone: '010-2345-6789', vars: { 이름: '이수민' } },
  { id: 2, name: '박지훈', phone: '010-9876-5432', vars: { 이름: '박지훈' } },
  { id: 3, name: '최예진', phone: '010-3344-5566', vars: { 이름: '최예진' } },
  { id: 4, name: '정민호', phone: '010-7788-9900', vars: { 이름: '정민호' } },
  { id: 5, name: '한지영', phone: '010-2233-4455', vars: { 이름: '한지영' } }
]

const brand = ref('malgn-default')
const senderNumber = ref('1588-1234')
const purpose = ref('info')
const msgType = ref('standalone')
const deliveryType = ref('standalone')
const fallback = ref('sms')
const body = ref('[몰리몰리] #{이름}님, VIP 등급으로 승급되셨습니다!\n\n특별 혜택을 확인해 보세요.')
const hasImage = ref(true)
const buttons = ref<{ type: string, label: string }[]>([
  { type: 'web', label: '혜택 확인하기' },
  { type: 'phone', label: '고객센터 전화' }
])
const expiry = ref('24')
const recipients = ref<Recipient[]>([...sample])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)
const openButton = ref(false)
const openAi = ref(false)

const brandName = computed(() => brand.value === 'molly' ? '몰리몰리' : '맑은소프트')

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
      <AppRecipientCard
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        key-column="phone"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <AppSendFormCard step="1" title="발신 정보" required>
        <AppFormRow label="RCS 브랜드" required>
          <select v-model="brand" class="select" style="max-width: 320px">
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
        </AppFormRow>
        <AppFormRow label="발신번호" required>
          <select v-model="senderNumber" class="select" style="max-width: 240px">
            <option>1588-1234</option>
            <option>02-555-1234</option>
          </select>
        </AppFormRow>
        <AppFormRow label="발송 목적" required>
          <AppRadioGroup
            v-model="purpose"
            :options="[
              { value: 'info', label: '정보성' },
              { value: 'ad', label: '광고성' },
              { value: 'auth', label: '인증' },
            ]"
          />
        </AppFormRow>
        <AppFormRow label="발송 유형" required help="3-단 선택: 메시지 유형 → 전송 방식 → 대체 전송">
          <div class="row" style="gap: 8px; flex-wrap: wrap">
            <select v-model="msgType" class="select" style="max-width: 160px">
              <option value="standalone">
                템플릿 미사용
              </option>
              <option value="template">
                템플릿 사용
              </option>
              <option value="lms">
                LMS
              </option>
            </select>
            <select v-model="deliveryType" class="select" style="max-width: 160px">
              <option value="standalone">
                단독 발송
              </option>
              <option value="grouped">
                그룹 발송
              </option>
            </select>
            <select v-model="fallback" class="select" style="max-width: 200px">
              <option value="sms">
                대체전송: SMS
              </option>
              <option value="unified-sms">
                대체전송: 통합 SMS
              </option>
              <option value="none">
                대체전송 없음
              </option>
            </select>
          </div>
        </AppFormRow>
      </AppSendFormCard>

      <AppSendFormCard step="3" title="메시지" required>
        <div class="msg-grid">
          <div>
            <AppFormRow label="대표 이미지">
              <div class="row" style="gap: 8px">
                <AppRadioGroup
                  :model-value="hasImage ? 'on' : 'off'"
                  :options="[{ value: 'off', label: '없음' }, { value: 'on', label: '사용' }]"
                  @update:model-value="(v) => hasImage = v === 'on'"
                />
                <button v-if="hasImage" type="button" class="btn btn-outline btn-sm">
                  <UIcon name="i-lucide-upload" class="text-[12px]" /> 이미지 업로드
                </button>
              </div>
            </AppFormRow>
            <AppFormRow label="본문" required>
              <div style="position: relative">
                <textarea
                  v-model="body"
                  class="textarea"
                  rows="6"
                  style="padding-right: 110px; padding-bottom: 28px"
                />
                <AppByteCounter :value="body" :max="100" unit="char" />
              </div>
              <div class="row" style="margin-top: 8px; gap: 6px">
                <button type="button" class="btn btn-outline btn-sm" @click="openAi = true">
                  <UIcon name="i-lucide-sparkles" class="text-[12px]" style="color: var(--accent-ink)" /> AI 문장 다듬기
                </button>
              </div>
            </AppFormRow>
            <AppFormRow label="버튼" help="최대 4개까지 추가할 수 있습니다.">
              <div class="col" style="gap: 6px">
                <div v-for="(b, i) in buttons" :key="i" class="rcs-btn-row">
                  <UIcon
                    :name="b.type === 'web' ? 'i-lucide-external-link' : b.type === 'phone' ? 'i-lucide-phone' : 'i-lucide-message-square'"
                    class="text-[12px]"
                  />
                  <span>{{ b.label }}</span>
                  <AppBadge tone="neutral" style="margin-left: auto">
                    {{ b.type }}
                  </AppBadge>
                  <button type="button" class="btn btn-ghost btn-sm" @click="buttons = buttons.filter((_, j) => j !== i)">
                    <UIcon name="i-lucide-trash-2" class="text-[12px]" />
                  </button>
                </div>
                <button
                  v-if="buttons.length < 4"
                  type="button"
                  class="btn btn-outline btn-sm"
                  style="align-self: flex-start"
                  @click="openButton = true"
                >
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 버튼 추가
                </button>
              </div>
            </AppFormRow>
            <AppFormRow label="유효기간">
              <select v-model="expiry" class="select" style="max-width: 160px">
                <option value="1">
                  1시간
                </option>
                <option value="6">
                  6시간
                </option>
                <option value="24">
                  24시간
                </option>
                <option value="72">
                  3일
                </option>
              </select>
            </AppFormRow>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--ink-500); margin-bottom: 8px; text-align: center">
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
        <button type="button" class="btn btn-sky" @click="openButton = false">
          추가
        </button>
      </template>
    </AppModal>

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
      @confirm="() => { recipients = []; body = ''; openReset = false }"
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
  font-size: 12px;
}
</style>
