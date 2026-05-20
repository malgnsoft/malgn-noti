<script setup lang="ts">
interface PushMedia {
  id: number | string
  url: string
  mediaType: string
  expand: string
}

const props = withDefaults(defineProps<{
  open: boolean
  edit?: PushMedia | null
  types?: string[]
  showType?: boolean
  showExpand?: boolean
  title?: string
}>(), { edit: null, types: () => ['이미지', 'GIF', '동영상', '소리'], showType: true, showExpand: true, title: '미디어' })

const emit = defineEmits<{ close: [], confirm: [PushMedia] }>()
const toast = useToast()

const EXPAND_OPTIONS = ['사용', '사용 안함']

const url = ref('')
const mediaType = ref('')
const expand = ref('')

watch(() => props.open, (v) => {
  if (v) {
    url.value = props.edit?.url || ''
    // 유형이 단일 옵션이면 자동 선택, 그 외에는 기존 값 또는 빈 값
    mediaType.value = props.edit?.mediaType || (props.types.length === 1 ? props.types[0]! : '')
    expand.value = props.edit?.expand || ''
  }
})

function confirm() {
  if (!url.value.trim()) {
    toast.add({ title: 'URL을 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (props.showType && !mediaType.value) {
    toast.add({ title: '유형을 선택하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (props.showExpand && !expand.value) {
    toast.add({ title: '펼치기 옵션을 선택하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  emit('confirm', {
    id: props.edit?.id ?? `pm-${Date.now()}`,
    url: url.value.trim(),
    mediaType: mediaType.value,
    expand: expand.value
  })
  emit('close')
}
</script>

<template>
  <AppModal
    :open="open"
    :title="title"
    :width="420"
    @close="emit('close')"
  >
    <AppFormRow label="URL">
      <input v-model="url" class="input" placeholder="https://~">
    </AppFormRow>
    <AppFormRow v-if="showType" label="유형">
      <select v-model="mediaType" class="select">
        <option value="">
          유형 선택
        </option>
        <option v-for="t in types" :key="t" :value="t">
          {{ t }}
        </option>
      </select>
    </AppFormRow>
    <AppFormRow v-if="showExpand" label="펼치기">
      <select v-model="expand" class="select">
        <option value="">
          선택
        </option>
        <option v-for="o in EXPAND_OPTIONS" :key="o" :value="o">
          {{ o }}
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
