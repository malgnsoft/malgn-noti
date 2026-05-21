<script setup lang="ts">
export interface PushAddPayload {
  label?: string
  link?: string
  url?: string
  value?: string
}

const props = defineProps<{
  open: boolean
  kind: 'button' | 'media' | 'group'
  mediaLabel?: string
}>()
const emit = defineEmits<{ close: [], submit: [payload: PushAddPayload] }>()
const toast = useToast()

const label = ref('')
const link = ref('')
const url = ref('')
const value = ref('')

watch(() => props.open, (v) => {
  if (!v) return
  label.value = ''
  link.value = ''
  url.value = ''
  value.value = ''
})

const title = computed(() => props.kind === 'button'
  ? '버튼 추가'
  : props.kind === 'group'
    ? '그룹 추가'
    : `${props.mediaLabel ?? '미디어'} 추가`)

function onSubmit() {
  if (props.kind === 'button') {
    if (!label.value.trim()) {
      toast.add({ title: '버튼 이름을 입력하세요.', icon: 'i-lucide-circle-alert' })
      return
    }
    emit('submit', { label: label.value.trim(), link: link.value.trim() })
  }
  else if (props.kind === 'media') {
    if (!url.value.trim()) {
      toast.add({ title: 'URL을 입력하세요.', icon: 'i-lucide-circle-alert' })
      return
    }
    emit('submit', { url: url.value.trim() })
  }
  else {
    if (!value.value.trim()) {
      toast.add({ title: '그룹 이름을 입력하세요.', icon: 'i-lucide-circle-alert' })
      return
    }
    emit('submit', { value: value.value.trim() })
  }
  emit('close')
}
</script>

<template>
  <AppModal :open="open" :title="title" :width="440" @close="emit('close')">
    <template v-if="kind === 'button'">
      <div class="pa-row">
        <label class="pa-label">버튼 이름</label>
        <input v-model="label" class="input" maxlength="20" placeholder="버튼에 표시될 이름">
      </div>
      <div class="pa-row">
        <label class="pa-label">링크</label>
        <input v-model="link" class="input" placeholder="https:// 또는 앱 스킴">
      </div>
    </template>
    <template v-else-if="kind === 'media'">
      <div class="pa-row">
        <label class="pa-label">URL</label>
        <input v-model="url" class="input" placeholder="미디어 파일 URL">
      </div>
    </template>
    <template v-else>
      <div class="pa-row">
        <label class="pa-label">그룹 이름</label>
        <input v-model="value" class="input" maxlength="40" placeholder="그룹 키를 입력하세요.">
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
.pa-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  align-items: center;
}
.pa-row + .pa-row {
  margin-top: 12px;
}
.pa-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
}
.pa-row .input {
  width: 100%;
}
</style>
