<script setup lang="ts">
import type { AttachRule } from '~/types/channel'

const props = withDefaults(defineProps<{
  rules: AttachRule
  buttonLabel?: string
  placeholder?: string
}>(), {
  buttonLabel: '파일 선택',
  placeholder: '파일을 업로드하세요.',
})

const files = defineModel<File[]>('files', { default: () => [] })
const inputRef = ref<HTMLInputElement | null>(null)
const error = ref<string | null>(null)

const accept = computed(() => {
  if (props.rules.allowedExts?.length) {
    return props.rules.allowedExts.map(e => (e.startsWith('.') ? e : `.${e}`)).join(',')
  }
  return undefined
})

function openPicker() {
  inputRef.value?.click()
}

function validateAndAdd(picked: FileList | null) {
  if (!picked || picked.length === 0) return
  const next = [...files.value, ...Array.from(picked)]

  const r = props.rules

  // count
  if (r.maxCount && next.length > r.maxCount) {
    error.value = `최대 ${r.maxCount}개까지 첨부 가능합니다.`
    return
  }
  // per-file size
  if (r.perFileBytes) {
    for (const f of next) {
      if (f.size > r.perFileBytes) {
        error.value = `1개당 ${(r.perFileBytes / 1024).toFixed(0)}KB 이하만 가능합니다 — ${f.name}`
        return
      }
    }
  }
  // total size
  if (r.totalBytes) {
    const total = next.reduce((s, f) => s + f.size, 0)
    if (total > r.totalBytes) {
      error.value = `합산 용량이 ${(r.totalBytes / 1024).toFixed(0)}KB를 초과합니다.`
      return
    }
  }
  // filename length
  if (r.maxFilenameLength) {
    for (const f of next) {
      if (f.name.length > r.maxFilenameLength) {
        error.value = `파일 이름은 ${r.maxFilenameLength}자 이하여야 합니다 — ${f.name}`
        return
      }
    }
  }
  // banned exts
  if (r.bannedExts?.length) {
    for (const f of next) {
      const ext = `.${f.name.split('.').pop()?.toLowerCase() ?? ''}`
      if (r.bannedExts.map(e => e.toLowerCase()).includes(ext)) {
        error.value = `허용되지 않은 확장자입니다 — ${f.name}`
        return
      }
    }
  }

  error.value = null
  files.value = next
}

function onChange(e: Event) {
  validateAndAdd((e.target as HTMLInputElement).files)
  if (inputRef.value) inputRef.value.value = ''
}

function removeFile(idx: number) {
  files.value = files.value.filter((_, i) => i !== idx)
  error.value = null
}

const fileNames = computed(() => files.value.map(f => f.name).join(', '))
</script>

<template>
  <div class="file-uploader">
    <div class="file-row">
      <UInput :model-value="fileNames" :placeholder="placeholder" readonly class="flex-1" />
      <button type="button" class="btn-pick" @click="openPicker">
        <UIcon name="i-bi-paperclip" class="size-3.5" /> {{ buttonLabel }}
      </button>
      <input
        ref="inputRef"
        type="file"
        :accept="accept"
        multiple
        class="hidden-input"
        @change="onChange"
      >
    </div>

    <ul v-if="files.length" class="file-list">
      <li v-for="(f, i) in files" :key="`${f.name}-${i}`" class="file-item">
        <UIcon name="i-bi-file-earmark" class="size-3.5 shrink-0" />
        <span class="file-name">{{ f.name }}</span>
        <span class="file-size">({{ (f.size / 1024).toFixed(0) }}KB)</span>
        <button type="button" class="file-remove" :aria-label="`${f.name} 제거`" @click="removeFile(i)">
          <UIcon name="i-bi-x-lg" class="size-3" />
        </button>
      </li>
    </ul>

    <p v-if="error" class="file-error">{{ error }}</p>

    <ul class="file-guide">
      <li>첨부 가능 파일 수: 최대 {{ rules.maxCount }}개</li>
      <li v-if="rules.allowedExts">
        지원 파일 형식: {{ rules.allowedExts.map(e => (e.startsWith('.') ? e : `.${e}`)).join(', ') }}
      </li>
      <li v-if="rules.bannedExts">
        미지원 파일 형식: {{ rules.bannedExts.map(e => (e.startsWith('.') ? e : `.${e}`)).join(', ') }}
      </li>
      <li v-if="rules.perFileBytes && rules.totalBytes">
        파일 크기: 1개당 {{ (rules.perFileBytes / 1024).toFixed(0) }}KB 이하,
        1개 이상인 경우 합산 {{ (rules.totalBytes / 1024).toFixed(0) }}KB 이하
      </li>
      <li v-else-if="rules.totalBytes">
        파일 용량: 합산 {{ (rules.totalBytes / 1024 / 1024).toFixed(0) }}MB 이하
      </li>
      <li v-if="rules.resolution">
        해상도: 가로 {{ rules.resolution.maxW }}px, 세로 {{ rules.resolution.maxH }}px 이하
      </li>
      <li v-if="rules.maxFilenameLength">
        파일 이름 길이: 최대 {{ rules.maxFilenameLength }}자
      </li>
    </ul>
  </div>
</template>

<style scoped>
.file-uploader {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-row {
  display: flex;
  gap: 8px;
}
.btn-pick {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--gray-900);
  color: white;
  border: 0;
  border-radius: 6px;
  font-size: var(--fz-md);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}
.btn-pick:hover {
  background: var(--gray-800);
}
.hidden-input {
  display: none;
}
.file-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}
.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 6px;
  font-size: var(--fz-md);
  color: var(--gray-700);
}
.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-size {
  font-size: var(--fz-xs);
  color: var(--gray-500);
}
.file-remove {
  background: none;
  border: 0;
  cursor: pointer;
  color: var(--gray-500);
  padding: 2px;
  border-radius: 4px;
}
.file-remove:hover {
  background: var(--gray-200);
  color: var(--gray-900);
}
.file-error {
  font-size: var(--fz-sm);
  color: #ef4444;
}
.file-guide {
  font-size: var(--fz-sm);
  color: var(--gray-500);
  list-style: disc;
  padding-left: 16px;
  line-height: 1.8;
  margin: 8px 0 0;
}
</style>
