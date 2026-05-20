<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  edit?: { id: number | string, type: string } | null
}>(), { edit: null })

const emit = defineEmits<{ close: [], confirm: [{ id: number | string, type: string }] }>()
const toast = useToast()

const BUTTON_TYPES = ['응답', '앱 열기', 'URL 열기', '닫기']

const type = ref('')

watch(() => props.open, (v) => {
  if (v) type.value = props.edit?.type || ''
})

function confirm() {
  if (!type.value) {
    toast.add({ title: '버튼 유형을 선택하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  emit('confirm', { id: props.edit?.id ?? `pb-${Date.now()}`, type: type.value })
  emit('close')
}
</script>

<template>
  <AppModal
    :open="open"
    title="버튼"
    :width="420"
    @close="emit('close')"
  >
    <AppFormRow label="버튼 유형">
      <select v-model="type" class="select">
        <option value="">
          유형 선택
        </option>
        <option v-for="t in BUTTON_TYPES" :key="t" :value="t">
          {{ t }}
        </option>
      </select>
    </AppFormRow>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" @click="confirm">
        확인
      </button>
    </template>
  </AppModal>
</template>
