<script setup lang="ts">
export interface ProfileRegisterResult {
  profileId: string
  sendKey: string
  registeredAt: string
  tokenStatus: '완료'
  profileStatus: '정상'
}

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], registered: [ProfileRegisterResult] }>()

const toast = useToast()

/* 카카오 비즈메시지 카테고리 (목업 — 백엔드 연동 시 교체) */
const CATEGORY_TREE: Record<string, Record<string, string[]>> = {
  건강: {
    병원: ['종합병원', '전문병원', '한방병원', '치과', '동물병원'],
    약국: ['일반약국'],
    '의료/건강용품': ['의료기기', '건강식품'],
  },
  교육: {
    학교: ['초·중·고등학교', '대학교'],
    학원: ['입시학원', '외국어학원', '예체능학원', '직업교육'],
    '교육 서비스': ['온라인 강의', '교재·출판'],
  },
  금융: {
    은행: ['은행', '저축은행'],
    보험: ['생명보험', '손해보험'],
    '카드/대출': ['신용카드', '대출중개'],
  },
  음식점: {
    한식: ['일반 한식', '고깃집'],
    '카페/디저트': ['카페', '베이커리'],
    '배달/외식': ['배달전문점', '패밀리레스토랑'],
  },
  '소매(쇼핑몰)': {
    '온라인 쇼핑몰': ['종합몰', '전문몰'],
    '오프라인 매장': ['백화점', '편의점', '대형마트'],
  },
  미용: {
    '헤어/뷰티': ['미용실', '네일샵', '피부관리'],
    '성형/시술': ['성형외과', '피부과'],
  },
}

const MAJOR_CATEGORIES = [
  '건강', '교육', '교통/운송서비스', '금융', '미용', '소매(쇼핑몰)', '엔터테인먼트',
  '여가', '게임', '출산/육아', '음식점', '자동차', '컴퓨터', '산업', '기관/단체',
  '광고', '방송사/출판', '인터넷통신', '일반서비스', '전문서비스', '기타서비스',
]

const profileId = ref('')
const adminPhone = ref('')
const cat1 = ref('')
const cat2 = ref('')
const cat3 = ref('')
const tokenRequested = ref(false)
const tokenCode = ref('')

const middleOptions = computed(() => {
  const sub = CATEGORY_TREE[cat1.value]
  return sub ? Object.keys(sub) : cat1.value ? ['일반'] : []
})
const minorOptions = computed(() => {
  const sub = CATEGORY_TREE[cat1.value]?.[cat2.value]
  return sub ?? (cat2.value ? ['일반'] : [])
})

watch(cat1, () => {
  cat2.value = ''
  cat3.value = ''
})
watch(cat2, () => {
  cat3.value = ''
})

const idValid = computed(() => profileId.value.trim().length >= 1 && profileId.value.length <= 16)
const phoneValid = computed(() => /^[0-9]{10,11}$/.test(adminPhone.value))
const categoryValid = computed(() => !!cat1.value && !!cat2.value && !!cat3.value)
const tokenValid = computed(() => /^[0-9]{6}$/.test(tokenCode.value))
const formReady = computed(() => idValid.value && phoneValid.value && categoryValid.value)
const canSave = computed(() => formReady.value && tokenRequested.value && tokenValid.value)

function reset() {
  profileId.value = ''
  adminPhone.value = ''
  cat1.value = ''
  cat2.value = ''
  cat3.value = ''
  tokenRequested.value = false
  tokenCode.value = ''
}

watch(() => props.open, (v) => {
  if (v) reset()
})

function requestToken() {
  if (!formReady.value) {
    toast.add({ title: '발신 프로필 아이디·관리자 휴대폰 번호·카테고리를 모두 입력해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  tokenRequested.value = true
  tokenCode.value = ''
  toast.add({
    title: '토큰 번호 6자리가 관리자 휴대폰 번호로 전송되었습니다.',
    color: 'info',
    icon: 'i-lucide-message-square',
  })
}

function save() {
  if (!canSave.value) return
  emit('registered', {
    profileId: profileId.value.trim(),
    sendKey: Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    registeredAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    tokenStatus: '완료',
    profileStatus: '정상',
  })
  toast.add({ title: '발신 프로필이 등록되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="발신 프로필 등록" :width="540" @close="emit('close')">
    <ul class="notice">
      <li>발신 프로필 등록 정보 입력 후 토큰 요청 시 입력한 관리자 휴대폰 번호로 토큰 번호 6자리가 전송됩니다.</li>
      <li>토큰 번호를 입력하여 발신 프로필 등록을 완료하세요.</li>
    </ul>

    <div class="reg-form">
      <div class="form-row">
        <label>발신 프로필 아이디 <span class="required">*</span></label>
        <div class="field">
          <div class="input-counter">
            <input v-model="profileId" class="input" maxlength="16" placeholder="@아이디">
            <span class="counter">{{ profileId.length }}/16</span>
          </div>
        </div>
      </div>

      <div class="form-row">
        <label>관리자 휴대폰 번호 <span class="required">*</span></label>
        <div class="field">
          <div class="input-counter">
            <input
              v-model="adminPhone"
              class="input"
              inputmode="numeric"
              maxlength="11"
              placeholder="-없이 숫자 입력"
            >
            <span class="counter">{{ adminPhone.length }}/11</span>
          </div>
        </div>
      </div>

      <div class="form-row">
        <label>카테고리 <span class="required">*</span></label>
        <div class="field">
          <div class="cat-row">
            <select v-model="cat1" class="select">
              <option value="">대분류</option>
              <option v-for="c in MAJOR_CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="cat2" class="select" :disabled="!cat1">
              <option value="">중분류</option>
              <option v-for="c in middleOptions" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="cat3" class="select" :disabled="!cat2">
              <option value="">소분류</option>
              <option v-for="c in minorOptions" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-row">
        <label>토큰</label>
        <div class="field">
          <div v-if="!tokenRequested">
            <button type="button" class="btn btn-accent" @click="requestToken">
              토큰 요청
            </button>
          </div>
          <div v-else>
            <div class="token-row">
              <input
                v-model="tokenCode"
                class="input token-input"
                inputmode="numeric"
                maxlength="6"
                placeholder="토큰 6자리 입력"
              >
              <button type="button" class="btn btn-outline-dark" @click="requestToken">
                토큰 재요청
              </button>
            </div>
            <p class="help">관리자 휴대폰 번호로 발송된 토큰 번호를 입력하세요.</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!canSave" @click="save">
        저장
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.notice {
  margin: 0 0 16px;
  padding: 12px 16px 12px 30px;
  background: var(--ink-50);
  border-radius: var(--r-md);
  list-style: disc;
}
.notice li {
  font-size: var(--fz-xs);
  color: var(--ink-500);
  line-height: 1.7;
}

.reg-form .form-row:first-child { padding-top: 0; }
.reg-form .form-row:last-child { padding-bottom: 0; }

.input-counter {
  position: relative;
  width: 100%;
}
.input-counter .counter {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--fz-xs);
  color: var(--ink-400);
  font-family: var(--font-mono);
  pointer-events: none;
}
.input-counter .input {
  padding-right: 52px;
}

.cat-row {
  display: flex;
  gap: 8px;
}
.cat-row .select {
  flex: 1;
  min-width: 0;
}

.token-row {
  display: flex;
  gap: 8px;
}
.token-input {
  flex: 1;
}
</style>
