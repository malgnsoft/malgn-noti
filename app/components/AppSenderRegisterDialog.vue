<script setup lang="ts">
import type { SenderRegisterResult } from '~/types/sender'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], registered: [SenderRegisterResult] }>()

const toast = useToast()

/* ── 마법사 상태 ─────────────────────────────────── */
const step = ref<1 | 2 | 3>(1)
const agreed = ref(false)
const method = ref<'document' | 'phone' | ''>('')

/* 서류 인증 경로 */
const DOC_TYPES = ['대표자 번호, 사업자 자체 번호', '임직원 번호', '타사 번호', '타인 번호']
const DOC_REQUIREMENTS: Record<string, string> = {
  '대표자 번호, 사업자 자체 번호': '통신서비스 이용증명원',
  '임직원 번호': '통신서비스 이용증명원, 재직증명서',
  '타사 번호': '통신서비스 이용증명원, 이용승낙서, 사업자등록증, 관계 확인 문서',
  '타인 번호': '통신서비스 이용증명원, 이용승낙서',
}
const docType = ref('')
const docNumber = ref('')
const docFile = ref<File | null>(null)
const docFileInput = ref<HTMLInputElement | null>(null)

const requiredDocLabel = computed(() => DOC_REQUIREMENTS[docType.value] ?? '통신서비스 이용증명원')

/* 휴대폰 본인인증 경로 */
const CARRIERS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰']
const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019']
const carrier = ref('')
const realName = ref('')
const rrnFront = ref('')
const rrnGender = ref('')
const foreigner = ref<'local' | 'foreign'>('local')
const phonePrefix = ref('010')
const phoneMid = ref('')
const phoneLast = ref('')
const codeSent = ref(false)
const verifyCode = ref('')
const verified = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const countdownLabel = computed(() => {
  const m = Math.floor(countdown.value / 60)
  const s = countdown.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
function startTimer() {
  stopTimer()
  countdown.value = 180
  timer = setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) stopTimer()
  }, 1000)
}

/* ── 단계 메타 ───────────────────────────────────── */
const steps = computed(() => [
  '개인정보 수집 이용 동의',
  '등록 방식 선택',
  method.value === 'phone' ? '휴대폰 본인인증' : '발신 정보 등록 및 서류 인증',
])

/* ── 진행 가능 여부 ─────────────────────────────── */
const docNumberValid = computed(() => /^[0-9]{8,12}$/.test(docNumber.value))
const phoneFilled = computed(
  () => !!carrier.value && !!realName.value
    && /^[0-9]{6}$/.test(rrnFront.value) && /^[0-9]$/.test(rrnGender.value)
    && /^[0-9]{3,4}$/.test(phoneMid.value) && /^[0-9]{4}$/.test(phoneLast.value),
)

const canProceed = computed(() => {
  if (step.value === 1) return agreed.value
  if (step.value === 2) return !!method.value
  if (step.value === 3 && method.value === 'document')
    return !!docType.value && docNumberValid.value && !!docFile.value
  if (step.value === 3 && method.value === 'phone')
    return verified.value
  return false
})

/* ── 핸들러 ──────────────────────────────────────── */
function reset() {
  step.value = 1
  agreed.value = false
  method.value = ''
  docType.value = ''
  docNumber.value = ''
  docFile.value = null
  carrier.value = ''
  realName.value = ''
  rrnFront.value = ''
  rrnGender.value = ''
  foreigner.value = 'local'
  phonePrefix.value = '010'
  phoneMid.value = ''
  phoneLast.value = ''
  codeSent.value = false
  verifyCode.value = ''
  verified.value = false
  stopTimer()
  countdown.value = 0
}

watch(() => props.open, (v) => {
  if (v) reset()
  else stopTimer()
})

onBeforeUnmount(stopTimer)

function close() {
  emit('close')
}

function goNext() {
  if (!canProceed.value) return
  if (step.value < 3) step.value = (step.value + 1) as 1 | 2 | 3
}
function goPrev() {
  if (step.value > 1) step.value = (step.value - 1) as 1 | 2 | 3
}

