<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

type Col = 'phone' | 'email' | 'token'

const props = withDefaults(defineProps<{
  open: boolean
  edit?: Recipient | null
  keyColumn?: Col
  keyColumns?: Col[]
  varKeys?: string[]
}>(), { edit: null, keyColumn: 'phone', keyColumns: undefined, varKeys: () => [] })

const emit = defineEmits<{ close: [], confirm: [Recipient] }>()
const toast = useToast()

// 표시할 키 컬럼 목록: keyColumns가 있으면 그 배열, 없으면 단일 keyColumn
const cols = computed<Col[]>(() => (props.keyColumns && props.keyColumns.length ? props.keyColumns : [props.keyColumn!]))

const form = reactive<{ name: string, phone: string, email: string, vars: Record<string, string> }>({
  name: '', phone: '', email: '', vars: {}
})

watch(() => props.open, (v) => {
  if (v) {
    const e = props.edit
    form.name = e?.name || ''
    form.phone = (e?.phone || '').replace(/\D/g, '').slice(0, 11)
    form.email = e?.email || ''
    form.vars = { ...(e?.vars || {}) }
  }
})

function onPhoneInput(ev: Event) {
  // 하이픈 등 비숫자 제거 후 11자리로 제한, 숫자만 저장·표시
  form.phone = (ev.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 11)
}

function confirm() {
  const want = cols.value
  const singleCol = want.length === 1 ? want[0] : null
  // 단일 컬럼 모드: 기존 동작(해당 컬럼 필수 + 형식 검사)
  if (singleCol === 'phone' && form.phone.length !== 11) {
    toast.add({ title: '국내 휴대폰 번호 11자리를 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  // 다중 컬럼 모드: 최소 한 항목 입력 + 입력된 항목은 형식 검사
  if (!singleCol) {
    const filled = want.filter((c) => {
      if (c === 'phone') return form.phone.length > 0
      if (c === 'email') return form.email.trim().length > 0
      return false
    })
    if (filled.length === 0) {
      toast.add({ title: '휴대폰 또는 이메일 중 하나는 입력해야 합니다.', color: 'error', icon: 'i-lucide-octagon-alert' })
      return
    }
    if (want.includes('phone') && form.phone.length > 0 && form.phone.length !== 11) {
      toast.add({ title: '휴대폰은 11자리 숫자여야 합니다.', color: 'error', icon: 'i-lucide-octagon-alert' })
      return
    }
    if (want.includes('email') && form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.add({ title: '올바른 이메일 형식을 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
      return
    }
  }
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
      <AppFormRow v-if="cols.includes('phone')" label="휴대폰" :required="cols.length === 1">
        <input
          :value="form.phone"
          class="input"
          inputmode="numeric"
          placeholder="01012345678"
          @input="onPhoneInput"
        >
        <div class="phone-hint">
          국내 휴대폰 <b>11자리</b>를 하이픈 없이 숫자만 입력하세요. (예: 01012345678)
        </div>
      </AppFormRow>
      <AppFormRow v-if="cols.includes('email')" label="이메일" :required="cols.length === 1">
        <input v-model="form.email" class="input" placeholder="user@example.com">
      </AppFormRow>
      <div v-if="cols.length > 1" class="multi-hint">
        휴대폰과 이메일 중 <b>하나 이상</b> 입력해 주세요.
      </div>
      <div v-if="varKeys.length > 0" style="margin-top: 6px">
        <div style="font-size: var(--fz-sm); font-weight: 600; color: var(--ink-700); margin-bottom: 8px">
          치환자
        </div>
        <div
          v-for="k in varKeys"
          :key="k"
          style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; align-items: center; margin-bottom: 6px"
        >
          <div style="font-size: var(--fz-sm); color: var(--ink-600); font-family: var(--font-mono)">
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
      <button type="button" class="btn btn-primary" @click="confirm">
        {{ edit ? '수정 완료' : '추가' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.phone-hint {
  margin-top: 6px;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.phone-hint b {
  color: var(--ink-700);
  font-weight: 700;
}
.multi-hint {
  margin-top: 4px;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.multi-hint b {
  color: var(--ink-700);
  font-weight: 700;
}
</style>
