<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '회원가입' })

const toast = useToast()

type UserType = 'corp' | 'sole' | 'personal'

const USER_TYPES = [
  { value: 'corp', label: '법인사업자', desc: '사업자 등록증 등 증빙 서류 제출이 필요합니다.', icon: 'i-lucide-building-2' },
  { value: 'sole', label: '개인사업자', desc: '사업자 등록증 등 증빙 서류 제출이 필요합니다.', icon: 'i-lucide-store' },
  { value: 'personal', label: '개인', desc: '가입신청서(계약서) 제출이 필요합니다.', icon: 'i-lucide-user' },
] as const

const STEPS = [
  { no: 1, label: '회원 가입 안내' },
  { no: 2, label: '정보 확인' },
  { no: 3, label: '아이디 등록 및 약관 동의' },
  { no: 4, label: '본인 인증' },
  { no: 5, label: '가입 완료' },
] as const

const step = ref(1)

/* ── Step 1 — 서비스 이용 절차 / 신청 서류 ───────────── */
const FLOW = [
  { tag: '홈페이지', lines: ['회원 가입'] },
  { tag: '가입신청서', lines: ['로그인 후 작성'] },
  { tag: '승인', lines: ['정보 확인 후 승인'] },
  { tag: '서비스 이용', lines: ['충전 후 사용', '사용 후 후불 정산'] },
]
const DOC_ROWS = [
  {
    target: ['법인 사업자', '개인 사업자'],
    docs: ['사업자 등록증', '대부업등록증(해당업체)', '가입신청서(계약서)'],
    usage: '카드 등록 후 충전 이용방식',
  },
  {
    target: ['개인'],
    docs: ['가입신청서(계약서)'],
    usage: '카드 등록 후 충전 이용방식',
  },
  {
    target: ['법인 사업자', '개인 사업자'],
    docs: ['사업자 등록증', '대부업등록증(해당업체)', '가입신청서(계약서)', '지급이행보증보험증권'],
    usage: '후불 계약',
  },
]

/* ── 회원 유형 (Step 1에서 선택) ─────────────────────── */
const userType = ref<UserType | ''>('')
const userTypeLabel = computed(() => USER_TYPES.find(t => t.value === userType.value)?.label ?? '')

/* ── Step 2 — 정보 확인 ──────────────────────────────── */
const bizNo1 = ref('')
const bizNo2 = ref('')
const bizNo3 = ref('')
const company = ref('')
const ceoName = ref('')
const personName = ref('')
const personAddr = ref('')

const isBusiness = computed(() => userType.value === 'corp' || userType.value === 'sole')
const bizNoValid = computed(() =>
  /^\d{3}$/.test(bizNo1.value) && /^\d{2}$/.test(bizNo2.value) && /^\d{5}$/.test(bizNo3.value),
)

/* ── Step 3 — 아이디 등록 및 약관 동의 ───────────────── */
const email = ref('')
const emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))
const idCodeSent = ref(false)
const codeDigits = ref(['', '', '', '', '', ''])
const fullCode = computed(() => codeDigits.value.join(''))
const idVerified = ref(false)

const password = ref('')
const passwordConfirm = ref('')
const pwValid = computed(() => password.value.length >= 8)
const pwMatch = computed(() => passwordConfirm.value !== '' && password.value === passwordConfirm.value)

const TERMS = [
  { key: 'service', badge: '필수', label: '서비스 이용약관 동의' },
  { key: 'spam', badge: '필수', label: '스팸메시지 이용약관 동의' },
  { key: 'privacy', badge: '필수', label: '개인정보 수집 및 이용동의' },
  { key: 'ad', badge: '선택', label: '광고성 메시지 활용 동의 안내' },
] as const
const agreed = ref<Record<string, boolean>>({})
const allAgreed = computed({
  get: () => TERMS.every(t => agreed.value[t.key]),
  set: (v: boolean) => { TERMS.forEach((t) => { agreed.value[t.key] = v }) },
})
const requiredTermsOk = computed(() => TERMS.filter(t => t.badge === '필수').every(t => agreed.value[t.key]))
const activeTermKey = ref('')

