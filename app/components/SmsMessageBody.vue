<script setup lang="ts">
import type { ChannelMeta } from '~/types/channel'

export interface SmsFormValue {
  senderNumber: string
  purpose: 'general' | 'auth' | 'ad'
  smsType: 'sms' | 'lms' | 'mms'
  subject: string
  body: string
  attachments: File[]
}

const props = defineProps<{
  meta: ChannelMeta
  templateUsed: boolean
  senderOptions: string[]
}>()

const value = defineModel<SmsFormValue>('value', { required: true })

defineEmits<{
  openAi: []
}>()

const currentVariant = computed(() => resolveBodyVariant(props.meta, value.value.smsType))
const senderLocked = computed(() => isFieldLocked(props.meta, 'sender', props.templateUsed))
const purposeLocked = computed(() => isFieldLocked(props.meta, 'purpose', props.templateUsed))
const sendTypeLocked = computed(() => isFieldLocked(props.meta, 'sendType', props.templateUsed))
const aiLocked = computed(() => isFieldLocked(props.meta, 'ai', props.templateUsed))

function utf8Bytes(s: string) {
  return new TextEncoder().encode(s).length
}
const bodyBytes = computed(() => utf8Bytes(value.value.body))
const subjectBytes = computed(() => utf8Bytes(value.value.subject))
</script>

<template>
  <div class="sms-message-body">
    <div class="form-row">
      <label class="form-label">발신 번호 <span class="req">*</span></label>
      <div class="form-control">
        <USelect
          v-model="value.senderNumber"
          :items="senderOptions"
          :disabled="senderLocked"
          placeholder="선택하세요"
          class="w-full"
        />
        <p class="help-text">
          전기통신사업법 관련 고시 준수를 위해 발신 번호 등록 시 발신 번호에 대한 명의자 인증이 필요합니다.<br>
          [발신 정보 &gt; 발신 번호 관리] 메뉴에서 발신 번호를 사전 등록하세요.
        </p>
      </div>
    </div>

    <div class="form-row">
      <label class="form-label">발송 목적 <span class="req">*</span></label>
      <div class="form-control">
        <div class="radio-group">
          <label class="radio"><input v-model="value.purpose" type="radio" value="general" :disabled="purposeLocked"><span>일반용</span></label>
          <label class="radio"><input v-model="value.purpose" type="radio" value="auth" :disabled="purposeLocked"><span>인증용</span></label>
          <label class="radio"><input v-model="value.purpose" type="radio" value="ad" :disabled="purposeLocked"><span>광고용</span></label>
        </div>
        <p class="help-text">
          광고성 정보 발송 시 수신자가 수신 거부나 수신 동의 철회를 무료로 할 수 있도록 무료 수신 거부 방법을 반드시 포함해야 합니다.
        </p>
      </div>
    </div>

    <div class="form-row">
      <label class="form-label">발송 유형 <span class="req">*</span></label>
      <div class="form-control">
        <div class="radio-group">
          <label class="radio"><input v-model="value.smsType" type="radio" value="sms" :disabled="sendTypeLocked"><span>SMS</span></label>
          <label class="radio"><input v-model="value.smsType" type="radio" value="lms" :disabled="sendTypeLocked"><span>LMS</span></label>
          <label class="radio"><input v-model="value.smsType" type="radio" value="mms" :disabled="sendTypeLocked"><span>MMS</span></label>
        </div>
      </div>
    </div>

    <div v-if="currentVariant.fields.includes('subject')" class="form-row">
      <label class="form-label">제목 <span class="req">*</span></label>
      <div class="form-control">
        <div class="input-with-counter">
          <UInput v-model="value.subject" :maxlength="40" class="w-full" />
          <span class="inline-counter">{{ subjectBytes }}/40 Bytes(EUC-KR)</span>
        </div>
      </div>
    </div>

    <div class="form-row">
      <label class="form-label">내용 <span class="req">*</span></label>
      <div class="form-control">
        <div class="ai-toolbar">
          <button type="button" class="ai-btn" :disabled="aiLocked" @click="$emit('openAi')">
            <UIcon name="i-bi-stars" class="size-3.5" /> AI 문장 다듬기
          </button>
        </div>
        <div class="textarea-wrap">
          <UTextarea v-model="value.body" :rows="10" class="w-full" />
          <div class="byte-counter">
            <template v-if="value.smsType === 'sms'">
              국내 SMS {{ bodyBytes }}/90Bytes(EUC-KR)<br>
              국제 SMS {{ value.body.length }}/765자(GSM-7)
            </template>
            <template v-else>
              {{ bodyBytes }}/{{ currentVariant.body?.counter?.max ?? 2000 }} Bytes(EUC-KR)
            </template>
          </div>
        </div>
      </div>
    </div>

    <div v-if="currentVariant.fields.includes('attach')" class="form-row">
      <label class="form-label">첨부파일 <span class="req">*</span></label>
      <div class="form-control">
        <AppFileUploader
          v-if="currentVariant.attach"
          v-model:files="value.attachments"
          :rules="currentVariant.attach"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sms-message-body { display: flex; flex-direction: column; }

.form-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: start;
  gap: 16px;
  padding: 12px 0;
}
.form-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--gray-700);
  padding-top: 8px;
}
.req { color: #ef4444; margin-left: 2px; }
.form-control { display: flex; flex-direction: column; gap: 8px; }

.radio-group { display: flex; gap: 24px; padding: 6px 0; }
.radio { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: var(--fz-md); color: var(--gray-700); }
.radio input[type='radio'] { accent-color: var(--primary-color); cursor: pointer; }
.radio input:disabled { cursor: not-allowed; }
.help-text { font-size: var(--fz-sm); color: var(--gray-500); line-height: 1.6; margin-top: 4px; }

.input-with-counter { position: relative; width: 100%; }
.inline-counter {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--fz-xs);
  color: var(--gray-500);
  pointer-events: none;
}

.ai-toolbar { display: flex; justify-content: flex-end; margin-bottom: 8px; }
.ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--primary-color);
  border-radius: 999px;
  color: var(--primary-color);
  font-size: var(--fz-sm);
  font-weight: 500;
  cursor: pointer;
}
.ai-btn:disabled {
  border-color: var(--gray-300);
  color: var(--gray-400);
  cursor: not-allowed;
}

.textarea-wrap { position: relative; }
.byte-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  text-align: right;
  font-size: var(--fz-xs);
  color: var(--gray-500);
  line-height: 1.5;
  pointer-events: none;
}
</style>
