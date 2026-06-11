<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '로그인' })

const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const userId = ref('')
const password = ref('')
const showPw = ref(false)
const keepId = ref(true)

const submitting = ref(false)
const canSubmit = computed(
  () => userId.value.trim().length > 0 && password.value.length > 0 && !submitting.value,
)

async function onLogin() {
  if (!canSubmit.value) {
    toast.add({
      title: '아이디와 비밀번호를 입력해 주세요.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    return
  }
  submitting.value = true
  try {
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    const result = await auth.loginByEmail({
      email: userId.value.trim(),
      password: password.value,
    })

    // 보안로그인(2FA) 계정 — 토큰 미발급, 2차 코드 입력 화면으로 이동.
    if (result.twoFactorRequired) {
      navigateTo({
        path: '/login/security',
        query: {
          method: result.method,
          to: result.sentTo,
          pendingToken: result.pendingToken,
          expiresAt: result.expiresAt,
          redirect,
        },
      })
      return
    }

    toast.add({ title: '로그인되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
    // 최초 로그인 멤버(joinState!=='joined')는 온보딩으로 강제 이동(약관·정보·비번).
    if (auth.needsOnboarding) {
      navigateTo('/onboarding')
    }
    else {
      // 사업자등록증 심사 미승인이면 계약 관리 페이지로 자동 이동 (사용자 정책)
      const state = auth.tenant?.approvalState
      navigateTo(state && state !== 'approved' ? '/account/contract' : redirect)
    }
  }
  catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    toast.add({
      title: status === 401
        ? '아이디 또는 비밀번호가 올바르지 않습니다.'
        : '로그인 중 오류가 발생했습니다.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <h2>로그인</h2>

    <form class="col" style="gap: 16px" @submit.prevent="onLogin">
      <div class="field-group">
        <label for="login-id" class="auth-label">아이디</label>
        <input
          id="login-id"
          v-model="userId"
          class="input"
          placeholder="가입 시 사용한 이메일을 입력해 주세요"
          autocomplete="username"
          inputmode="email"
        >
      </div>

      <div class="field-group">
        <label for="login-pw" class="auth-label">비밀번호</label>
        <div class="pw-wrap">
          <input
            id="login-pw"
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            class="input"
            placeholder="비밀번호(영문, 숫자, 특수문자 조합으로 8자 이상) 를 입력해 주세요"
            autocomplete="current-password"
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
      </div>

      <label class="checkbox">
        <input v-model="keepId" type="checkbox"> 아이디 기억하기
      </label>

      <button type="submit" class="btn btn-primary btn-lg login-btn" :disabled="!canSubmit">
        {{ submitting ? '로그인 중…' : '로그인 하기' }}
      </button>
    </form>

    <p class="reset-line">
      비밀번호가 생각나지 않으신다면
      <NuxtLink to="/reset-password" class="reset-link">비밀번호 재설정</NuxtLink>
    </p>

    <NuxtLink to="/signup" class="signup-card">
      <span class="signup-sub">아직 회원가입을 하지 않으셨다면</span>
      <span class="signup-link">회원가입하기</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.login h2 {
  text-align: center;
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
.login-btn {
  width: 100%;
  margin-top: 4px;
}
.reset-line {
  margin: 18px 0 0;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.reset-link {
  margin-left: 4px;
  font-weight: 600;
  color: var(--ink-900);
}
.reset-link:hover {
  text-decoration: underline;
}
.signup-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin-top: 24px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  transition: border-color 0.12s, background 0.12s;
}
.signup-card:hover {
  border-color: var(--ink-200);
  background: var(--paper);
}
.signup-sub {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.signup-link {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--accent-ink);
}
</style>
