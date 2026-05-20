<script setup lang="ts" generic="T">
export interface TemplateTab {
  key: string
  label: string
  sublabel?: string
}

const props = withDefaults(defineProps<{
  title?: string
  tabs?: TemplateTab[]                    // 비어있으면 단일 탭 (탭바 숨김)
  items: T[]
  searchPlaceholder?: string
  layout?: 'cards' | 'rows'               // SMS = cards, 알림톡·RCS·이메일·PUSH = rows
  selectedKey?: string                    // 현재 활성 탭 key (defineModel)
}>(), {
  title: '템플릿 선택',
  layout: 'rows',
  searchPlaceholder: '템플릿 이름을 입력하세요.',
})

const open = defineModel<boolean>('open', { default: false })
const activeTab = defineModel<string>('activeTab', { default: '' })
const searchQuery = defineModel<string>('searchQuery', { default: '' })
const selectedId = defineModel<string | null>('selectedId', { default: null })

const emit = defineEmits<{
  confirm: [selectedId: string | null]
  cancel: []
  search: []
  'tab-change': [key: string]
}>()

watch(open, (v) => {
  // open 시 첫 탭으로 초기화
  if (!v) return
  const first = props.tabs?.[0]
  if (first && !activeTab.value) {
    activeTab.value = first.key
  }
})

function onConfirm() {
  emit('confirm', selectedId.value)
  open.value = false
}

function onCancel() {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-4xl' }">
    <template #body>
      <div class="picker-body">
        <h4 class="modal-title">{{ title }}</h4>

        <div v-if="tabs?.length" class="tabs" role="tablist">
          <button
            v-for="t in tabs"
            :key="t.key"
            type="button"
            class="tab"
            :class="{ 'is-active': activeTab === t.key }"
            @click="activeTab = t.key; emit('tab-change', t.key)"
          >
            {{ t.label }}
            <span v-if="t.sublabel" class="tab-sub">{{ t.sublabel }}</span>
          </button>
        </div>

        <div class="grid">
          <div class="list-col">
            <div class="search-row">
              <UInput
                v-model="searchQuery"
                :placeholder="searchPlaceholder"
                class="w-full"
                @keydown.enter="emit('search')"
              />
              <UButton color="neutral" variant="ghost" icon="i-lucide-search" @click="emit('search')" />
            </div>

            <div :class="layout === 'cards' ? 'cards-grid' : 'rows-list'">
              <slot name="item-list" :select="(id: string) => selectedId = id" :selected-id="selectedId" />
            </div>
          </div>

          <div class="preview-col">
            <slot name="preview" :selected-id="selectedId">
              <div class="preview-empty">템플릿을 선택하면 미리보기가 표시됩니다.</div>
            </slot>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="footer-actions">
        <UButton color="neutral" variant="outline" @click="onCancel">취소</UButton>
        <UButton class="btn-confirm" :disabled="!selectedId" @click="onConfirm">확인</UButton>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.picker-body { padding: 8px 0 16px; }
.modal-title {
  font-size: var(--fz-3xl);
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 16px;
}
.tabs {
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 16px;
}
.tab {
  padding: 10px 20px;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  font-size: var(--fz-lg);
  font-weight: 500;
  color: var(--gray-500);
  cursor: pointer;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.tab.is-active {
  color: var(--color-sky-vivid);
  border-bottom-color: var(--color-sky-vivid);
  font-weight: 700;
}
.tab-sub {
  font-size: var(--fz-sm);
  color: var(--gray-400);
}
.tab.is-active .tab-sub {
  color: var(--color-sky-vivid);
}
.grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  min-height: 420px;
}
.search-row {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
}
.cards-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: 480px;
  overflow-y: auto;
}
.rows-list {
  max-height: 480px;
  overflow-y: auto;
}
.preview-col {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-empty {
  text-align: center;
  color: var(--gray-500);
  font-size: var(--fz-md);
  line-height: 1.6;
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
