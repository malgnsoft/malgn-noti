<script setup lang="ts">
const props = defineProps<{
  open: boolean
  kind: 'number' | 'email'
  selectOptions: string[]
}>()
const emit = defineEmits<{ close: [], submit: [values: string[]] }>()
const toast = useToast()

const isNum = computed(() => props.kind === 'number')
const L = computed(() => isNum.value
  ? {
      title: '수신 거부 번호 등록',
      fieldLabel: '080 수신 거부 번호',
      selectPlaceholder: '080 수신 거부 번호 선택',
      entryPlaceholder: '수신 거부 번호를 추가하세요.',
      valueHead: '수신 거부 번호',
      notice: [
        { text: '080 수신 거부 번호를 선택 후 수신 거부 번호를 입력하세요.', sub: '080 수신 거부 번호는 [발신 정보 > 080 수신 거부 번호 관리]에서 등록할 수 있습니다.' },
        { text: '직접 입력하는 경우 최대 10건까지 추가할 수 있습니다.' },
      ],
    }
  : {
      title: '수신 거부 이메일 등록',
      fieldLabel: '이메일 도메인',
      selectPlaceholder: '이메일 도메인 선택',
      entryPlaceholder: '수신 거부 이메일을 추가하세요.',
      valueHead: '수신 거부 이메일',
      notice: [
        { text: '이메일 도메인을 선택한 뒤 수신 거부 이메일을 입력하세요.', sub: '도메인은 [발신 정보 > 도메인 관리]에서 등록할 수 있습니다.' },
        { text: '직접 입력하는 경우 최대 10건까지 추가할 수 있습니다.' },
      ],
    })

const selectValue = ref('')
const entry = ref('')
const entries = ref<string[]>([])

watch(() => props.open, (v) => {
  if (!v) return
  selectValue.value = ''
  entry.value = ''
  entries.value = []
})

function onAddEntry() {
  const v = entry.value.trim()
  if (!v) return
  if (entries.value.length >= 10) {
    toast.add({ title: '최대 10건까지 추가할 수 있습니다.', icon: 'i-lucide-circle-alert' })
    return
  }
  if (entries.value.includes(v)) {
    toast.add({ title: '이미 추가된 항목입니다.', icon: 'i-lucide-circle-alert' })
    return
  }
  entries.value.push(v)
  entry.value = ''
}
function onRemoveEntry(i: number) {
  entries.value.splice(i, 1)
}
function onSave() {
  if (!selectValue.value) {
    toast.add({ title: `${L.value.fieldLabel}을(를) 선택하세요.`, icon: 'i-lucide-circle-alert' })
    return
  }
  if (!entries.value.length) {
    toast.add({ title: '수신 거부 항목을 1건 이상 추가하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  const values = [...entries.value]
  emit('submit', values)
  toast.add({ title: L.value.title, description: `${values.length}건을 수신 거부 목록에 등록했습니다.`, icon: 'i-lucide-circle-check' })
  emit('close')
}
</script>

<template>
  <AppModal :open="open" :title="L.title" :width="560" @close="emit('close')">
    <ul class="oa-notice">
      <li v-for="(n, i) in L.notice" :key="i">
        {{ n.text }}
        <ul v-if="n.sub">
          <li>{{ n.sub }}</li>
        </ul>
      </li>
    </ul>

    <div class="oa-row">
      <label class="oa-label">{{ L.fieldLabel }}</label>
      <select v-model="selectValue" class="select">
        <option value="">
          {{ L.selectPlaceholder }}
        </option>
        <option v-for="o in selectOptions" :key="o" :value="o">
          {{ o }}
        </option>
      </select>
    </div>

    <div class="oa-divider" />

    <div class="oa-entry-row">
      <div class="oa-entry-input">
        <input
          v-model="entry"
          class="input"
          maxlength="15"
          :placeholder="L.entryPlaceholder"
          @keyup.enter="onAddEntry"
        >
        <span class="oa-count">{{ entry.length }}/15</span>
      </div>
      <button type="button" class="btn btn-primary" @click="onAddEntry">
        <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 추가
      </button>
    </div>
    <table class="table oa-table">
      <thead>
        <tr>
          <th>{{ L.valueHead }}</th>
          <th style="width: 72px; text-align: center">
            삭제
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(v, i) in entries" :key="i">
          <td class="cell-mono" style="text-align: center">
            {{ v }}
          </td>
          <td style="text-align: center">
            <button type="button" class="btn btn-ghost btn-icon" aria-label="삭제" @click="onRemoveEntry(i)">
              <UIcon name="i-lucide-trash-2" class="text-[length:var(--fz-md)]" />
            </button>
          </td>
        </tr>
        <tr v-if="!entries.length">
          <td colspan="2" style="text-align: center; padding: 28px 12px; color: var(--ink-500)">
            표시할 항목이 없습니다.
          </td>
        </tr>
      </tbody>
    </table>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onSave">
        저장
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.oa-notice {
  margin: 0 0 16px;
  padding-left: 18px;
  list-style: disc;
}
.oa-notice > li {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
}
.oa-notice ul {
  margin: 2px 0;
  padding-left: 16px;
  list-style: '- ';
}
.oa-notice ul li {
  font-size: var(--fz-sm);
  color: var(--ink-400);
  line-height: 1.7;
}

.oa-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 12px;
  align-items: center;
}
.oa-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-700);
}
.oa-row .select {
  width: 100%;
}

.oa-divider {
  height: 1px;
  background: var(--line);
  margin: 18px 0;
}

.oa-entry-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.oa-entry-input {
  position: relative;
  flex: 1;
  min-width: 0;
}
.oa-entry-input .input {
  width: 100%;
  padding-right: 52px;
}
.oa-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
.oa-table {
  table-layout: fixed;
}
</style>
