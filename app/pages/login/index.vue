<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '로그인' })

const toast = useToast()
const email = ref('admin@malgnsoft.com')
const password = ref('password123!')
const showPw = ref(false)
const keep = ref(false)

function onLogin() {
  toast.add({ title: '로그인되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  navigateTo('/home')
}
</script>

<template>
  <div>
    <h2>로그인</h2>
    <p class="sub">
      기업의 모든 메시지를 한 곳에서 관리하세요.
    </p>

    <form class="col" style="gap: 12px" @submit.prevent="onLogin">
      <div>
        <label class="auth-label">아이디 (이메일)</label>
        <input v-model="email" class="input" placeholder="admin@malgnsoft.com" autocomplete="email" style="margin-top: 6px">
      </div>
      <div>
        <label class="auth-label">비밀번호</label>
        <div style="position: relative; margin-top: 6px">
          <input
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            class="input"
            placeholder="비밀번호"
            autocomplete="current-password"
            style="padding-right: 40px"
          >
          <button
            type="button"
            class="btn btn-ghost btn-icon btn-sm"
            style="position: absolute; right: 4px; top: 4px"
            :aria-label="showPw ? '비밀번호 숨기기' : '비밀번호 표시'"
            @click="showPw = !showPw"
          >
            <UIcon :name="showPw ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="text-sm" />
          </button>
        </div>
      </div>
      <div class="row" style="justify-content: space-between; font-size: 12px; margin-top: 4px">
        <label class="checkbox"><input v-model="keep" type="checkbox"> 로그인 상태 유지</label>
        <NuxtLink to="/reset-password" style="color: var(--accent-ink)">
          비밀번호 찾기
        </NuxtLink>
      </div>
      <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 6px">
        로그인
      </button>
      <div class="h-divider-dash" />
      <NuxtLink to="/signup" class="btn btn-outline-dark btn-lg" style="width: 100%">
        회원가입
      </NuxtLink>
    </form>
  </div>
</template>

<style scoped>
.auth-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-700);
  display: block;
}
</style>
