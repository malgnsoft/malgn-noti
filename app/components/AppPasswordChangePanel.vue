<script setup lang="ts">
const toast = useToast()

const currentPw = ref('')
const newPw = ref('')
const confirmPw = ref('')

const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

/* 새 비밀번호 규칙: 최소 8자 + 특수문자 포함 */
const SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/~`';]/
const newPwError = computed(() => {
  if (!newPw.value) return ''
  if (newPw.value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  if (!SPECIAL.test(newPw.value)) return '특수문자를 1개 이상 포함해 주세요.'
  if (currentPw.value && newPw.value === currentPw.value) return '현재 비밀번호와 다른 비밀번호를 사용해 주세요.'
  return ''
})
const confirmError = computed(() => {
  if (!confirmPw.value) return ''
  if (confirmPw.value !== newPw.value) return '비밀번호가 일치하지 않습니다.'
  return ''
})

const canSave = computed(() =>
  !!currentPw.value
  && !!newPw.value
  && !!confirmPw.value
  && !newPwError.value
  && !confirmError.value,
)

function save() {
  if (!canSave.value) {
    toast.add({ title: '입력값을 다시 확인해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  currentPw.value = ''
  newPw.value = ''
  confirmPw.value = ''
  toast.add({ title: '비밀번호가 변경되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}
</script>

<template>
  <div class="pw-panel">
    <section class="ms-sec">
      <div class="ms-head">
        <h3>비밀번호 변경</h3>
      </div>

      <div class="ms-rows">
        <!-- 현재 비밀번호 -->
        <div class="ms-row">
          <span class="ms-label">현재 비밀번호 <span class="rq">*</span></span>
          <div class="ms-value">
            <div class="pw-input-wrap">
              <input
                v-model="currentPw"
                :type="showCurrent ? 'text' : 'password'"
                class="input pw-input"
                placeholder="현재 비밀번호를 입력해 주세요"
                autocomplete="current-password"
              >
              <button type="button" class="pw-eye" :aria-label="showCurrent ? '숨기기' : '표시'" @click="showCurrent = !showCurrent">
                <UIcon :name="showCurrent ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
              </button>
            </div>
            <span class="ms-note">
              비밀번호가 생각나지 않으신다면
              <NuxtLink to="/reset-password" class="pw-link">비밀번호 재설정</NuxtLink>
            </span>
          </div>
        </div>

        <!-- 새 비밀번호 -->
        <div class="ms-row">
          <span class="ms-label">새 비밀번호 <span class="rq">*</span></span>
          <div class="ms-value">
            <div class="pw-input-wrap">
              <input
                v-model="newPw"
                :type="showNew ? 'text' : 'password'"
                class="input pw-input"
                :class="{ 'has-error': !!newPwError }"
                placeholder="최소 8자 이상 특수문자 기호를 포함해 주세요."
                autocomplete="new-password"
              >
              <button type="button" class="pw-eye" :aria-label="showNew ? '숨기기' : '표시'" @click="showNew = !showNew">
                <UIcon :name="showNew ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
              </button>
            </div>
            <span v-if="newPwError" class="pw-msg error">{{ newPwError }}</span>
          </div>
        </div>

        <!-- 새 비밀번호 확인 -->
        <div class="ms-row">
          <span class="ms-label">새 비밀번호 확인 <span class="rq">*</span></span>
          <div class="ms-value">
            <div class="pw-input-wrap">
              <input
                v-model="confirmPw"
                :type="showConfirm ? 'text' : 'password'"
                class="input pw-input"
                :class="{ 'has-error': !!confirmError }"
                placeholder="새로운 비밀번호를 다시 입력해 주세요."
                autocomplete="new-password"
              >
              <button type="button" class="pw-eye" :aria-label="showConfirm ? '숨기기' : '표시'" @click="showConfirm = !showConfirm">
                <UIcon :name="showConfirm ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
              </button>
            </div>
            <span v-if="confirmError" class="pw-msg error">{{ confirmError }}</span>
            <span v-else-if="confirmPw && confirmPw === newPw" class="pw-msg ok">비밀번호가 일치합니다.</span>
          </div>
        </div>
      </div>
    </section>

    <div class="ms-actions">
      <button type="button" class="btn btn-primary btn-lg save-btn" :disabled="!canSave" @click="save">
        저장하기
      </button>
    </div>
  </div>
</template>

<style scoped>
.ms-head {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}

.ms-rows {
  display: flex;
  flex-direction: column;
}
.ms-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  align-items: start;
  gap: 16px;
  padding: 11px 0;
}
.ms-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
  padding-top: 12px;
}
.rq { color: var(--danger); margin-left: 2px; }
.ms-value {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.pw-input-wrap {
  position: relative;
  max-width: 360px;
}
.pw-input {
  width: 100%;
  height: 44px;
  padding-right: 44px;
}
.pw-input.has-error {
  border-color: var(--danger);
}
.pw-eye {
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
.pw-eye:hover { color: var(--ink-700); }

.ms-note {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.pw-link {
  font-weight: 600;
  color: var(--ink-900);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.pw-link:hover { color: var(--ink-700); }

.pw-msg {
  font-size: var(--fz-xs);
}
.pw-msg.error { color: var(--danger); }
.pw-msg.ok { color: var(--ink-500); }

.ms-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}
.save-btn {
  min-width: 160px;
  font-weight: 600;
}

@media (max-width: 720px) {
  .ms-row { grid-template-columns: 1fr; gap: 6px; }
  .ms-label { padding-top: 0; }
}
</style>
