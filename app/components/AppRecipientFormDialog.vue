<script setup lang="ts">
export interface RecipientFormValue {
  alias?: string
  phone?: string
  email?: string
  token?: string
  pushType?: string
  substitution?: string
}

const props = withDefaults(defineProps<{
  title?: string
  fields: ('alias' | 'phone' | 'email' | 'token' | 'pushType' | 'substitution')[]
  substitutionPlaceholder?: string
  pushTypeOptions?: string[]
}>(), {
  title: '수신자 정보',
  substitutionPlaceholder: '치환자 값',
  pushTypeOptions: () => ['FCM', 'APNS', 'APNS_SANDBOX', 'APNS_VOIP', 'APNS_SANDBOX_VOIP', 'ADM'],
})

const open = defineModel<boolean>('open', { default: false })
const value = defineModel<RecipientFormValue>('value', { default: () => ({}) })

const emit = defineEmits<{
  confirm: [value: RecipientFormValue]
  cancel: []
}>()

function onConfirm() {
  emit('confirm', value.value)
  open.value = false
}

function onCancel() {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :ui="{ content: 'sm:max-w-md' }">
    <template #body>
      <div class="form-stack">
        <div v-if="fields.includes('alias')" class="form-row">
          <label class="form-label">수신자 별칭</label>
          <UInput v-model="value.alias" placeholder="수신자 별칭" />
        </div>
        <div v-if="fields.includes('phone')" class="form-row">
          <label class="form-label">휴대폰 번호</label>
          <UInput v-model="value.phone" placeholder="-없이 숫자 입력" maxlength="11" />
        </div>
        <div v-if="fields.includes('email')" class="form-row">
          <label class="form-label">이메일</label>
          <UInput v-model="value.email" type="email" placeholder="example@domain.com" />
        </div>
        <div v-if="fields.includes('pushType')" class="form-row">
          <label class="form-label">푸시 유형</label>
          <USelect v-model="value.pushType" :items="pushTypeOptions" placeholder="푸시 유형 선택" />
        </div>
        <div v-if="fields.includes('token')" class="form-row">
          <label class="form-label">토큰</label>
          <UInput v-model="value.token" placeholder="토큰" />
        </div>
        <div v-if="fields.includes('substitution')" class="form-row">
          <label class="form-label">템플릿 치환자</label>
          <UInput v-model="value.substitution" :placeholder="substitutionPlaceholder" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="footer-actions">
        <UButton color="neutral" variant="outline" @click="onCancel">
          취소
        </UButton>
        <UButton class="btn-confirm" @click="onConfirm">
          확인
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}
.form-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 12px;
}
.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
.btn-confirm {
  background: var(--color-sky-vivid);
  color: white;
}
.btn-confirm:hover {
  background: #016bda;
}
</style>
