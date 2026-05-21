<script setup lang="ts">
export interface PushSample {
  id: string
  name: string
  title: string
  body: string
  purpose: 'info' | 'ad'
}

withDefaults(defineProps<{ open: boolean, title?: string }>(), { title: '샘플 템플릿 선택' })
const emit = defineEmits<{ close: [], pick: [tpl: PushSample] }>()

const PURPOSE_LABEL = { info: '일반용', ad: '광고용' } as const

const SAMPLES: PushSample[] = [
  { id: 'p1', name: '회원가입 환영', title: '가입을 환영합니다 🎉', body: '#{name}님, 맑은 메시징에 오신 것을 환영합니다. 지금 바로 시작해 보세요!', purpose: 'info' },
  { id: 'p2', name: '업로드 완료 알림', title: '업로드가 완료되었습니다', body: '요청하신 파일 업로드가 정상적으로 완료되었습니다.', purpose: 'info' },
  { id: 'p3', name: '예약 리마인더', title: '예약 안내', body: '#{name}님, 예약하신 일정이 곧 시작됩니다. 잊지 말고 확인해 주세요.', purpose: 'info' },
  { id: 'p4', name: '할인 이벤트 안내', title: '🔥 오늘만 특별 할인', body: '봄맞이 최대 40% 할인! 지금 앱에서 확인하세요.', purpose: 'ad' },
]

const search = ref('')
const picked = ref<PushSample | null>(null)
const filtered = computed(() => SAMPLES.filter(s => !search.value || s.name.includes(search.value)))

function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" :title="title" :width="780" @close="emit('close')">
    <div class="ps-grid">
      <div>
        <div class="ps-search">
          <input v-model="search" class="input" placeholder="샘플 템플릿명을 입력하세요.">
          <UIcon name="i-lucide-search" class="text-sm ps-search-icon" />
        </div>
        <div class="ps-cards">
          <button
            v-for="s in filtered"
            :key="s.id"
            type="button"
            class="ps-card"
            :class="{ on: picked?.id === s.id }"
            @click="picked = s"
          >
            <div class="ps-card-name">
              {{ s.name }}
            </div>
            <div class="ps-card-title">
              {{ s.title }}
            </div>
            <div class="ps-card-body">
              {{ s.body }}
            </div>
            <div class="ps-card-tag">
              {{ PURPOSE_LABEL[s.purpose] }}
            </div>
          </button>
          <div v-if="!filtered.length" class="ps-empty">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>

      <div class="ps-preview">
        <AppPushPreview
          platform="ios"
          app-name="맑은 메시징"
          :title="picked?.title ?? ''"
          :body="picked?.body ?? ''"
        />
        <p v-if="!picked" class="ps-preview-hint">
          템플릿을 선택하면 미리보기가 표시됩니다.
        </p>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!picked" @click="confirm">
        선택
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.ps-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 18px;
}
@media (max-width: 720px) {
  .ps-grid { grid-template-columns: 1fr; }
}

.ps-search {
  position: relative;
  margin-bottom: 12px;
}
.ps-search .input {
  width: 100%;
  padding-right: 34px;
}
.ps-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
}

.ps-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-height: 360px;
  overflow: auto;
}
@media (max-width: 560px) {
  .ps-cards { grid-template-columns: 1fr; }
}
.ps-card {
  position: relative;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  padding: 13px 14px 28px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.ps-card:hover {
  border-color: var(--ink-200);
}
.ps-card.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.ps-card-name {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 4px;
}
.ps-card-title {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  margin-bottom: 4px;
}
.ps-card-body {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ps-card-tag {
  position: absolute;
  right: 12px;
  bottom: 9px;
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--accent-ink);
}
.ps-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 36px 0;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}

.ps-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.ps-preview-hint {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  text-align: center;
}
</style>
