<script setup lang="ts">
export interface KakaoButton {
  type: string
  label: string
  mobileUrl?: string
  pcUrl?: string
}

const props = defineProps<{ open: boolean, edit?: KakaoButton | null }>()
const emit = defineEmits<{ close: [], submit: [btn: KakaoButton] }>()
const toast = useToast()

const BUTTON_TYPES = ['웹 링크', '앱 링크', '봇 전환', '상담톡 전환', '채널 추가', '배송 조회']

const type = ref('웹 링크')
const label = ref('')
const mobileUrl = ref('')
const pcUrl = ref('')

const isLink = computed(() => type.value === '웹 링크' || type.value === '앱 링크')

watch(() => props.open, (v) => {
  if (!v) return
  type.value = props.edit?.type ?? '웹 링크'
  label.value = props.edit?.label ?? ''
  mobileUrl.value = props.edit?.mobileUrl ?? ''
  pcUrl.value = props.edit?.pcUrl ?? ''
})

function onSubmit() {
  if (!label.value.trim()) {
    toast.add({ title: '버튼 이름을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('submit', {
    type: type.value,
    label: label.value.trim(),
    mobileUrl: isLink.value ? mobileUrl.value.trim() : '',
    pcUrl: isLink.value ? pcUrl.value.trim() : '',
  })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" :title="edit ? '버튼 수정' : '버튼 추가'" :width="460" @close="emit('close')">
    <div class="kb-row">
      <label class="kb-label">버튼 유형</label>
      <select v-model="type" class="select">
        <option v-for="t in BUTTON_TYPES" :key="t" :value="t">
          {{ t }}
        </option>
      </select>
    </div>
    <div class="kb-row">
      <label class="kb-label">버튼 이름</label>
      <input v-model="label" class="input" maxlength="14" placeholder="버튼 이름을 입력하세요.">
    </div>
    <template v-if="isLink">
      <div class="kb-row">
        <label class="kb-label">모바일 링크</label>
        <input v-model="mobileUrl" class="input" placeholder="https://">
      </div>
      <div class="kb-row">
        <label class="kb-label">PC 링크</label>
        <input v-model="pcUrl" class="input" placeholder="https://">
      </div>
    </template>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onSubmit">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.kb-row {
  display: grid;
  grid-template-columns: 86px 1fr;
  gap: 12px;
  align-items: center;
}
.kb-row + .kb-row {
  margin-top: 12px;
}
.kb-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
}
.kb-row .select,
.kb-row .input {
  width: 100%;
}
</style>
