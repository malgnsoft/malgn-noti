<script setup lang="ts">
interface FlowChannelRow { id: string, ch: string, template: string }
interface FlowDraft { id?: string, name: string, purpose: 'info' | 'auth' | 'ad', mode: 'sequential' | 'parallel', channels: FlowChannelRow[] }

const props = withDefaults(defineProps<{ open: boolean, edit?: FlowDraft | null }>(), { edit: null })
const emit = defineEmits<{ close: [], confirm: [FlowDraft] }>()
const toast = useToast()

const CHANNEL_OPTIONS = ['SMS', '알림톡', '이메일', 'PUSH']

const isEdit = computed(() => !!props.edit)

const name = ref('')
const purpose = ref<'info' | 'auth' | 'ad'>('info')
const mode = ref<'sequential' | 'parallel'>('sequential')
const rows = ref<FlowChannelRow[]>([])

function seedRows(): FlowChannelRow[] {
  const t = Date.now()
  return [
    { id: `r-${t}-1`, ch: '알림톡', template: '' },
    { id: `r-${t}-2`, ch: 'SMS', template: '' },
    { id: `r-${t}-3`, ch: '이메일', template: '' }
  ]
}

watch(() => props.open, (v) => {
  if (!v) return
  if (props.edit) {
    // 수정 모드: 기존 값으로 시드
    name.value = props.edit.name
    purpose.value = props.edit.purpose
    mode.value = props.edit.mode
    rows.value = props.edit.channels.map(c => ({ ...c }))
  }
  else {
    // 등록 모드: 기본 값으로 시드
    name.value = ''
    purpose.value = 'info'
    mode.value = 'sequential'
    rows.value = seedRows()
  }
})

function onNameInput(e: Event) {
  name.value = (e.target as HTMLInputElement).value.slice(0, 20)
}

function addRow() {
  rows.value = [...rows.value, { id: `r-${Date.now()}`, ch: '', template: '' }]
}
function removeRow(id: string) {
  rows.value = rows.value.filter(r => r.id !== id)
}

// 드래그 앤 드롭으로 순서 변경
const dragIndex = ref<number | null>(null)
function onDragStart(i: number, e: DragEvent) {
  dragIndex.value = i
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}
function onDrop(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  const arr = [...rows.value]
  const [moved] = arr.splice(dragIndex.value, 1)
  if (moved) arr.splice(i, 0, moved)
  rows.value = arr
  dragIndex.value = null
}
function onDragEnd() {
  dragIndex.value = null
}

// 템플릿 선택 다이얼로그
const openTplPicker = ref(false)
const tplPickerRow = ref<FlowChannelRow | null>(null)
function pickTemplate(r: FlowChannelRow) {
  if (!r.ch) {
    toast.add({ title: '메시지 채널을 먼저 선택하세요.', color: 'warning', icon: 'i-lucide-triangle-alert' })
    return
  }
  tplPickerRow.value = r
  openTplPicker.value = true
}
function onTplPicked(name: string) {
  if (!tplPickerRow.value) return
  const id = tplPickerRow.value.id
  rows.value = rows.value.map(r => r.id === id ? { ...r, template: name } : r)
}
// 행의 채널이 바뀌면 기존 템플릿 선택은 무효 → 비움 (select @change에서 호출)
function onChannelChange(r: FlowChannelRow) {
  rows.value = rows.value.map(x => x.id === r.id ? { ...x, template: '' } : x)
}

