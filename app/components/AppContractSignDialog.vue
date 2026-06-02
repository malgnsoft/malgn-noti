<script setup lang="ts">
const api = useApi()
const auth = useAuthStore()

interface Article {
  no: string
  title: string
  body: string[]
}
interface Chapter {
  heading: string
  articles: Article[]
}

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
}>(), { title: '표준 이용계약서' })

const emit = defineEmits<{ close: [], completed: [] }>()
const toast = useToast()

/* 스텝 메타 */
const STEPS = [
  { n: 1, label: '제1장 · 총칙 및 서류' },
  { n: 2, label: '제2장 · 이용요금 및 결제' },
  { n: 3, label: '제3장 · 전자서명 / 공인인증' },
]

/* 계약 본문 (목업 — 백엔드 연동 시 교체) */
const CHAPTERS: Chapter[] = [
  {
    heading: '제1장 총칙 · 제1조 ~ 제8조',
    articles: [
      { no: '제1조', title: '목적', body: ['본 계약은 (주)맑은소프트(이하 "회사")가 제공하는 메시징 서비스 "맑은 메시징"(이하 "서비스")의 이용과 관련하여, 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.'] },
      { no: '제2조', title: '용어의 정의', body: [
        '① "이용자"라 함은 본 계약에 따라 회사와 서비스 이용 계약을 체결한 법인 또는 개인 사업자를 말합니다.',
        '② "서비스"라 함은 회사가 제공하는 SMS, LMS, 알림톡, 친구톡, RCS, 푸시, 이메일 등 일체의 메시징 발송 서비스를 의미합니다.',
        '③ "발송 데이터"라 함은 이용자가 서비스 이용 과정에서 회사 시스템에 전송·등록한 모든 정보를 의미합니다.',
      ] },
      { no: '제3조', title: '계약의 성립', body: [
        '① 본 계약은 이용자가 회사가 정한 절차에 따라 신청서를 제출하고, 회사가 이를 승낙하여 본 계약서에 전자서명함으로써 성립합니다.',
        '② 회사는 다음 각 호의 사유가 있는 경우 신청을 승낙하지 아니하거나 사후에 이용 계약을 해지할 수 있습니다.',
        '  1. 신청 내용에 허위, 기재 누락, 오기가 있는 경우',
        '  2. 사회 질서 또는 미풍양속에 반하거나, 법령을 위반할 우려가 있다고 판단되는 경우',
        '  3. 기타 회사가 정한 신청 요건을 충족하지 못하는 경우',
      ] },
      { no: '제4조', title: '서비스의 제공', body: [
        '① 회사는 이용자가 신청한 서비스 종류에 따라 메시징 발송, 발송 결과 리포트, 수신자 관리 등의 기능을 제공합니다.',
        '② 서비스는 연중무휴 24시간 제공함을 원칙으로 하며, 정기점검, 시스템 장애, 통신사 사정 등 불가피한 사유가 있는 경우 일시 중단될 수 있습니다.',
      ] },
      { no: '제5조', title: '이용자의 의무', body: [
        '① 이용자는 관계 법령(정보통신망법, 개인정보보호법 등) 및 본 계약에서 정한 사항을 준수하여야 합니다.',
        '② 이용자는 회사 시스템에 발송 데이터를 전송할 때, 수신자의 사전 동의를 적법하게 확보하여야 하며, 광고성 정보 전송 시 정보통신망법에서 정한 표시 의무를 준수하여야 합니다.',
        '③ 이용자가 본 조의 의무를 위반하여 회사에 손해가 발생한 경우, 그 손해를 배상할 책임이 있습니다.',
      ] },
      { no: '제6조', title: '회사의 의무', body: ['회사는 안정적인 서비스 제공을 위하여 보안 시스템 구축, 서비스 품질 모니터링, 이용자 문의 대응 체계를 운영하며, 이용자의 정보를 관계 법령에 따라 보호합니다.'] },
      { no: '제7조', title: '개인정보의 보호', body: ['회사는 관련 법령에 따라 이용자 및 수신자의 개인정보 보호에 최선을 다하며, 자세한 사항은 회사가 별도로 게시하는 개인정보처리방침에 따릅니다.'] },
      { no: '제8조', title: '지적재산권', body: ['서비스에 포함된 모든 콘텐츠, 소프트웨어, 디자인 등 지적재산권은 회사 또는 정당한 권리자에게 귀속되며, 이용자는 회사의 사전 서면 동의 없이 이를 복제, 배포, 변경, 2차 가공할 수 없습니다.'] },
    ],
  },
  {
    heading: '제2장 이용요금 및 결제 · 제9조 ~ 제16조',
    articles: [
      { no: '제9조', title: '이용요금의 산정', body: [
        '① 이용요금은 이용자가 신청한 요금제(Free, Basic, Growth, Advanced, Enterprise)에 따라 정액 구독료와 메시지 발송 단가를 합산하여 산정합니다.',
        '② 회사는 시장 상황 및 통신사 정책 변경에 따라 단가를 조정할 수 있으며, 변경 시 30일 전 이용자에게 사전 고지합니다.',
      ] },
      { no: '제10조', title: '결제 수단 및 결제일', body: [
        '① 정기 구독료는 신용카드 자동결제를 원칙으로 합니다.',
        '② 발송 단가에 따른 사용료는 후불 결제 또는 충전금에서 차감되는 방식으로 정산되며, 매월 1일 기준 전월 사용분이 정산됩니다.',
      ] },
      { no: '제11조', title: '결제 실패 및 미납', body: ['결제 실패 시 회사는 3일간 1일 2회씩 자동 재시도(총 6회)를 진행하며, 그 이후에도 결제가 이루어지지 않는 경우 27일간의 결제유예 기간을 부여합니다. 유예기간 종료 시까지 결제가 완료되지 않으면 해당 상품은 자동 해지됩니다.'] },
      { no: '제12조', title: '해지 및 환불', body: [
        '① 이용자는 언제든지 서비스 해지를 신청할 수 있으며, 해지 방식은 (1) 잔여기간 종료 후 해지 (2) 즉시 취소 및 환불 중 선택할 수 있습니다.',
        '② 환불은 결제일로부터 7일 이내·미사용인 경우 전액 환불하며, 그 외에는 잔여기간을 일할 계산한 금액의 70%(위약금 30% 차감)를 환불합니다.',
      ] },
      { no: '제13조', title: '요금제 변경', body: ['요금제 상위 변경은 즉시 적용되며, 미사용 기간을 일할 계산하여 차액을 차감합니다. 결제 주기 변경(월→연)은 즉시, 결제 주기 변경(연→월)은 현재 구독기간 종료 후 적용됩니다.'] },
      { no: '제14조', title: '영수증', body: ['신용카드 결제분은 신용카드 매출전표로 영수증을 갈음하며, 별도의 세금계산서를 발행하지 않습니다.'] },
      { no: '제15조', title: '책임의 제한', body: ['회사는 통신사 장애, 천재지변, 정전, 전쟁 등 불가항력적 사유로 발생한 서비스 중단에 대하여 책임을 지지 않습니다.'] },
      { no: '제16조', title: '분쟁의 해결', body: ['본 계약과 관련하여 발생한 분쟁에 대하여는 대한민국 법령을 적용하며, 관할 법원은 회사 본점 소재지를 관할하는 법원으로 합니다.'] },
    ],
  },
]

