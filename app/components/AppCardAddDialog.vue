<script setup lang="ts">
export interface CardAddResult {
  brand: string
  last4: string
  alias: string
}

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], registered: [CardAddResult] }>()

const toast = useToast()

const cardType = ref<'personal' | 'corporate'>('personal')
const num = ref(['', '', '', ''])
const expMM = ref('')
const expYY = ref('')
const cvc = ref('')
const pwPrefix = ref('')
const alias = ref('')

const numFilled = computed(() => num.value.every(n => /^\d{4}$/.test(n)))
const expValid = computed(() =>
  /^\d{2}$/.test(expMM.value) && /^\d{2}$/.test(expYY.value)
  && Number(expMM.value) >= 1 && Number(expMM.value) <= 12,
)
const canSubmit = computed(() =>
  numFilled.value && expValid.value
  && /^\d{3}$/.test(cvc.value) && /^\d{2}$/.test(pwPrefix.value),
)

function reset() {
  cardType.value = 'personal'
  num.value = ['', '', '', '']
  expMM.value = ''
  expYY.value = ''
  cvc.value = ''
  pwPrefix.value = ''
  alias.value = ''
}
watch(() => props.open, (v) => {
  if (v) reset()
})

function brandOf(first: string) {
  if (first.startsWith('4')) return 'VISA'
  if (first.startsWith('5') || first.startsWith('2')) return 'MASTER'
  if (first.startsWith('3')) return 'AMEX'
  return 'CARD'
}
function onNumInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 4)
  num.value[i] = digits
  el.value = digits
  if (digits.length === 4) (el.nextElementSibling as HTMLInputElement | null)?.focus()
}
function submit() {
  if (!canSubmit.value) {
    toast.add({ title: '카드 정보를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('registered', {
    brand: brandOf(num.value[0] ?? ''),
    last4: num.value[3] ?? '',
    alias: alias.value.trim(),
  })
  toast.add({ title: '결제 카드가 등록되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="카드 추가" :width="440" @close="emit('close')">
    <div class="ca-form">
      <div class="fld">
        <label>카드 종류</label>
        <div class="radio-group">
          <label class="radio"><input v-model="cardType" type="radio" value="personal"><span>개인카드</span></label>
          <label class="radio"><input v-model="cardType" type="radio" value="corporate"><span>법인카드</span></label>
        </div>
      </div>

      <div class="fld">
        <label>카드번호</label>
        <div class="num-row">
          <input
            v-for="(d, i) in num"
            :key="i"
            :value="d"
            class="input num-box"
            inputmode="numeric"
            maxlength="4"
            placeholder="0000"
            @input="onNumInput(i, $event)"
          >
        </div>
      </div>

      <div class="ca-grid">
        <div class="fld">
          <label>유효기간</label>
          <div class="exp-row">
            <input v-model="expMM" class="input" inputmode="numeric" maxlength="2" placeholder="MM">
            <span class="slash">/</span>
            <input v-model="expYY" class="input" inputmode="numeric" maxlength="2" placeholder="YY">
          </div>
        </div>
        <div class="fld">
          <label>CVC</label>
          <input v-model="cvc" class="input" inputmode="numeric" maxlength="3" placeholder="카드 뒷면 3자리">
        </div>
      </div>

      <div class="fld">
        <label>비밀번호 앞 2자리</label>
        <input
          v-model="pwPrefix"
          type="password"
          class="input pw-input"
          inputmode="numeric"
          maxlength="2"
        >
      </div>

      <div class="fld">
        <label>카드 별명 <span class="opt">(선택)</span></label>
        <input v-model="alias" class="input" maxlength="20" placeholder="예) 회사 법인카드">
      </div>

      <button type="button" class="btn btn-primary ca-submit" :disabled="!canSubmit" @click="submit">
        등록
      </button>
    </div>
  </AppModal>
</template>

<style scoped>
.ca-form {
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
.fld .opt {
  font-weight: 400;
  color: var(--ink-400);
}
.fld .radio-group { min-height: 32px; }

.num-row {
  display: flex;
  gap: 8px;
}
.num-box {
  min-width: 0;
  flex: 1;
  text-align: center;
  font-family: var(--font-mono);
}

.ca-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.exp-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.exp-row .input {
  flex: 1;
  min-width: 0;
  text-align: center;
  font-family: var(--font-mono);
}
.slash { color: var(--ink-300); }

.pw-input {
  max-width: 140px;
  letter-spacing: 0.3em;
}

.ca-submit {
  width: 100%;
  height: 46px;
  margin-top: 4px;
  font-size: var(--fz-md);
  font-weight: 600;
}
</style>
