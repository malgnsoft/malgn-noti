<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '로그인' })

const route = useRoute()
const toast = useToast()

const userId = ref('')
const password = ref('')
const showPw = ref(false)
const keepId = ref(true)

const canSubmit = computed(() => userId.value.trim().length > 0 && password.value.length > 0)

function onLogin() {
  if (!canSubmit.value) {
    toast.add({ title: '아이디와 비밀번호를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  toast.add({ title: '로그인되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
  navigateTo(redirect)
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
          placeholder="아이디를 입력해 주세요"
          autocomplete="username"
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
        로그인 하기
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
