<script setup lang="ts">
type MsgType = 'basic' | 'channel' | 'extra' | 'composite'
type Emphasis = 'none' | 'highlight' | 'image' | 'itemlist'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], apply: [payload: { msgType: MsgType, emphasis: Emphasis, body: string }] }>()
const toast = useToast()

const MSG_TYPES: { v: MsgType, l: string }[] = [
  { v: 'basic', l: '기본형' },
  { v: 'channel', l: '채널 추가형' },
  { v: 'extra', l: '부가 정보형' },
  { v: 'composite', l: '복합형' },
]
const EMPHASIS: { v: Emphasis, l: string }[] = [
  { v: 'none', l: '선택 안함' },
  { v: 'highlight', l: '강조 표기형' },
  { v: 'image', l: '이미지형' },
  { v: 'itemlist', l: '아이템 리스트형' },
]
const SUGGESTIONS = ['회원가입 환영', '예약 확정 안내', '배송 출발 알림', '결제 완료 안내']

const msgType = ref<MsgType>('basic')
const emphasis = ref<Emphasis>('none')
const input = ref('')
const generating = ref(false)
const prompt = ref('')
const result = ref('')

const msgTypeLabel = computed(() => MSG_TYPES.find(m => m.v === msgType.value)?.l ?? '기본형')

watch(() => props.open, (v) => {
  if (!v) return
  msgType.value = 'basic'
  emphasis.value = 'none'
  input.value = ''
  generating.value = false
  prompt.value = ''
  result.value = ''
})

function mockTemplate(text: string): string {
  const topic = text.trim() || '서비스 안내'
  return `안녕하세요, 고객님.\n\n${topic}을(를) 안내해 드립니다.\n\n· 신청 내용을 확인해 주세요.\n· 변경 사항은 마이페이지에서 가능합니다.\n\n자세한 내용은 아래 버튼에서 확인해 주세요.\n감사합니다.`
}

function generate(text?: string) {
  const q = (text ?? input.value).trim()
  if (!q) return
  prompt.value = q
  input.value = ''
  generating.value = true
  result.value = ''
  setTimeout(() => {
    result.value = mockTemplate(q)
    generating.value = false
  }, 700)
}

