<script setup lang="ts">
interface Flow {
  id: string
  name: string
  purpose: string
  channels: string
  createdAt: string
}

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const toast = useToast()

const flows = ref<Flow[]>([
  { id: 'uX32yFWZ', name: 'djkim', purpose: '일반용', channels: 'SMS, 알림톡', createdAt: '2026-04-23 10:01' }
])
const search = ref('')
const selected = ref<string[]>([])

const filtered = computed(() => flows.value.filter(f =>
  !search.value || (f.id + f.name).toLowerCase().includes(search.value.toLowerCase())))

function toggleAll(e: Event) {
  selected.value = (e.target as HTMLInputElement).checked ? filtered.value.map(f => f.id) : []
}
function toggleOne(id: string) {
  selected.value = selected.value.includes(id) ? selected.value.filter(x => x !== id) : [...selected.value, id]
}
function placeholder(msg: string) {
  toast.add({ title: msg, color: 'info', icon: 'i-lucide-info' })
}
</script>

<template>
  <AppModal :open="open" title="복합(플로우) 생성 관리" :width="920" @close="emit('close')">
    <div class="fm-info">
      <div>· 플로우 발송을 하려면 플로우를 먼저 생성해야 합니다.</div>
      <div>· 발송할 메시지 채널과 템플릿을 선택하고 발송 순서를 지정한 플로우를 생성하세요.</div>
    </div>

    <div class="fm-bar">
      <button type="button" class="btn btn-sky btn-sm" @click="placeholder('플로우 생성 화면은 준비 중입니다.')">
        <UIcon name="i-lucide-plus" class="text-[12px]" /> 플로우 생성
      </button>
      <button
        type="button"
        class="btn btn-soft btn-sm"
        :disabled="selected.length !== 1"
        @click="placeholder('플로우 수정 화면은 준비 중입니다.')"
      >
        플로우 수정
      </button>
      <button
        type="button"
        class="btn btn-error btn-sm"
        :disabled="selected.length === 0"
        @click="flows = flows.filter(f => !selected.includes(f.id)); selected = []"
      >
        플로우 삭제
      </button>
      <div style="position: relative; flex: 1; max-width: 240px">
        <input v-model="search" class="input" placeholder="플로우 이름을 입력하세요." style="padding-right: 30px">
        <UIcon name="i-lucide-search" class="text-sm" style="position: absolute; right: 10px; top: 11px; color: var(--ink-400)" />
      </div>
      <button type="button" class="btn btn-outline btn-sm" @click="placeholder('새로고침했습니다.')">
        <UIcon name="i-lucide-refresh-cw" class="text-[12px]" /> 새로고침
      </button>
      <button type="button" class="btn btn-outline btn-sm" disabled>
        ‹ 이전
      </button>
      <button type="button" class="btn btn-outline btn-sm" disabled>
        다음 ›
      </button>
      <span class="muted" style="font-size: 12px">총 {{ filtered.length }}개</span>
    </div>

    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 36px">
              <label class="checkbox">
                <input
                  type="checkbox"
                  :checked="selected.length === filtered.length && filtered.length > 0"
                  @change="toggleAll"
                >
              </label>
            </th>
            <th>플로우 아이디</th>
            <th>플로우 이름</th>
            <th>발송 목적</th>
            <th>메시지 채널</th>
            <th>생성 일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in filtered" :key="f.id" :class="{ selected: selected.includes(f.id) }">
            <td>
              <label class="checkbox">
                <input type="checkbox" :checked="selected.includes(f.id)" @change="toggleOne(f.id)">
              </label>
            </td>
            <td class="cell-mono">
              {{ f.id }}
            </td>
            <td style="color: var(--accent-ink); font-weight: 600">
              {{ f.name }}
            </td>
            <td>{{ f.purpose }}</td>
            <td>{{ f.channels }}</td>
            <td class="muted">
              {{ f.createdAt }}
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="muted" style="text-align: center; padding: 32px 0">
              생성된 플로우가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </AppModal>
</template>

<style scoped>
.fm-info {
  background: var(--ink-50);
  border-radius: var(--r-md);
  padding: 12px 14px;
  font-size: 12px;
  color: var(--ink-600);
  line-height: 1.7;
  margin-bottom: 14px;
}
.fm-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
</style>
