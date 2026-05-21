<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], apply: [payload: { subject: string, body: string }] }>()
const toast = useToast()

const SUGGESTIONS = ['회원가입 환영', '결제 완료 안내', '이벤트 초대', '휴면 계정 안내']
const FROM = 'no-reply@wecandeo.com'

const input = ref('')
const generating = ref(false)
const prompt = ref('')
const result = ref<{ subject: string, body: string } | null>(null)

watch(() => props.open, (v) => {
  if (!v) return
  input.value = ''
  generating.value = false
  prompt.value = ''
  result.value = null
})

function mockTemplate(text: string) {
  const topic = text.trim() || '서비스 안내'
  return {
    subject: `[맑은소프트] ${topic} 안내`,
    body: `안녕하세요, 고객님.\n\n${topic}을(를) 안내해 드립니다.\n\n· 자세한 내용은 본문을 확인해 주세요.\n· 궁금한 점은 고객센터로 문의해 주세요.\n\n앞으로도 좋은 소식으로 찾아뵙겠습니다.\n감사합니다.`,
  }
}

function generate(text?: string) {
  const q = (text ?? input.value).trim()
  if (!q) return
  prompt.value = q
  input.value = ''
  generating.value = true
  result.value = null
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
  emit('apply', { subject: result.value.subject, body: result.value.body })
  toast.add({ title: 'AI 템플릿을 적용했습니다.', icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" title="AI 템플릿 만들기" :width="820" @close="emit('close')">
    <div class="ai-grid">
      <div class="ai-panel">
        <div class="ai-panel-scroll">
          <div v-if="!prompt" class="ai-intro">
            <div class="ai-spark">
              <UIcon name="i-lucide-sparkles" class="text-[length:var(--fz-xl)]" />
            </div>
            <div class="ai-intro-title">
              어떤 이메일을 만들어드릴까요?
            </div>
            <p class="ai-intro-desc">
              발송 목적, 대상, 핵심 내용을 알려주시면<br>
              제목과 본문이 포함된 이메일 템플릿을 만들어 드립니다.
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
            <div v-else-if="result" class="ai-msg ai-msg--ai">
              <div class="ai-result-subject">
                {{ result.subject }}
              </div>
              <div class="ai-result-body">
                {{ result.body }}
              </div>
            </div>
          </div>
        </div>

        <div class="ai-input-row">
          <input
            v-model="input"
            class="input"
            placeholder="예) 이번 달 신규 회원 대상 환영 이메일을 만들어줘"
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

      <div class="ai-preview">
        <AppEmailPreview
          v-if="result"
          :subject="result.subject"
          :from="FROM"
          :heading="result.subject"
          :body="result.body"
        />
        <div v-else class="ai-preview-empty">
          대화를 입력하시면<br>생성된 이메일 템플릿이 여기에 표시됩니다.
        </div>
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
  grid-template-columns: 1fr 320px;
  gap: 20px;
}
@media (max-width: 720px) {
  .ai-grid { grid-template-columns: 1fr; }
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
  min-height: 300px;
  max-height: 360px;
  overflow-y: auto;
  padding: 18px;
}
.ai-intro {
  text-align: center;
  padding: 26px 12px;
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
.ai-result-subject {
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 6px;
}
.ai-result-body {
  color: var(--ink-700);
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

.ai-preview-empty {
  display: grid;
  place-items: center;
  min-height: 420px;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  font-size: var(--fz-sm);
  color: var(--ink-400);
  text-align: center;
  line-height: 1.6;
  padding: 0 16px;
}
</style>
