<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], submit: [] }>()

const toast = useToast()

const MAX_SIZE = 1_000_000 // 1MB
const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)

function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (!f) return
  const ext = f.name.split('.').pop()?.toLowerCase()
  if (ext !== 'xlsx') {
    toast.add({ title: '.xlsx 파일 형식만 등록할 수 있습니다.', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (f.size > MAX_SIZE) {
    toast.add({ title: '파일 용량은 최대 1MB까지 가능합니다.', icon: 'i-lucide-octagon-alert' })
    return
  }
  file.value = f
}
function onDownloadTemplate() {
  toast.add({ title: '양식 다운로드', description: '주소록 등록 양식(.xlsx) 다운로드는 준비 중입니다.', icon: 'i-lucide-download' })
}
function onConfirm() {
  if (!file.value) {
    toast.add({ title: '등록할 .xlsx 파일을 선택하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('submit')
  toast.add({ title: '주소록 일괄 등록', description: `'${file.value.name}' 파일로 일괄 등록을 요청했습니다.`, icon: 'i-lucide-circle-check' })
  emit('close')
}

watch(() => props.open, (v) => {
  if (v) file.value = null
})
</script>

<template>
  <AppModal :open="open" title="주소록 일괄 등록" :width="520" @close="emit('close')">
    <p class="bd-sub">
      엑셀 파일로 여러 연락처를 한 번에 등록합니다.
    </p>
    <div class="bd-divider" />

    <button type="button" class="btn btn-outline bd-tpl" @click="onDownloadTemplate">
      <UIcon name="i-lucide-download" class="text-[length:var(--fz-sm)]" /> 양식 다운로드
    </button>

    <div class="bd-filerow">
      <input
        class="input bd-filename"
        :value="file?.name || ''"
        readonly
        placeholder="선택된 파일 없음"
      >
      <input ref="fileInput" type="file" accept=".xlsx" class="bd-file-hidden" @change="onPick">
      <button type="button" class="btn btn-outline" @click="fileInput?.click()">
        <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 파일 선택
      </button>
    </div>
    <p class="bd-note">
      .xlsx 파일 형식으로 등록하세요. (최대 용량: 1MB)
    </p>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onConfirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.bd-sub {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 14px;
}
.bd-divider {
  height: 1px;
  background: var(--line);
  margin: 0 0 18px;
}
.bd-tpl {
  margin-bottom: 14px;
}
.bd-filerow {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bd-filename {
  flex: 1;
  min-width: 0;
}
.bd-file-hidden {
  display: none;
}
.bd-note {
  margin-top: 8px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
</style>
