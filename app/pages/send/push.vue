<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: 'PUSH 발송' })
const toast = useToast()
const router = useRouter()

const useTemplate = ref<'off' | 'on'>('off')
const pushType = ref('info')
const inputMode = ref('basic')
const htmlStyle = ref<'on' | 'off'>('on')
const title = ref('')
const body = ref('')
const badge = ref('')
const jsonPayload = ref(JSON.stringify({ title: '', body: '', data: {} }, null, 2))
const recipients = ref<Recipient[]>([])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)
const openTpl = ref(false)
const pushTemplateName = ref('')

const extensionRows = ['버튼', '미디어', 'Android 미디어', 'iOS 미디어', 'Android 큰 아이콘', '그룹']

function onPickPushTpl(t: { name: string, title: string, body: string }) {
  pushTemplateName.value = t.name
  title.value = t.title
  body.value = t.body
  toast.add({ title: `"${t.name}" 템플릿을 적용했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}
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
      <!-- 템플릿 선택 -->
      <AppSendFormCard title="템플릿 선택">
        <AppFormRow label="템플릿 사용유무">
          <AppRadioGroup
            v-model="useTemplate"
            :options="[{ value: 'off', label: '사용 안함' }, { value: 'on', label: '사용' }]"
          />
        </AppFormRow>
        <AppFormRow label="템플릿 선택">
          <div class="row" style="gap: 12px; flex-wrap: wrap">
            <span style="font-size: 13px; color: var(--ink-900)">
              {{ pushTemplateName || '선택된 템플릿 없음' }}
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
        key-column="token"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <!-- 메시지 설정 -->
      <AppSendFormCard title="메시지 설정" required>
        <div class="msg-grid">
          <div class="col">
            <AppFormRow label="발송 목적" required>
              <AppRadioGroup
                v-model="pushType"
                :options="[{ value: 'info', label: '일반용' }, { value: 'ad', label: '광고용' }]"
              />
            </AppFormRow>
            <AppFormRow label="입력 유형">
              <AppRadioGroup
                v-model="inputMode"
                :options="[{ value: 'basic', label: '기본' }, { value: 'json', label: 'JSON' }]"
              />
            </AppFormRow>

            <template v-if="inputMode === 'basic'">
              <div class="push-box">
                <AppFormRow label="HTML 스타일">
                  <AppRadioGroup
                    v-model="htmlStyle"
                    :options="[{ value: 'on', label: '사용' }, { value: 'off', label: '사용 안함' }]"
                  />
                </AppFormRow>
                <AppFormRow label="제목">
                  <input v-model="title" class="input" placeholder="제목을 입력하세요.">
                </AppFormRow>
                <AppFormRow label="내용">
                  <textarea v-model="body" class="textarea" rows="6" placeholder="내용을 입력하세요. 치환자는 #{name} 형식으로 작성합니다." />
                </AppFormRow>
              </div>
            </template>
            <AppFormRow v-else label="JSON 페이로드">
              <textarea
                v-model="jsonPayload"
                class="textarea"
                rows="12"
                style="font-family: var(--font-mono); font-size: 12px"
              />
            </AppFormRow>

            <AppFormRow label="배지">
              <input v-model="badge" class="input" inputmode="numeric" placeholder="숫자만 입력" style="max-width: 240px">
            </AppFormRow>
            <AppFormRow v-for="row in extensionRows" :key="row" :label="row">
              <button type="button" class="btn btn-sky btn-sm" style="align-self: flex-start">
                <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
              </button>
            </AppFormRow>
          </div>
          <div>
            <div class="push-prev-caps">
              <span>Android</span>
              <span>iOS</span>
            </div>
            <div class="push-previews">
              <AppPushPreview app-name="앱 알림" :title="title" :body="body" />
              <AppPushPreview app-name="앱 알림" :title="title" :body="body" />
            </div>
            <div class="push-help">
              <UIcon name="i-lucide-info" class="text-[12px]" />
              <span>디바이스에 따라 실제 메시지 수신 화면과 미리보기 화면이 다를 수 있으며, 일부 기능(애니메이션, 사운드 등)은 미리보기에서 지원되지 않을 수 있습니다.</span>
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

    <AppPushTemplateDialog :open="openTpl" @close="openTpl = false" @pick="onPickPushTpl" />
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
.msg-grid { display: grid; grid-template-columns: minmax(0, 1fr) min-content; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
.push-box {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 4px 16px;
  background: var(--paper);
  margin: 8px 0;
}
.push-prev-caps {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.push-prev-caps span {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--ink-500);
  margin-bottom: 8px;
}
.push-previews {
  display: flex;
  gap: 16px;
}
.push-help {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--ink-50);
  border-radius: var(--r-md);
  font-size: 11px;
  color: var(--ink-500);
  line-height: 1.6;
  max-width: 576px;
}
</style>
