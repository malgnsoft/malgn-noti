<script setup lang="ts">
interface PushGroup { id: number | string, key: string, desc: string }

const props = withDefaults(defineProps<{
  open: boolean
  edit?: PushGroup | null
}>(), { edit: null })

const emit = defineEmits<{ close: [], confirm: [PushGroup] }>()
const toast = useToast()

const key = ref('')
const desc = ref('')

watch(() => props.open, (v) => {
  if (v) {
    key.value = props.edit?.key || ''
    desc.value = props.edit?.desc || ''
  }
})

function confirm() {
  if (!key.value.trim()) {
    toast.add({ title: '키를 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  emit('confirm', {
    id: props.edit?.id ?? `pg-${Date.now()}`,
    key: key.value.trim(),
    desc: desc.value.trim()
  })
  emit('close')
}
</script>

<template>
  <AppModal
    :open="open"
    title="그룹"
    :width="420"
    @close="emit('close')"
  >
    <AppFormRow label="키">
      <input v-model="key" class="input">
    </AppFormRow>
    <AppFormRow label="설명">
      <input v-model="desc" class="input">
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
