<script setup lang="ts">
const props = defineProps<{ open: boolean, submitting?: boolean }>()
const emit = defineEmits<{ close: [], submit: [{ name: string, email: string, role: 'admin' | 'member' }] }>()

const toast = useToast()

const name = ref('')
const email = ref('')
const role = ref<'admin' | 'member'>('member')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailError = computed(() => {
  if (!email.value) return ''
  return EMAIL_RE.test(email.value) ? '' : '올바른 이메일 형식이 아닙니다.'
})
const canSend = computed(() => name.value.trim() !== '' && EMAIL_RE.test(email.value))

watch(() => props.open, (v) => {
  if (v) {
    name.value = ''
    email.value = ''
    role.value = 'member'
  }
})

function send() {
  if (!canSend.value) {
    toast.add({ title: '이름과 이메일을 올바르게 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  // 실제 생성·토스트·닫기는 호출부(패널)가 서버 응답 후 처리한다.
  emit('submit', { name: name.value.trim(), email: email.value.trim(), role: role.value })
}
</script>

<template>
  <AppModal :open="open" title="담당자 추가" :width="460" @close="emit('close')">
    <p class="iv-desc">
      추가할 담당자의 이름·이메일·권한을 입력해 주세요.
      계정이 즉시 생성되며, 입력한 이메일로 <b>임시 비밀번호 안내 메일</b>이 발송됩니다.
    </p>

    <div class="iv-form">
      <div class="iv-row">
        <label for="iv-name">이름 <span class="rq">*</span></label>
        <input
          id="iv-name"
          v-model="name"
          class="input"
          placeholder="담당자 이름을 입력해 주세요"
          @keyup.enter="send"
        >
      </div>
      <div class="iv-row">
        <label for="iv-email">이메일 <span class="rq">*</span></label>
        <input
          id="iv-email"
          v-model="email"
          type="email"
          class="input"
          :class="{ 'has-error': !!emailError }"
          placeholder="example@company.com"
          @keyup.enter="send"
        >
        <p v-if="emailError" class="iv-error">{{ emailError }}</p>
        <p v-else class="iv-help">이 이메일이 담당자의 로그인 아이디로 사용됩니다.</p>
      </div>
      <div class="iv-row">
        <label>권한 <span class="rq">*</span></label>
        <div class="radio-group">
          <label class="radio"><input v-model="role" type="radio" value="member"><span>멤버</span></label>
          <label class="radio"><input v-model="role" type="radio" value="admin"><span>관리자</span></label>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!canSend || submitting" @click="send">
        <UIcon name="i-lucide-user-plus" class="text-[length:var(--fz-sm)]" /> 담당자 추가
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.iv-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 18px;
}
.iv-desc b { color: var(--ink-700); font-weight: 600; }

.iv-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.iv-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.iv-row label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.rq { color: var(--danger); margin-left: 2px; }
.iv-row .input { width: 100%; }
.iv-row .input.has-error { border-color: var(--danger); }
.iv-error {
  font-size: var(--fz-xs);
  color: var(--danger);
  margin: 0;
}
.iv-help {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0;
}
</style>
