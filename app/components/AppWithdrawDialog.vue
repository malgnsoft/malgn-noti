<script setup lang="ts">
interface WithdrawPayload { password: string, reason?: string }

const props = defineProps<{
  open: boolean
  /** 부모가 제공하는 비동기 처리 함수. throw 시 다이얼로그는 열린 채로 submit 상태만 해제. */
  onConfirm: (payload: WithdrawPayload) => Promise<void>
}>()
const emit = defineEmits<{ close: [] }>()

const toast = useToast()

const password = ref('')
const reason = ref('')
const showPw = ref(false)
const submitting = ref(false)

const canSubmit = computed(() => password.value.length > 0)

function reset() {
  password.value = ''
  reason.value = ''
  showPw.value = false
  submitting.value = false
}
watch(() => props.open, (v) => {
  if (v) reset()
})

async function submit() {
  if (!canSubmit.value) {
    toast.add({ title: '비밀번호를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (submitting.value) return
  submitting.value = true
  try {
    await props.onConfirm({ password: password.value, reason: reason.value.trim() || undefined })
    emit('close')
  }
  catch (e) {
    const msg = (e as { data?: { message?: string } }).data?.message ?? '회원 탈퇴 처리에 실패했습니다.'
    toast.add({ title: msg, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppModal :open="open" title="회원 탈퇴" :width="460" @close="emit('close')">
    <div class="wd-warn">
      <UIcon name="i-lucide-triangle-alert" class="wd-warn-icon" />
      <p>
        회원 탈퇴 시 모든 발송 이력·주소록·설정이 영구 삭제되며 <strong>복구할 수 없습니다.</strong>
        계속하시려면 본인 확인을 위해 로그인 비밀번호를 입력해 주세요.
      </p>
    </div>

    <div class="wd-form">
      <div class="fld">
        <label>비밀번호 <span class="rq">*</span></label>
        <div class="pw-wrap">
          <input
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            class="input pw-input"
            placeholder="로그인 비밀번호를 입력해 주세요."
            autocomplete="current-password"
            @keyup.enter="submit"
          >
          <button type="button" class="pw-eye" :aria-label="showPw ? '숨기기' : '표시'" @click="showPw = !showPw">
            <UIcon :name="showPw ? 'i-lucide-eye-off' : 'i-lucide-eye'" />
          </button>
        </div>
      </div>

      <div class="fld">
        <label>탈퇴 사유 <span class="opt">(선택)</span></label>
        <textarea
          v-model="reason"
          class="input wd-reason"
          rows="3"
          maxlength="500"
          placeholder="서비스 개선을 위해 탈퇴 사유를 남겨주시면 큰 도움이 됩니다."
        />
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-error-solid" :disabled="!canSubmit || submitting" @click="submit">
        {{ submitting ? '처리 중…' : '회원 탈퇴' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.wd-warn {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  margin-bottom: 18px;
  border: 1px solid var(--danger);
  background: #fef2f2;
  border-radius: var(--r-md);
}
.wd-warn-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: var(--danger-ink);
  margin-top: 1px;
}
.wd-warn p {
  margin: 0;
  font-size: var(--fz-sm);
  color: var(--ink-700);
  line-height: 1.6;
}
.wd-warn strong { color: var(--danger-ink); font-weight: 700; }

.wd-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.fld {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fld > label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.rq { color: var(--danger); margin-left: 2px; }
.opt { font-weight: 400; color: var(--ink-400); }

.pw-wrap { position: relative; }
.pw-input { width: 100%; height: 44px; padding-right: 44px; }
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

.wd-reason {
  width: 100%;
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.5;
  font-family: inherit;
}
</style>
