<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '서비스 담당자 등록' })

const route = useRoute()
const toast = useToast()

/* 초대 메일 링크 파라미터 (백엔드 연동 시 토큰 검증) */
const email = computed(() => String(route.query.email ?? 'manager@company.com'))
const inviter = computed(() => String(route.query.inviter ?? '(주)맑은소프트'))

const password = ref('')
const confirmPw = ref('')
const showPw = ref(false)
const showConfirm = ref(false)
const agree = ref(false)
const phoneVerified = ref(false)
const phoneVerifyOpen = ref(false)
const done = ref(false)

const SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`';]/
const pwError = computed(() => {
  if (!password.value) return ''
  if (password.value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  if (!SPECIAL.test(password.value)) return '특수문자를 1개 이상 포함해 주세요.'
  return ''
})
const confirmError = computed(() => {
  if (!confirmPw.value) return ''
  return confirmPw.value === password.value ? '' : '비밀번호가 일치하지 않습니다.'
})

const canSubmit = computed(() =>
  !!password.value && !pwError.value
  && !!confirmPw.value && !confirmError.value
  && phoneVerified.value
  && agree.value,
)

function onPhoneVerified() {
  phoneVerified.value = true
  phoneVerifyOpen.value = false
  toast.add({ title: '휴대폰 본인 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}

function submit() {
  if (!canSubmit.value) {
    toast.add({ title: '입력값과 인증·약관 동의를 모두 완료해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  done.value = true
}
</script>

<template>
  <div class="invite-page">
    <div class="invite-card">
      <!-- 등록 완료 -->
      <template v-if="done">
        <div class="iv-success">
          <span class="iv-success-icon"><UIcon name="i-lucide-circle-check" /></span>
          <h1>서비스 담당자 등록이 완료되었습니다</h1>
          <p>
            이제 <b>{{ email }}</b> 계정으로 로그인하여
            {{ inviter }}의 서비스를 이용하실 수 있습니다.
          </p>
          <NuxtLink to="/login" class="btn btn-primary btn-lg iv-success-btn">
            로그인하기
          </NuxtLink>
        </div>
      </template>

      <!-- 등록 폼 -->
      <template v-else>
        <div class="iv-brand">맑은 메시징</div>
        <h1 class="iv-title">서비스 담당자 등록</h1>

        <div class="iv-banner">
          <UIcon name="i-lucide-mail-check" class="iv-banner-icon" />
          <p>
            <b>{{ inviter }}</b>의 서비스 담당자로 초대되었습니다.<br>
            아래 정보를 입력하여 등록을 완료해 주세요.
          </p>
        </div>

        <div class="iv-form">
          <!-- 아이디 -->
          <div class="iv-field">
            <label>아이디 (이메일)</label>
            <div class="iv-readonly">
              <UIcon name="i-lucide-mail" />
              <span>{{ email }}</span>
              <span class="iv-readonly-tag">초대 이메일</span>
            </div>
          </div>

          <!-- 비밀번호 -->
          <div class="iv-field">
            <label for="iv-pw">비밀번호 <span class="rq">*</span></label>
            <div class="iv-input-wrap">
              <input
                id="iv-pw"
                v-model="password"
                :type="showPw ? 'text' : 'password'"
                class="input"
                :class="{ 'has-error': !!pwError }"
                placeholder="최소 8자 이상 특수문자 기호를 포함해 주세요."
                autocomplete="new-password"
              >
              <button type="button" class="iv-eye" @click="showPw = !showPw">
                <UIcon :name="showPw ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
              </button>
            </div>
            <p v-if="pwError" class="iv-msg error">{{ pwError }}</p>
          </div>

          <!-- 비밀번호 확인 -->
          <div class="iv-field">
            <label for="iv-pw2">비밀번호 확인 <span class="rq">*</span></label>
            <div class="iv-input-wrap">
              <input
                id="iv-pw2"
                v-model="confirmPw"
                :type="showConfirm ? 'text' : 'password'"
                class="input"
                :class="{ 'has-error': !!confirmError }"
                placeholder="비밀번호를 다시 입력해 주세요."
                autocomplete="new-password"
              >
              <button type="button" class="iv-eye" @click="showConfirm = !showConfirm">
                <UIcon :name="showConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
              </button>
            </div>
            <p v-if="confirmError" class="iv-msg error">{{ confirmError }}</p>
            <p v-else-if="confirmPw && confirmPw === password" class="iv-msg ok">비밀번호가 일치합니다.</p>
          </div>

          <!-- 본인 인증 -->
          <div class="iv-field">
            <label>본인 인증 <span class="rq">*</span></label>
            <div v-if="phoneVerified" class="iv-verified">
              <UIcon name="i-lucide-circle-check" />
              휴대폰 본인 인증이 완료되었습니다.
            </div>
            <button
              v-else
              type="button"
              class="btn btn-outline-dark iv-verify-btn"
              @click="phoneVerifyOpen = true"
            >
              <UIcon name="i-lucide-smartphone" class="text-[length:var(--fz-md)]" />
              휴대폰 본인 인증
            </button>
          </div>

          <!-- 약관 동의 -->
          <label class="iv-agree">
            <input v-model="agree" type="checkbox" class="checkbox">
            <span>서비스 이용약관 및 개인정보 처리방침에 동의합니다. <span class="rq">*</span></span>
          </label>

          <button
            type="button"
            class="btn btn-primary btn-lg iv-submit"
            :disabled="!canSubmit"
            @click="submit"
          >
            가입 완료
          </button>
        </div>

        <p class="iv-foot">
          이미 계정이 있으신가요? <NuxtLink to="/login" class="iv-link">로그인</NuxtLink>
        </p>
      </template>
    </div>

    <AppPhoneVerifyDialog
      :open="phoneVerifyOpen"
      @close="phoneVerifyOpen = false"
      @verified="onPhoneVerified"
    />
  </div>
</template>

<style scoped>
.invite-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 48px 16px;
  background: var(--paper, var(--ink-50));
}
.invite-card {
  width: 480px;
  max-width: 100%;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 36px;
}

.iv-brand {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--accent-ink);
  letter-spacing: 0.02em;
}
.iv-title {
  font-size: var(--fz-2xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 4px 0 18px;
}

/* 초대 배너 */
.iv-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  background: var(--accent-soft);
  border-radius: var(--r-md);
  margin-bottom: 22px;
}
.iv-banner-icon {
  font-size: var(--fz-lg);
  color: var(--accent-ink);
  flex-shrink: 0;
  margin-top: 1px;
}
.iv-banner p {
  font-size: var(--fz-sm);
  color: var(--ink-700);
  line-height: 1.6;
  margin: 0;
}
.iv-banner b { color: var(--accent-ink); font-weight: 700; }

/* 폼 */
.iv-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.iv-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.iv-field label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-900);
}
.rq { color: var(--danger); margin-left: 1px; }

.iv-readonly {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--ink-50);
  font-size: var(--fz-sm);
  color: var(--ink-700);
}
.iv-readonly > span:first-of-type { font-weight: 600; color: var(--ink-900); }
.iv-readonly-tag {
  margin-left: auto;
  font-size: var(--fz-2xs);
  font-weight: 600;
  color: var(--ink-400);
}

.iv-input-wrap { position: relative; }
.iv-input-wrap .input {
  width: 100%;
  height: 44px;
  padding-right: 44px;
}
.iv-input-wrap .input.has-error { border-color: var(--danger); }
.iv-eye {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  color: var(--ink-400);
  font-size: var(--fz-lg);
}
.iv-eye:hover { color: var(--ink-700); }

.iv-msg { font-size: var(--fz-xs); margin: 0; }
.iv-msg.error { color: var(--danger); }
.iv-msg.ok { color: var(--ink-500); }

.iv-verify-btn {
  align-self: flex-start;
  height: 44px;
}
.iv-verified {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 14px;
  border-radius: var(--r-md);
  background: var(--accent-soft);
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--accent-ink);
}

.iv-agree {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-size: var(--fz-sm);
  color: var(--ink-700);
  cursor: pointer;
}

.iv-submit {
  width: 100%;
  margin-top: 6px;
  font-weight: 600;
}

.iv-foot {
  margin: 20px 0 0;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.iv-link {
  font-weight: 600;
  color: var(--ink-900);
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* 완료 */
.iv-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 0;
}
.iv-success-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: var(--fz-3xl);
  margin-bottom: 18px;
}
.iv-success h1 {
  font-size: var(--fz-xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 8px;
}
.iv-success p {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 24px;
}
.iv-success p b { color: var(--ink-800); }
.iv-success-btn {
  min-width: 220px;
  font-weight: 600;
}
</style>