/* 상태 */
const step = ref(1)
const done = ref(false)
const reached = reactive<Record<number, boolean>>({ 1: false, 2: false })
const signTab = ref<'sign' | 'cert'>('sign')
const signerName = ref(auth.user?.name ?? '')
const certLoaded = ref(false)

const progress = computed(() => [0, 33, 67][step.value - 1] ?? 0)
const canConfirm = computed(() => reached[step.value] === true)
const hasInk = ref(false)

/* ─── 휴대폰 본인인증 ───
 * STEP 3 진입 시 본인인증 카드 노출. 인증 통과 전엔 서명·인증서 영역 비활성화.
 * 사용자가 회원가입 시 NICE로 확인한 본인 휴대폰으로 SMS OTP를 발송 → 6자리 코드 확인. */
const userPhone = computed(() => (auth.user?.phone ?? '').replace(/\D/g, ''))
const userPhoneMasked = computed(() => {
  const p = userPhone.value
  if (p.length < 8) return ''
  // 010-****-1234 형태
  return `${p.slice(0, 3)}-****-${p.slice(-4)}`
})
const phoneVerified = ref(false)
const phoneCodeSent = ref(false)
const phoneCode = ref('')
const sendingPhone = ref(false)
const verifyingPhone = ref(false)
const phoneMockCode = ref('')

