<script setup lang="ts">
withDefaults(defineProps<{
  optionNumbers?: string[]                      // 등록된 080 번호 목록
}>(), {
  optionNumbers: () => [],
})

const open = defineModel<boolean>('open', { default: false })
const selectedNumber = defineModel<string>('selectedNumber', { default: '' })

const emit = defineEmits<{
  confirm: [selectedNumber: string]
  cancel: []
}>()

function onConfirm() {
  emit('confirm', selectedNumber.value)
  open.value = false
}

function onCancel() {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-md' }" :dismissible="false">
    <template #body>
      <div class="ad-body">
        <h4 class="modal-title">알림</h4>
        <p class="lead">
          광고성 문자 발송 시 발송 표기 의무 사항을 준수해야 합니다.<br>
          광고성 안내 문구를 추가하시겠습니까?
        </p>
        <ul class="bullet">
          <li>내용 맨 앞단 (광고) 문구 추가</li>
          <li>내용 하단 080 수신 거부 번호 추가</li>
        </ul>

        <p class="subhead">[080 수신 거부 번호]</p>
        <ul class="bullet">
          <li>080 수신 거부 번호는 [발신 정보 &gt; 080 수신 거부 관리] 메뉴에서 신청 가능합니다.</li>
        </ul>

        <USelect
          v-model="selectedNumber"
          :items="optionNumbers"
          placeholder="080 수신 거부 번호 선택"
          class="w-full mt-2"
        />
      </div>
    </template>
    <template #footer>
      <div class="footer-actions">
        <UButton color="neutral" variant="outline" @click="onCancel">취소</UButton>
        <UButton class="btn-confirm" @click="onConfirm">확인</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.ad-body { padding: 8px 0; }
.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
}
.lead {
  font-size: 14px;
  color: var(--gray-700);
  line-height: 1.6;
  margin-bottom: 12px;
}
.bullet {
  list-style: disc;
  padding-left: 20px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--gray-600);
  line-height: 1.8;
}
.subhead {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
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
