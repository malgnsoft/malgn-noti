<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: 'PUSH 발송' })
const toast = useToast()
const router = useRouter()

const pushType = ref('info')
const inputMode = ref('basic')
const title = ref('타임세일 시작!')
const body = ref('VIP 전용 타임세일이 시작되었어요. 지금 확인하기')
const jsonPayload = ref(JSON.stringify({ title: '타임세일 시작!', body: 'VIP 전용 타임세일', data: { url: '/sale' } }, null, 2))
const recipients = ref<Recipient[]>([
  { id: 1, name: '이수민', token: 'eXamp1eToken-7f4a92...' },
  { id: 2, name: '박지훈', token: 'eXamp1eToken-3c1b08...' },
  { id: 3, name: '최예진', token: 'eXamp1eToken-9d7e21...' }
])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)

const extraOptions = ['대표 이미지', 'iOS 미디어', 'Android 미디어', '큰 아이콘', '그룹 ID']

function onManualConfirm(r: Recipient) {
  recipients.value = editTarget.value
    ? recipients.value.map(x => x.id === r.id ? r : x)
    : [...recipients.value, r]
}
function send() {
  openConfirm.value = false
  toast.add({ title: 'PUSH 발송 시작', color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/push'), 1000)
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · PUSH
      </div>
      <h1>PUSH 발송</h1>
      <p>모바일 앱 푸시 알림. 무료.</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px">
      <AppRecipientCard
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        key-column="token"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <AppSendFormCard step="1" title="발신 정보">
        <AppFormRow label="앱 / 인증서">
          <select class="select" style="max-width: 320px">
            <option>몰리몰리 앱 (iOS · Android)</option>
            <option>몰리몰리 파트너 (iOS · Android)</option>
          </select>
        </AppFormRow>
        <AppFormRow label="푸시 유형">
          <AppRadioGroup
            v-model="pushType"
            :options="[{ value: 'info', label: '정보성' }, { value: 'ad', label: '광고성' }]"
          />
        </AppFormRow>
        <AppFormRow label="입력 모드">
          <AppSegmented
            v-model="inputMode"
            :options="[
              { value: 'basic', label: '기본 (제목 + 본문)' },
              { value: 'json', label: 'JSON 페이로드' },
            ]"
          />
        </AppFormRow>
      </AppSendFormCard>

      <AppSendFormCard step="3" title="메시지" required>
        <div class="msg-grid">
          <div>
            <template v-if="inputMode === 'basic'">
              <AppFormRow label="제목" required>
                <input v-model="title" class="input">
              </AppFormRow>
              <AppFormRow label="본문" required>
                <textarea v-model="body" class="textarea" rows="5" />
              </AppFormRow>
            </template>
            <AppFormRow v-else label="JSON 페이로드">
              <textarea
                v-model="jsonPayload"
                class="textarea"
                rows="12"
                style="font-family: var(--font-mono); font-size: 12px"
              />
            </AppFormRow>
            <AppFormRow label="확장 옵션">
              <div class="row" style="flex-wrap: wrap; gap: 6px">
                <button v-for="n in extraOptions" :key="n" type="button" class="btn btn-outline btn-sm">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> {{ n }}
                </button>
              </div>
            </AppFormRow>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기 (잠금화면)
            </div>
            <div style="display: grid; place-items: center">
              <AppPushPreview app-name="몰리몰리" :title="title" :body="body" />
            </div>
          </div>
        </div>
      </AppSendFormCard>

      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="recipients.length === 0"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

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
    <AppConfirmDialog
      :open="openReset"
      title="초기화"
      message="입력 초기화"
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="() => { recipients = []; openReset = false }"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      channel="PUSH"
      :count="recipients.length"
      :price-per-unit="0"
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.msg-grid { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
</style>
