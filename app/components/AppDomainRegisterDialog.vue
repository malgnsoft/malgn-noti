<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], registered: [string] }>()

const toast = useToast()

const ROOT_RE = /^(?!-)[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i

const domain = ref('')
const checked = ref(false)

watch(domain, () => { checked.value = false })
watch(() => props.open, (v) => {
  if (v) {
    domain.value = ''
    checked.value = false
  }
})

function onVerify() {
  const v = domain.value.trim().toLowerCase()
  if (!v) {
    toast.add({ title: '이메일 도메인을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!ROOT_RE.test(v)) {
    toast.add({ title: '올바른 루트 도메인 형식이 아닙니다.', icon: 'i-lucide-octagon-alert' })
    return
  }
  domain.value = v
  checked.value = true
  toast.add({ title: '도메인 검증', description: `'${v}' 도메인을 검증했습니다.`, icon: 'i-lucide-circle-check' })
}
function onConfirm() {
  if (!checked.value) return
  emit('registered', domain.value.trim().toLowerCase())
  toast.add({ title: '도메인 등록', description: `'${domain.value.trim().toLowerCase()}' 도메인을 등록했습니다.`, icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="도메인 등록" :width="460" @close="emit('close')">
    <ul class="dr-notice">
      <li>루트 도메인만 입력할 수 있습니다.</li>
    </ul>
    <div class="dr-row">
      <label class="dr-label">이메일 도메인</label>
      <div class="dr-field">
        <div class="dr-line">
          <input
            v-model="domain"
            class="input"
            placeholder="example.com"
            @keyup.enter="onVerify"
          >
          <button type="button" class="btn btn-soft" @click="onVerify">
            검증
          </button>
        </div>
        <p v-if="checked" class="dr-ok">
          사용 가능한 도메인입니다.
        </p>
        <p v-else class="dr-error">
          도메인을 검증하세요.
        </p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!checked" @click="onConfirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.dr-notice {
  margin: 0 0 16px;
  padding: 12px 16px 12px 30px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  list-style: disc;
}
.dr-notice li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
}
.dr-row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  align-items: start;
}
.dr-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
  padding-top: 9px;
}
.dr-field {
  min-width: 0;
}
.dr-line {
  display: flex;
  gap: 6px;
}
.dr-line .input {
  flex: 1;
  min-width: 0;
}
.dr-error {
  margin-top: 6px;
  font-size: var(--fz-xs);
  color: var(--danger-ink);
}
.dr-ok {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  font-size: var(--fz-xs);
  color: var(--accent-ink);
}
</style>
