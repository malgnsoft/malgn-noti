<script setup lang="ts">
export interface AddressBookItem {
  id: string
  alias: string
  keyValue: string
}

export interface AddressBookGroup {
  id: string
  name: string
  count: number
}

const props = withDefaults(defineProps<{
  items: AddressBookItem[]
  groups: AddressBookGroup[]
  keyColumnLabel: string
  rightPanel?: 'edit' | 'preview'
  page?: number
  pageCount?: number
  loading?: boolean
}>(), {
  page: 1,
  pageCount: 1,
})

const open = defineModel<boolean>('open', { default: false })
const selectedItemIds = defineModel<string[]>('selectedItemIds', { default: () => [] })
const selectedGroupIds = defineModel<string[]>('selectedGroupIds', { default: () => [] })
const searchQuery = defineModel<string>('searchQuery', { default: '' })

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:page': [page: number]
  search: []
}>()

const activeTab = ref<'individual' | 'group'>('individual')

const totalSelected = computed(() => {
  if (activeTab.value === 'individual') return selectedItemIds.value.length
  return props.groups
    .filter(g => selectedGroupIds.value.includes(g.id))
    .reduce((sum, g) => sum + g.count, 0)
})

const allItemsChecked = computed(
  () => props.items.length > 0 && props.items.every(i => selectedItemIds.value.includes(i.id)),
)
const allGroupsChecked = computed(
  () => props.groups.length > 0 && props.groups.every(g => selectedGroupIds.value.includes(g.id)),
)

function toggleAllItems(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selectedItemIds.value = checked ? props.items.map(i => i.id) : []
}
function toggleItem(id: string, e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    if (!selectedItemIds.value.includes(id))
      selectedItemIds.value = [...selectedItemIds.value, id]
  } else {
    selectedItemIds.value = selectedItemIds.value.filter(s => s !== id)
  }
}
function toggleAllGroups(e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  selectedGroupIds.value = checked ? props.groups.map(g => g.id) : []
}
function toggleGroup(id: string, e: Event) {
  const checked = (e.target as HTMLInputElement).checked
  if (checked) {
    if (!selectedGroupIds.value.includes(id))
      selectedGroupIds.value = [...selectedGroupIds.value, id]
  } else {
    selectedGroupIds.value = selectedGroupIds.value.filter(s => s !== id)
  }
}

function onConfirm() {
  emit('confirm')
  open.value = false
}
function onCancel() {
  emit('cancel')
  open.value = false
}
function goToPage(p: number) {
  if (p >= 1 && p <= props.pageCount && p !== props.page) emit('update:page', p)
}

