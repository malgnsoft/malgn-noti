<script setup lang="ts">
import type { Recipient } from '~/types/recipient'

const props = withDefaults(defineProps<{
  step?: number
  recipients: Recipient[]
  selected: (number | string)[]
  keyColumn?: 'phone' | 'email' | 'token'
  showVars?: boolean
  varKeys?: string[]
  substitutionMode?: 'common' | 'individual'
  showSubstitution?: boolean
  commonVars?: Record<string, string>
  locked?: boolean
  lockedHint?: string
  title?: string
}>(), {
  step: 2,
  title: '수신자',
  keyColumn: 'phone',
  showVars: false,
  varKeys: () => [],
  substitutionMode: 'common',
  commonVars: () => ({})
})

const emit = defineEmits<{
  'update:recipients': [Recipient[]]
  'update:selected': [(number | string)[]]
  'update:substitutionMode': [string]
  'update:commonVars': [Record<string, string>]
  'addManual': [Recipient | undefined]
  'addressBook': []
}>()

const allChecked = computed(() => props.recipients.length > 0 && props.selected.length === props.recipients.length)
const keyHead = computed(() => props.keyColumn === 'phone' ? '휴대폰' : props.keyColumn === 'email' ? '이메일' : '토큰')

function toggleAll() {
  emit('update:selected', allChecked.value ? [] : props.recipients.map(r => r.id))
}
function toggleOne(id: number | string) {
  emit('update:selected', props.selected.includes(id)
    ? props.selected.filter(x => x !== id)
    : [...props.selected, id])
}
function onDelete() {
  emit('update:recipients', props.recipients.filter(r => !props.selected.includes(r.id)))
  emit('update:selected', [])
}
function keyVal(r: Recipient) {
  return props.keyColumn === 'phone' ? r.phone : props.keyColumn === 'email' ? r.email : (r.token || '—')
}
</script>

<template>
  <AppSendFormCard
    :step="step"
    :title="title"
    required
    collapsible
    :locked="locked"
    :locked-hint="lockedHint"
    :hint="locked ? undefined : `총 ${recipients.length.toLocaleString()}명`"
  >
    <AppFormRow
      v-if="showSubstitution"
      label="치환자 입력"
      help="개별 입력 시 수신자 표에 치환자 컬럼이 추가됩니다."
    >
      <AppRadioGroup
        :model-value="substitutionMode"
        :options="[
          { value: 'common', label: '공통 입력' },
          { value: 'individual', label: '개별 입력' },
        ]"
        @update:model-value="emit('update:substitutionMode', $event)"
      />
      <div
        v-if="substitutionMode === 'common' && varKeys.length > 0"
        style="margin-top: 12px; display: grid; gap: 8px"
      >
        <div
          v-for="k in varKeys"
          :key="k"
          style="display: grid; grid-template-columns: 100px 1fr; gap: 8px; align-items: center"
        >
          <div style="font-size: 12px; color: var(--ink-600); font-family: var(--font-mono)">
            #{{ '{' + k + '}' }}
          </div>
          <input
            class="input"
            :value="commonVars?.[k] || ''"
            :placeholder="`#{${k}} 자리에 들어갈 값`"
            @input="emit('update:commonVars', { ...commonVars, [k]: ($event.target as HTMLInputElement).value })"
          >
        </div>
      </div>
    </AppFormRow>

    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 4px">
      <button type="button" class="btn btn-primary btn-sm" @click="emit('addManual', undefined)">
        <UIcon name="i-lucide-plus" class="text-[12px]" /> 직접입력
      </button>
      <button type="button" class="btn btn-primary btn-sm" @click="emit('addressBook')">
        <UIcon name="i-lucide-plus" class="text-[12px]" /> 주소록에서 선택
      </button>
      <button
        type="button"
        class="btn btn-error btn-sm"
        :disabled="selected.length !== 1"
        @click="emit('addManual', recipients.find(r => r.id === selected[0]))"
      >
        수신자 정보 수정
      </button>
      <button
        type="button"
        class="btn btn-error btn-sm"
        :disabled="selected.length === 0"
        @click="onDelete"
      >
        수신자 정보 삭제
      </button>
    </div>

    <div style="margin-top: 12px">
      <AppEmptyState
        v-if="recipients.length === 0"
        icon="i-lucide-users"
        title="아직 수신자가 없습니다."
        desc="직접 입력하거나 주소록에서 선택해 주세요."
      >
        <template #action>
          <button type="button" class="btn btn-primary btn-sm" @click="emit('addressBook')">
            <UIcon name="i-lucide-contact-round" class="text-[14px]" /> 주소록 열기
          </button>
        </template>
      </AppEmptyState>
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px">
                <label class="checkbox">
                  <input type="checkbox" :checked="allChecked" @change="toggleAll">
                </label>
              </th>
              <th>별칭</th>
              <th>{{ keyHead }}</th>
              <th
                v-for="k in (showVars && substitutionMode === 'individual' ? varKeys : [])"
                :key="k"
                style="color: var(--accent-ink)"
              >
                #{{ '{' + k + '}' }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in recipients" :key="r.id" :class="{ selected: selected.includes(r.id) }">
              <td>
                <label class="checkbox">
                  <input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)">
                </label>
              </td>
              <td>{{ r.name }}</td>
              <td class="cell-mono">
                {{ keyVal(r) }}
              </td>
              <td
                v-for="k in (showVars && substitutionMode === 'individual' ? varKeys : [])"
                :key="k"
                class="cell-mono"
              >
                {{ r.vars?.[k] || '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppSendFormCard>
</template>