function confirm() {
  if (!name.value.trim()) {
    toast.add({ title: '플로우 이름을 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (rows.value.length < 2) {
    toast.add({ title: '2개 이상의 메시지 채널을 선택해야 합니다.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  emit('confirm', {
    ...(props.edit?.id ? { id: props.edit.id } : {}),
    name: name.value.trim(),
    purpose: purpose.value,
    mode: mode.value,
    channels: rows.value.map(r => ({ ...r }))
  })
  emit('close')
}
</script>

<template>
  <AppModal
    :open="open"
    :title="isEdit ? '플로우 수정' : '플로우 관리'"
    :width="960"
    @close="emit('close')"
  >
    <!-- 플로우 발송 정보 -->
    <div class="fc-card">
      <div class="fc-card-title">
        플로우 발송 정보
      </div>
      <AppFormRow label="플로우 이름" required>
        <div class="fc-name">
          <input
            :value="name"
            class="input"
            maxlength="20"
            @input="onNameInput"
          >
          <span class="fc-counter">{{ name.length }}/20</span>
        </div>
      </AppFormRow>
      <AppFormRow label="발송 목적">
        <AppRadioGroup
          v-model="purpose"
          :options="[
            { value: 'info', label: '일반용' },
            { value: 'auth', label: '인증용' },
            { value: 'ad', label: '광고용' },
          ]"
        />
      </AppFormRow>
    </div>

    <!-- 플로우 설정 -->
    <div class="fc-card">
      <div class="fc-card-title">
        플로우 설정
      </div>
      <ul class="fc-help">
        <li>
          순차 발송을 원하실 경우 발송할 메시지 채널과 메시지 채널별 템플릿을 선택하고, 메시지 발송 순서를 지정하세요.
          <div class="fc-sub">
            - 플로우 설정 시 2개 이상의 메시지 채널을 선택해야 합니다.
          </div>
        </li>
        <li>메시지 채널을 드래그하여 발송 순서를 지정할 수 있습니다.</li>
        <li>선택된 메시지 채널을 동시에 발송하고자 할 경우 '동시 발송'을 선택하세요.</li>
      </ul>
      <AppFormRow label="발송 플로우 선택">
        <AppRadioGroup
          v-model="mode"
          :options="[
            { value: 'sequential', label: '순차 발송' },
            { value: 'parallel', label: '동시 발송' },
          ]"
        />
      </AppFormRow>

      <div class="table-wrap" style="margin-top: 8px">
        <table class="table fc-table">
          <thead>
            <tr>
              <th style="width: 36px" />
              <th style="width: 90px; text-align: center">
                발송 순서
              </th>
              <th style="width: 160px">
                메시지 채널
              </th>
              <th>템플릿 이름</th>
              <th style="width: 80px" />
              <th style="width: 40px" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(r, i) in rows"
              :key="r.id"
              draggable="true"
              :class="{ 'fc-row-dragging': dragIndex === i }"
              @dragstart="onDragStart(i, $event)"
              @dragover="onDragOver"
              @drop="onDrop(i)"
              @dragend="onDragEnd"
            >
              <td>
                <UIcon name="i-lucide-grip-vertical" class="text-base fc-grip" />
              </td>
              <td style="text-align: center; font-weight: 600">
                {{ i + 1 }}
              </td>
              <td>
                <select v-model="r.ch" class="select" @change="onChannelChange(r)">
                  <option value="">
                    메시지 채널 선택
                  </option>
                  <option v-for="c in CHANNEL_OPTIONS" :key="c" :value="c">
                    {{ c }}
                  </option>
                </select>
              </td>
              <td>
                <input
                  v-model="r.template"
                  class="input"
                  placeholder="템플릿 이름을 선택하세요."
                  readonly
                >
              </td>
              <td>
                <button type="button" class="btn btn-primary btn-sm" @click="pickTemplate(r)">
                  선택
                </button>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-outline btn-sm btn-icon"
                  aria-label="삭제"
                  @click="removeRow(r.id)"
                >
                  <UIcon name="i-lucide-minus" class="text-[12px]" />
                </button>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td colspan="6" class="muted" style="text-align: center; padding: 24px 0">
                메시지 채널을 추가하세요.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" class="fc-add" @click="addRow">
        <UIcon name="i-lucide-plus" class="text-sm" /> 메시지 채널 추가
      </button>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="confirm">
        {{ isEdit ? '수정하기' : '저장하기' }}
      </button>
    </template>
  </AppModal>

  <AppFlowTemplatePickerDialog
    :open="openTplPicker"
    :channel="tplPickerRow?.ch || ''"
    @close="openTplPicker = false"
    @confirm="onTplPicked"
  />
</template>

<style scoped>
.fc-card {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 18px 20px 16px;
  margin-bottom: 14px;
  background: var(--white);
}
.fc-card-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
}
.fc-name {
  position: relative;
  max-width: 280px;
}
.fc-counter {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-400);
  pointer-events: none;
}
.fc-help {
  background: var(--ink-50);
  border-radius: var(--r-sm);
  padding: 12px 16px 12px 30px;
  margin-bottom: 14px;
  font-size: 12px;
  color: var(--ink-600);
  line-height: 1.75;
  list-style: disc;
}
.fc-help .fc-sub {
  font-size: 11px;
  color: var(--ink-500);
  margin-top: 2px;
}
.fc-add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  background: var(--paper);
  border: 1px dashed var(--ink-300);
  border-radius: var(--r-sm);
  font-size: 13px;
  color: var(--ink-700);
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.fc-add:hover {
  background: var(--ink-50);
  border-color: var(--ink-400);
}
.fc-grip {
  color: var(--ink-400);
  cursor: grab;
}
.fc-table tbody tr.fc-row-dragging {
  opacity: 0.45;
  background: var(--accent-soft);
}
.fc-table tbody tr {
  cursor: default;
}
</style>
