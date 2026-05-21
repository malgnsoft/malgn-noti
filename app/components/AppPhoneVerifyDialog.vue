<script setup lang="ts">
export interface PhoneVerifyResult {
  prefix: string
  mid: string
  last: string
}

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], verified: [PhoneVerifyResult] }>()

const toast = useToast()

const CARRIERS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰']
const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019']

const carrier = ref('')
const name = ref('')
const rrnFront = ref('')
const rrnGender = ref('')
const foreigner = ref<'local' | 'foreign'>('local')
const phonePrefix = ref('010')
const phoneMid = ref('')
const phoneLast = ref('')
const codeSent = ref(false)
const code = ref('')
const verified = ref(false)

const phoneFilled = computed(() =>
  !!carrier.value && name.value.trim() !== ''
  && /^\d{6}$/.test(rrnFront.value) && /^\d$/.test(rrnGender.value)
  && /^\d{3,4}$/.test(phoneMid.value) && /^\d{4}$/.test(phoneLast.value),
)

function reset() {
  carrier.value = ''
  name.value = ''
  rrnFront.value = ''
  rrnGender.value = ''
  foreigner.value = 'local'
  phonePrefix.value = '010'
  phoneMid.value = ''
  phoneLast.value = ''
  codeSent.value = false
  code.value = ''
  verified.value = false
}
watch(() => props.open, (v) => {
  if (v) reset()
})

function sendCode() {
  if (!phoneFilled.value) {
    toast.add({ title: '통신사·이름·주민등록번호·휴대폰 번호를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  codeSent.value = true
  verified.value = false
  code.value = ''
  toast.add({ title: '인증번호 6자리가 휴대폰으로 발송되었습니다.', color: 'info', icon: 'i-lucide-message-square' })
}
function confirmCode() {
  if (!/^\d{6}$/.test(code.value)) {
    toast.add({ title: '인증번호 6자리를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  verified.value = true
  toast.add({ title: '휴대폰 본인 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}
function complete() {
  if (!verified.value) return
  emit('verified', { prefix: phonePrefix.value, mid: phoneMid.value, last: phoneLast.value })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="휴대폰 본인 인증" :width="520" @close="emit('close')">
    <p class="pv-desc">본인 명의의 휴대폰 정보를 입력하고 인증을 진행해 주세요.</p>

    <div class="pv-form">
      <div class="pv-row">
        <label>통신사 <span class="rq">*</span></label>
        <div class="pv-field">
          <select v-model="carrier" class="select" :disabled="verified">
            <option value="">통신사를 선택하세요</option>
            <option v-for="c in CARRIERS" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <div class="pv-row">
        <label>이름 <span class="rq">*</span></label>
        <div class="pv-field">
          <input v-model="name" class="input" placeholder="실명을 입력하세요" :disabled="verified">
        </div>
      </div>

      <div class="pv-row">
        <label>주민등록번호 <span class="rq">*</span></label>
        <div class="pv-field">
          <div class="rrn-row">
            <input
              v-model="rrnFront"
              class="input rrn-front"
              inputmode="numeric"
              maxlength="6"
              placeholder="앞 6자리"
              :disabled="verified"
            >
            <span class="dash">-</span>
            <input
              v-model="rrnGender"
              class="input rrn-gender"
              inputmode="numeric"
              maxlength="1"
              :disabled="verified"
            >
            <span class="rrn-mask">
              <span v-for="n in 6" :key="n" class="rrn-dot" />
            </span>
          </div>
        </div>
      </div>

      <div class="pv-row">
        <label>내/외국인 <span class="rq">*</span></label>
        <div class="pv-field">
          <div class="radio-group">
            <label class="radio">
              <input v-model="foreigner" type="radio" value="local" :disabled="verified"><span>내국인</span>
            </label>
            <label class="radio">
              <input v-model="foreigner" type="radio" value="foreign" :disabled="verified"><span>외국인</span>
            </label>
          </div>
        </div>
      </div>

      <div class="pv-row">
        <label>휴대폰 번호 <span class="rq">*</span></label>
        <div class="pv-field">
          <div class="phone-row">
            <select v-model="phonePrefix" class="select phone-prefix" :disabled="verified">
              <option v-for="p in PHONE_PREFIXES" :key="p" :value="p">{{ p }}</option>
            </select>
            <span class="dash">-</span>
            <input v-model="phoneMid" class="input" inputmode="numeric" maxlength="4" :disabled="verified">
            <span class="dash">-</span>
            <input v-model="phoneLast" class="input" inputmode="numeric" maxlength="4" :disabled="verified">
            <button type="button" class="btn btn-outline-dark phone-btn" :disabled="verified" @click="sendCode">
              {{ codeSent ? '재발송' : '인증번호 받기' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="codeSent" class="pv-row">
        <label>인증번호 <span class="rq">*</span></label>
        <div class="pv-field">
          <div class="phone-row">
            <input
              v-model="code"
              class="input"
              inputmode="numeric"
              maxlength="6"
              placeholder="인증번호 6자리"
              :disabled="verified"
            >
            <button type="button" class="btn btn-primary phone-btn" :disabled="verified" @click="confirmCode">
              {{ verified ? '인증 완료' : '확인' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="verified" class="pv-ok">
        <UIcon name="i-lucide-circle-check" /> 휴대폰 본인 인증이 완료되었습니다.
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!verified" @click="complete">
        완료
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.pv-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 16px;
}
.pv-form {
  display: flex;
  flex-direction: column;
}
.pv-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 11px 0;
}
.pv-row + .pv-row { border-top: 1px solid var(--line); }
.pv-row > label {
  width: 96px;
  flex-shrink: 0;
  padding-top: 9px;
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.rq { color: var(--danger); margin-left: 2px; }
.pv-field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pv-field .radio-group { min-height: 36px; }

.dash { color: var(--ink-300); }

/* 주민등록번호 */
.rrn-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rrn-front { flex: 0 0 120px; }
.rrn-gender { flex: 0 0 48px; text-align: center; }
.rrn-mask {
  display: flex;
  align-items: center;
  gap: 7px;
}
.rrn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ink-200);
}

/* 휴대폰 번호 / 인증번호 */
.phone-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.phone-row .input {
  flex: 1;
  min-width: 0;
}
.phone-row .phone-prefix { flex: 0 0 80px; }
.phone-row .phone-btn { flex: 0 0 auto; height: 36px; }

.pv-ok {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding: 10px 12px;
  background: var(--accent-soft);
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--accent-ink);
}
</style>
