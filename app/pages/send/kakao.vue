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
const openProfile = ref(false)
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
      <AppSendFormCard step="1" title="발신 정보" required>
        <AppFormRow label="발신 프로필" required>
          <button
            type="button"
            class="btn btn-outline sel-btn"
            @click="openProfile = true"
          >
            <span>
              <template v-if="profile"><strong>{{ profile.name }}</strong> · {{ profile.desc }}</template>
              <template v-else>발신 프로필 검색 / 선택</template>
            </span>
            <UIcon name="i-lucide-chevron-down" class="text-sm" />
          </button>
        </AppFormRow>
        <AppFormRow label="템플릿" required help="알림톡은 사전 승인된 템플릿만 사용할 수 있습니다.">
          <button
            type="button"
            class="btn btn-outline sel-btn"
            :disabled="!profile"
            @click="openTpl = true"
          >
            <span>
              <template v-if="template">
                <strong>{{ template.name }}</strong> · <AppBadge :tone="template.type === 'basic' ? 'neutral' : 'primary'">{{ typeLabel(template.type) }}</AppBadge>
              </template>
              <template v-else>템플릿 선택</template>
            </span>
            <UIcon name="i-lucide-chevron-down" class="text-sm" />
          </button>
          <div v-if="!profile" class="help" style="color: var(--warning-ink)">
            발신 프로필을 먼저 선택해 주세요.
          </div>
        </AppFormRow>
      </AppSendFormCard>

      <AppRecipientCard
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        v-model:substitution-mode="substitutionMode"
        v-model:common-vars="commonVars"
        key-column="phone"
        :locked="locked"
        locked-hint="발신 프로필과 템플릿을 먼저 선택해 주세요."
        :show-vars="varKeys.length > 0"
        :var-keys="varKeys"
        :show-substitution="varKeys.length > 0"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <AppSendFormCard
        step="3"
        title="메시지"
        required
        :locked="locked"
        locked-hint="발신 프로필과 템플릿을 먼저 선택해 주세요."
      >
        <div v-if="template" class="msg-grid">
          <div>
            <div class="row" style="justify-content: space-between; margin-bottom: 10px">
              <div style="font-size: 13px; font-weight: 600; color: var(--ink-900)">
                본문 (변수 영역만 편집 가능)
              </div>
              <AppBadge tone="neutral">
                <UIcon name="i-lucide-lock" class="text-[10px]" /> 본문 잠금
              </AppBadge>
            </div>
            <AppTemplateVariableTextarea v-model="commonVars" :body="template.body" />
            <template v-if="template.extra">
              <div style="font-size: 12px; font-weight: 600; margin-top: 16px; margin-bottom: 6px">
                부가 정보
              </div>
              <div class="kakao-extra">
                {{ template.extra }}
              </div>
            </template>
            <template v-if="template.buttons.length > 0">
              <div style="font-size: 12px; font-weight: 600; margin-top: 16px; margin-bottom: 6px">
                버튼 (읽기 전용)
              </div>
              <div class="col" style="gap: 4px">
                <div v-for="(b, i) in template.buttons" :key="i" class="kakao-btn-row">
                  <UIcon :name="b.type === 'web' ? 'i-lucide-external-link' : 'i-lucide-phone'" class="text-[12px]" />
                  {{ b.label }}
                  <AppBadge tone="neutral" style="margin-left: auto">
                    {{ b.type }}
                  </AppBadge>
                </div>
              </div>
            </template>
          </div>
          <div>
            <div style="font-size: 12px; color: var(--ink-500); margin-bottom: 8px; text-align: center">
              미리보기
            </div>
            <div style="display: grid; place-items: center">
              <AppKakaoPreview
                :profile-name="profile?.name"
                :body="previewBody"
                :extra="template.extra"
                :buttons="template.buttons"
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

    <AppModal :open="openProfile" title="발신 프로필 선택" :width="520" @close="openProfile = false">
      <input class="input" placeholder="프로필명 검색" style="margin-bottom: 12px">
      <div class="col" style="gap: 6px">
        <div
          v-for="p in profiles"
          :key="p.id"
          class="prof-item"
          :class="{ 'prof-on': profile?.id === p.id }"
          @click="profile = p; openProfile = false"
        >
          <div style="font-size: 13px; font-weight: 600; color: var(--ink-900)">
            {{ p.name }}
          </div>
          <div style="font-size: 12px; color: var(--ink-500); margin-top: 2px">
            {{ p.desc }}
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-dark" @click="openProfile = false">
          닫기
        </button>
      </template>
    </AppModal>

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
.sel-btn { justify-content: space-between; width: 100%; max-width: 420px; }
.kakao-extra {
  padding: 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  font-size: 12px;
  color: var(--ink-700);
  white-space: pre-wrap;
  line-height: 1.6;
}
.kakao-btn-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  font-size: 12px;
}
.prof-item {
  padding: 12px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  cursor: pointer;
  background: var(--white);
}
.prof-item:hover { border-color: var(--ink-200); }
.prof-on { background: var(--accent-soft); border-color: var(--accent); }
</style>
