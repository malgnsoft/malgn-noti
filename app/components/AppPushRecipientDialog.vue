<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

const props = withDefaults(defineProps<{
  open: boolean
  edit?: Recipient | null
}>(), { edit: null })

const emit = defineEmits<{ close: [], confirm: [Recipient[]] }>()
const toast = useToast()

const PUSH_TYPES = ['FCM', 'APNS', 'APNS SANDBOX', 'APNS VOIP', 'APNS SANDBOX VOIP', 'ADM']

interface Entry { id: number | string, pushType: string, token: string }

const aliasName = ref('') // 별칭
const list = ref<Entry[]>([])
const adding = ref(false)
const formType = ref('')
const formToken = ref('')

watch(() => props.open, (v) => {
  if (v) {
    const e = props.edit
    aliasName.value = e?.name || ''
    list.value = e?.token
      ? [{ id: e.id, pushType: (e.vars?.pushType as string) || '', token: e.token }]
      : []
    adding.value = false
    formType.value = ''
    formToken.value = ''
  }
})

function openAddForm() {
  formType.value = ''
  formToken.value = ''
  adding.value = true
}
function cancelAddForm() {
  adding.value = false
}
function saveEntry() {
  if (!formType.value) {
    toast.add({ title: '푸시 유형을 선택하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (!formToken.value.trim()) {
    toast.add({ title: '토큰을 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  list.value = [...list.value, { id: `pt-${Date.now()}`, pushType: formType.value, token: formToken.value.trim() }]
  adding.value = false
}
function removeEntry(id: number | string) {
  list.value = list.value.filter(x => x.id !== id)
}

function confirm() {
  if (list.value.length === 0) {
    toast.add({ title: '추가된 토큰이 없습니다.', color: 'warning', icon: 'i-lucide-triangle-alert' })
    return
  }
  emit('confirm', list.value.map(e => ({
    id: e.id,
    name: aliasName.value.trim(),
    token: e.token,
    vars: e.pushType ? { pushType: e.pushType } : {}
  })))
  emit('close')
}
</script>

<template>
  <AppModal
    :open="open"
    :title="edit ? '수신자 수정' : '수신자 직접 입력'"
    :width="460"
    @close="emit('close')"
  >
    <AppFormRow label="별칭">
      <input v-model="aliasName" class="input" placeholder="예: 이수민">
    </AppFormRow>
    <div class="pr-row">
      <div class="pr-label">
        토큰
      </div>
      <button v-if="!edit" type="button" class="btn btn-primary btn-sm" @click="openAddForm">
        <UIcon name="i-lucide-plus" class="text-[12px]" /> 추가
      </button>
    </div>

    <div v-if="list.length" class="pr-list">
      <div v-for="e in list" :key="e.id" class="pr-item">
        <AppBadge v-if="!edit && e.pushType" tone="neutral">
          {{ e.pushType }}
        </AppBadge>
        <span class="pr-token">{{ e.token }}</span>
        <button v-if="!edit" type="button" class="btn btn-ghost btn-sm" style="margin-left: auto" @click="removeEntry(e.id)">
          <UIcon name="i-lucide-x" class="text-[12px]" />
        </button>
      </div>
    </div>

    <div v-if="adding" class="pr-form">
      <AppFormRow label="푸시 유형">
        <select v-model="formType" class="select">
          <option value="">
            푸시 유형 선택
          </option>
          <option v-for="t in PUSH_TYPES" :key="t" :value="t">
            {{ t }}
          </option>
        </select>
      </AppFormRow>
      <AppFormRow label="토큰">
        <input v-model="formToken" class="input" placeholder="토큰">
      </AppFormRow>
      <div class="pr-form-actions">
        <button type="button" class="btn btn-sky btn-sm" @click="saveEntry">
          저장
        </button>
        <button type="button" class="btn btn-soft btn-sm" @click="cancelAddForm">
          취소
        </button>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" @click="confirm">
        저장
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.pr-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.pr-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-700);
  min-width: 48px;
}
.pr-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}
.pr-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--paper);
}
.pr-token {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-800);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pr-form {
  margin-top: 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--ink-50);
  padding: 16px 16px 14px;
}
.pr-form-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
</style>
