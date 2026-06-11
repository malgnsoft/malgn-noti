<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '보안 인증' })

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

/* ── 보안로그인(2단계 인증) 코드 입력 ────────────────────────
 * 보안로그인을 사용 중인 계정이 1차(아이디·비번) 인증을 통과한 직후 도달한다.
 * 1차 응답(loginByEmail의 TwoFactorChallenge)이 쿼리로 컨텍스트를 넘겨준다.
 *   ?method=email&to=ho***@malgn.example&pendingToken=<단기토큰>&expiresAt=<ISO>&redirect=/home
 * pendingToken 은 2차 verify·resend 호출의 단기 자격증명(수명 10분, body 전달)이다.
 * method/to/expiresAt 는 재발송 응답으로 갱신될 수 있어 ref(쿼리 초기값)로 보관한다.
 */
const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : '/home'))
const pendingToken = computed(() => (typeof route.query.pendingToken === 'string' ? route.query.pendingToken : ''))

const method = ref<'email' | 'sms'>(route.query.method === 'sms' ? 'sms' : 'email')
const sentTo = ref(typeof route.query.to === 'string' ? route.query.to : '')
const expiresAt = ref(typeof route.query.expiresAt === 'string' ? route.query.expiresAt : '')

/* pendingToken 없이 직접 진입(예: 새로고침으로 쿼리 소실)하면 로그인부터 다시. */
onMounted(() => {
  if (!pendingToken.value) {
    toast.add({ title: '인증 세션이 없습니다. 다시 로그인해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    navigateTo('/login')
  }
})

const methodLabel = computed(() => (method.value === 'sms' ? '휴대전화' : '이메일'))
const destLine = computed(() => {
  const where = sentTo.value || (method.value === 'sms' ? '등록된 휴대전화' : '등록된 이메일')
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

/* ── 시계 틱(1초) — 코드 만료(expiresAt) 카운트다운 + 재발송 쿨다운(30초) ──── */
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => clearInterval(timer))

/* 코드 만료까지 남은 초 — expiresAt 미지정이면 null(표시 안 함). */
const expiresInSec = computed(() => {
  if (!expiresAt.value) return null
  const ms = new Date(expiresAt.value).getTime() - now.value
  return ms > 0 ? Math.ceil(ms / 1000) : 0
})
const expired = computed(() => expiresInSec.value === 0)
const expiryLabel = computed(() => {
  if (expiresInSec.value == null) return ''
  if (expiresInSec.value === 0) return '인증코드가 만료되었습니다. 재발송해 주세요.'
  const m = Math.floor(expiresInSec.value / 60)
  const s = expiresInSec.value % 60
  return `남은 시간 ${m}:${String(s).padStart(2, '0')}`
})

/* 재발송 쿨다운(anti-spam, 30초) — 목표 시각 기반으로 now 틱에서 파생. */
const resendReadyAt = ref(0)
const cooldown = computed(() => {
  const sec = Math.ceil((resendReadyAt.value - now.value) / 1000)
  return sec > 0 ? sec : 0
})
function startCooldown() {
  resendReadyAt.value = Date.now() + 30_000
}
onMounted(() => startCooldown())

const resending = ref(false)
async function resend() {
  if (cooldown.value > 0 || resending.value || !pendingToken.value) return
  resending.value = true
  try {
    const res = await auth.resendTwoFactor({ pendingToken: pendingToken.value })
    // 재발송 응답으로 발송 컨텍스트 갱신(만료 시각 포함).
    method.value = res.method
    sentTo.value = res.sentTo
    expiresAt.value = res.expiresAt
    codeDigits.value = ['', '', '', '', '', '']
    startCooldown()
    if (res.mockCode) {
      toast.add({ title: `인증코드 재발송됨 (개발 모드: ${res.mockCode})`, color: 'info', icon: 'i-lucide-send' })
    }
    else {
      toast.add({ title: `인증코드를 ${methodLabel.value}로 재발송했습니다.`, color: 'info', icon: 'i-lucide-send' })
    }
  }
  catch (e: unknown) {
    const data = (e as { data?: { code?: string, message?: string, details?: { retryAfterSeconds?: number } } })?.data
    // 429 rate_limited — 서버가 알려준 retryAfterSeconds로 쿨다운을 동기화(미제공 시 기존 30초 유지).
    const retry = data?.details?.retryAfterSeconds
    if (typeof retry === 'number' && retry > 0) {
      resendReadyAt.value = Date.now() + retry * 1000
    }
    toast.add({ title: data?.message ?? '재발송에 실패했습니다. 잠시 후 다시 시도해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
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
  if (!pendingToken.value) {
    toast.add({ title: '인증 세션이 없습니다. 다시 로그인해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    navigateTo('/login')
    return
  }
  verifying.value = true
  try {
    // 2차 코드 검증 → 정식 토큰 발급 + /me 페치(로그인 완료).
    await auth.verifyTwoFactor({ pendingToken: pendingToken.value, code: fullCode.value })
    toast.add({ title: '보안 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
    // 최초 로그인 멤버는 온보딩 우선(로그인 페이지와 동일 정책).
    if (auth.needsOnboarding) {
      navigateTo('/onboarding')
    }
    else {
      // 사업자등록증 심사 미승인이면 계약 관리 페이지로(로그인 페이지와 동일 정책).
      const state = auth.tenant?.approvalState
      navigateTo(state && state !== 'approved' ? '/account/contract' : redirect.value)
    }
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
            :disabled="expired"
            @input="onCodeInput(i, $event)"
            @keydown="onCodeKeydown(i, $event)"
          >
        </div>
        <p v-if="expiryLabel" class="expiry-line" :class="{ expired }">{{ expiryLabel }}</p>
      </div>

      <button
        type="submit"
        class="btn btn-primary btn-lg submit-btn"
        :disabled="fullCode.length !== 6 || verifying || expired"
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
.expiry-line {
  align-self: flex-start;
  margin: 2px 0 0;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  font-variant-numeric: tabular-nums;
}
.expiry-line.expired {
  color: var(--danger-ink, var(--danger));
  font-weight: 600;
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
