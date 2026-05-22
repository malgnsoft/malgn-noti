<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], invited: [{ name: string, email: string }] }>()

const toast = useToast()

const name = ref('')
const email = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailError = computed(() => {
  if (!email.value) return ''
  return EMAIL_RE.test(email.value) ? '' : '올바른 이메일 형식이 아닙니다.'
})
const canSend = computed(() => name.value.trim() !== '' && EMAIL_RE.test(email.value))

watch(() => props.open, (v) => {
  if (v) {
    name.value = ''
    email.value = ''
  }
})

function send() {
  if (!canSend.value) {
    toast.add({ title: '이름과 이메일을 올바르게 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('invited', { name: name.value.trim(), email: email.value.trim() })
  toast.add({
    title: `${email.value.trim()} 으로 초대 메일을 발송했습니다.`,
    color: 'success',
    icon: 'i-lucide-mail-check',
  })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="서비스 담당자 초대" :width="460" @close="emit('close')">
    <p class="iv-desc">
      초대할 서비스 담당자의 이름과 이메일을 입력해 주세요.
      입력한 이메일로 <b>서비스 담당자 등록 안내 메일</b>이 발송됩니다.
    </p>

    <div class="iv-form">
      <div class="iv-row">
        <label for="iv-name">이름 <span class="rq">*</span></label>
        <input
          id="iv-name"
          v-model="name"
          class="input"
          placeholder="담당자 이름을 입력해 주세요"
          @keyup.enter="send"
        >
      </div>
      <div class="iv-row">
        <label for="iv-email">이메일 <span class="rq">*</span></label>
        <input
          id="iv-email"
          v-model="email"
          type="email"
          class="input"
          :class="{ 'has-error': !!emailError }"
          placeholder="example@company.com"
          @keyup.enter="send"
        >
        <p v-if="emailError" class="iv-error">{{ emailError }}</p>
        <p v-else class="iv-help">이 이메일이 서비스 담당자의 로그인 아이디로 사용됩니다.</p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!canSend" @click="send">
        <UIcon name="i-lucide-send" class="text-[length:var(--fz-sm)]" /> 초대 메일 발송
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.iv-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 18px;
}
.iv-desc b { color: var(--ink-700); font-weight: 600; }

.iv-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.iv-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.iv-row label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.rq { color: var(--danger); margin-left: 2px; }
.iv-row .input { width: 100%; }
.iv-row .input.has-error { border-color: var(--danger); }
.iv-error {
  font-size: var(--fz-xs);
  color: var(--danger);
  margin: 0;
}
.iv-help {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0;
}
</style>
