<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

useHead({ title: 'PUSH 발송' })
const toast = useToast()
const router = useRouter()

const useTemplate = ref<'off' | 'on'>('off')
const pushType = ref('info')
const inputMode = ref('basic')
const htmlStyle = ref<'on' | 'off'>('on')
const title = ref('')
const body = ref('')
const badge = ref('')
const jsonPayload = ref(JSON.stringify({ title: '', body: '', data: {} }, null, 2))
const recipients = ref<Recipient[]>([])
const selectedRcpt = ref<(number | string)[]>([])
const sendOptions = ref({ mode: 'now' as 'now' | 'schedule', date: '', hour: '09', minute: '00' })

const openAddrBook = ref(false)
const openManual = ref(false)
const editTarget = ref<Recipient | null>(null)
const openConfirm = ref(false)
const openReset = ref(false)
const openTpl = ref(false)
const pushTemplateName = ref('')


// 미디어(URL · 유형 · 펼치기) 목록
interface PushMedia { id: number | string, url: string, mediaType: string, expand: string }
const pushMedia = ref<PushMedia[]>([])
const openPushMedia = ref(false)
const editPushMedia = ref<PushMedia | null>(null)

function shortUrl(u: string) {
  return u.replace(/^https?:\/\//, '').replace(/\/$/, '')
}
function openPushMediaAdd() {
  editPushMedia.value = null
  openPushMedia.value = true
}
function openPushMediaEdit(m: PushMedia) {
  editPushMedia.value = m
  openPushMedia.value = true
}
function onPushMediaConfirm(m: PushMedia) {
  pushMedia.value = editPushMedia.value
    ? pushMedia.value.map(x => x.id === m.id ? m : x)
    : [...pushMedia.value, m]
}
function removePushMedia(id: number | string) {
  pushMedia.value = pushMedia.value.filter(x => x.id !== id)
}

// Android 미디어(이미지 전용)
const pushAndroidMedia = ref<PushMedia[]>([])
const openPushAndroidMedia = ref(false)
const editPushAndroidMedia = ref<PushMedia | null>(null)
function openPushAndroidMediaAdd() {
  editPushAndroidMedia.value = null
  openPushAndroidMedia.value = true
}
function openPushAndroidMediaEdit(m: PushMedia) {
  editPushAndroidMedia.value = m
  openPushAndroidMedia.value = true
}
function onPushAndroidMediaConfirm(m: PushMedia) {
  pushAndroidMedia.value = editPushAndroidMedia.value
    ? pushAndroidMedia.value.map(x => x.id === m.id ? m : x)
    : [...pushAndroidMedia.value, m]
}
function removePushAndroidMedia(id: number | string) {
  pushAndroidMedia.value = pushAndroidMedia.value.filter(x => x.id !== id)
}

// iOS 미디어(이미지/GIF/동영상/소리 · 펼치기 없음)
const pushIosMedia = ref<PushMedia[]>([])
const openPushIosMedia = ref(false)
const editPushIosMedia = ref<PushMedia | null>(null)
function openPushIosMediaAdd() {
  editPushIosMedia.value = null
  openPushIosMedia.value = true
}
function openPushIosMediaEdit(m: PushMedia) {
  editPushIosMedia.value = m
  openPushIosMedia.value = true
}
function onPushIosMediaConfirm(m: PushMedia) {
  pushIosMedia.value = editPushIosMedia.value
    ? pushIosMedia.value.map(x => x.id === m.id ? m : x)
    : [...pushIosMedia.value, m]
}
function removePushIosMedia(id: number | string) {
  pushIosMedia.value = pushIosMedia.value.filter(x => x.id !== id)
}

// Android 큰 아이콘(URL만)
const pushAndroidBigIcon = ref<PushMedia[]>([])
const openPushBigIcon = ref(false)
const editPushBigIcon = ref<PushMedia | null>(null)
function openPushBigIconAdd() {
  editPushBigIcon.value = null
  openPushBigIcon.value = true
}
function openPushBigIconEdit(m: PushMedia) {
  editPushBigIcon.value = m
  openPushBigIcon.value = true
}
function onPushBigIconConfirm(m: PushMedia) {
  pushAndroidBigIcon.value = editPushBigIcon.value
    ? pushAndroidBigIcon.value.map(x => x.id === m.id ? m : x)
    : [...pushAndroidBigIcon.value, m]
}
function removePushBigIcon(id: number | string) {
  pushAndroidBigIcon.value = pushAndroidBigIcon.value.filter(x => x.id !== id)
}

// 그룹(키 · 설명)
interface PushGroup { id: number | string, key: string, desc: string }
const pushGroups = ref<PushGroup[]>([])
const openPushGroup = ref(false)
const editPushGroup = ref<PushGroup | null>(null)
function openPushGroupAdd() {
  editPushGroup.value = null
  openPushGroup.value = true
}
function openPushGroupEdit(g: PushGroup) {
  editPushGroup.value = g
  openPushGroup.value = true
}
function onPushGroupConfirm(g: PushGroup) {
  pushGroups.value = editPushGroup.value
    ? pushGroups.value.map(x => x.id === g.id ? g : x)
    : [...pushGroups.value, g]
}
function removePushGroup(id: number | string) {
  pushGroups.value = pushGroups.value.filter(x => x.id !== id)
}

// 버튼(응답·앱 열기·URL 열기·닫기) 목록
const pushButtons = ref<{ id: number | string, type: string }[]>([])
const openPushBtn = ref(false)
const editPushBtn = ref<{ id: number | string, type: string } | null>(null)

function openPushBtnAdd() {
  editPushBtn.value = null
  openPushBtn.value = true
}
function openPushBtnEdit(b: { id: number | string, type: string }) {
  editPushBtn.value = b
  openPushBtn.value = true
}
function onPushBtnConfirm(b: { id: number | string, type: string }) {
  pushButtons.value = editPushBtn.value
    ? pushButtons.value.map(x => x.id === b.id ? b : x)
    : [...pushButtons.value, b]
}
function removePushBtn(id: number | string) {
  pushButtons.value = pushButtons.value.filter(x => x.id !== id)
}

// 발송 목적이 광고용이면 제목 앞에 (광고)를 자동·강제로 부착
const AD_PREFIX = '(광고)'
watch(pushType, (val, old) => {
  if (val === 'ad') {
    if (!title.value.startsWith(AD_PREFIX)) title.value = `${AD_PREFIX} ${title.value}`.trimEnd()
  }
  else if (old === 'ad' && title.value.startsWith(AD_PREFIX)) {
    title.value = title.value.slice(AD_PREFIX.length).replace(/^\s+/, '')
  }
})
watch(title, (v) => {
  if (pushType.value === 'ad' && !v.startsWith(AD_PREFIX)) title.value = `${AD_PREFIX} ${v}`.trimEnd()
})

function onPickPushTpl(t: { name: string, title: string, body: string }) {
  pushTemplateName.value = t.name
  title.value = t.title
  body.value = t.body
  toast.add({ title: `"${t.name}" 템플릿을 적용했습니다.`, color: 'success', icon: 'i-lucide-circle-check' })
}
function onPushRecipientsConfirm(list: Recipient[]) {
  // 수정 모드면 기존 항목 제거 후 입력 목록 추가, 아니면 그대로 추가
  if (editTarget.value) {
    recipients.value = recipients.value.filter(x => x.id !== editTarget.value!.id)
  }
  recipients.value = [...recipients.value, ...list]
}
function send() {
  openConfirm.value = false
  toast.add({ title: 'PUSH 발송 시작', color: 'success', icon: 'i-lucide-circle-check' })
  setTimeout(() => router.push('/history/push'), 1000)
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        메시지 발송 · PUSH
      </div>
      <h1>PUSH 발송</h1>
      <p>모바일 앱 푸시 알림. 무료.</p>
    </div>

    <div style="display: flex; flex-direction: column; gap: 16px">
      <!-- 템플릿 선택 -->
      <AppSendFormCard title="템플릿 선택">
        <AppFormRow label="템플릿 사용유무">
          <AppRadioGroup
            v-model="useTemplate"
            :options="[{ value: 'off', label: '사용 안 함' }, { value: 'on', label: '사용' }]"
          />
        </AppFormRow>
        <AppFormRow label="템플릿 선택">
          <div class="row" style="gap: 12px; flex-wrap: wrap">
            <span style="font-size: 13px; color: var(--ink-900)">
              {{ pushTemplateName || '선택된 템플릿 없음' }}
            </span>
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="useTemplate === 'off'"
              @click="openTpl = true"
            >
              선택
            </button>
          </div>
        </AppFormRow>
      </AppSendFormCard>

      <!-- 수신자 설정 -->
      <AppRecipientCard
        title="수신자 설정"
        :step="2"
        v-model:recipients="recipients"
        v-model:selected="selectedRcpt"
        key-column="token"
        @add-manual="(t) => { editTarget = t || null; openManual = true }"
        @address-book="openAddrBook = true"
      />

      <!-- 메시지 설정 -->
      <AppSendFormCard title="메시지 설정" required>
        <div class="msg-grid">
          <div class="col">
            <AppFormRow label="발송 목적" required>
              <AppRadioGroup
                v-model="pushType"
                :options="[{ value: 'info', label: '일반용' }, { value: 'ad', label: '광고용' }]"
              />
            </AppFormRow>
            <AppFormRow label="입력 유형">
              <AppRadioGroup
                v-model="inputMode"
                :options="[{ value: 'basic', label: '기본' }, { value: 'json', label: 'JSON' }]"
              />
            </AppFormRow>

            <template v-if="inputMode === 'basic'">
              <div class="push-box">
                <AppFormRow label="HTML 스타일">
                  <AppRadioGroup
                    v-model="htmlStyle"
                    :options="[{ value: 'on', label: '사용' }, { value: 'off', label: '사용 안 함' }]"
                  />
                </AppFormRow>
                <AppFormRow label="제목">
                  <input v-model="title" class="input" placeholder="제목을 입력하세요.">
                </AppFormRow>
                <AppFormRow label="내용">
                  <textarea v-model="body" class="textarea" rows="6" placeholder="내용을 입력하세요. 치환자는 #{name} 형식으로 작성합니다." />
                </AppFormRow>
              </div>
            </template>
            <AppFormRow v-else label="JSON 페이로드">
              <textarea
                v-model="jsonPayload"
                class="textarea"
                rows="12"
                style="font-family: var(--font-mono); font-size: 12px"
              />
            </AppFormRow>

            <AppFormRow label="배지">
              <input v-model="badge" class="input" inputmode="numeric" placeholder="숫자만 입력" style="max-width: 240px">
            </AppFormRow>
            <AppFormRow label="버튼">
              <div class="row" style="gap: 6px; flex-wrap: wrap">
                <button type="button" class="btn btn-primary btn-sm" @click="openPushBtnAdd">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
                </button>
                <div v-for="b in pushButtons" :key="b.id" class="push-btn-chip">
                  <span>{{ b.type }}</span>
                  <button type="button" class="pbc-act" aria-label="수정" @click="openPushBtnEdit(b)">
                    <UIcon name="i-lucide-pencil" class="text-[11px]" />
                  </button>
                  <button type="button" class="pbc-act" aria-label="삭제" @click="removePushBtn(b.id)">
                    <UIcon name="i-lucide-x" class="text-[11px]" />
                  </button>
                </div>
              </div>
            </AppFormRow>
            <AppFormRow label="미디어">
              <div class="row" style="gap: 6px; flex-wrap: wrap">
                <button type="button" class="btn btn-primary btn-sm" @click="openPushMediaAdd">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
                </button>
                <div
                  v-for="m in pushMedia"
                  :key="m.id"
                  class="push-btn-chip"
                  style="cursor: pointer"
                  @click="openPushMediaEdit(m)"
                >
                  <span>{{ m.mediaType }} · {{ shortUrl(m.url) }}</span>
                  <button type="button" class="pbc-act" aria-label="삭제" @click.stop="removePushMedia(m.id)">
                    <UIcon name="i-lucide-x" class="text-[11px]" />
                  </button>
                </div>
              </div>
            </AppFormRow>
            <AppFormRow label="iOS 미디어">
              <div class="row" style="gap: 6px; flex-wrap: wrap">
                <button type="button" class="btn btn-primary btn-sm" @click="openPushIosMediaAdd">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
                </button>
                <div
                  v-for="m in pushIosMedia"
                  :key="m.id"
                  class="push-btn-chip"
                  style="cursor: pointer"
                  @click="openPushIosMediaEdit(m)"
                >
                  <span>{{ m.mediaType }} · {{ shortUrl(m.url) }}</span>
                  <button type="button" class="pbc-act" aria-label="삭제" @click.stop="removePushIosMedia(m.id)">
                    <UIcon name="i-lucide-x" class="text-[11px]" />
                  </button>
                </div>
              </div>
            </AppFormRow>
            <AppFormRow label="Android 미디어">
              <div class="row" style="gap: 6px; flex-wrap: wrap">
                <button type="button" class="btn btn-primary btn-sm" @click="openPushAndroidMediaAdd">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
                </button>
                <div
                  v-for="m in pushAndroidMedia"
                  :key="m.id"
                  class="push-btn-chip"
                  style="cursor: pointer"
                  @click="openPushAndroidMediaEdit(m)"
                >
                  <span>{{ m.mediaType }} · {{ shortUrl(m.url) }}</span>
                  <button type="button" class="pbc-act" aria-label="삭제" @click.stop="removePushAndroidMedia(m.id)">
                    <UIcon name="i-lucide-x" class="text-[11px]" />
                  </button>
                </div>
              </div>
            </AppFormRow>
            <AppFormRow label="Android 큰 아이콘">
              <div class="row" style="gap: 6px; flex-wrap: wrap">
                <button type="button" class="btn btn-primary btn-sm" @click="openPushBigIconAdd">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
                </button>
                <div
                  v-for="m in pushAndroidBigIcon"
                  :key="m.id"
                  class="push-btn-chip"
                  style="cursor: pointer"
                  @click="openPushBigIconEdit(m)"
                >
                  <span>{{ shortUrl(m.url) }}</span>
                  <button type="button" class="pbc-act" aria-label="삭제" @click.stop="removePushBigIcon(m.id)">
                    <UIcon name="i-lucide-x" class="text-[11px]" />
                  </button>
                </div>
              </div>
            </AppFormRow>
            <AppFormRow label="그룹">
              <div class="row" style="gap: 6px; flex-wrap: wrap">
                <button type="button" class="btn btn-primary btn-sm" @click="openPushGroupAdd">
                  <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
                </button>
                <div v-for="g in pushGroups" :key="g.id" class="push-btn-chip">
                  <span>{{ g.key }}</span>
                  <button type="button" class="pbc-act" aria-label="수정" @click="openPushGroupEdit(g)">
                    <UIcon name="i-lucide-pencil" class="text-[11px]" />
                  </button>
                  <button type="button" class="pbc-act" aria-label="삭제" @click="removePushGroup(g.id)">
                    <UIcon name="i-lucide-x" class="text-[11px]" />
                  </button>
                </div>
              </div>
            </AppFormRow>
          </div>
          <div>
            <div class="push-prev-caps">
              <span>Android</span>
              <span>iOS</span>
            </div>
            <div class="push-previews">
              <AppPushPreview platform="android" app-name="앱 알림" :title="title" :body="body" />
              <AppPushPreview platform="ios" app-name="앱 알림" :title="title" :body="body" />
            </div>
            <div class="push-help">
              <UIcon name="i-lucide-info" class="text-[12px]" />
              <span>디바이스에 따라 실제 메시지 수신 화면과 미리보기 화면이 다를 수 있으며, 일부 기능(애니메이션, 사운드 등)은 미리보기에서 지원되지 않을 수 있습니다.</span>
            </div>
          </div>
        </div>
      </AppSendFormCard>

      <AppSendOptionsCard v-model="sendOptions" :step="4" />
    </div>

    <AppSendActionsBar
      :send-disabled="recipients.length === 0"
      @reset="openReset = true"
      @send="openConfirm = true"
    />

    <AppPushTemplateDialog :open="openTpl" @close="openTpl = false" @pick="onPickPushTpl" />
    <AppPushButtonDialog
      :open="openPushBtn"
      :edit="editPushBtn"
      @close="openPushBtn = false"
      @confirm="onPushBtnConfirm"
    />
    <AppPushMediaDialog
      :open="openPushMedia"
      :edit="editPushMedia"
      @close="openPushMedia = false"
      @confirm="onPushMediaConfirm"
    />
    <AppPushMediaDialog
      :open="openPushAndroidMedia"
      :edit="editPushAndroidMedia"
      title="Android 미디어"
      :types="['이미지']"
      @close="openPushAndroidMedia = false"
      @confirm="onPushAndroidMediaConfirm"
    />
    <AppPushMediaDialog
      :open="openPushIosMedia"
      :edit="editPushIosMedia"
      title="iOS 미디어"
      :show-expand="false"
      @close="openPushIosMedia = false"
      @confirm="onPushIosMediaConfirm"
    />
    <AppPushMediaDialog
      :open="openPushBigIcon"
      :edit="editPushBigIcon"
      title="Android 큰 아이콘"
      :show-type="false"
      :show-expand="false"
      @close="openPushBigIcon = false"
      @confirm="onPushBigIconConfirm"
    />
    <AppPushGroupDialog
      :open="openPushGroup"
      :edit="editPushGroup"
      @close="openPushGroup = false"
      @confirm="onPushGroupConfirm"
    />
    <AppAddressBookDialog
      :open="openAddrBook"
      key-column="token"
      @close="openAddrBook = false"
      @confirm="(items) => recipients = [...recipients, ...items]"
    />
    <AppPushRecipientDialog
      :open="openManual"
      :edit="editTarget"
      @close="openManual = false"
      @confirm="onPushRecipientsConfirm"
    />
    <AppConfirmDialog
      :open="openReset"
      title="초기화"
      message="입력 초기화"
      confirm-label="초기화"
      danger
      @close="openReset = false"
      @confirm="() => { recipients = []; openReset = false }"
    />
    <AppSendConfirmDialog
      :open="openConfirm"
      channel="PUSH"
      :count="recipients.length"
      :price-per-unit="0"
      :schedule-at="sendOptions.mode === 'schedule' ? `${sendOptions.date} ${sendOptions.hour}:${sendOptions.minute}` : null"
      @close="openConfirm = false"
      @confirm="send"
    />
  </div>
</template>

<style scoped>
.msg-grid { display: grid; grid-template-columns: minmax(0, 1fr) min-content; gap: 24px; }
@media (max-width: 1023px) { .msg-grid { grid-template-columns: 1fr; } }
.push-box {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 4px 16px;
  background: var(--paper);
  margin: 8px 0;
}
.push-prev-caps {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.push-prev-caps span {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: var(--ink-500);
  margin-bottom: 8px;
}
.push-previews {
  display: flex;
  gap: 16px;
}
.push-btn-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 4px 10px;
  background: var(--accent-soft);
  border: 1px solid rgba(0, 220, 130, 0.25);
  border-radius: 999px;
  font-size: 12px;
  color: var(--ink-800);
}
.push-btn-chip .pbc-act {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: var(--ink-600);
  background: transparent;
  cursor: pointer;
}
.push-btn-chip .pbc-act:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--ink-900);
}
.push-help {
  display: flex;
  gap: 6px;
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--ink-50);
  border-radius: var(--r-md);
  font-size: 11px;
  color: var(--ink-500);
  line-height: 1.6;
  max-width: 576px;
}
</style>
