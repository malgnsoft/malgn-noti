<script setup lang="ts">
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

withDefaults(defineProps<{
  quickPrompts?: string[]
  loading?: boolean
}>(), {
  quickPrompts: () => ['친근한 톤', '간결하게', '정중한 비즈니스', '맞춤법 교정'],
  loading: false,
})

const open = defineModel<boolean>('open', { default: false })
const messages = defineModel<ChatMessage[]>('messages', { default: () => [] })
const inputText = defineModel<string>('inputText', { default: '' })

const emit = defineEmits<{
  send: [prompt: string]
  apply: []
  cancel: []
}>()

function onSend() {
  if (!inputText.value.trim()) return
  emit('send', inputText.value)
  inputText.value = ''
}

function onQuickPrompt(p: string) {
  emit('send', p)
}

function onApply() {
  emit('apply')
  open.value = false
}

function onCancel() {
  emit('cancel')
  open.value = false
}

const hasResult = computed(() => messages.value.some(m => m.role === 'assistant'))
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-5xl' }">
    <template #body>
      <div class="ai-body">
        <h4 class="modal-title">
          <UIcon name="i-bi-stars" class="size-4 text-indigo-500" />
          AI 문장 다듬기
        </h4>

        <div class="grid">
          <!-- 좌측: 챗 -->
          <div class="chat-col">
            <div class="chat-messages">
              <div v-if="!messages.length" class="chat-empty">
                원하는 톤이나 방향을 입력하거나 아래 빠른 옵션을 선택하세요.
              </div>
              <div
                v-for="(m, i) in messages"
                :key="i"
                class="chat-msg"
                :class="m.role"
              >
                <div class="chat-bubble">{{ m.content }}</div>
              </div>
              <div v-if="loading" class="chat-msg assistant">
                <div class="chat-bubble loading">생각 중...</div>
              </div>
            </div>

            <div class="quick-row">
              <button
                v-for="q in quickPrompts"
                :key="q"
                type="button"
                class="quick-btn"
                :disabled="loading"
                @click="onQuickPrompt(q)"
              >
                {{ q }}
              </button>
            </div>

            <div class="chat-input-wrap">
              <UTextarea
                v-model="inputText"
                :rows="2"
                placeholder="원하는 톤이나 다듬을 방향을 입력하세요. (예: 더 친근한 톤으로, 인사말만 추가)"
                class="flex-1"
                @keydown.enter.prevent="onSend"
              />
              <button
                type="button"
                class="chat-send"
                :disabled="loading || !inputText.trim()"
                aria-label="전송"
                @click="onSend"
              >
                <UIcon name="i-lucide-arrow-up" class="size-4" />
              </button>
            </div>
          </div>

          <!-- 우측: 프리뷰 슬롯 -->
          <div class="preview-col">
            <div class="preview-label">미리보기</div>
            <div class="preview-content">
              <slot name="preview">
                <div class="preview-empty">AI가 다듬은 결과가 이곳에 표시됩니다.</div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="footer-actions">
        <UButton color="neutral" variant="outline" @click="onCancel">취소</UButton>
        <UButton class="btn-confirm" :disabled="!hasResult" @click="onApply">적용</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.ai-body { padding: 8px 0 16px; }
.modal-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  min-height: 480px;
}
.chat-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-messages {
  flex: 1;
  background: var(--gray-50);
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  max-height: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-empty {
  color: var(--gray-500);
  font-size: 13px;
  text-align: center;
  margin: auto;
}
.chat-msg {
  display: flex;
}
.chat-msg.user {
  justify-content: flex-end;
}
.chat-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.chat-msg.user .chat-bubble {
  background: var(--primary-color);
  color: white;
}
.chat-msg.assistant .chat-bubble {
  background: white;
  border: 1px solid var(--gray-200);
  color: var(--gray-800);
}
.chat-bubble.loading {
  opacity: 0.6;
}
.quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.quick-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid var(--gray-300);
  border-radius: 999px;
  font-size: 12px;
  color: var(--gray-700);
  cursor: pointer;
}
.quick-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.chat-input-wrap {
  display: flex;
  gap: 8px;
}
.chat-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--primary-color);
  color: white;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  align-self: flex-end;
}
.chat-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.preview-col {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
}
.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-empty {
  text-align: center;
  color: var(--gray-500);
  font-size: 13px;
}
.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 100%;
}
.btn-confirm {
  background: var(--color-sky-vivid);
  color: white;
}
.btn-confirm:hover:not(:disabled) {
  background: #016bda;
}
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
