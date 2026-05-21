<script setup lang="ts">
const props = defineProps<{
  open: boolean
  kind: 'number' | 'email'
  selectOptions: string[]
}>()
const emit = defineEmits<{ close: [], submit: [] }>()
const toast = useToast()

const isNum = computed(() => props.kind === 'number')
const L = computed(() => isNum.value
  ? {
      title: '수신 거부 번호 일괄 등록',
      fieldLabel: '080 수신 거부 번호',
      selectPlaceholder: '080 수신 거부 번호 선택',
      notice: [
        { text: '080 수신 거부 번호를 선택 후 템플릿을 내려받아 수신 거부 번호를 입력하세요.', sub: '080 수신 거부 번호는 [발신 정보 > 080 수신 거부 번호 관리]에서 등록할 수 있습니다.' },
        { text: '템플릿 양식에 맞춰 .xlsx 파일로 업로드하세요.' },
      ],
    }
  : {
      title: '수신 거부 이메일 일괄 등록',
      fieldLabel: '이메일 도메인',
      selectPlaceholder: '이메일 도메인 선택',
      notice: [
        { text: '이메일 도메인을 선택 후 템플릿을 내려받아 수신 거부 이메일을 입력하세요.', sub: '도메인은 [발신 정보 > 도메인 관리]에서 등록할 수 있습니다.' },
        { text: '템플릿 양식에 맞춰 .xlsx 파일로 업로드하세요.' },
      ],
    })

const selectValue = ref('')
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

watch(() => props.open, (v) => {
  if (!v) return
  selectValue.value = ''
  file.value = null
})

const MAX_SIZE = 1_000_000 // 1MB
function onPickFile(e: Event) {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  if (!f) return
  if (f.name.split('.').pop()?.toLowerCase() !== 'xlsx') {
    toast.add({ title: '.xlsx 파일 형식만 등록할 수 있습니다.', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (f.size > MAX_SIZE) {
    toast.add({ title: '파일 용량은 최대 1MB까지 가능합니다.', icon: 'i-lucide-octagon-alert' })
    return
  }
  file.value = f
}
function onTemplate() {
  toast.add({ title: '양식 다운로드', description: '등록 양식(.xlsx) 다운로드는 준비 중입니다.', icon: 'i-lucide-download' })
}
function onSave() {
  if (!selectValue.value) {
    toast.add({ title: `${L.value.fieldLabel}을(를) 선택하세요.`, icon: 'i-lucide-circle-alert' })
    return
  }
  if (!file.value) {
    toast.add({ title: '등록할 .xlsx 파일을 선택하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('submit')
  toast.add({ title: L.value.title, description: `'${file.value.name}' 파일로 일괄 등록을 요청했습니다.`, icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" :title="L.title" :width="560" @close="emit('close')">
    <ul class="ob-notice">
      <li v-for="(n, i) in L.notice" :key="i">
        {{ n.text }}
        <ul v-if="n.sub">
          <li>{{ n.sub }}</li>
        </ul>
      </li>
    </ul>

    <div class="ob-row">
      <label class="ob-label">{{ L.fieldLabel }}</label>
      <select v-model="selectValue" class="select">
        <option value="">
          {{ L.selectPlaceholder }}
        </option>
        <option v-for="o in selectOptions" :key="o" :value="o">
          {{ o }}
        </option>
      </select>
    </div>

    <div class="ob-divider" />

    <button type="button" class="btn btn-outline ob-tpl" @click="onTemplate">
      <UIcon name="i-lucide-download" class="text-[length:var(--fz-sm)]" /> 양식 다운로드
    </button>
    <div class="ob-file-row">
      <input class="input ob-filename" :value="file?.name || ''" readonly placeholder="파일을 선택하세요.">
      <input ref="fileInput" type="file" accept=".xlsx" class="ob-file-hidden" @change="onPickFile">
      <button type="button" class="btn btn-outline" @click="fileInput?.click()">
        <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 파일 선택
      </button>
    </div>
    <p class="ob-file-hint">
      .xlsx 파일 형식으로 등록하세요. (최대 용량: 1MB)
    </p>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onSave">
        저장
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.ob-notice {
  margin: 0 0 16px;
  padding-left: 18px;
  list-style: disc;
}
.ob-notice > li {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
}
.ob-notice ul {
  margin: 2px 0;
  padding-left: 16px;
  list-style: '- ';
}
.ob-notice ul li {
  font-size: var(--fz-sm);
  color: var(--ink-400);
  line-height: 1.7;
}

.ob-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  align-items: center;
}
.ob-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-700);
}
.ob-row .select {
  width: 100%;
}

.ob-divider {
  height: 1px;
  background: var(--line);
  margin: 18px 0;
}

.ob-tpl {
  margin-bottom: 14px;
}
.ob-file-row {
  display: flex;
  gap: 8px;
}
.ob-filename {
  flex: 1;
  min-width: 0;
}
.ob-file-hidden {
  display: none;
}
.ob-file-hint {
  margin-top: 8px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
</style>
