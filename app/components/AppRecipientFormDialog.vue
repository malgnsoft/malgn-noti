<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

const props = withDefaults(defineProps<{
  open: boolean
  edit?: Recipient | null
  keyColumn?: 'phone' | 'email' | 'token'
  varKeys?: string[]
}>(), { edit: null, keyColumn: 'phone', varKeys: () => [] })

const emit = defineEmits<{ close: [], confirm: [Recipient] }>()

const form = reactive<{ name: string, phone: string, email: string, vars: Record<string, string> }>({
  name: '', phone: '', email: '', vars: {}
})

watch(() => props.open, (v) => {
  if (v) {
    const e = props.edit
    form.name = e?.name || ''
    form.phone = e?.phone || ''
    form.email = e?.email || ''
    form.vars = { ...(e?.vars || {}) }
  }
})

function confirm() {
  emit('confirm', {
    id: props.edit?.id ?? `m-${Date.now()}`,
    name: form.name,
    phone: form.phone,
    email: form.email,
    vars: { ...form.vars }
  })
  emit('close')
}
</script>

<template>
  <AppModal
    :open="open"
    :title="edit ? '수신자 수정' : '수신자 직접 입력'"
    :width="480"
    @close="emit('close')"
  >
    <div class="col">
      <AppFormRow label="별칭">
        <input v-model="form.name" class="input" placeholder="예: 이수민">
      </AppFormRow>
      <AppFormRow v-if="keyColumn === 'phone'" label="휴대폰" required>
        <input v-model="form.phone" class="input" placeholder="010-1234-5678">
      </AppFormRow>
      <AppFormRow v-else label="이메일" required>
        <input v-model="form.email" class="input" placeholder="user@example.com">
      </AppFormRow>
      <div v-if="varKeys.length > 0" style="margin-top: 6px">
        <div style="font-size: 12px; font-weight: 600; color: var(--ink-700); margin-bottom: 8px">
          치환자
        </div>
        <div
          v-for="k in varKeys"
          :key="k"
          style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; align-items: center; margin-bottom: 6px"
        >
          <div style="font-size: 12px; color: var(--ink-600); font-family: var(--font-mono)">
            #{{ '{' + k + '}' }}
          </div>
          <input
            class="input"
            :value="form.vars[k] || ''"
            @input="form.vars[k] = ($event.target as HTMLInputElement).value"
          >
        </div>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" @click="confirm">
        {{ edit ? '수정 완료' : '추가' }}
      </button>
    </template>
  </AppModal>
</template>