function sendIdCode() {
  if (!emailValid.value) {
    toast.add({ title: '올바른 이메일 주소를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  idCodeSent.value = true
  idVerified.value = false
  codeDigits.value = ['', '', '', '', '', '']
  toast.add({ title: '인증코드 6자리를 이메일로 발송했습니다.', color: 'info', icon: 'i-lucide-mail' })
}
function onCodeInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement
  const digit = el.value.replace(/\D/g, '').slice(-1)
  codeDigits.value[i] = digit
  el.value = digit
  if (digit) (el.nextElementSibling as HTMLInputElement | null)?.focus()
}
function onCodeKeydown(i: number, e: KeyboardEvent) {
  const el = e.target as HTMLInputElement
  if (e.key === 'Backspace' && !codeDigits.value[i]) {
    (el.previousElementSibling as HTMLInputElement | null)?.focus()
  }
}
function confirmIdCode() {
  if (!idCodeSent.value) {
    toast.add({ title: '먼저 인증코드를 발송해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (fullCode.value.length !== 6) {
    toast.add({ title: '인증코드 6자리를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  idVerified.value = true
  toast.add({ title: '이메일 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}
function onTermAgree(key: string) {
  agreed.value[key] = true
  activeTermKey.value = ''
}

/* ── Step 4 — 휴대폰 본인 인증 ───────────────────────── */
const CARRIERS = ['SKT', 'KT', 'LG U+', 'SKT 알뜰폰', 'KT 알뜰폰', 'LG U+ 알뜰폰']
const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019']
const carrier = ref('')
const authName = ref('')
const rrnFront = ref('')
const rrnGender = ref('')
const foreigner = ref<'local' | 'foreign'>('local')
const phonePrefix = ref('010')
const phoneMid = ref('')
const phoneLast = ref('')
const codeSent = ref(false)
const authCode = ref('')
const verified = ref(false)

const phoneFilled = computed(() =>
  !!carrier.value && authName.value.trim() !== ''
  && /^\d{6}$/.test(rrnFront.value) && /^\d$/.test(rrnGender.value)
  && /^\d{3,4}$/.test(phoneMid.value) && /^\d{4}$/.test(phoneLast.value),
)

function sendCode() {
  if (!phoneFilled.value) {
    toast.add({ title: '통신사·이름·주민등록번호·휴대폰 번호를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  codeSent.value = true
  verified.value = false
  authCode.value = ''
  toast.add({ title: '인증번호 6자리가 휴대폰으로 발송되었습니다.', color: 'info', icon: 'i-lucide-message-square' })
}
function confirmCode() {
  if (!/^\d{6}$/.test(authCode.value)) {
    toast.add({ title: '인증번호 6자리를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  verified.value = true
  toast.add({ title: '본인 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}

/* ── 진행 가능 여부 ──────────────────────────────────── */
const canProceed = computed(() => {
  switch (step.value) {
    case 1:
      return userType.value !== ''
    case 2:
      return isBusiness.value
        ? bizNoValid.value && company.value.trim() !== '' && ceoName.value.trim() !== ''
        : personName.value.trim() !== '' && personAddr.value.trim() !== ''
    case 3:
      return idVerified.value && pwValid.value && pwMatch.value && requiredTermsOk.value
    case 4:
      return verified.value
    default:
      return true
  }
})

async function goNext() {
  if (!canProceed.value) {
    toast.add({ title: '필수 항목을 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (step.value === 4) {
    // 본인 인증 완료 → 실제 가입 API 호출 → 성공 시 step 5
    await submitSignup()
    return
  }
  if (step.value < 5) {
    step.value += 1
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
function goPrev() {
  if (step.value > 1) {
    step.value -= 1
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
/* ── Step 4 → 5: 실 가입 API 호출 (auto-login) ────────── */
const auth = useAuthStore()
const submitting = ref(false)

async function submitSignup() {
  if (!emailValid.value || !pwValid.value || !pwMatch.value) {
    toast.add({ title: '입력값을 다시 확인해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    step.value = 3
    return
  }

  const fullPhone = `${phonePrefix.value}-${phoneMid.value}-${phoneLast.value}`
  const displayName = isBusiness.value ? ceoName.value.trim() : personName.value.trim()
  const companyName = isBusiness.value ? company.value.trim() : displayName

  submitting.value = true
  try {
    await auth.signup({
      companyName,
      loginid: email.value.trim(),
      password: password.value,
      email: email.value.trim(),
      name: displayName || undefined,
      phone: fullPhone,
    })
    step.value = 5
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status
    const dataAny = (e as { data?: unknown })?.data
    const msg = (dataAny && typeof dataAny === 'object' && 'message' in dataAny)
      ? String((dataAny as { message?: unknown }).message ?? '')
      : ''
    toast.add({
      title: status === 409 || /Duplicate|이미 사용/.test(msg)
        ? '이미 가입된 이메일입니다. 로그인 화면에서 진행해 주세요.'
        : '가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
  }
  finally {
    submitting.value = false
  }
}

/* Step 5에서 호출 — 이미 자동 로그인된 상태 */
function finish() {
  navigateTo('/home')
}
</script>

<template>
  <div class="signup">
    <NuxtLink to="/home" class="signup-logo">
      <span class="logo-icon"><AppLogoMark :size="16" /></span>
      <span><strong>맑은</strong><span class="logo-sub">message</span></span>
    </NuxtLink>

    <h1 class="signup-title">회원가입</h1>

    <!-- 5단계 인디케이터 -->
    <ol class="steps">
      <li
        v-for="s in STEPS"
        :key="s.no"
        class="step"
        :class="{ active: s.no === step, done: s.no < step }"
      >
        <span class="step-no">Step {{ s.no }}</span>
        <span class="step-label">{{ s.label }}</span>
      </li>
    </ol>

    <!-- ============ STEP 1 — 회원 가입 안내 ============ -->
    <section v-if="step === 1" class="panel">
      <h2 class="section-title">서비스 이용 절차</h2>
      <div class="flow">
        <template v-for="(f, i) in FLOW" :key="f.tag">
          <UIcon v-if="i > 0" name="i-lucide-chevron-right" class="flow-arrow" />
          <div class="flow-card">
            <span class="flow-tag">{{ f.tag }}</span>
            <span v-for="ln in f.lines" :key="ln" class="flow-line">{{ ln }}</span>
          </div>
        </template>
      </div>

      <h2 class="section-title" style="margin-top: 36px">서비스 신청 서류</h2>
      <table class="table doc-table">
        <thead>
          <tr>
            <th style="width: 240px">구분</th>
            <th>가입 서류</th>
            <th style="width: 280px">이용 방식</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in DOC_ROWS" :key="i">
            <td>
              <div v-for="t in row.target" :key="t">{{ t }}</div>
            </td>
            <td>
              <div v-for="d in row.docs" :key="d">{{ d }}</div>
            </td>
            <td>{{ row.usage }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="section-title" style="margin-top: 36px">회원 유형 선택</h2>
      <p class="select-hint">가입하실 회원 유형을 선택한 후 다음 단계로 진행해 주세요.</p>
      <div class="type-cards">
        <label
          v-for="t in USER_TYPES"
          :key="t.value"
          class="type-card"
          :class="{ selected: userType === t.value }"
        >
          <input v-model="userType" type="radio" :value="t.value">
          <span class="type-ico"><UIcon :name="t.icon" /></span>
          <span class="type-name">{{ t.label }}</span>
          <span class="type-desc">{{ t.desc }}</span>
        </label>
      </div>
    </section>

    <!-- ============ STEP 2 — 정보 확인 ============ -->
    <section v-else-if="step === 2" class="panel">
      <h2 class="panel-title">정보 확인</h2>
      <p class="panel-desc">
        사업자등록번호 입력 후 기업 정보를 확인해 주세요. (비영리 단체일 경우는 고유번호 입력)
      </p>
      <p class="panel-desc strong">증빙서류와 동일한 사업자등록번호(고유번호)를 입력해 주세요.</p>

      <div class="form">
        <div class="frow">
          <label>사용자 유형</label>
          <div class="fctrl">
            <div class="type-readonly">{{ userTypeLabel }}</div>
          </div>
        </div>

        <template v-if="isBusiness">
          <div class="frow">
            <label>사업자 등록 번호</label>
            <div class="fctrl bizno">
              <input v-model="bizNo1" class="input" inputmode="numeric" maxlength="3">
              <span class="dash">-</span>
              <input v-model="bizNo2" class="input" inputmode="numeric" maxlength="2">
              <span class="dash">-</span>
              <input v-model="bizNo3" class="input" inputmode="numeric" maxlength="5">
            </div>
          </div>
          <div class="frow">
            <label>회사명</label>
            <div class="fctrl">
              <input v-model="company" class="input" placeholder="회사명을 입력해 주세요.">
            </div>
          </div>
          <div class="frow">
            <label>대표자명</label>
            <div class="fctrl">
              <input v-model="ceoName" class="input" placeholder="대표자명을 입력해 주세요.">
            </div>
          </div>
        </template>

        <template v-else>
          <div class="frow">
            <label>이름</label>
            <div class="fctrl">
              <input v-model="personName" class="input" placeholder="이름을 입력해 주세요.">
            </div>
          </div>
          <div class="frow">
            <label>주소</label>
            <div class="fctrl">
              <input v-model="personAddr" class="input" placeholder="주소를 입력해 주세요.">
            </div>
          </div>
        </template>
      </div>
    </section>

    <!-- ============ STEP 3 — 아이디 등록 및 약관 동의 ============ -->
    <section v-else-if="step === 3" class="panel">
      <h2 class="panel-title">아이디 등록 및 약관 동의</h2>
      <div class="panel-rule" />

      <div class="form form-flush">
        <div class="frow">
          <label>아이디</label>
          <div class="fctrl id-row">
            <input
              v-model="email"
              type="email"
              class="input"
              placeholder="이메일 주소를 입력해 주세요."
              autocomplete="email"
              :disabled="idVerified"
            >
            <button type="button" class="btn btn-outline-dark" :disabled="idVerified" @click="sendIdCode">
              인증코드 발송
            </button>
          </div>
        </div>

        <div class="frow">
          <label>인증코드</label>
          <div class="fctrl id-row">
            <div class="code-boxes">
              <input
                v-for="(d, i) in codeDigits"
                :key="i"
                :value="d"
                class="code-box"
                inputmode="numeric"
                maxlength="1"
                :disabled="idVerified"
                @input="onCodeInput(i, $event)"
                @keydown="onCodeKeydown(i, $event)"
              >
            </div>
            <button type="button" class="btn btn-primary" :disabled="idVerified" @click="confirmIdCode">
              {{ idVerified ? '인증 완료' : '확인' }}
            </button>
          </div>
        </div>

        <div class="frow">
          <label>비밀번호</label>
          <div class="fctrl">
            <input
              v-model="password"
              type="password"
              class="input"
              placeholder="최소 8자 이상 특수문자 기호를 포함해 주세요."
              autocomplete="new-password"
            >
          </div>
        </div>

        <div class="frow">
          <label>비밀번호 확인</label>
          <div class="fctrl">
            <input
              v-model="passwordConfirm"
              type="password"
              class="input"
              placeholder="비밀번호를 다시 입력해 주세요."
              autocomplete="new-password"
            >
            <p v-if="passwordConfirm && !pwMatch" class="err">비밀번호가 일치하지 않습니다.</p>
          </div>
        </div>
      </div>

      <div class="terms">
        <label class="checkbox terms-all">
          <input v-model="allAgreed" type="checkbox">
          <span class="terms-all-text">전체 동의</span>
          <span class="terms-all-sub">필수 및 선택 약관에 모두 동의합니다.</span>
        </label>
        <ul class="terms-list">
          <li v-for="t in TERMS" :key="t.key" class="terms-row">
            <label class="checkbox">
              <input v-model="agreed[t.key]" type="checkbox">
            </label>
            <span class="badge" :class="t.badge === '필수' ? 'badge-error' : 'badge-neutral'">{{ t.badge }}</span>
            <span class="terms-name">{{ t.label }}</span>
            <button type="button" class="terms-more" @click="activeTermKey = t.key">
              약관보기
              <UIcon name="i-lucide-chevron-right" class="text-[length:var(--fz-xs)]" />
            </button>
          </li>
        </ul>
      </div>
    </section>

    <!-- ============ STEP 4 — 휴대폰 본인 인증 ============ -->
    <section v-else-if="step === 4" class="panel">
      <h2 class="panel-title">휴대폰 본인 인증</h2>
      <p class="panel-desc">
        본인 명의의 휴대폰 정보를 입력하고 인증을 진행해 주세요. 인증이 완료되면 다음 단계로 진행할 수 있습니다.
      </p>

      <div class="form">
        <div class="frow">
          <label>통신사 <span class="req-star">*</span></label>
          <div class="fctrl">
            <select v-model="carrier" class="select" :disabled="verified">
              <option value="">통신사를 선택하세요</option>
              <option v-for="c in CARRIERS" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>

        <div class="frow">
          <label>이름 <span class="req-star">*</span></label>
          <div class="fctrl">
            <input v-model="authName" class="input" placeholder="실명을 입력하세요" :disabled="verified">
          </div>
        </div>

        <div class="frow">
          <label>주민등록번호 <span class="req-star">*</span></label>
          <div class="fctrl">
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
            <ul class="hint-bullets">
              <li>본인인증을 위해 주민등록번호 앞 6자리와 뒷자리 첫 번째 숫자(성별)만 입력합니다.</li>
            </ul>
          </div>
        </div>

        <div class="frow">
          <label>내/외국인 <span class="req-star">*</span></label>
          <div class="fctrl">
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

        <div class="frow">
          <label>휴대폰 번호 <span class="req-star">*</span></label>
          <div class="fctrl">
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

        <div v-if="codeSent" class="frow">
          <label>인증번호 <span class="req-star">*</span></label>
          <div class="fctrl">
            <div class="phone-row">
              <input
                v-model="authCode"
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

        <div v-if="verified" class="auth-ok">
          <UIcon name="i-lucide-circle-check" /> 본인 인증이 완료되었습니다.
        </div>
      </div>
    </section>

    <!-- ============ STEP 5 — 가입 완료 ============ -->
    <section v-else class="panel done-panel">
      <span class="done-icon"><UIcon name="i-lucide-circle-check" /></span>
      <h2 class="panel-title">회원가입이 완료되었습니다</h2>
      <p class="panel-desc">
        발급된 고객사 ID: <strong>{{ auth.tenant?.id ?? '-' }}</strong><br>
        다음 로그인 시 필요할 수 있으니 기억해 주세요.<br>
        승인 결과는 등록하신 휴대폰·이메일로 안내됩니다.
      </p>
    </section>

    <!-- 네비게이션 -->
    <div class="nav">
      <button
        v-if="step > 1 && step < 5"
        type="button"
        class="btn btn-outline-dark nav-btn"
        @click="goPrev"
      >
        이전
      </button>
      <button
        v-if="step < 5"
        type="button"
        class="btn btn-primary nav-btn"
        :disabled="!canProceed || submitting"
        @click="goNext"
      >
        {{ step === 4 ? (submitting ? '가입 처리 중…' : '가입 완료') : '다음' }}
      </button>
      <button
        v-else
        type="button"
        class="btn btn-primary nav-btn"
        @click="finish"
      >
        대시보드로 이동
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
.signup {
  min-height: 100vh;
  background: var(--paper);
  max-width: 1140px;
  margin: 0 auto;
  padding: 36px 24px 80px;
}

/* 로고 */
.signup-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: var(--fz-xl);
  font-weight: 600;
  color: var(--ink-900);
}
.signup-logo .logo-icon {
  width: 26px;
  height: 26px;
  background: var(--ink-900);
  color: var(--white);
  border-radius: var(--r-md);
  display: grid;
  place-items: center;
}
.signup-logo strong { font-weight: 700; }
.signup-logo .logo-sub { font-weight: 400; color: var(--ink-400); }

/* 타이틀 */
.signup-title {
  text-align: center;
  font-size: var(--fz-4xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 28px 0 24px;
  letter-spacing: -0.01em;
}

/* 5단계 인디케이터 */
.steps {
  display: flex;
  gap: 8px;
  margin: 0 0 40px;
  padding: 0;
  list-style: none;
}
.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 18px;
  border-radius: var(--r-lg);
  background: var(--ink-50);
}
.step-no {
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  font-weight: 500;
  color: var(--ink-400);
  letter-spacing: 0.04em;
}
.step-label {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-400);
  line-height: 1.4;
}
.step.done {
  background: var(--ink-100);
}
.step.done .step-no { color: var(--ink-500); }
.step.done .step-label { color: var(--ink-700); }
.step.active {
  background: var(--ink-900);
}
.step.active .step-no { color: rgba(255, 255, 255, 0.6); }
.step.active .step-label { color: var(--white); }

@media (max-width: 720px) {
  .steps { flex-wrap: wrap; }
  .step { flex: 1 1 calc(50% - 8px); }
}

/* 패널 */
.panel {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 36px 40px;
}

/* Step 1 */
.section-title {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 16px;
}
.flow {
  display: flex;
  align-items: stretch;
  gap: 8px;
}
.flow-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 96px;
  padding: 18px 12px;
  border: 1px solid rgba(0, 220, 130, 0.35);
  border-radius: var(--r-md);
  text-align: center;
}
.flow-tag {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.flow-line {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  line-height: 1.4;
}
.flow-arrow {
  align-self: center;
  color: var(--ink-300);
  font-size: var(--fz-lg);
  flex-shrink: 0;
}

.doc-table {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
.doc-table td { vertical-align: top; }
.doc-table td div + div { margin-top: 4px; }

/* Step 1 — 회원 유형 선택 */
.select-hint {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: -8px 0 16px;
}
.type-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.12s, background 0.12s;
}
.type-card:hover { border-color: var(--ink-300); }
.type-card input { display: none; }
.type-card.selected {
  border-color: var(--ink-900);
  background: var(--ink-50);
}
.type-ico {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: var(--r-full);
  background: var(--ink-50);
  color: var(--ink-500);
  font-size: var(--fz-2xl);
}
.type-card.selected .type-ico {
  background: var(--accent-soft);
  color: var(--accent-ink);
}
.type-name {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
}
.type-desc {
  font-size: var(--fz-xs);
  color: var(--ink-500);
  line-height: 1.6;
}
.type-readonly {
  padding-top: 9px;
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
@media (max-width: 640px) {
  .type-cards { grid-template-columns: 1fr; }
}

/* Step 2~5 패널 공통 */
.panel-title {
  text-align: center;
  font-size: var(--fz-3xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 10px;
}
.panel-desc {
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: 0;
  line-height: 1.7;
}
.panel-desc.strong {
  color: var(--ink-800);
  font-weight: 600;
  margin-top: 2px;
}

/* 폼 (Step 2~4) */
.form {
  max-width: 520px;
  margin: 28px auto 0;
  padding-top: 24px;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.frow {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}
.frow > label {
  width: 110px;
  flex-shrink: 0;
  padding-top: 9px;
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-800);
}
.fctrl {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fctrl .radio-group { min-height: 36px; }
.bizno {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.bizno .input { text-align: center; }
.bizno .dash { color: var(--ink-300); }
.req-star { color: var(--danger); margin-left: 2px; }
.dash { color: var(--ink-300); }

/* 주민등록번호 */
.rrn-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
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

/* 휴대폰 번호 / 인증번호 입력행 */
.phone-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.phone-row .input {
  flex: 1;
  min-width: 0;
}
.phone-row .phone-prefix { flex: 0 0 92px; }
.phone-row .phone-btn { flex: 0 0 auto; height: 36px; }

.hint-bullets {
  margin: 0;
  padding-left: 16px;
  list-style: disc;
}
.hint-bullets li {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.6;
}
.err {
  font-size: var(--fz-xs);
  color: var(--danger-ink);
}
.auth-ok {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding: 10px 12px;
  background: var(--accent-soft);
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--accent-ink);
}

/* Step 3 — 패널 구분선 */
.panel-rule {
  height: 1px;
  background: var(--line);
  margin-top: 18px;
}
.form-flush {
  border-top: 0;
  padding-top: 0;
}

/* 아이디·인증코드 입력행 */
.id-row {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.id-row > .input,
.id-row > .code-boxes {
  flex: 1;
  min-width: 0;
}
.id-row > .btn {
  flex: 0 0 auto;
  height: 36px;
}

/* 인증코드 6칸 */
.code-boxes {
  display: flex;
  gap: 6px;
}
.code-box {
  flex: 1;
  min-width: 0;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--fz-md);
  color: var(--ink-800);
  outline: none;
  transition: border-color 0.12s, background 0.12s;
}
.code-box:focus { background: var(--white); border-color: var(--ink-300); }
.code-box:disabled { background: var(--ink-50); color: var(--ink-300); }

/* Step 3 — 약관 동의 */
.terms {
  max-width: 520px;
  margin: 28px auto 0;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
}
.terms-all {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px 18px;
  background: var(--ink-50);
  border-bottom: 1px solid var(--line);
}
.terms-all-text {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}
.terms-all-sub {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.terms-list {
  margin: 0;
  padding: 6px 0;
  list-style: none;
}
.terms-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 18px;
}
.terms-row:hover { background: var(--paper); }
.terms-name {
  flex: 1;
  min-width: 0;
  font-size: var(--fz-sm);
  color: var(--ink-700);
}
.terms-more {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px 4px 3px 8px;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  background: transparent;
  border: 0;
  border-radius: var(--r-sm);
  transition: color 0.12s, background 0.12s;
}
.terms-more:hover { color: var(--ink-800); background: var(--white); }

/* Step 5 완료 */
.done-panel {
  text-align: center;
  padding: 64px 40px;
}
.done-icon {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  border-radius: var(--r-full);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: var(--fz-4xl);
}

/* 네비게이션 */
.nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 28px;
}
.nav-btn {
  min-width: 160px;
  height: 44px;
  font-size: var(--fz-md);
  font-weight: 600;
}
</style>
