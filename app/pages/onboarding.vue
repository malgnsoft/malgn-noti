<script setup lang="ts">
definePageMeta({ layout: 'blank' })
useHead({ title: '시작하기 — 맑은 메시징' })

const auth = useAuthStore()
const toast = useToast()

// 이미 가입완료(joined) 상태면 온보딩 불필요 → 홈으로.
onMounted(() => {
  if (auth.user && !auth.needsOnboarding) navigateTo('/home')
})

/* ① 약관 동의 */
const TERMS = [
  { key: 'service', badge: '필수', label: '서비스 이용약관 동의' },
  { key: 'privacy', badge: '필수', label: '개인정보 수집 및 이용동의' },
  { key: 'spam', badge: '필수', label: '스팸메시지 이용약관 동의' },
  { key: 'ad', badge: '선택', label: '광고성 메시지 활용 동의 안내' },
] as const
const agreed = ref<Record<string, boolean>>({})
const allAgreed = computed({
  get: () => TERMS.every(t => agreed.value[t.key]),
  set: (v: boolean) => { TERMS.forEach((t) => { agreed.value[t.key] = v }) },
})
const requiredTermsOk = computed(() => TERMS.filter(t => t.badge === '필수').every(t => agreed.value[t.key]))
const activeTermKey = ref('')
function onTermAgree(key: string) {
  agreed.value[key] = true
  activeTermKey.value = ''
}

/* ② 회원정보 */
const name = ref(auth.user?.name ?? '')
const phone = ref(auth.user?.phone ?? '')

