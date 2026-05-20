<script setup lang="ts">
interface ContactEditData { name?: string, phone?: string, email?: string }
const props = defineProps<{ open: boolean, edit?: ContactEditData | null }>()
const emit = defineEmits<{ close: [], submit: [] }>()

const isEdit = computed(() => !!props.edit)

const toast = useToast()

const PUSH_TYPES = ['GCM', 'FCM', 'APNS', 'APNS_SANDBOX', 'ADM', 'TENCENT', 'WNS']
const OPTOUT_OPTS = ['수신', '수신 거부']
const MOCK_GROUPS = [
  '트래픽_알림_오발송', '위캔디오_업무_소통방', '마케팅_정기발송', 'VIP_전용_채널',
  '신규가입_환영', '재구매_유도', '이벤트_공지', '휴면고객_리마인드',
]
const MAX_GROUPS = 16

const alias = ref('')
const phone = ref('')
const email = ref('')

/* 토큰 */
interface TokenItem {
  pushType: string
  token: string
  countryCode: string
  langCode: string
  timezone: string
  noticeOptout: string
  adOptout: string
  nightAdOptout: string
  deviceId: string
}
function blankToken(): TokenItem {
  return { pushType: '', token: '', countryCode: '', langCode: '', timezone: '', noticeOptout: '', adOptout: '', nightAdOptout: '', deviceId: '' }
}
const tokens = ref<TokenItem[]>([])
const tokenFormOpen = ref(false)
const tokenDraft = ref<TokenItem>(blankToken())
function openTokenForm() {
  tokenDraft.value = blankToken()
  tokenFormOpen.value = true
}
function saveToken() {
  if (!tokenDraft.value.token.trim()) {
    toast.add({ title: '토큰을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  tokens.value = [...tokens.value, { ...tokenDraft.value }]
  tokenFormOpen.value = false
}
function removeToken(i: number) {
  tokens.value = tokens.value.filter((_, idx) => idx !== i)
}

/* 그룹 멀티 선택 */
const selectedGroups = ref<string[]>([])
const groupOpen = ref(false)
const groupLabel = computed(() =>
  selectedGroups.value.length
    ? `${selectedGroups.value.length}개 그룹 선택됨`
    : '그룹 선택(최대 16개 선택 가능)',
)
function toggleGroup(g: string) {
  if (selectedGroups.value.includes(g)) {
    selectedGroups.value = selectedGroups.value.filter(x => x !== g)
  }
  else if (selectedGroups.value.length >= MAX_GROUPS) {
    toast.add({ title: `그룹은 최대 ${MAX_GROUPS}개까지 선택할 수 있습니다.`, icon: 'i-lucide-circle-alert' })
  }
  else {
    selectedGroups.value = [...selectedGroups.value, g]
  }
}

function onConfirm() {
  if (!alias.value.trim()) {
    toast.add({ title: '수신자 별칭을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('submit')
  toast.add({
    title: isEdit.value ? '주소록 수정' : '주소록 등록',
    description: isEdit.value ? '연락처 정보를 수정했습니다.' : '연락처를 등록했습니다.',
    icon: 'i-lucide-circle-check',
  })
  emit('close')
}

// 열릴 때 폼 초기화 (수정 모드면 기존 값으로 채움)
watch(() => props.open, (v) => {
  if (!v) return
  alias.value = props.edit?.name ?? ''
  phone.value = props.edit?.phone ?? ''
  email.value = props.edit?.email ?? ''
  tokens.value = []
  tokenFormOpen.value = false
  selectedGroups.value = []
  groupOpen.value = false
})
</script>

<template>
  <AppModal :open="open" :title="isEdit ? '주소록 수정' : '주소록 등록'" :width="560" @close="emit('close')">
    <p class="cf-sub">
      {{ isEdit ? '연락처 정보를 수정합니다.' : '연락처를 사전 등록하여 관리할 수 있습니다.' }}
    </p>
    <div class="cf-divider" />

    <div class="cf-row">
      <label class="cf-label">수신자 별칭 <span class="cf-req">*</span></label>
      <div class="cf-input-wrap">
        <input v-model="alias" class="input" maxlength="64" placeholder="수신자 별칭">
        <span class="cf-count">{{ alias.length }}/64</span>
      </div>
    </div>
    <div class="cf-row">
      <label class="cf-label">휴대폰 번호</label>
      <input v-model="phone" class="input" placeholder="-없이 숫자 입력" inputmode="numeric">
    </div>
    <div class="cf-row">
      <label class="cf-label">이메일</label>
      <input v-model="email" class="input" placeholder="이메일">
    </div>

    <div class="cf-row cf-row--top">
      <label class="cf-label">
        토큰
        <UIcon name="i-lucide-circle-help" class="cf-help-icon" />
      </label>
      <div class="cf-field">
        <div v-if="tokens.length" class="cf-chips">
          <span v-for="(t, i) in tokens" :key="i" class="cf-chip">
            {{ t.pushType || '토큰' }} · {{ t.token.slice(0, 14) || '—' }}
            <button type="button" class="cf-chip-x" aria-label="삭제" @click="removeToken(i)">
              <UIcon name="i-lucide-x" />
            </button>
          </span>
        </div>
        <button v-if="!tokenFormOpen" type="button" class="btn btn-primary btn-sm" @click="openTokenForm">
          <UIcon name="i-lucide-plus" /> 추가
        </button>
        <div v-else class="cf-token-form">
          <div class="cf-trow">
            <label class="cf-tlabel">푸시 유형</label>
            <select v-model="tokenDraft.pushType" class="select">
              <option value="">
                푸시 유형 선택
              </option>
              <option v-for="p in PUSH_TYPES" :key="p" :value="p">
                {{ p }}
              </option>
            </select>
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">토큰</label>
            <input v-model="tokenDraft.token" class="input" placeholder="토큰">
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">국가 코드</label>
            <input v-model="tokenDraft.countryCode" class="input" placeholder="iso 3166-1 alpha-2, iso 3166-1 alpha-3(e.g. KR)">
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">언어 코드</label>
            <input v-model="tokenDraft.langCode" class="input" placeholder="iso 639-1, iso639-2(e.g. ko)">
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">표준 시간대</label>
            <input v-model="tokenDraft.timezone" class="input" placeholder="Area/Name(예: Asia/Seoul)">
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">알림 수신 거부</label>
            <select v-model="tokenDraft.noticeOptout" class="select">
              <option value="">
                알림 수신 거부 선택
              </option>
              <option v-for="o in OPTOUT_OPTS" :key="o" :value="o">
                {{ o }}
              </option>
            </select>
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">광고 수신 거부</label>
            <select v-model="tokenDraft.adOptout" class="select">
              <option value="">
                광고 수신 거부 선택
              </option>
              <option v-for="o in OPTOUT_OPTS" :key="o" :value="o">
                {{ o }}
              </option>
            </select>
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">야간 광고 수신 거부</label>
            <select v-model="tokenDraft.nightAdOptout" class="select">
              <option value="">
                야간 광고 수신 거부 선택
              </option>
              <option v-for="o in OPTOUT_OPTS" :key="o" :value="o">
                {{ o }}
              </option>
            </select>
          </div>
          <div class="cf-trow">
            <label class="cf-tlabel">디바이스 아이디</label>
            <input v-model="tokenDraft.deviceId" class="input" placeholder="디바이스 아이디">
          </div>
          <div class="cf-token-actions">
            <button type="button" class="btn btn-primary btn-sm" @click="saveToken">
              저장
            </button>
            <button type="button" class="btn btn-neutral btn-sm" @click="tokenFormOpen = false">
              취소
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="cf-row cf-row--top">
      <label class="cf-label">그룹</label>
      <div class="cf-field">
        <button
          type="button"
          class="cf-group-trigger"
          :class="{ on: groupOpen }"
          @click="groupOpen = !groupOpen"
        >
          <span :class="{ 'cf-placeholder': !selectedGroups.length }">{{ groupLabel }}</span>
          <UIcon :name="groupOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="text-[length:var(--fz-md)]" />
        </button>
        <div v-if="groupOpen" class="cf-group-list">
          <label v-for="g in MOCK_GROUPS" :key="g" class="checkbox cf-group-option">
            <input type="checkbox" :checked="selectedGroups.includes(g)" @change="toggleGroup(g)">
            <span>{{ g }}</span>
          </label>
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onConfirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.cf-sub {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 14px;
}
.cf-divider {
  height: 1px;
  background: var(--line);
  margin: 0 0 18px;
}

.cf-row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}
.cf-row--top {
  align-items: start;
}
.cf-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
  display: flex;
  align-items: center;
  gap: 3px;
}
.cf-req {
  color: var(--danger);
}
.cf-help-icon {
  font-size: var(--fz-sm);
  color: var(--ink-400);
}
.cf-field {
  min-width: 0;
}
.cf-input-wrap {
  position: relative;
}
.cf-input-wrap .input {
  width: 100%;
  padding-right: 48px;
}
.cf-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.cf-row .input,
.cf-row .select {
  width: 100%;
}

/* 토큰 칩 */
.cf-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.cf-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 6px 0 10px;
  background: var(--ink-50);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  font-size: var(--fz-xs);
  color: var(--ink-700);
}
.cf-chip-x {
  display: inline-flex;
  background: none;
  border: 0;
  color: var(--ink-400);
  cursor: pointer;
}
.cf-chip-x:hover {
  color: var(--ink-700);
}

/* 토큰 입력 패널 */
.cf-token-form {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  padding: 14px;
}
.cf-trow {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}
.cf-tlabel {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  text-align: right;
}
.cf-trow .input,
.cf-trow .select {
  width: 100%;
}
.cf-token-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

/* 그룹 선택 */
.cf-group-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  font-size: var(--fz-md);
  color: var(--ink-700);
  cursor: pointer;
}
.cf-group-trigger.on {
  background: var(--white);
  border-color: var(--ink-300);
}
.cf-placeholder {
  color: var(--ink-400);
}
.cf-group-list {
  margin-top: 6px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 6px;
  max-height: 200px;
  overflow-y: auto;
}
.cf-group-option {
  display: flex;
  width: 100%;
  padding: 7px 8px;
  border-radius: var(--r-sm);
}
.cf-group-option:hover {
  background: var(--ink-50);
}
</style>