function onApply() {
  if (!result.value) {
    toast.add({ title: '먼저 템플릿을 생성해 주세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('apply', { msgType: msgType.value, emphasis: emphasis.value, body: result.value })
  toast.add({ title: 'AI 템플릿을 적용했습니다.', icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="AI 템플릿 만들기" :width="820" @close="emit('close')">
    <div class="ai-grid">
      <div class="ai-left">
        <div class="ai-types">
          <div class="ai-type-row">
            <span class="ai-type-label">메시지 유형 <em>*</em></span>
            <div class="ai-type-radios">
              <label v-for="t in MSG_TYPES" :key="t.v" class="ai-radio">
                <input v-model="msgType" type="radio" name="ai-msgtype" :value="t.v"> {{ t.l }}
              </label>
            </div>
          </div>
          <div class="ai-type-row">
            <span class="ai-type-label">강조 유형 <em>*</em></span>
            <div class="ai-type-radios">
              <label v-for="e in EMPHASIS" :key="e.v" class="ai-radio">
                <input v-model="emphasis" type="radio" name="ai-emphasis" :value="e.v"> {{ e.l }}
              </label>
            </div>
          </div>
        </div>

        <div class="ai-panel">
          <div class="ai-panel-scroll">
            <div v-if="!prompt" class="ai-intro">
              <div class="ai-spark">
                <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-xl)]" />
              </div>
              <div class="ai-intro-title">
                어떤 알림톡을 만들어드릴까요?
              </div>
              <p class="ai-intro-desc">
                발송 목적과 핵심 내용을 알려주시면<br>
                {{ msgTypeLabel }} 알림톡 템플릿을 만들어 드립니다.
              </p>
              <div class="ai-suggestions">
                <button
                  v-for="s in SUGGESTIONS"
                  :key="s"
                  type="button"
                  class="ai-chip"
                  @click="generate(s)"
                >
                  <UIcon name="i-lucide-lightbulb" class="text-[length:var(--fz-xs)]" /> {{ s }}
                </button>
              </div>
            </div>

            <div v-else class="ai-thread">
              <div class="ai-msg ai-msg--user">
                {{ prompt }}
              </div>
              <div v-if="generating" class="ai-msg ai-msg--ai ai-msg--loading">
                <UIcon name="i-lucide-loader-circle" class="ai-spin" /> 템플릿을 생성하고 있어요…
              </div>
              <div v-else class="ai-msg ai-msg--ai">
                {{ result }}
              </div>
            </div>
          </div>

          <div class="ai-input-row">
            <input
              v-model="input"
              class="input"
              placeholder="예) 신규 회원가입 환영 알림톡을 만들어줘"
              @keyup.enter="generate()"
            >
            <button
              type="button"
              class="btn btn-primary btn-icon"
              :disabled="!input.trim() || generating"
              aria-label="생성"
              @click="generate()"
            >
              <UIcon name="i-lucide-send" class="text-[length:var(--fz-sm)]" />
            </button>
          </div>
        </div>
      </div>

      <div class="ai-preview">
        <AppKakaoPreview profile-name="맑은소프트" :body="result" />
        <p v-if="!result" class="ai-preview-hint">
          대화를 입력하시면 생성된 템플릿이 여기에 표시됩니다.
        </p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!result" @click="onApply">
        템플릿 적용
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.ai-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
}
@media (max-width: 720px) {
  .ai-grid { grid-template-columns: 1fr; }
}

.ai-types {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 12px 14px;
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ai-type-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ai-type-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  width: 78px;
  flex-shrink: 0;
}
.ai-type-label em {
  color: var(--danger-ink, #e0364a);
  font-style: normal;
}
.ai-type-radios {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.ai-radio {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--fz-sm);
  color: var(--ink-700);
  cursor: pointer;
}
.ai-radio input {
  accent-color: var(--accent);
  width: 16px;
  height: 16px;
}

.ai-panel {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  display: flex;
  flex-direction: column;
}
.ai-panel-scroll {
  flex: 1;
  min-height: 260px;
  max-height: 320px;
  overflow-y: auto;
  padding: 18px;
}
.ai-intro {
  text-align: center;
  padding: 18px 12px;
}
.ai-spark {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  display: grid;
  place-items: center;
  border-radius: var(--r-full);
  background: var(--accent-soft);
  color: var(--accent-ink);
}
.ai-intro-title {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 6px;
}
.ai-intro-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin-bottom: 16px;
}
.ai-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}
.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border: 1px solid var(--line);
  border-radius: var(--r-full);
  background: var(--white);
  font-size: var(--fz-sm);
  color: var(--ink-700);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.ai-chip:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.ai-thread {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ai-msg {
  font-size: var(--fz-md);
  line-height: 1.6;
  white-space: pre-wrap;
  padding: 10px 13px;
  border-radius: var(--r-md);
  max-width: 92%;
}
.ai-msg--user {
  align-self: flex-end;
  background: var(--ink-900);
  color: var(--white);
}
.ai-msg--ai {
  align-self: flex-start;
  background: var(--white);
  border: 1px solid var(--line);
  color: var(--ink-800);
}
.ai-msg--loading {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--ink-500);
}
.ai-spin {
  animation: ai-spin 0.8s linear infinite;
}
@keyframes ai-spin {
  to { transform: rotate(360deg); }
}
.ai-input-row {
  display: flex;
  gap: 6px;
  padding: 10px;
  border-top: 1px solid var(--line);
}
.ai-input-row .input {
  flex: 1;
  min-width: 0;
}
.ai-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.ai-preview-hint {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  text-align: center;
}
</style>
