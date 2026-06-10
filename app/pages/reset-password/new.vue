<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '새 비밀번호 설정' })

const toast = useToast()

/* ── 직전 화면(/reset-password)에서 넘어온 검증 컨텍스트 ────────
 * sessionStorage 의 { email, code, at } 를 읽는다. 검증 직후 10분 내에서만
 * 유효하며(서버 OTP TTL 과 동일), 없거나 만료면 재설정 시작 화면으로 되돌린다.
 */
interface ResetCtx { email: string, code: string, at: number }
const ctx = ref<ResetCtx | null>(null)
const RESET_TTL_MS = 10 * 60 * 1000

onMounted(() => {
  if (!import.meta.client) return
  try {
    const raw = sessionStorage.getItem('reset-pw')
    const parsed = raw ? JSON.parse(raw) as ResetCtx : null
    if (parsed?.email && parsed.code && Date.now() - parsed.at < RESET_TTL_MS) {
      ctx.value = parsed
      return
    }
  }
  catch { /* 손상된 값 — 아래에서 되돌림 */ }
  toast.add({ title: '인증 정보가 만료되었습니다. 다시 시도해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
  navigateTo('/reset-password')
})

/* ── 새 비밀번호 입력 + 검증 ───────────────────────────────── */
const password = ref('')
const confirm = ref('')
const showPw = ref(false)

const pwError = computed(() => {
  if (!password.value) return undefined
  if (password.value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  return undefined
})
const confirmError = computed(() => {
  if (!confirm.value) return undefined
  if (confirm.value !== password.value) return '비밀번호가 일치하지 않습니다.'
  return undefined
})
const canSubmit = computed(() =>
  !!ctx.value
  && password.value.length >= 8
  && confirm.value === password.value
  && !submitting.value,
)

const submitting = ref(false)

async function onSubmit() {
  if (!canSubmit.value || !ctx.value) return
  submitting.value = true
  try {
    // 완료 API — 서버가 (email, code) 를 한 번 더 검증·소비한 뒤 새 비밀번호를 적용한다.
    await useApi()<{ data: { reset: boolean } }>(
      '/auth/reset-password',
      { method: 'POST', body: { email: ctx.value.email, code: ctx.value.code, password: password.value } },
    )
    if (import.meta.client) sessionStorage.removeItem('reset-pw')
    toast.add({
      title: '비밀번호가 변경되었습니다.',
      description: '새 비밀번호로 다시 로그인해 주세요.',
      color: 'success',
      icon: 'i-lucide-circle-check',
    })
    navigateTo('/login')
  }
  catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    const data = (e as { data?: { message?: string } })?.data
    // 401 → 코드 만료·불일치·소비됨 또는 계정 없음(백엔드가 모두 401로 응답) → 처음부터 다시.
    // 서버가 사유별 메시지를 분기해 주므로 data.message 를 그대로 노출한다.
    if (status === 401) {
      if (import.meta.client) sessionStorage.removeItem('reset-pw')
      toast.add({ title: data?.message ?? '인증이 만료되었습니다. 다시 시도해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
      navigateTo('/reset-password')
      return
    }
    // 400(검증 실패) 등 — 입력값 문제이므로 현재 화면에 머무른다.
    toast.add({ title: data?.message ?? '비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="reset-new">
    <h2>새 비밀번호 설정</h2>
    <p class="lead">
      안전한 새 비밀번호를 입력하세요.
    </p>

    <form class="col" style="gap: 16px" @submit.prevent="onSubmit">
      <div class="field-group">
        <label for="new-pw" class="auth-label">새 비밀번호</label>
        <div class="pw-wrap">
          <input
            id="new-pw"
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            class="input"
            placeholder="영문·숫자·특수문자 조합 8자 이상"
            autocomplete="new-password"
          >
          <button
            type="button"
            class="btn btn-ghost btn-icon btn-sm pw-toggle"
            :aria-label="showPw ? '비밀번호 숨기기' : '비밀번호 표시'"
            @click="showPw = !showPw"
          >
            <UIcon :name="showPw ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="text-[length:var(--fz-md)]" />
          </button>
        </div>
        <p v-if="pwError" class="field-error">{{ pwError }}</p>
      </div>

      <div class="field-group">
        <label for="new-pw-confirm" class="auth-label">새 비밀번호 확인</label>
        <input
          id="new-pw-confirm"
          v-model="confirm"
          type="password"
          class="input"
          placeholder="비밀번호를 다시 입력해 주세요"
          autocomplete="new-password"
        >
        <p v-if="confirmError" class="field-error">{{ confirmError }}</p>
      </div>

      <button type="submit" class="btn btn-primary btn-lg submit-btn" :disabled="!canSubmit">
        {{ submitting ? '변경 중…' : '비밀번호 변경' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.reset-new h2 {
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
.pw-wrap {
  position: relative;
}
.pw-wrap .input {
  padding-right: 40px;
}
.pw-toggle {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
}
.field-error {
  font-size: var(--fz-xs);
  color: var(--danger);
}
.submit-btn {
  width: 100%;
  margin-top: 4px;
}
</style>