function pickFile() {
  docFileInput.value?.click()
}
function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (f.size > 10 * 1024 * 1024) {
    toast.add({ title: '파일 용량은 10MB 이하만 가능합니다.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  docFile.value = f
}

function nowStamp() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

function submitDocument() {
  if (!canProceed.value) return
  emit('registered', {
    type: docType.value,
    number: docNumber.value,
    status: '심사중',
    requestedAt: nowStamp(),
    approvedAt: '-',
  })
  toast.add({
    title: '발신 번호 등록이 요청되었습니다. 심사 결과는 영업일 기준 3~5일 이내에 안내됩니다.',
    color: 'success',
    icon: 'i-lucide-circle-check',
  })
  close()
}

function sendCode() {
  if (!phoneFilled.value) {
    toast.add({ title: '통신사·이름·주민등록번호·휴대폰 번호를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  codeSent.value = true
  verified.value = false
  verifyCode.value = ''
  startTimer()
  toast.add({
    title: '인증번호 6자리가 휴대폰 문자메시지로 발송되었습니다. 3분 이내 입력해 주세요.',
    color: 'info',
    icon: 'i-lucide-message-square',
  })
}

function confirmCode() {
  if (!/^[0-9]{6}$/.test(verifyCode.value)) {
    toast.add({ title: '인증번호 6자리를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (countdown.value <= 0) {
    toast.add({ title: '인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  verified.value = true
  stopTimer()
  toast.add({ title: '휴대폰 본인인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}

function submitPhone() {
  if (!verified.value) return
  emit('registered', {
    type: '본인 명의 휴대폰 (본인인증)',
    number: `${phonePrefix.value}${phoneMid.value}${phoneLast.value}`,
    status: '승인',
    requestedAt: nowStamp(),
    approvedAt: nowStamp(),
  })
  toast.add({
    title: '본인인증이 완료되어 발신 번호가 즉시 등록되었습니다.',
    color: 'success',
    icon: 'i-lucide-circle-check',
  })
  close()
}
</script>

<template>
  <AppModal :open="open" title="" :width="660" @close="close">
    <!-- 단계 인디케이터 -->
    <div class="stepper">
      <template v-for="(label, i) in steps" :key="i">
        <div v-if="i > 0" class="stepper-line" :class="{ done: step > i }" />
        <div
          class="stepper-step"
          :class="{ active: step === i + 1, done: step > i + 1 }"
        >
          <span class="stepper-dot">
            <UIcon v-if="step > i + 1" name="i-lucide-check" class="text-[length:var(--fz-sm)]" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span class="stepper-label">{{ label }}</span>
        </div>
      </template>
    </div>

    <!-- STEP 1 — 개인정보 수집 이용 동의 -->
    <div v-if="step === 1" class="wiz-step">
      <h3 class="wiz-title">[필수] 개인정보 수집 이용 동의</h3>
      <div class="agree-box">
        <h4>개인정보 수집 이용 동의서(발신 번호 등록)</h4>
        <p>회사는 귀하의 개인정보를 아래와 같이 수집 및 이용하고자 하오니, 동의하여 주시기 바랍니다.</p>
        <ol>
          <li>수집 항목: 이름, 생년월일, 성별, 내외국인 정보, 휴대폰 번호, 중복가입확인정보(DI), 암호화된 식별정보(CI), 재직증명서, 사업자등록증, 통신서비스 이용증명원, 기타 발신 번호 명의자가 사전승낙여부를 확인하기 위한 문서</li>
          <li>수집 목적: 발신 번호 등록, 본인 확인</li>
          <li>보유 기간: 관련 법령에 따라 보관 후 삭제</li>
        </ol>
        <p>귀하는 상기 개인정보 수집을 거부하실 권리가 있으며, 거부하시는 경우 서비스 이용이 불가합니다.</p>
      </div>
      <label class="checkbox agree-check">
        <input v-model="agreed" type="checkbox">
        <span>위 내용을 확인하였으며 개인정보 수집 및 이용에 동의합니다.</span>
      </label>
    </div>

    <!-- STEP 2 — 등록 방식 선택 -->
    <div v-else-if="step === 2" class="wiz-step">
      <h3 class="wiz-title">발신 정보 등록 방식 선택</h3>
      <p class="wiz-desc">등록하실 발신 번호 유형에 맞는 방식을 선택해 주세요.</p>
      <div class="method-list">
        <label class="method-card" :class="{ selected: method === 'document' }">
          <input v-model="method" type="radio" value="document">
          <span class="method-ico">
            <UIcon name="i-lucide-file-text" class="text-lg" />
          </span>
          <span class="method-body">
            <span class="method-name">발신 정보 직접 등록 및 서류 인증</span>
            <span class="method-text">
              발신 번호 유형 선택 후 필요한 명의자 인증 서류를 직접 업로드합니다.
              대표자/임직원/타사/타인 번호 등 모든 유형을 등록할 수 있으며,
              심사는 영업일 기준 <strong>3-5일</strong> 소요됩니다.
            </span>
          </span>
        </label>
        <label class="method-card" :class="{ selected: method === 'phone' }">
          <input v-model="method" type="radio" value="phone">
          <span class="method-ico">
            <UIcon name="i-lucide-smartphone" class="text-lg" />
          </span>
          <span class="method-body">
            <span class="method-name">내 휴대폰 번호로 발신 번호 설정하기</span>
            <span class="method-text">
              본인 명의 휴대폰 번호를 본인인증을 통해 <strong>즉시 등록</strong>합니다.
              별도의 서류 제출이 필요하지 않으며, 인증 완료 후 바로 사용 가능합니다.
            </span>
          </span>
        </label>
      </div>
    </div>

    <!-- STEP 3a — 서류 인증 -->
    <div v-else-if="step === 3 && method === 'document'" class="wiz-step">
      <h3 class="wiz-title">발신 정보 등록 및 서류 인증</h3>
      <p class="wiz-desc">
        발신 번호와 필요 서류 심사 후 승인이 완료되면 발신 번호가 등록됩니다. 심사는 영업일 기준 3~5일 소요됩니다.
      </p>

      <div class="form-row">
        <label>발신 번호 <span class="required">*</span></label>
        <div class="field">
          <div class="row" style="gap: 8px">
            <select v-model="docType" class="select" style="flex: 0 0 220px">
              <option value="">발신 번호 유형 선택</option>
              <option v-for="t in DOC_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
            <input
              v-model="docNumber"
              class="input"
              inputmode="numeric"
              maxlength="12"
              placeholder="-없이 숫자 입력"
            >
          </div>
          <ul class="bullets">
            <li>등록할 발신 번호의 유형과 발신 번호를 입력하세요.</li>
          </ul>
        </div>
      </div>

      <div class="form-row">
        <label>필요 서류 <span class="required">*</span></label>
        <div class="field">
          <div class="doc-label">{{ requiredDocLabel }}</div>
          <div class="row" style="gap: 8px">
            <input
              :value="docFile?.name ?? ''"
              class="input"
              readonly
              placeholder="서류 파일을 선택하세요"
            >
            <button type="button" class="btn btn-outline-dark" @click="pickFile">
              <UIcon name="i-lucide-upload" class="text-[length:var(--fz-sm)]" /> 파일 선택
            </button>
            <input
              ref="docFileInput"
              type="file"
              accept=".png,.jpg,.jpeg,.pdf,.tif,.tiff,.zip"
              style="display: none"
              @change="onFileChange"
            >
          </div>
          <p class="help">.png, .jpg, .jpeg, .pdf, .tif, .tiff, .zip 형식만 지원합니다. (최대 용량: 10MB)</p>
          <ul class="bullets">
            <li>{{ requiredDocLabel }}은 <strong class="danger">마스킹(숨김) 처리된 부분이 없고</strong>, 최근 3개월 이내 발급된 서류만 가능합니다.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- STEP 3b — 휴대폰 본인인증 -->
    <div v-else-if="step === 3 && method === 'phone'" class="wiz-step">
      <h3 class="wiz-title">휴대폰 본인인증</h3>
      <p class="wiz-desc">
        본인 명의의 휴대폰 정보를 입력하고 인증을 진행해 주세요. 인증이 완료되면 해당 번호가 발신 번호로 즉시 등록됩니다.
      </p>

      <div class="form-row">
        <label>통신사 <span class="required">*</span></label>
        <div class="field">
          <select v-model="carrier" class="select">
            <option value="">통신사를 선택하세요</option>
            <option v-for="c in CARRIERS" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <label>이름 <span class="required">*</span></label>
        <div class="field">
          <input v-model="realName" class="input" placeholder="실명을 입력하세요">
        </div>
      </div>

      <div class="form-row">
        <label>주민등록번호 <span class="required">*</span></label>
        <div class="field">
          <div class="rrn-row">
            <input
              v-model="rrnFront"
              class="input rrn-front"
              inputmode="numeric"
              maxlength="6"
              placeholder="앞 6자리"
            >
            <span class="rrn-dash">-</span>
            <input
              v-model="rrnGender"
              class="input rrn-gender"
              inputmode="numeric"
              maxlength="1"
            >
            <span class="rrn-mask">
              <span v-for="n in 6" :key="n" class="rrn-dot" />
            </span>
          </div>
          <ul class="bullets">
            <li>본인인증을 위해 주민등록번호 앞 6자리와 뒷자리 첫 번째 숫자(성별)만 입력합니다.</li>
          </ul>
        </div>
      </div>

      <div class="form-row">
        <label>내/외국인 <span class="required">*</span></label>
        <div class="field">
          <div class="radio-group">
            <label class="radio"><input v-model="foreigner" type="radio" value="local"><span>내국인</span></label>
            <label class="radio"><input v-model="foreigner" type="radio" value="foreign"><span>외국인</span></label>
          </div>
        </div>
      </div>

      <div class="form-row">
        <label>휴대폰 번호 <span class="required">*</span></label>
        <div class="field">
          <div class="row" style="gap: 8px">
            <select v-model="phonePrefix" class="select" style="flex: 0 0 90px">
              <option v-for="p in PHONE_PREFIXES" :key="p" :value="p">{{ p }}</option>
            </select>
            <span class="rrn-dash">-</span>
            <input v-model="phoneMid" class="input" inputmode="numeric" maxlength="4">
            <span class="rrn-dash">-</span>
            <input v-model="phoneLast" class="input" inputmode="numeric" maxlength="4">
            <button
              type="button"
              class="btn"
              :class="codeSent ? 'btn-outline' : 'btn-outline-dark'"
              style="flex: 0 0 auto"
              @click="sendCode"
            >
              {{ codeSent ? '재발송' : '인증번호 받기' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="codeSent" class="form-row">
        <label>인증번호 <span class="required">*</span></label>
        <div class="field">
          <div class="row" style="gap: 8px">
            <div class="code-input-wrap">
              <input
                v-model="verifyCode"
                class="input"
                :class="{ 'code-verified': verified }"
                inputmode="numeric"
                maxlength="6"
                :disabled="verified"
                placeholder="인증번호 6자리"
              >
              <span v-if="!verified && countdown > 0" class="code-timer">{{ countdownLabel }}</span>
              <span v-else-if="verified" class="code-ok"><UIcon name="i-lucide-circle-check" /></span>
            </div>
            <button
              type="button"
              class="btn btn-primary"
              style="flex: 0 0 auto"
              :disabled="verified"
              @click="confirmCode"
            >
              확인
            </button>
          </div>
          <ul class="bullets">
            <li>인증번호가 오지 않으면 입력하신 정보를 확인하고 재발송해 주세요.</li>
            <li>유효 시간은 3분이며, 만료 시 인증번호를 다시 받아주세요.</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <template #footer>
      <div class="wiz-footer">
        <button
          type="button"
          class="btn btn-outline-dark wiz-btn"
          @click="step === 1 ? close() : goPrev()"
        >
          {{ step === 1 ? '취소' : '이전' }}
        </button>

        <button
          v-if="step < 3"
          type="button"
          class="btn btn-primary wiz-btn"
          :disabled="!canProceed"
          @click="goNext"
        >
          다음
        </button>
        <button
          v-else-if="method === 'document'"
          type="button"
          class="btn btn-primary wiz-btn"
          :disabled="!canProceed"
          @click="submitDocument"
        >
          등록 요청
        </button>
        <button
          v-else
          type="button"
          class="btn btn-primary wiz-btn"
          :disabled="!canProceed"
          @click="submitPhone"
        >
          등록 완료
        </button>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
/* ── 단계 인디케이터 ─────────────────────────────── */
.stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0 20px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 20px;
}
.stepper-step {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stepper-dot {
  width: 22px;
  height: 22px;
  border-radius: var(--r-full);
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  font-weight: 600;
  background: var(--ink-100);
  color: var(--ink-400);
  flex-shrink: 0;
}
.stepper-step.active .stepper-dot {
  background: var(--ink-900);
  color: var(--white);
}
.stepper-step.done .stepper-dot {
  background: var(--accent);
  color: var(--ink-900);
}
.stepper-label {
  font-size: var(--fz-sm);
  color: var(--ink-400);
  white-space: nowrap;
}
.stepper-step.active .stepper-label {
  color: var(--ink-900);
  font-weight: 600;
}
.stepper-step.done .stepper-label {
  color: var(--ink-600);
}
.stepper-line {
  flex: 1;
  height: 1px;
  background: var(--line);
}
.stepper-line.done {
  background: var(--accent);
}

/* ── 단계 본문 ───────────────────────────────────── */
.wiz-step {
  display: flex;
  flex-direction: column;
}
.wiz-title {
  font-size: var(--fz-2xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 4px;
}
.wiz-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: 0 0 20px;
  line-height: 1.6;
}

/* STEP 1 — 동의 */
.agree-box {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--ink-50);
  padding: 18px 20px;
  margin: 12px 0 16px;
  max-height: 260px;
  overflow-y: auto;
}
.agree-box h4 {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 10px;
}
.agree-box p {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
  margin: 0 0 10px;
}
.agree-box ol {
  margin: 0 0 10px;
  padding-left: 20px;
  list-style: decimal;
}
.agree-box li {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
  margin-bottom: 4px;
}
.agree-check {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 14px 16px;
  font-size: var(--fz-md);
}

/* STEP 2 — 방식 선택 */
.method-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.method-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.method-card:hover { border-color: var(--ink-300); }
.method-card.selected {
  border-color: var(--ink-900);
  background: var(--ink-50);
}
.method-card input[type='radio'] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--ink-300);
  border-radius: 50%;
  margin: 2px 0 0;
  flex-shrink: 0;
  cursor: pointer;
}
.method-card input[type='radio']:checked {
  border-color: var(--ink-900);
  background: var(--ink-900);
  box-shadow: inset 0 0 0 3px var(--white);
}
.method-ico {
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  background: var(--ink-50);
  color: var(--ink-600);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.method-card.selected .method-ico {
  background: var(--accent-soft);
  color: var(--accent-ink);
}
.method-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.method-name {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.method-text {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
}
.method-text strong { color: var(--accent-ink); font-weight: 600; }

/* STEP 3 — 폼 공통 */
.bullets {
  margin: 6px 0 0;
  padding-left: 16px;
  list-style: disc;
}
.bullets li {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.6;
}
.bullets li .danger { color: var(--danger-ink); }
.doc-label {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
  margin-bottom: 6px;
}

/* 주민등록번호 */
.rrn-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rrn-dash { color: var(--ink-300); }
.rrn-front { flex: 0 0 130px; }
.rrn-gender { flex: 0 0 52px; text-align: center; }
.rrn-mask {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rrn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ink-200);
}

/* 인증번호 */
.code-input-wrap {
  position: relative;
  flex: 1;
}
.code-timer {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--danger-ink);
  pointer-events: none;
}
.code-ok {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--accent-ink);
}
.code-verified {
  border-color: var(--accent);
  background: var(--accent-soft);
}

/* 푸터 */
.wiz-footer {
  width: 100%;
  display: flex;
  gap: 8px;
}
.wiz-btn {
  flex: 1;
  height: 40px;
  font-size: var(--fz-md);
}
</style>
