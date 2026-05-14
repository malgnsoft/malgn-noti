<script setup lang="ts">
/**
 * 본문은 readonly로 표시하되 #{var} / {{%var%}} 변수 영역만 인라인 편집 가능한 textarea.
 * 알림톡 등 사전 승인 템플릿 본문의 부분 편집에 사용 (DESIGN.md §14.3 templateBodyEdit='variable-only').
 *
 * 구현:
 *   - 본문은 토큰 단위로 분할(고정 문자열 / 변수 슬롯)
 *   - 변수 슬롯은 contenteditable span, 본문은 일반 span
 *   - v-model:value = { templateText, variables: Record<varName, value> }
 */

export interface TemplateVariableValue {
  templateText: string                                             // 원본 본문 (변수 마커 포함)
  variables: Record<string, string>                                // 변수명 → 사용자 입력값
}

const props = defineProps<{
  variablePattern?: RegExp                                         // 기본: #{name} 또는 {{%name%}}
  rows?: number
}>()

const value = defineModel<TemplateVariableValue>('value', { required: true })

const pattern = computed(() => props.variablePattern ?? /#\{([^}]+)\}|\{\{%([^%}]+)%\}\}/g)

interface Token {
  kind: 'text' | 'var'
  text?: string
  varName?: string
}

const tokens = computed<Token[]>(() => {
  const out: Token[] = []
  const re = new RegExp(pattern.value.source, 'g')
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(value.value.templateText)) !== null) {
    if (m.index > lastIndex) {
      out.push({ kind: 'text', text: value.value.templateText.slice(lastIndex, m.index) })
    }
    out.push({ kind: 'var', varName: m[1] ?? m[2] ?? '' })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < value.value.templateText.length) {
    out.push({ kind: 'text', text: value.value.templateText.slice(lastIndex) })
  }
  return out
})

function getVarValue(name: string): string {
  return value.value.variables[name] ?? ''
}

function setVarValue(name: string, v: string) {
  value.value = {
    ...value.value,
    variables: { ...value.value.variables, [name]: v },
  }
}

function onVarInput(name: string, e: Event) {
  const target = e.target as HTMLSpanElement
  setVarValue(name, target.textContent ?? '')
}
</script>

<template>
  <div class="tv-textarea" :style="{ minHeight: `${(rows ?? 8) * 22}px` }">
    <template v-for="(tok, i) in tokens" :key="i">
      <span v-if="tok.kind === 'text'" class="tv-fixed">{{ tok.text }}</span>
      <span
        v-else
        class="tv-var"
        contenteditable="true"
        :data-placeholder="`{${tok.varName}}`"
        @input="onVarInput(tok.varName!, $event)"
      >{{ getVarValue(tok.varName!) }}</span>
    </template>
  </div>
</template>

<style scoped>
.tv-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  background: white;
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--gray-800);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.tv-fixed {
  color: var(--gray-800);
  white-space: pre-wrap;
}
.tv-var {
  display: inline-block;
  min-width: 40px;
  padding: 0 6px;
  margin: 0 2px;
  background: var(--color-sky-soft);
  border: 1px dashed var(--color-sky-vivid);
  border-radius: 4px;
  color: var(--gray-900);
  outline: none;
  vertical-align: baseline;
}
.tv-var:focus {
  background: white;
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(2, 124, 250, 0.2);
}
.tv-var:empty::before {
  content: attr(data-placeholder);
  color: var(--color-sky-vivid);
  opacity: 0.6;
}
</style>
