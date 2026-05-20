<script setup lang="ts">
export interface RecipientRow {
  id: string
  alias?: string
  keyValue: string
  substitution?: string
}

const props = defineProps<{
  rows: RecipientRow[]
  keyColumnLabel: string
  showSubstitutionColumn?: boolean
  substitutionPlaceholder?: string
}>()

const selected = defineModel<string[]>('selected', { default: () => [] })

const allChecked = computed(
  () => props.rows.length > 0 && props.rows.every(r => selected.value.includes(r.id)),
)

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selected.value = checked ? props.rows.map(r => r.id) : []
}

function toggleRow(id: string, e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    if (!selected.value.includes(id)) selected.value = [...selected.value, id]
  } else {
    selected.value = selected.value.filter(s => s !== id)
  }
}
</script>

<template>
  <div v-if="rows.length" class="app-recipient-table-wrap">
    <table class="app-recipient-table">
      <thead>
        <tr>
          <th class="th-check">
            <input type="checkbox" :checked="allChecked" @change="toggleAll">
          </th>
          <th>수신자 별칭</th>
          <th>{{ keyColumnLabel }}</th>
          <th v-if="showSubstitutionColumn">치환자</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td class="th-check">
            <input
              type="checkbox"
              :checked="selected.includes(row.id)"
              @change="toggleRow(row.id, $event)"
            >
          </td>
          <td>{{ row.alias || '—' }}</td>
          <td>{{ row.keyValue }}</td>
          <td v-if="showSubstitutionColumn">
            <input
              v-model="row.substitution"
              type="text"
              class="substitution-input"
              :placeholder="substitutionPlaceholder ?? '치환자 값'"
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.app-recipient-table-wrap {
  margin-top: 16px;
  border-top: 1px solid var(--gray-200);
}
.app-recipient-table {
  width: 100%;
  border-collapse: collapse;
}
.app-recipient-table thead th {
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  padding: 12px;
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--gray-700);
  text-align: center;
}
.app-recipient-table tbody td {
  border-bottom: 1px solid var(--gray-200);
  padding: 12px;
  text-align: center;
  font-size: var(--fz-md);
  color: var(--gray-700);
}
.th-check {
  width: 48px;
}
.substitution-input {
  width: 100%;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: var(--fz-md);
  font-family: var(--font-sans);
}
.substitution-input:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -1px;
}
</style>
