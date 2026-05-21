<script setup lang="ts">
export interface RcsButton {
  type: string
  label: string
  url?: string
  phone?: string
  copyValue?: string
}

const props = defineProps<{ open: boolean, edit?: RcsButton | null }>()
const emit = defineEmits<{ close: [], submit: [btn: RcsButton] }>()
const toast = useToast()

const BUTTON_TYPES = [
  'URL 연결하기',
  '전화 걸기',
  '복사하기',
  '지도 보여주기',
  '지도 검색하기',
  '현재 위치 공유하기',
  '일정 등록하기',
  '대화방 열기',
]

const type = ref('')
const label = ref('')
const url = ref('')
const phone = ref('')
const copyValue = ref('')

const needsUrl = computed(() => type.value === 'URL 연결하기')
const needsPhone = computed(() => type.value === '전화 걸기')
const needsCopy = computed(() => type.value === '복사하기')

watch(() => props.open, (v) => {
  if (!v) return
  type.value = props.edit?.type ?? ''
  label.value = props.edit?.label ?? ''
  url.value = props.edit?.url ?? ''
  phone.value = props.edit?.phone ?? ''
  copyValue.value = props.edit?.copyValue ?? ''
})

function onSubmit() {
  if (!type.value) {
    toast.add({ title: '버튼 유형을 선택하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!label.value.trim()) {
    toast.add({ title: '버튼 이름을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('submit', {
    type: type.value,
    label: label.value.trim(),
    url: needsUrl.value ? url.value.trim() : '',
    phone: needsPhone.value ? phone.value.trim() : '',
    copyValue: needsCopy.value ? copyValue.value.trim() : '',
  })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="버튼" :width="420" @close="emit('close')">
    <div class="rb-row">
      <label class="rb-label">버튼 유형</label>
      <select v-model="type" class="select">
        <option value="">
          버튼 유형 선택
        </option>
        <option v-for="t in BUTTON_TYPES" :key="t" :value="t">
          {{ t }}
        </option>
      </select>
    </div>
    <div v-if="type" class="rb-row">
      <label class="rb-label">버튼 이름</label>
      <input v-model="label" class="input" maxlength="20" placeholder="버튼에 표시될 이름">
    </div>
    <div v-if="needsUrl" class="rb-row">
      <label class="rb-label">URL</label>
      <input v-model="url" class="input" placeholder="https://example.com">
    </div>
    <div v-if="needsPhone" class="rb-row">
      <label class="rb-label">전화번호</label>
      <input v-model="phone" class="input" placeholder="01012345678">
    </div>
    <div v-if="needsCopy" class="rb-row">
      <label class="rb-label">복사할 값</label>
      <input v-model="copyValue" class="input" placeholder="복사할 텍스트">
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!type" @click="onSubmit">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.rb-row {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 12px;
  align-items: center;
}
.rb-row + .rb-row {
  margin-top: 12px;
}
.rb-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
}
.rb-row .select,
.rb-row .input {
  width: 100%;
}
</style>
