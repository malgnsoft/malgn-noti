<script setup lang="ts">
import type { Recipient } from '~/types/recipient'
import type { KakaoTpl } from '~/types/template'

useHead({ title: '알림톡 발송' })
const toast = useToast()
const router = useRouter()

const profiles = [
  { id: 1, name: '(주)몰리몰리', desc: '공식 알림톡 발신 프로필 · @molly_official' },
  { id: 2, name: '몰리몰리 고객센터', desc: '고객 상담 전용 · @molly_cs' },
  { id: 3, name: '몰리몰리 마케팅', desc: '마케팅 전용 · @molly_mkt' }
]

const profile = ref<typeof profiles[number] | null>(null)
const template = ref<KakaoTpl | null>(null)
const substitutionMode = ref<'common' | 'individual'>('common')
const commonVars = ref<Record<string, string>>({})
const recipients = ref<Recipient[]>([])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openTpl = ref(false)
const openConfirm = ref(false)
const openReset = ref(false)

const varKeys = computed(() => {
  if (!template.value) return []
  const found = template.value.body.match(/#\{([^}]+)\}/g) || []
  return [...new Set(found.map(s => s.slice(2, -1)))]
})
const locked = computed(() => !profile.value || !template.value)
const previewBody = computed(() => {
  if (!template.value) return ''
  let b = template.value.body
  for (const [k, v] of Object.entries(commonVars.value)) {
    if (v) b = b.replace(new RegExp(`#\\{${k}\\}`, 'g'), v)
  }
  return b
})

function typeLabel(t?: KakaoTpl['type']) {
  return t === 'extra' ? '부가정보형' : t === 'auth' ? '인증형' : '기본형'
}
function onPickTemplate(t: KakaoTpl) {
  template.value = t
  commonVars.value = {}
  toast.add({ title: `"${t.name}" 템플릿 적용됨`, color: 'success', icon: 'i-lucide-circle-check' })
}
function onManualConfirm(r: Recipient) {
  recipients.value = editTarget.value
    ? recipients.value.map(x => x.id === r.id ? r : x)
    : [...recipients.value, r]
}
function handleReset() {
  profile.value = null
  template.value = null
  recipients.value = []
  commonVars.value = {}
  openReset.value = false
  toast.add({ title: '초기화했습니다.', color: 'info', icon: 'i-lucide-info' })
}
function send() {
  openConfirm.value = false
  toast.add({ title: `알림톡 ${recipients.value.length}건 발송 시작`, color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/kakao'), 1000)
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · 알림톡
      </div>
      <h1>알림톡 발송</h1>
      <p>카카오톡 비즈메시지. 발신 프로필과 템플릿이 선택되어야 다음 단계로 진행됩니다.</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px">
      <!-- 템플릿 선택 -->
      <AppSendFormCard title="템플릿 선택">
        <AppFormRow label="발신 프로필" required>
          <select
            class="select"
            style="max-width: 360px"
            :value="profile?.id ?? ''"
            @change="profile = profiles.find(p => p.id === Number(($event.target as HTMLSelectElement).value)) || null"
          >
            <option value="">
              발신 프로필 선택
            </option>
            <option v-for="p in profiles" :key="p.id" :value="p.id">
              {{ p.name }} · {{ p.desc }}
            </option>
          </select>
        </AppFormRow>
        <AppFormRow label="템플릿 선택" required help="알림톡은 사전 승인된 템플릿만 사용할 수 있습니다.">
          <div class="row" style="gap: 12px; flex-wrap: wrap">
            <span style="font-size: 13px; color: var(--ink-900)">
              {{ template ? template.name : '선택된 템플릿 없음' }}
            </span>
            <button type="button" class="btn btn-primary btn-sm" :disabled="!profile" @click="openTpl = true">
              선택
            </button>
          </div>
          <div v-if="!profile" class="help" style="color: var(--warning-ink)">
            발신 프로필을 먼저 선택해 주세요.
          </div>
        </AppFormRow>
      </AppSendFormCard>

      <!-- 수신자 설정 -->
      <AppRecipientCard
        title="수신자 설정"
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        v-model:substitution-mode="substitutionMode"
        v-model:common-vars="commonVars"
        key-column="phone"
        :show-vars="varKeys.length > 0"
        :var-keys="varKeys"
        :show-substitution="varKeys.length > 0"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <!-- 메시지 설정 -->
      <AppSendFormCard
        title="메시지 설정"
        required
      >
        <div class="msg-grid">
          <div class="col">
            <AppFormRow label="템플릿 코드">
              <div class="ro-text">
                {{ template?.id ?? '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="카카오톡 템플릿 코드">
              <div class="ro-text">
                {{ template?.id ?? '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="발송 목적">
              <div class="ro-text">
                {{ template ? '일반용' : '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="메시지 유형">
              <div class="ro-text">
                {{ template ? typeLabel(template.type) : '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="메시지 강조 유형">
              <div class="ro-text">
                {{ template ? '선택 안함' : '' }}
              </div>
            </AppFormRow>
            <AppFormRow label="내용" required>
              <textarea
                class="textarea"
                rows="8"
                readonly
                :value="template?.body ?? ''"
                placeholder="템플릿을 선택하면 내용이 표시됩니다."
              />
            </AppFormRow>
            <AppFormRow label="보안 템플릿 여부">
              <div class="ro-text">
                {{ template ? (template.type === 'auth' ? '설정' : '미설정') : '' }}
              </div>
            </AppFormRow>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <div style="display: grid; place-items: center">
              <AppKakaoPreview
                :profile-name="profile?.name"
                :body="previewBody"
                :extra="template?.extra"
                :buttons="template?.buttons"
              />
            </div>
          </div>
        </div>
      </AppSendFormCard>

      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="!profile || !template || recipients.length === 0"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

    <AppKakaoTemplateDialog :open="openTpl" @close="openTpl = false" @pick="onPickTemplate" />
    <AppAddressBookDialog
      :open="openAddrBook"
      key-column="phone"
      @close="openAddrBook = false"
      @confirm="(items) => { recipients = [...recipients, ...items]; toast.add({ title: `${items.length}명 추가됨`, color: 'success', icon: 'i-lucide-circle-check' }) }"
    />
    <AppRecipientFormDialog
      :open="openManual"
      :edit="editTarget"
      key-column="phone"
      :var-keys="substitutionMode === 'individual' ? varKeys : []"
      @close="openManual = false"
      @confirm="onManualConfirm"
    />
    <AppConfirmDialog
      :open="openReset"
      title="입력 초기화"
      message="입력 내용이 모두 사라집니다. 정말 초기화하시겠습니까?"
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="handleReset"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      channel="알림톡"
      :count="recipients.length"
      :price-per-unit="8"
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.msg-grid { display: grid; grid-template-columns: 1fr 280px; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
.ro-text {
  font-size: 13px;
  color: var(--ink-800);
  padding-top: 2px;
}
.textarea[readonly] {
  background: var(--ink-50);
  color: var(--ink-600);
}
</style>
