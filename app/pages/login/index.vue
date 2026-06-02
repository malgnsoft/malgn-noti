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

// 같은 이메일이 여러 회사에 가입돼 있을 때 회사 선택용
const companyChoices = ref<{ id: number, name: string }[]>([])
const showCompanyPicker = computed(() => companyChoices.value.length > 0)

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
    const choices = await auth.loginByEmail({
      email: userId.value.trim(),
      password: password.value,
    })
    if (choices) {
      // 복수 매치 — 사용자 선택 UI 노출
      companyChoices.value = choices
      toast.add({
        title: '같은 아이디로 가입된 고객사가 여러 개입니다. 로그인할 곳을 선택해 주세요.',
        color: 'info',
        icon: 'i-lucide-building-2',
      })
      return
    }
    // 단일 매치 — 바로 로그인 완료
    toast.add({ title: '로그인되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    navigateTo(redirect)
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

async function chooseCompany(companyId: number) {
  submitting.value = true
  try {
    await auth.login({
      companyId,
      loginid: userId.value.trim(),
      password: password.value,
    })
    toast.add({ title: '로그인되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/home'
    navigateTo(redirect)
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

function cancelCompanyPick() {
  companyChoices.value = []
  password.value = ''
}
</script>

<template>
  <div class="login">
    <h2>로그인</h2>

    <!-- 일반 로그인 폼 -->
    <form v-if="!showCompanyPicker" class="col" style="gap: 16px" @submit.prevent="onLogin">
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

    <!-- 회사 선택 (같은 이메일이 여러 회사에 가입) -->
    <div v-else class="col" style="gap: 16px">
      <p class="picker-desc">
        <strong>{{ userId }}</strong>로 가입된 고객사가 여러 개입니다.<br>
        로그인할 고객사를 선택해 주세요.
      </p>
      <ul class="company-list">
        <li v-for="c in companyChoices" :key="c.id">
          <button
            type="button"
            class="company-card"
            :disabled="submitting"
            @click="chooseCompany(c.id)"
          >
            <span class="company-name">{{ c.name }}</span>
            <span class="company-id">ID {{ c.id }}</span>
            <UIcon name="i-lucide-arrow-right" class="company-arrow" />
          </button>
        </li>
      </ul>
      <button type="button" class="btn btn-outline-dark" :disabled="submitting" @click="cancelCompanyPick">
        다시 입력
      </button>
    </div>

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
.field-hint {
  font-size: var(--fz-xs);
  color: var(--ink-400);
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

/* 회사 선택 UI */
.picker-desc {
  font-size: var(--fz-sm);
  color: var(--ink-700);
  line-height: 1.55;
}
.picker-desc strong {
  font-weight: 700;
  color: var(--ink-900);
}
.company-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.company-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.company-card:hover:not(:disabled) {
  border-color: var(--ink-900);
  background: var(--paper);
}
.company-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.company-name {
  flex: 1;
  text-align: left;
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.company-id {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.company-arrow {
  color: var(--ink-400);
}
</style>
