<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  desc: string
  currentEmail: string
  confirmLabel: string
}>()
const emit = defineEmits<{ close: [], confirm: [string] }>()

const toast = useToast()

const newEmail = ref('')
const codeSent = ref(false)
const codeDigits = ref(['', '', '', '', '', ''])
const verified = ref(false)
const password = ref('')

const newEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.value))
const fullCode = computed(() => codeDigits.value.join(''))
const canConfirm = computed(() => verified.value && password.value.length > 0)

function reset() {
  newEmail.value = ''
  codeSent.value = false
  codeDigits.value = ['', '', '', '', '', '']
  verified.value = false
  password.value = ''
}
watch(() => props.open, (v) => {
  if (v) reset()
})

function sendCode() {
  if (!newEmailValid.value) {
    toast.add({ title: '올바른 이메일 주소를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  codeSent.value = true
  verified.value = false
  codeDigits.value = ['', '', '', '', '', '']
  toast.add({ title: '인증코드 6자리를 이메일로 발송했습니다.', color: 'info', icon: 'i-lucide-mail' })
}
function onCodeInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement
  const digit = el.value.replace(/\D/g, '').slice(-1)
  codeDigits.value[i] = digit
  el.value = digit
  if (digit) (el.nextElementSibling as HTMLInputElement | null)?.focus()
}
function onCodeKeydown(i: number, e: KeyboardEvent) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Backspace' && !codeDigits.value[i]) {
    (el.previousElementSibling as HTMLInputElement | null)?.focus()
  }
}
function confirmCode() {
  if (!codeSent.value) {
    toast.add({ title: '먼저 인증코드를 발송해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (fullCode.value.length !== 6) {
    toast.add({ title: '인증코드 6자리를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  verified.value = true
  toast.add({ title: '이메일 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}
function submit() {
  if (!canConfirm.value) {
    toast.add({ title: '이메일 인증과 비밀번호 입력을 완료해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('confirm', newEmail.value.trim())
}
</script>

<template>
  <AppModal :open="open" :title="title" :width="520" @close="emit('close')">
    <p class="ec-desc">{{ desc }}</p>

    <div class="ec-form">
      <div class="fld">
        <label>현재 이메일 주소 <span class="rq">*</span></label>
        <input class="input" :value="currentEmail" disabled>
      </div>

      <div class="fld">
        <label>변경할 이메일 주소 <span class="rq">*</span></label>
        <div class="row-inline">
          <input
            v-model="newEmail"
            class="input"
            type="email"
            placeholder="이메일을 입력해 주세요"
            :disabled="verified"
          >
          <button type="button" class="btn btn-primary" :disabled="verified" @click="sendCode">
            인증코드 발송
          </button>
        </div>
      </div>

      <div class="fld">
        <label>인증코드 <span class="rq">*</span></label>
        <div class="row-inline">
          <div class="ec-code-boxes">
            <input
              v-for="(d, i) in codeDigits"
              :key="i"
              :value="d"
              class="ec-code-box"
              inputmode="numeric"
              maxlength="1"
              :disabled="verified || !codeSent"
              @input="onCodeInput(i, $event)"
              @keydown="onCodeKeydown(i, $event)"
            >
          </div>
          <button type="button" class="btn btn-outline-dark" :disabled="verified" @click="confirmCode">
            {{ verified ? '인증 완료' : '확인' }}
          </button>
        </div>
      </div>

      <div class="fld">
        <label>비밀번호 <span class="rq">*</span></label>
        <input
          v-model="password"
          class="input"
          type="password"
          placeholder="로그인 비밀번호를 입력해 주세요."
          autocomplete="current-password"
        >
      </div>

      <button type="button" class="btn btn-primary ec-submit" :disabled="!canConfirm" @click="submit">
        {{ confirmLabel }}
      </button>
    </div>
  </AppModal>
</template>

<style scoped>
.ec-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 18px;
}
.ec-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.fld {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fld > label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.rq { color: var(--danger); margin-left: 2px; }

.row-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}
.row-inline .input { flex: 1; min-width: 0; }
.row-inline .btn { flex: 0 0 auto; height: 36px; }

.ec-code-boxes {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 6px;
}
.ec-code-box {
  flex: 1;
  min-width: 0;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--fz-md);
  color: var(--ink-800);
  outline: none;
  transition: border-color 0.12s, background 0.12s;
}
.ec-code-box:focus { background: var(--white); border-color: var(--ink-300); }
.ec-code-box:disabled { background: var(--ink-50); color: var(--ink-300); }

.ec-submit {
  width: 100%;
  height: 44px;
  margin-top: 6px;
  font-size: var(--fz-md);
  font-weight: 600;
}
</style>
