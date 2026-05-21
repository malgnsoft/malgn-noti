<script setup lang="ts">
type MsgType = 'sms' | 'lms' | 'mms'
type Delivery = 'standalone' | 'conversation'
type Fallback = 'sms' | 'integrated'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  apply: [payload: { msgType: MsgType, delivery: Delivery, fallback: Fallback, body: string }]
}>()
const toast = useToast()

const SUGGESTIONS = ['봄맞이 할인 이벤트', '신규 가입 환영 안내', '예약 확정 알림', '재입고 안내']

const msgType = ref<MsgType>('sms')
const delivery = ref<Delivery>('standalone')
const fallback = ref<Fallback>('sms')
const input = ref('')
const generating = ref(false)
const prompt = ref('')
const result = ref('')

watch(() => props.open, (v) => {
  if (!v) return
  msgType.value = 'sms'
  delivery.value = 'standalone'
  fallback.value = 'sms'
  input.value = ''
  generating.value = false
  prompt.value = ''
  result.value = ''
})

function mockTemplate(text: string): string {
  const topic = text.trim() || '서비스 안내'
  return `[Web 발신]\n${topic}을(를) 안내해 드립니다.\n\n· 자세한 내용은 아래 버튼에서 확인해 주세요.\n· 궁금한 점은 고객센터로 문의해 주세요.\n\n감사합니다.`
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
  emit('apply', { msgType: msgType.value, delivery: delivery.value, fallback: fallback.value, body: result.value })
  toast.add({ title: 'AI 템플릿을 적용했습니다.', icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="AI 템플릿 만들기" :width="820" @close="emit('close')">
    <div class="ai-grid">
      <div class="ai-left">
        <div class="ai-types">
          <span class="ai-type-label">발송 유형 <em>*</em></span>
          <div class="ai-type-radios">
            <label v-for="t in (['sms', 'lms', 'mms'] as MsgType[])" :key="t" class="ai-radio">
              <input v-model="msgType" type="radio" name="ai-rcs-type" :value="t"> {{ t.toUpperCase() }}
            </label>
          </div>
          <select v-model="delivery" class="select ai-select">
            <option value="standalone">
              스탠드얼론
            </option>
            <option value="conversation">
              대화형
            </option>
          </select>
          <select v-model="fallback" class="select ai-select">
            <option value="sms">
              SMS
            </option>
            <option value="integrated">
              통합
            </option>
          </select>
        </div>

        <div class="ai-panel">
          <div class="ai-panel-scroll">
            <div v-if="!prompt" class="ai-intro">
              <div class="ai-spark">
                <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-xl)]" />
              </div>
              <div class="ai-intro-title">
                어떤 RCS 템플릿을 만들어드릴까요?
              </div>
              <p class="ai-intro-desc">
                발송 목적과 핵심 내용을 알려주시면<br>
                RCS 템플릿을 만들어 드립니다.
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
              placeholder="예) 신상품 출시 안내 RCS 메시지를 만들어줘"
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
        <AppRcsPreview brand-name="맑은소프트" :body="result" />
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 12px 14px;
  margin-bottom: 14px;
}
.ai-type-label {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
}
.ai-type-label em {
  color: var(--danger-ink, #e0364a);
  font-style: normal;
}
.ai-type-radios {
  display: flex;
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
.ai-select {
  height: 32px;
  font-size: var(--fz-sm);
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
