<script setup lang="ts">
interface PushTpl { id: number, name: string, title: string, body: string }

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], pick: [PushTpl] }>()

const TEMPLATES: PushTpl[] = [
  { id: 1, name: '01_가입환영', title: '가입을 환영합니다', body: '#{name}님, 서비스 가입을 환영합니다.' },
  { id: 2, name: '02_이벤트안내', title: '진행 중인 이벤트가 있어요', body: '#{name}님, 지금 참여 가능한 이벤트를 확인해 보세요.' },
  { id: 3, name: '03_결제완료', title: '결제가 완료되었습니다', body: '#{name}님, 결제가 정상적으로 완료되었습니다.' }
]

const search = ref('')
const picked = ref<PushTpl | null>(TEMPLATES[0])
const filtered = computed(() => TEMPLATES.filter(t => !search.value || t.name.includes(search.value)))

function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" title="템플릿 선택" :width="720" @close="emit('close')">
    <div style="display: grid; grid-template-columns: 1fr 280px; gap: 16px">
      <div>
        <div style="position: relative">
          <input
            v-model="search"
            class="input"
            placeholder="템플릿 이름을 입력하세요."
            style="padding-right: 32px"
          >
          <UIcon
            name="i-lucide-search"
            class="text-sm"
            style="position: absolute; right: 10px; top: 11px; color: var(--ink-400)"
          />
        </div>
        <div class="table-wrap" style="margin-top: 10px">
          <table class="table">
            <thead>
              <tr>
                <th style="text-align: center">
                  템플릿 이름
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in filtered"
                :key="t.id"
                :class="{ selected: picked?.id === t.id }"
                style="cursor: pointer"
                @click="picked = t"
              >
                <td>{{ t.name }}</td>
              </tr>
              <tr v-if="filtered.length === 0">
                <td class="muted" style="text-align: center; padding: 28px 0">
                  검색 결과가 없습니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="row" style="justify-content: center; gap: 4px; margin-top: 12px">
          <button class="btn btn-outline btn-sm btn-icon" disabled>
            <UIcon name="i-lucide-chevrons-left" class="text-sm" />
          </button>
          <button class="btn btn-outline btn-sm btn-icon" disabled>
            <UIcon name="i-lucide-chevron-left" class="text-sm" />
          </button>
          <button class="btn btn-primary btn-sm" style="min-width: 30px; padding: 0">
            1
          </button>
          <button class="btn btn-outline btn-sm btn-icon" disabled>
            <UIcon name="i-lucide-chevron-right" class="text-sm" />
          </button>
          <button class="btn btn-outline btn-sm btn-icon" disabled>
            <UIcon name="i-lucide-chevrons-right" class="text-sm" />
          </button>
        </div>
      </div>

      <div class="pt-preview">
        <template v-if="picked">
          <div class="pt-title">
            {{ picked.title }}
          </div>
          <div class="pt-body">
            {{ picked.body }}
          </div>
        </template>
        <AppEmptyState
          v-else
          icon="i-lucide-bell"
          title="템플릿을 선택해 주세요"
          desc="좌측 목록에서 PUSH 템플릿을 고르세요."
        />
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!picked" @click="confirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.pt-preview {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--paper);
  padding: 20px;
  min-height: 240px;
}
.pt-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 8px;
}
.pt-body {
  font-size: 13px;
  color: var(--ink-600);
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>
