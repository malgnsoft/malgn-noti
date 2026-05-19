<script setup lang="ts">
interface RcsTpl { id: number, name: string }

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], pick: [RcsTpl] }>()

const TEMPLATES: RcsTpl[] = [
  { id: 1, name: '01_비디오팩생성' },
  { id: 2, name: '02-1_비디오팩생성2일경과_upload_N' },
  { id: 3, name: '02-2_비디오팩생성2일경과_upload_Y' },
  { id: 4, name: '03-1_비디오팩생성5일경과_upload_N' },
  { id: 5, name: '03-2_비디오팩생성5일경과_upload_Y' },
  { id: 6, name: '04_만기1일전' },
  { id: 7, name: '05_기간만료' },
  { id: 8, name: '06-1_사용량초과_스토리지_무료플랜' },
  { id: 9, name: '06-2_사용량초과_스토리지_구독플랜' }
]

const search = ref('')
const picked = ref<RcsTpl | null>(null)
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
        <div class="table-wrap" style="margin-top: 10px; max-height: 360px; overflow: auto">
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
      </div>
      <div class="rcs-tpl-side">
        RCS Biz Center 템플릿 유형은<br>미리보기를 지원하지 않습니다.
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" :disabled="!picked" @click="confirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.rcs-tpl-side {
  display: grid;
  place-items: center;
  text-align: center;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 20px;
  font-size: 12px;
  color: var(--ink-500);
  line-height: 1.7;
}
</style>