/* ③ 비밀번호 변경 — 정책: 8자 이상 + 특수문자 1개 이상(BE /me/onboarding과 동일) */
const SPECIAL = /[^A-Za-z0-9]/
const newPw = ref('')
const confirmPw = ref('')
const newPwError = computed(() => {
  if (!newPw.value) return ''
  if (newPw.value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  if (!SPECIAL.test(newPw.value)) return '특수문자를 1개 이상 포함해 주세요.'
  return ''
})
const confirmError = computed(() => {
  if (!confirmPw.value) return ''
  if (confirmPw.value !== newPw.value) return '비밀번호가 일치하지 않습니다.'
  return ''
})

const submitting = ref(false)
const canSubmit = computed(() =>
  requiredTermsOk.value
  && name.value.trim() !== ''
  && !!newPw.value && !newPwError.value
  && !!confirmPw.value && !confirmError.value
  && !submitting.value,
)

async function submit() {
  if (!canSubmit.value) {
    toast.add({ title: '필수 약관 동의·이름·비밀번호를 확인해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  submitting.value = true
  try {
    await auth.onboard({
      newPassword: newPw.value,
      name: name.value.trim(),
      phone: phone.value.trim() || undefined,
      agreedTerms: true,
    })
    toast.add({ title: '가입이 완료되었습니다. 환영합니다!', color: 'success', icon: 'i-lucide-circle-check' })
    await navigateTo('/home')
  }
  catch (e) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    toast.add({ title: msg || '온보딩 처리에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
    submitting.value = false
  }
}

async function useAnotherAccount() {
  await auth.logout()
}
</script>

<template>
  <div class="ob">
    <div class="ob-card">
      <header class="ob-head">
        <div class="ob-brand">맑은 메시징</div>
        <h1>시작하기 전에 몇 가지만 확인할게요</h1>
        <p>관리자가 만든 계정으로 처음 로그인하셨습니다. 약관 동의·회원 정보·비밀번호를 설정하면 서비스를 이용하실 수 있어요.</p>
      </header>

      <!-- ① 약관 동의 -->
      <section class="ob-sec">
        <h2 class="ob-sec-title"><span class="ob-step">1</span> 이용약관 동의</h2>
        <div class="ob-terms">
          <label class="checkbox ob-terms-all">
            <input v-model="allAgreed" type="checkbox">
            <span class="ob-terms-all-text">전체 동의</span>
            <span class="ob-terms-all-sub">필수 및 선택 약관에 모두 동의합니다.</span>
          </label>
          <ul class="ob-terms-list">
            <li v-for="t in TERMS" :key="t.key" class="ob-terms-row">
              <label class="checkbox">
                <input v-model="agreed[t.key]" type="checkbox">
              </label>
              <span class="badge" :class="t.badge === '필수' ? 'badge-error' : 'badge-neutral'">{{ t.badge }}</span>
              <span class="ob-terms-name">{{ t.label }}</span>
              <button type="button" class="ob-terms-more" @click="activeTermKey = t.key">
                약관보기 <UIcon name="i-lucide-chevron-right" class="text-[length:var(--fz-xs)]" />
              </button>
            </li>
          </ul>
        </div>
      </section>

      <!-- ② 회원정보 -->
      <section class="ob-sec">
        <h2 class="ob-sec-title"><span class="ob-step">2</span> 회원 정보</h2>
        <div class="ob-field">
          <label for="ob-name">이름 <span class="rq">*</span></label>
          <input id="ob-name" v-model="name" class="input" placeholder="이름을 입력해 주세요" autocomplete="name">
        </div>
        <div class="ob-field">
          <label for="ob-phone">휴대폰 번호 <span class="ob-opt">(선택)</span></label>
          <input id="ob-phone" v-model="phone" class="input" placeholder="010-0000-0000" inputmode="tel" autocomplete="tel">
        </div>
      </section>

      <!-- ③ 비밀번호 변경 -->
      <section class="ob-sec">
        <h2 class="ob-sec-title"><span class="ob-step">3</span> 비밀번호 변경</h2>
        <div class="ob-field">
          <label for="ob-pw">새 비밀번호 <span class="rq">*</span></label>
          <input
            id="ob-pw"
            v-model="newPw"
            type="password"
            class="input"
            :class="{ 'has-error': !!newPwError }"
            placeholder="8자 이상, 특수문자 1개 이상"
            autocomplete="new-password"
          >
          <p v-if="newPwError" class="ob-err">{{ newPwError }}</p>
        </div>
        <div class="ob-field">
          <label for="ob-pw2">새 비밀번호 확인 <span class="rq">*</span></label>
          <input
            id="ob-pw2"
            v-model="confirmPw"
            type="password"
            class="input"
            :class="{ 'has-error': !!confirmError }"
            placeholder="새 비밀번호를 다시 입력해 주세요"
            autocomplete="new-password"
            @keyup.enter="submit"
          >
          <p v-if="confirmError" class="ob-err">{{ confirmError }}</p>
        </div>
      </section>

      <button type="button" class="btn btn-primary btn-lg ob-submit" :disabled="!canSubmit" @click="submit">
        {{ submitting ? '처리 중…' : '가입 완료하고 시작하기' }}
      </button>

      <button type="button" class="ob-logout" @click="useAnotherAccount">
        다른 계정으로 로그인
      </button>
    </div>

    <AppSignupTermsDialog
      :open="!!activeTermKey"
      :term-key="activeTermKey"
      @close="activeTermKey = ''"
      @agree="onTermAgree"
    />
  </div>
</template>

<style scoped>
.ob {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 16px;
  background: var(--ink-50);
}
.ob-card {
  width: 100%;
  max-width: 520px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 36px 32px;
}

.ob-head {
  margin-bottom: 28px;
}
.ob-brand {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--accent-ink);
  letter-spacing: 0.02em;
  margin-bottom: 10px;
}
.ob-head h1 {
  font-size: var(--fz-2xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 8px;
  line-height: 1.35;
}
.ob-head p {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.65;
  margin: 0;
}

.ob-sec {
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid var(--line);
}
.ob-sec-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 16px;
}
.ob-step {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: var(--r-full);
  background: var(--ink-900);
  color: var(--white);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  font-weight: 700;
  flex-shrink: 0;
}

/* 약관 */
.ob-terms-all {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: var(--ink-50);
  border-radius: var(--r-md);
  margin-bottom: 10px;
}
.ob-terms-all-text {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}
.ob-terms-all-sub {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.ob-terms-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ob-terms-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
}
.ob-terms-name {
  flex: 1;
  min-width: 0;
  font-size: var(--fz-sm);
  color: var(--ink-700);
}
.ob-terms-more {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border: 0;
  background: transparent;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  flex-shrink: 0;
}
.ob-terms-more:hover { color: var(--ink-900); }

/* 필드 */
.ob-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ob-field + .ob-field { margin-top: 14px; }
.ob-field label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.ob-field .input { width: 100%; }
.ob-field .input.has-error { border-color: var(--danger); }
.rq { color: var(--danger); margin-left: 2px; }
.ob-opt { font-weight: 400; color: var(--ink-400); }
.ob-err {
  font-size: var(--fz-xs);
  color: var(--danger);
  margin: 0;
}

.ob-submit {
  width: 100%;
  height: 50px;
  margin-top: 28px;
  font-size: var(--fz-md);
  font-weight: 600;
}
.ob-logout {
  display: block;
  width: 100%;
  margin-top: 14px;
  border: 0;
  background: transparent;
  font-size: var(--fz-sm);
  color: var(--ink-400);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.ob-logout:hover { color: var(--ink-700); }
</style>
