<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  value?: string
  senderName?: string
}>(), { value: '', senderName: '1588-1234' })

const emit = defineEmits<{ close: [], apply: [string] }>()

const quickActions = ['더 친근하게', '더 정중하게', '더 짧게', '맞춤법 검사', '이모지 추가']
const history = ref<{ role: 'user' | 'ai', text: string }[]>([])
const input = ref('')
const draft = ref('')

watch(() => props.open, (v) => {
  if (v) { history.value = []; draft.value = props.value || ''; input.value = '' }
})

function ask(prompt: string) {
  history.value.push({ role: 'user', text: prompt })
  input.value = ''
  const cur = draft.value
  setTimeout(() => {
    const transformed = prompt.includes('짧게')
      ? cur.split('.')[0] + '.'
      : prompt.includes('정중')
        ? cur.replace(/요\./g, '습니다.')
        : prompt.includes('친근')
          ? cur.replace(/하셨습니다/g, '되셨네요').replace(/입니다/g, '이에요')
          : prompt.includes('이모지')
            ? '🎉 ' + cur + ' 😊'
            : cur + ' (다듬은 결과)'
    history.value.push({ role: 'ai', text: transformed })
    draft.value = transformed
  }, 450)
}
</script>

<template>
  <AppModal :open="open" title="AI 문장 다듬기" :width="960" @close="emit('close')">
    <div style="display: grid; grid-template-columns: 1fr 280px; gap: 20px">
      <div>
        <div class="ai-log">
          <div v-if="history.length === 0" class="muted" style="font-size: 13px">
            아래 빠른 액션을 누르거나, 원하는 톤을 직접 입력해 주세요.
          </div>
          <div v-for="(h, i) in history" :key="i" style="margin-bottom: 12px">
            <div
              class="ai-role"
              :style="{ color: h.role === 'ai' ? 'var(--accent-ink)' : 'var(--ink-500)' }"
            >
              {{ h.role === 'ai' ? '✨ AI' : '나' }}
            </div>
            <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap">
              {{ h.text }}
            </div>
          </div>
        </div>
        <div class="row" style="flex-wrap: wrap; gap: 6px; margin-top: 10px">
          <button
            v-for="a in quickActions"
            :key="a"
            type="button"
            class="btn btn-outline btn-sm"
            @click="ask(a)"
          >
            {{ a }}
          </button>
        </div>
        <div class="row" style="margin-top: 12px; gap: 6px">
          <input
            v-model="input"
            class="input"
            placeholder="원하는 변경을 입력하세요…"
            @keydown.enter="input.trim() && ask(input)"
          >
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="!input.trim()"
            @click="ask(input)"
          >
            <UIcon name="i-lucide-sparkles" class="text-[12px]" /> 다듬기
          </button>
        </div>
        <div class="ai-result">
          <div class="row" style="justify-content: space-between; margin-bottom: 6px">
            <div style="font-size: 12px; font-weight: 600; color: var(--ink-600)">
              적용 후 본문
            </div>
            <span class="num" style="font-size: 11px; color: var(--ink-500)">{{ byteLen(draft) }} byte</span>
          </div>
          <div style="font-size: 13px; white-space: pre-wrap; line-height: 1.6; color: var(--ink-800)">
            {{ draft || '(빈 본문)' }}
          </div>
        </div>
      </div>
      <div style="display: grid; place-items: center">
        <AppPhonePreview :sender-name="senderName" :message="draft" />
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" @click="emit('apply', draft); emit('close')">
        적용
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.ai-log {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 14px;
  min-height: 200px;
  max-height: 280px;
  overflow: auto;
}
.ai-role { font-size: 11px; margin-bottom: 4px; font-weight: 600; }
.ai-result {
  margin-top: 14px;
  padding: 12px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
</style>
