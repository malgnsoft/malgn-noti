<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '비밀번호 재설정' })

const toast = useToast()

/* ── 이메일 + OTP 발송/검증 (purpose=reset_password) ──────────
 * 발송·검증 모두 회원가입과 동일한 /auth/email-code/* 엔드포인트를 사용한다.
 * reset_password 의 verify 는 코드를 소비(consume)하므로, 검증에 성공하면
 * 곧바로 새 비밀번호 입력 화면으로 넘어가 한 흐름으로 재설정을 끝낸다.
 * 검증 성공 사실(email + 토큰)은 sessionStorage 로 다음 화면에 전달한다.
 */
const email = ref('')
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

const codeDigits = ref(['', '', '', '', '', ''])
const fullCode = computed(() => codeDigits.value.join(''))

const codeSent = ref(false)
const sending = ref(false)
const verifying = ref(false)

async function sendCode() {
  if (!emailValid.value) {
    toast.add({ title: '올바른 이메일 주소를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  sending.value = true
  try {
    const res = await useApi()<{ data: { sent: boolean, expiresAt: string, mockCode?: string } }>(
      '/auth/email-code/send',
      { method: 'POST', body: { email: email.value.trim(), purpose: 'reset_password' } },
    )
    codeSent.value = true
    codeDigits.value = ['', '', '', '', '', '']

    if (res.data.mockCode) {
      toast.add({ title: `인증코드 발송됨 (개발 모드: ${res.data.mockCode})`, color: 'info', icon: 'i-lucide-mail' })
    }
    else {
      toast.add({ title: '인증코드 6자리를 이메일로 발송했습니다.', color: 'info', icon: 'i-lucide-mail' })
    }
  }
  catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    toast.add({
      title: status === 400 ? '이메일 형식이 올바르지 않습니다.' : '인증코드 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
  finally {
    sending.value = false
  }
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

async function verifyCode() {
  if (!codeSent.value) {
    toast.add({ title: '먼저 인증코드를 발송해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (fullCode.value.length !== 6) {
    toast.add({ title: '인증코드 6자리를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  verifying.value = true
  try {
    await useApi()<{ data: { verified: boolean } }>(
      '/auth/email-code/verify',
      { method: 'POST', body: { email: email.value.trim(), purpose: 'reset_password', code: fullCode.value } },
    )
    // 검증 성공 — email + 코드를 다음 화면으로 넘긴다(완료 API가 한 번 더 검증·소비).
    if (import.meta.client) {
      sessionStorage.setItem(
        'reset-pw',
        JSON.stringify({ email: email.value.trim(), code: fullCode.value, at: Date.now() }),
      )
    }
    toast.add({ title: '인증되었습니다. 새 비밀번호를 설정해 주세요.', color: 'success', icon: 'i-lucide-circle-check' })
    navigateTo('/reset-password/new')
  }
  catch (e: unknown) {
    const data = (e as { data?: { message?: string } })?.data
    toast.add({ title: data?.message ?? '인증코드 확인 실패. 다시 시도해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    verifying.value = false
  }
}
</script>

<template>
  <div class="reset">
    <h2>비밀번호 재설정</h2>
    <p class="lead">
      가입 시 등록한 이메일로 인증코드를 보내드립니다.
    </p>

    <form class="col" style="gap: 16px" @submit.prevent="verifyCode">
      <div class="field-group">
        <label for="reset-email" class="auth-label">이메일</label>
        <div class="id-row">
          <input
            id="reset-email"
            v-model="email"
            type="email"
            class="input"
            placeholder="가입 시 사용한 이메일을 입력해 주세요"
            autocomplete="email"
            inputmode="email"
            :disabled="sending"
          >
          <button
            type="button"
            class="btn btn-outline-dark"
            :disabled="!emailValid || sending"
            @click="sendCode"
          >
            {{ sending ? '발송 중…' : (codeSent ? '재발송' : '인증코드 발송') }}
          </button>
        </div>
      </div>

      <div v-if="codeSent" class="field-group">
        <label class="auth-label">인증코드</label>
        <div class="code-boxes">
          <input
            v-for="(d, i) in codeDigits"
            :key="i"
            :value="d"
            class="code-box"
            inputmode="numeric"
            maxlength="1"
            aria-label="인증코드"
            @input="onCodeInput(i, $event)"
            @keydown="onCodeKeydown(i, $event)"
          >
        </div>
      </div>

      <button
        type="submit"
        class="btn btn-primary btn-lg submit-btn"
        :disabled="!codeSent || fullCode.length !== 6 || verifying"
      >
        {{ verifying ? '확인 중…' : '인증 후 비밀번호 재설정' }}
      </button>
    </form>

    <div class="back-line">
      <NuxtLink to="/login" class="back-link">로그인으로 돌아가기</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.reset h2 {
  text-align: center;
  margin-bottom: 8px;
}
.lead {
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 28px;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.auth-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.id-row {
  display: flex;
  gap: 8px;
}
.id-row .input {
  flex: 1;
  min-width: 0;
}
.code-boxes {
  display: flex;
  gap: 8px;
}
.code-box {
  width: 44px;
  height: 48px;
  text-align: center;
  font-size: var(--fz-lg);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--ink-50);
  color: var(--ink-900);
}
.code-box:focus {
  background: var(--white);
  border-color: var(--ink-300);
  outline: none;
}
.submit-btn {
  width: 100%;
  margin-top: 4px;
}
.back-line {
  margin-top: 18px;
  text-align: center;
  font-size: var(--fz-sm);
}
.back-link {
  color: var(--ink-500);
}
.back-link:hover {
  color: var(--ink-900);
  text-decoration: underline;
}
</style>
