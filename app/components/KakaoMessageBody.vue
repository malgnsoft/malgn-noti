<script setup lang="ts">
import type { ChannelMeta } from '~/types/channel'
import type { KakaoButton } from '~/components/AppPhonePreviewKakaoBubble.vue'

/** 변수 슬롯이 포함된 알림톡 본문 — templateText는 원본, variables는 #{var} 입력값 */
export interface TemplateVariableValue {
  templateText: string
  variables: Record<string, string>
}

/**
 * 알림톡 메시지 본문. 모든 필드는 readonly (템플릿 메타) 또는 variable-only.
 * - 발송 목적/메시지 유형/메시지 강조 유형: readonly row
 * - 내용: AppTemplateVariableTextarea (templateBodyEdit='variable-only')
 * - 부가 정보/대표 링크/버튼: 메시지 유형 'extra' 일 때만 표시 (readonly)
 */

export interface KakaoFormValue {
  templateCode: string                        // 템플릿 코드
  kakaoTemplateCode: string                   // 카카오톡 템플릿 코드
  purpose: string                             // baked-in (e.g., '일반용')
  messageType: 'basic' | 'extra'
  emphasisType: string                        // '선택 안함' 등
  body: TemplateVariableValue
  extra?: string                              // 부가 정보 (extra 유형 전용)
  links?: { mobile?: string; pc?: string }    // 대표 링크 (extra 유형 전용)
  buttons?: KakaoButton[]                     // 버튼 (extra 유형 전용)
  securityTemplate: '미설정' | '설정'
}

defineProps<{
  meta: ChannelMeta
}>()

const value = defineModel<KakaoFormValue>('value', { required: true })

const showExtra = computed(() => value.value.messageType === 'extra')
</script>

<template>
  <div class="kakao-message-body">
    <div class="ro-row">
      <span class="ro-label">템플릿 코드</span>
      <span class="ro-value">{{ value.templateCode }}</span>
    </div>
    <div class="ro-row">
      <span class="ro-label">카카오톡 템플릿 코드</span>
      <span class="ro-value">{{ value.kakaoTemplateCode }}</span>
    </div>
    <div class="ro-row">
      <span class="ro-label">발송 목적</span>
      <span class="ro-value">{{ value.purpose }}</span>
    </div>
    <div class="ro-row">
      <span class="ro-label">메시지 유형</span>
      <span class="ro-value">{{ value.messageType === 'basic' ? '기본형' : '부가 정보형' }}</span>
    </div>
    <div class="ro-row">
      <span class="ro-label">메시지 강조 유형</span>
      <span class="ro-value">{{ value.emphasisType }}</span>
    </div>

    <div class="form-row">
      <label class="form-label">내용 <span class="req">*</span></label>
      <div class="form-control">
        <AppTemplateVariableTextarea
          :body="value.body.templateText"
          v-model="value.body.variables"
        />
      </div>
    </div>

    <template v-if="showExtra">
      <div class="form-row">
        <label class="form-label">부가 정보</label>
        <div class="form-control">
          <UTextarea :model-value="value.extra ?? ''" readonly :rows="3" class="w-full readonly-textarea" />
        </div>
      </div>

      <div class="form-row">
        <label class="form-label">대표 링크</label>
        <div class="form-control">
          <table class="link-table">
            <tbody>
              <tr>
                <td class="link-key">모바일</td>
                <td class="link-val">{{ value.links?.mobile ?? '' }}</td>
              </tr>
              <tr>
                <td class="link-key">PC</td>
                <td class="link-val">{{ value.links?.pc ?? '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="value.buttons?.length" class="form-row">
        <label class="form-label">버튼</label>
        <div class="form-control">
          <table class="button-table">
            <thead>
              <tr>
                <th>버튼 유형</th>
                <th>버튼 이름</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(b, i) in value.buttons" :key="i">
                <td>{{ b.type === 'web' ? '웹 링크' : b.type === 'app' ? '앱 링크' : b.type === 'phone' ? '전화' : b.type === 'message' ? '메시지' : '기타' }}</td>
                <td>{{ b.label }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div class="ro-row">
      <span class="ro-label">보안 템플릿 여부</span>
      <span class="ro-value">{{ value.securityTemplate }}</span>
    </div>
  </div>
</template>

<style scoped>
.kakao-message-body { display: flex; flex-direction: column; }

.ro-row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}
.ro-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--gray-700);
}
.ro-value {
  font-size: var(--fz-md);
  color: var(--gray-900);
}

.form-row {
  display: grid;
  grid-template-columns: 140px 1fr;
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

.readonly-textarea :deep(textarea) {
  background: var(--gray-50);
  color: var(--gray-700);
}

.link-table, .button-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  overflow: hidden;
  font-size: var(--fz-md);
}
.link-table td, .button-table td, .button-table th {
  border-bottom: 1px solid var(--gray-200);
  padding: 8px 12px;
}
.link-key {
  background: var(--gray-50);
  font-weight: 500;
  color: var(--gray-700);
  width: 80px;
}
.link-val {
  color: var(--color-sky-vivid);
}
.button-table th {
  background: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
  text-align: center;
}
.button-table td {
  text-align: center;
  color: var(--gray-800);
}
</style>
