<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '보안 인증' })

const route = useRoute()
const toast = useToast()

/* ── 보안로그인(2단계 인증) 코드 입력 ────────────────────────
 * 보안로그인을 사용 중인 계정이 1차(아이디·비번) 인증을 통과한 직후 도달한다.
 * 발송 방식(email/phone)·마스킹된 수신처는 1차 응답이 쿼리로 넘겨준다.
 *   ?method=email&to=ho***@malgn.example&redirect=/home
 * 백엔드 로그인 2FA 엔드포인트가 확정되기 전까지 verify 호출은 관대하게 처리한다.
 */
const method = computed<'email' | 'phone'>(() => (route.query.method === 'phone' ? 'phone' : 'email'))
const maskedTo = computed(() => (typeof route.query.to === 'string' ? route.query.to : ''))
const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : '/home'))

const methodLabel = computed(() => (method.value === 'phone' ? '휴대전화' : '이메일'))
const destLine = computed(() => {
  const where = maskedTo.value || (method.value === 'phone' ? '등록된 휴대전화' : '등록된 이메일')
  return `${where}(으)로 발송된 6자리 인증코드를 입력해 주세요.`
})

const codeDigits = ref(['', '', '', '', '', ''])
const fullCode = computed(() => codeDigits.value.join(''))

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

/* ── 재발송 쿨다운 (30초) ──────────────────────────────────── */
const cooldown = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

function startCooldown() {
  cooldown.value = 30
  clearInterval(timer)
  timer = setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(timer)
  }, 1000)
}
onMounted(() => startCooldown())
onBeforeUnmount(() => clearInterval(timer))

const resending = ref(false)
async function resend() {
  if (cooldown.value > 0 || resending.value) return
  resending.value = true
  try {
    // TODO(api): 로그인 2FA 코드 재발송 엔드포인트 확정 시 연결.
    await new Promise(r => setTimeout(r, 400))
    codeDigits.value = ['', '', '', '', '', '']
    startCooldown()
    toast.add({ title: `인증코드를 ${methodLabel.value}로 재발송했습니다.`, color: 'info', icon: 'i-lucide-send' })
  }
  finally {
    resending.value = false
  }
}

/* ── 코드 확인 ─────────────────────────────────────────────── */
const verifying = ref(false)
async function verify() {
  if (fullCode.value.length !== 6) {
    toast.add({ title: '인증코드 6자리를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  verifying.value = true
  try {
    // TODO(api): 로그인 2FA verify 엔드포인트 확정 시 연결(현재는 통과 처리).
    await new Promise(r => setTimeout(r, 400))
    toast.add({ title: '보안 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
    navigateTo(redirect.value)
  }
  catch (e: unknown) {
    const data = (e as { data?: { message?: string } })?.data
    toast.add({ title: data?.message ?? '인증코드가 올바르지 않습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    verifying.value = false
  }
}
</script>

<template>
  <div class="security">
    <h2>보안 인증</h2>
    <p class="lead">{{ destLine }}</p>

    <form class="col" style="gap: 16px" @submit.prevent="verify">
      <div class="field-group">
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
        :disabled="fullCode.length !== 6 || verifying"
      >
        {{ verifying ? '확인 중…' : '확인' }}
      </button>
    </form>

    <p class="resend-line">
      코드를 받지 못하셨나요?
      <button
        type="button"
        class="resend-link"
        :disabled="cooldown > 0 || resending"
        @click="resend"
      >
        {{ cooldown > 0 ? `재발송 (${cooldown}초)` : (resending ? '재발송 중…' : '재발송') }}
      </button>
    </p>

    <div class="back-line">
      <NuxtLink to="/login" class="back-link">로그인으로 돌아가기</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.security h2 {
  text-align: center;
  margin-bottom: 8px;
}
.lead {
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 28px;
  line-height: 1.55;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.auth-label {
  align-self: flex-start;
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.code-boxes {
  display: flex;
  gap: 8px;
}
.code-box {
  width: 44px;
  height: 52px;
  text-align: center;
  font-size: var(--fz-xl);
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
.resend-line {
  margin-top: 18px;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.resend-link {
  margin-left: 4px;
  padding: 0;
  background: transparent;
  border: 0;
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--accent-ink);
  cursor: pointer;
}
.resend-link:disabled {
  color: var(--ink-300);
  cursor: default;
}
.resend-link:not(:disabled):hover {
  text-decoration: underline;
}
.back-line {
  margin-top: 14px;
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