const visiblePages = computed(() => {
  const pages = []
  const total = props.pageCount
  for (let i = 1; i <= Math.min(total, 5); i++) pages.push(i)
  return pages
})
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-3xl' }">
    <template #body>
      <div class="address-book-body">
        <h4 class="modal-title">수신자 선택</h4>

        <div class="tabs" role="tablist">
          <button
            type="button"
            class="tab"
            :class="{ 'is-active': activeTab === 'individual' }"
            @click="activeTab = 'individual'"
          >
            개별선택
          </button>
          <button
            type="button"
            class="tab"
            :class="{ 'is-active': activeTab === 'group' }"
            @click="activeTab = 'group'"
          >
            그룹선택
          </button>
        </div>

        <div class="grid" :class="{ 'with-panel': !!rightPanel }">
          <div class="list-col">
            <div class="search-row">
              <div class="search-box">
                <UInput
                  v-model="searchQuery"
                  :placeholder="activeTab === 'individual' ? '수신자 별칭을 입력하세요.' : '그룹명을 입력하세요.'"
                  @keydown.enter="emit('search')"
                />
                <UButton color="neutral" variant="ghost" icon="i-lucide-search" @click="emit('search')" />
              </div>
              <div class="count">
                총 <strong>{{ totalSelected }}</strong>{{ activeTab === 'group' ? '명' : '개' }} 선택
              </div>
            </div>

            <table v-if="activeTab === 'individual'" class="data-table">
              <thead>
                <tr>
                  <th class="th-check">
                    <input type="checkbox" :checked="allItemsChecked" @change="toggleAllItems">
                  </th>
                  <th>수신자 별칭</th>
                  <th>{{ keyColumnLabel }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  <td class="th-check">
                    <input
                      type="checkbox"
                      :checked="selectedItemIds.includes(item.id)"
                      @change="toggleItem(item.id, $event)"
                    >
                  </td>
                  <td>{{ item.alias }}</td>
                  <td>{{ item.keyValue }}</td>
                </tr>
                <tr v-if="!items.length">
                  <td colspan="3" class="empty-row">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>

            <table v-else class="data-table">
              <thead>
                <tr>
                  <th class="th-check">
                    <input type="checkbox" :checked="allGroupsChecked" @change="toggleAllGroups">
                  </th>
                  <th>그룹명</th>
                  <th>연락처 수</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="g in groups" :key="g.id">
                  <td class="th-check">
                    <input
                      type="checkbox"
                      :checked="selectedGroupIds.includes(g.id)"
                      @change="toggleGroup(g.id, $event)"
                    >
                  </td>
                  <td>{{ g.name }}</td>
                  <td>{{ g.count }}명</td>
                </tr>
                <tr v-if="!groups.length">
                  <td colspan="3" class="empty-row">검색 결과가 없습니다.</td>
                </tr>
              </tbody>
            </table>

            <div v-if="activeTab === 'individual' && pageCount > 1" class="pagination">
              <button
                type="button"
                :disabled="page === 1"
                @click="goToPage(1)"
              >
                «
              </button>
              <button
                type="button"
                :disabled="page === 1"
                @click="goToPage(page - 1)"
              >
                ‹
              </button>
              <button
                v-for="p in visiblePages"
                :key="p"
                type="button"
                :class="{ 'is-active': p === page }"
                @click="goToPage(p)"
              >
                {{ p }}
              </button>
              <button
                type="button"
                :disabled="page === pageCount"
                @click="goToPage(page + 1)"
              >
                ›
              </button>
              <button
                type="button"
                :disabled="page === pageCount"
                @click="goToPage(pageCount)"
              >
                »
              </button>
            </div>
          </div>

          <div v-if="rightPanel" class="right-panel">
            <slot name="rightPanel">
              <div class="right-panel-empty">
                <UIcon name="i-lucide-info" class="size-4" />
                <span>좌측에서 수신자를 선택해 주세요.</span>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="footer-actions">
        <UButton color="neutral" variant="outline" @click="onCancel">취소</UButton>
        <UButton class="btn-confirm" :disabled="totalSelected === 0" @click="onConfirm">확인</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.address-book-body {
  padding: 8px 0 16px;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 16px;
}
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 16px;
}
.tab {
  padding: 10px 20px;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-500);
  cursor: pointer;
}
.tab.is-active {
  color: var(--color-sky-vivid);
  border-bottom-color: var(--color-sky-vivid);
  font-weight: 700;
}
.grid {
  display: grid;
  grid-template-columns: 1fr;
}
.grid.with-panel {
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.search-box {
  display: flex;
  flex: 1;
  gap: 4px;
}
.search-box :deep(.u-input) {
  flex: 1;
}
.count {
  font-size: 13px;
  color: var(--gray-700);
}
.count strong {
  color: var(--color-sky-vivid);
  font-weight: 700;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table thead th {
  background: var(--gray-50);
  border-top: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  text-align: center;
}
.data-table tbody td {
  border-bottom: 1px solid var(--gray-200);
  padding: 10px;
  text-align: center;
  font-size: 13px;
  color: var(--gray-700);
}
.empty-row {
  text-align: center;
  color: var(--gray-500);
  padding: 32px !important;
}
.th-check {
  width: 40px;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
}
.pagination button {
  min-width: 32px;
  height: 32px;
  background: white;
  border: 1px solid var(--gray-200);
  color: var(--gray-700);
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
}
.pagination button.is-active {
  background: var(--color-sky-vivid);
  color: white;
  border-color: var(--color-sky-vivid);
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.right-panel {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 16px;
  min-height: 240px;
}
.right-panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
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