async function sendPhoneCode() {
  if (!userPhone.value) {
    toast.add({ title: '등록된 휴대폰 번호가 없습니다. 회원 정보를 확인해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  sendingPhone.value = true
  try {
    const res = await api<{ data: { mockCode?: string } }>('/auth/phone-code/send', {
      method: 'POST',
      body: { phone: userPhone.value, purpose: 'contract_sign' },
    })
    phoneCodeSent.value = true
    phoneMockCode.value = res.data?.mockCode ?? ''
    toast.add({
      title: phoneMockCode.value
        ? `[테스트] 인증번호: ${phoneMockCode.value}`
        : '인증번호를 발송했습니다. 10분 안에 입력해 주세요.',
      color: 'success',
      icon: 'i-lucide-message-square',
      duration: phoneMockCode.value ? 8000 : 4000,
    })
  }
  catch (e) {
    const msg = (e as { data?: { message?: string } }).data?.message ?? '인증번호 발송에 실패했습니다.'
    toast.add({ title: msg, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    sendingPhone.value = false
  }
}

async function verifyPhoneCode() {
  if (!/^\d{6}$/.test(phoneCode.value)) {
    toast.add({ title: '6자리 인증번호를 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  verifyingPhone.value = true
  try {
    await api('/auth/phone-code/verify', {
      method: 'POST',
      body: { phone: userPhone.value, purpose: 'contract_sign', code: phoneCode.value },
    })
    phoneVerified.value = true
    toast.add({ title: '본인 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
    // 인증 완료 직후 서명 캔버스 활성화 — 다음 틱에 셋업
    if (signTab.value === 'sign') setupCanvas()
  }
  catch (e) {
    const msg = (e as { data?: { message?: string } }).data?.message ?? '인증번호가 올바르지 않습니다.'
    toast.add({ title: msg, color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    verifyingPhone.value = false
  }
}

const canComplete = computed(() =>
  phoneVerified.value
  && signerName.value.trim() !== ''
  && (signTab.value === 'sign' ? hasInk.value : certLoaded.value),
)

const docRef = ref<HTMLElement>()
function onScroll() {
  const el = docRef.value
  if (!el) return
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 8) reached[step.value] = true
}
function checkFits() {
  nextTick(() => {
    const el = docRef.value
    if (el && el.scrollHeight - el.clientHeight < 8) reached[step.value] = true
  })
}

/* 서명 캔버스 */
const canvasRef = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null
let drawing = false

function setupCanvas() {
  nextTick(() => {
    const cv = canvasRef.value
    if (!cv) return
    cv.width = cv.offsetWidth
    cv.height = cv.offsetHeight
    ctx = cv.getContext('2d')
    if (ctx) {
      ctx.lineWidth = 2.4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#1a1a1a'
    }
  })
}
function ptOf(e: PointerEvent) {
  const cv = canvasRef.value!
  const r = cv.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}
function startDraw(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  const p = ptOf(e)
  ctx.beginPath()
  ctx.moveTo(p.x, p.y)
  canvasRef.value?.setPointerCapture(e.pointerId)
}
function moveDraw(e: PointerEvent) {
  if (!drawing || !ctx) return
  const p = ptOf(e)
  ctx.lineTo(p.x, p.y)
  ctx.stroke()
  hasInk.value = true
}
function endDraw() { drawing = false }
function clearSign() {
  const cv = canvasRef.value
  if (cv && ctx) ctx.clearRect(0, 0, cv.width, cv.height)
  hasInk.value = false
}

/* 스텝 이동 */
function next() {
  if (step.value < 3 && canConfirm.value) {
    step.value += 1
    // STEP 3 진입 시점에는 캔버스 셋업 보류 — 본인인증 통과 후 verifyPhoneCode 안에서 셋업.
    if (step.value !== 3) { docRef.value?.scrollTo({ top: 0 }); checkFits() }
  }
}
function prev() {
  if (step.value > 1) {
    step.value -= 1
    if (step.value < 3) checkFits()
  }
}
function finish() {
  if (!phoneVerified.value) {
    toast.add({ title: '본인 인증을 먼저 완료해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  if (!canComplete.value) {
    toast.add({ title: '서명자명과 서명을 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  done.value = true
}
function confirmDone() {
  emit('completed')
  emit('close')
}

watch(signTab, (t) => {
  if (t === 'sign' && phoneVerified.value) setupCanvas()
})

/* 초기화 + 스크롤 잠금 */
let locked = false
function lock() {
  if (locked || !import.meta.client) return
  lockScroll()
  locked = true
}
function unlock() {
  if (!locked || !import.meta.client) return
  unlockScroll()
  locked = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
function reset() {
  step.value = 1
  done.value = false
  reached[1] = false
  reached[2] = false
  signTab.value = 'sign'
  signerName.value = auth.user?.name ?? ''
  certLoaded.value = false
  hasInk.value = false
  phoneVerified.value = false
  phoneCodeSent.value = false
  phoneCode.value = ''
  phoneMockCode.value = ''
}
watch(() => props.open, (v) => {
  if (!import.meta.client) return
  if (v) {
    reset()
    lock()
    window.addEventListener('keydown', onKey)
    checkFits()
  }
  else {
    unlock()
    window.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  unlock()
  if (import.meta.client) window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop">
      <div class="cd-modal" @click.stop>
        <!-- ===== 위저드 ===== -->
        <template v-if="!done">
          <!-- 헤더 -->
          <header class="cd-head">
            <div class="cd-head-main">
              <span class="cd-badge">전자 계약체결</span>
              <h2>{{ title }}</h2>
              <p>아래 단계별 계약 내용을 끝까지 확인하신 후 '확인하였음' 버튼을 눌러 다음 단계로 이동해 주세요.</p>
            </div>
            <button type="button" class="cd-x" aria-label="닫기" @click="emit('close')">
              <UIcon name="i-lucide-x" />
            </button>
          </header>

          <!-- 스텝 인디케이터 -->
          <div class="cd-stepper">
            <template v-for="(s, i) in STEPS" :key="s.n">
              <div class="cd-step" :class="{ done: step > s.n, active: step === s.n }">
                <span class="cd-step-no">
                  <UIcon v-if="step > s.n" name="i-lucide-check" />
                  <template v-else>{{ s.n }}</template>
                </span>
                <span class="cd-step-text">
                  <b>STEP {{ s.n }}</b>
                  <span>{{ s.label }}</span>
                </span>
              </div>
              <span v-if="i < STEPS.length - 1" class="cd-step-bar" :class="{ done: step > s.n }" />
            </template>
          </div>

          <!-- 본문 -->
          <div class="cd-body">
            <!-- 약관 열람 (STEP 1·2) -->
            <article
              v-if="step < 3"
              ref="docRef"
              class="cd-doc"
              @scroll="onScroll"
            >
              <h3 class="cd-doc-title">맑은소프트 맑은 메시징 표준 이용계약서</h3>
              <p class="cd-doc-sub">{{ CHAPTERS[step - 1]!.heading }}</p>
              <div class="cd-rule" />

              <section v-for="a in CHAPTERS[step - 1]!.articles" :key="a.no" class="cd-article">
                <h4>{{ a.no }} ({{ a.title }})</h4>
                <p
                  v-for="(line, i) in a.body"
                  :key="i"
                  :class="{ 'cd-sub': line.startsWith('  ') }"
                >{{ line.trim() }}</p>
              </section>

              <p class="cd-doc-end">— {{ step === 1 ? '제1장' : '제2장' }} 끝 —</p>
            </article>

            <!-- 전자서명 (STEP 3) -->
            <div v-else class="cd-sign">
              <!-- 본인인증 카드 — 통과 전엔 항상 노출 / 통과 후엔 간략 배지만 -->
              <div class="cd-verify" :class="{ done: phoneVerified }">
                <div v-if="!phoneVerified" class="cd-verify-head">
                  <UIcon name="i-lucide-shield-alert" class="cd-verify-icon" />
                  <div>
                    <strong>먼저 본인 인증을 완료해 주세요</strong>
                    <p>가입 시 등록한 휴대폰으로 인증번호를 발송합니다.</p>
                  </div>
                </div>
                <div v-else class="cd-verify-head done">
                  <UIcon name="i-lucide-circle-check" class="cd-verify-icon" />
                  <div>
                    <strong>본인 인증이 완료되었습니다</strong>
                    <p>아래에서 전자서명을 진행해 주세요.</p>
                  </div>
                </div>

                <div v-if="!phoneVerified" class="cd-verify-body">
                  <div class="cd-verify-row">
                    <label>휴대폰</label>
                    <span class="cd-verify-phone">{{ userPhoneMasked || '— 등록 정보 없음 —' }}</span>
                    <button
                      type="button"
                      class="btn btn-outline-dark btn-sm"
                      :disabled="sendingPhone || !userPhone"
                      @click="sendPhoneCode"
                    >
                      <UIcon name="i-lucide-message-square" class="text-[length:var(--fz-sm)]" />
                      {{ sendingPhone ? '발송 중…' : phoneCodeSent ? '재발송' : '인증번호 받기' }}
                    </button>
                  </div>
                  <div v-if="phoneCodeSent" class="cd-verify-row">
                    <label>인증번호</label>
                    <input
                      v-model="phoneCode"
                      class="input cd-code-input"
                      inputmode="numeric"
                      maxlength="6"
                      placeholder="6자리 숫자"
                      @keyup.enter="verifyPhoneCode"
                    >
                    <button
                      type="button"
                      class="btn btn-primary btn-sm"
                      :disabled="verifyingPhone || phoneCode.length !== 6"
                      @click="verifyPhoneCode"
                    >
                      {{ verifyingPhone ? '확인 중…' : '확인' }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="cd-tabs" :class="{ locked: !phoneVerified }">
                <button
                  type="button"
                  :class="{ on: signTab === 'sign' }"
                  :disabled="!phoneVerified"
                  @click="signTab = 'sign'"
                >
                  <UIcon name="i-lucide-pen-line" /> 전자 서명
                </button>
                <button
                  type="button"
                  :class="{ on: signTab === 'cert' }"
                  :disabled="!phoneVerified"
                  @click="signTab = 'cert'"
                >
                  <UIcon name="i-lucide-shield-check" /> 공인인증서
                </button>
              </div>

              <table v-if="phoneVerified" class="cd-info-table">
                <tbody>
                  <tr>
                    <th>계약 명</th>
                    <td>맑은소프트 맑은 메시징 이용계약서</td>
                  </tr>
                  <tr>
                    <th>사업자명</th>
                    <td>{{ auth.tenant?.name || '—' }} <span v-if="auth.tenant?.bizNo">({{ auth.tenant.bizNo }})</span></td>
                  </tr>
                  <tr>
                    <th>대표자</th>
                    <td>{{ auth.tenant?.ceoName || '—' }}</td>
                  </tr>
                  <tr>
                    <th>서명자명 <span class="rq">*</span></th>
                    <td>
                      <input v-model="signerName" class="input cd-signer" placeholder="서명자명을 입력해 주세요">
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- 전자 서명 -->
              <div v-if="phoneVerified && signTab === 'sign'" class="cd-sign-area">
                <div class="cd-sign-head">
                  <span>아래 영역에 마우스 또는 손가락으로 서명해 주세요.</span>
                  <button type="button" class="btn btn-outline-dark btn-sm" @click="clearSign">
                    <UIcon name="i-lucide-rotate-ccw" class="text-[length:var(--fz-sm)]" /> 다시 서명
                  </button>
                </div>
                <div class="cd-pad">
                  <span v-if="!hasInk" class="cd-pad-ph">Sign here</span>
                  <canvas
                    ref="canvasRef"
                    class="cd-canvas"
                    @pointerdown="startDraw"
                    @pointermove="moveDraw"
                    @pointerup="endDraw"
                    @pointerleave="endDraw"
                  />
                </div>
                <p class="cd-sign-note">
                  <UIcon name="i-lucide-info" /> 서명은 전자서명법에 따라 본인의 의사 표시로 간주됩니다.
                </p>
              </div>

              <!-- 공인인증서 -->
              <div v-else-if="phoneVerified" class="cd-cert-area">
                <div class="cd-cert-box">
                  <UIcon name="i-lucide-shield-check" class="cd-cert-icon" />
                  <p class="cd-cert-title">공인인증서로 서명</p>
                  <p class="cd-cert-desc">등록된 공인인증서(범용/은행)로 본인 인증 후 계약서에 서명합니다.</p>
                  <button
                    type="button"
                    class="btn btn-outline-dark btn-sm"
                    :class="{ 'btn-primary': certLoaded }"
                    @click="certLoaded = true"
                  >
                    <UIcon :name="certLoaded ? 'i-lucide-check' : 'i-lucide-folder-open'" class="text-[length:var(--fz-sm)]" />
                    {{ certLoaded ? '공인인증서 선택 완료' : '공인인증서 불러오기' }}
                  </button>
                </div>
                <p class="cd-sign-note">
                  <UIcon name="i-lucide-info" /> 공인인증서 서명은 전자서명법에 따라 본인의 의사 표시로 간주됩니다.
                </p>
              </div>
            </div>
          </div>

          <!-- 푸터 -->
          <footer class="cd-foot">
            <button type="button" class="btn btn-outline-dark" :disabled="step === 1" @click="prev">
              <UIcon name="i-lucide-arrow-left" class="text-[length:var(--fz-sm)]" /> 이전 단계
            </button>
            <div class="cd-progress">
              <div class="cd-progress-track">
                <div class="cd-progress-fill" :style="{ width: `${progress}%` }" />
              </div>
              <span class="cd-progress-pct">{{ progress }}%</span>
            </div>
            <button
              v-if="step < 3"
              type="button"
              class="btn btn-primary cd-next"
              :disabled="!canConfirm"
              @click="next"
            >
              <UIcon name="i-lucide-check" class="text-[length:var(--fz-sm)]" />
              확인하였음<span v-if="!canConfirm" class="cd-next-hint"> (끝까지 스크롤)</span>
            </button>
            <button
              v-else
              type="button"
              class="btn btn-primary cd-next"
              :disabled="!canComplete"
              @click="finish"
            >
              <UIcon name="i-lucide-shield-check" class="text-[length:var(--fz-sm)]" /> 서명 완료
            </button>
          </footer>
        </template>

        <!-- ===== 완료 ===== -->
        <div v-else class="cd-success">
          <span class="cd-success-icon">
            <UIcon name="i-lucide-shield-check" />
          </span>
          <h3>전자서명이 완료되었습니다.</h3>
          <p>이용계약서 체결이 완료되었습니다.</p>
          <button type="button" class="btn btn-primary btn-lg cd-success-btn" @click="confirmDone">
            확인
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cd-modal {
  width: 760px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--r-lg);
  overflow: hidden;
}

/* 헤더 */
.cd-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 22px 16px;
  background: var(--info-soft);
  border-bottom: 1px solid var(--info-line);
  flex-shrink: 0;
}
.cd-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: var(--r-sm);
  background: var(--info);
  color: var(--white);
  font-size: var(--fz-2xs);
  font-weight: 700;
}
.cd-head-main h2 {
  font-size: var(--fz-xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 6px 0 4px;
}
.cd-head-main p {
  font-size: var(--fz-xs);
  color: var(--ink-500);
  margin: 0;
}
.cd-x {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-400);
  font-size: var(--fz-lg);
  flex-shrink: 0;
}
.cd-x:hover { background: rgba(0, 0, 0, 0.06); color: var(--ink-900); }

/* 스텝 인디케이터 */
.cd-stepper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.cd-step {
  display: flex;
  align-items: center;
  gap: 9px;
}
.cd-step-no {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ink-100);
  color: var(--ink-400);
  font-size: var(--fz-sm);
  font-weight: 700;
  flex-shrink: 0;
}
.cd-step.active .cd-step-no { background: var(--info); color: var(--white); }
.cd-step.done .cd-step-no { background: var(--accent); color: var(--white); }
.cd-step-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.cd-step-text b {
  font-size: var(--fz-2xs);
  font-weight: 700;
  color: var(--ink-400);
  letter-spacing: 0.04em;
}
.cd-step.active .cd-step-text b { color: var(--info); }
.cd-step-text span {
  font-size: var(--fz-xs);
  color: var(--ink-500);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}
.cd-step.active .cd-step-text span { color: var(--ink-900); font-weight: 600; }
.cd-step-bar {
  flex: 1;
  height: 2px;
  background: var(--ink-100);
  border-radius: 1px;
}
.cd-step-bar.done { background: var(--accent); }

/* 본문 */
.cd-body {
  flex: 1;
  min-height: 0;
  height: 440px;
  padding: 20px 24px;
  background: var(--paper, var(--ink-50));
  display: flex;
}

/* 약관 카드 */
.cd-doc {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 26px 30px;
}
.cd-doc-title {
  text-align: center;
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 5px;
}
.cd-doc-sub {
  text-align: center;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0;
}
.cd-rule {
  height: 1px;
  background: var(--line);
  margin: 18px 0;
}
.cd-article + .cd-article { margin-top: 16px; }
.cd-article h4 {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 6px;
}
.cd-article p {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
  margin: 0 0 3px;
}
.cd-article p.cd-sub {
  padding-left: 14px;
  color: var(--ink-500);
}
.cd-doc-end {
  text-align: center;
  font-size: var(--fz-xs);
  color: var(--ink-300);
  margin: 24px 0 4px;
}

/* 전자서명 (STEP 3) */
.cd-sign {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
/* 본인인증 카드 */
.cd-verify {
  border: 1px solid var(--info-line);
  background: var(--info-soft);
  border-radius: var(--r-md);
  padding: 16px 18px;
  margin-bottom: 18px;
}
.cd-verify.done {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.cd-verify-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.cd-verify-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--info-ink);
}
.cd-verify-head.done .cd-verify-icon { color: var(--success-ink); }
.cd-verify-head strong {
  display: block;
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 2px;
}
.cd-verify-head p {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  margin: 0;
}
.cd-verify-body {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.cd-verify-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cd-verify-row label {
  width: 80px;
  flex-shrink: 0;
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.cd-verify-phone {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--ink-800);
}
.cd-code-input {
  flex: 1;
  font-family: var(--font-mono);
  letter-spacing: 4px;
  text-align: center;
}

.cd-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.cd-tabs.locked button {
  opacity: 0.45;
  cursor: not-allowed;
}
.cd-tabs button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-500);
  transition: all 0.12s;
}
.cd-tabs button.on {
  border-color: var(--ink-900);
  background: var(--ink-900);
  color: var(--white);
}

.cd-info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
  margin-bottom: 18px;
}
.cd-info-table th,
.cd-info-table td {
  padding: 11px 14px;
  font-size: var(--fz-sm);
  text-align: left;
  border-bottom: 1px solid var(--line);
}
.cd-info-table tr:last-child th,
.cd-info-table tr:last-child td { border-bottom: 0; }
.cd-info-table th {
  width: 130px;
  background: var(--ink-50);
  font-weight: 600;
  color: var(--ink-600);
}
.cd-info-table td { color: var(--ink-800); }
.rq { color: var(--danger); margin-left: 2px; }
.cd-signer { width: 260px; max-width: 100%; }

/* 서명 패드 */
.cd-sign-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}
.cd-sign-head span {
  font-size: var(--fz-sm);
  color: var(--ink-600);
}
.cd-pad {
  position: relative;
  height: 180px;
  border: 1px dashed var(--ink-300);
  border-radius: var(--r-md);
  background: var(--white);
  overflow: hidden;
}
.cd-pad-ph {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-serif, serif);
  font-size: var(--fz-2xl);
  font-style: italic;
  color: var(--ink-200);
  pointer-events: none;
}
.cd-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: crosshair;
}
.cd-sign-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0 0;
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

/* 공인인증서 */
.cd-cert-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 34px 20px;
  border: 1px dashed var(--ink-300);
  border-radius: var(--r-md);
  background: var(--white);
  text-align: center;
}
.cd-cert-icon {
  font-size: var(--fz-3xl);
  color: var(--info);
  margin-bottom: 4px;
}
.cd-cert-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.cd-cert-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: 0 0 10px;
}

/* 푸터 */
.cd-foot {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 22px;
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
.cd-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.cd-progress-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--ink-100);
  overflow: hidden;
}
.cd-progress-fill {
  height: 100%;
  border-radius: 3px;
  background: var(--accent);
  transition: width 0.25s ease;
}
.cd-progress-pct {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-500);
  min-width: 34px;
  text-align: right;
}
.cd-next { flex-shrink: 0; }
.cd-next-hint { font-weight: 400; opacity: 0.85; }

/* 완료 */
.cd-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 52px 32px 40px;
}
.cd-success-icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: var(--fz-3xl);
  margin-bottom: 18px;
}
.cd-success h3 {
  font-size: var(--fz-xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 6px;
}
.cd-success p {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: 0 0 24px;
}
.cd-success-btn {
  min-width: 200px;
  font-weight: 600;
}
</style>
