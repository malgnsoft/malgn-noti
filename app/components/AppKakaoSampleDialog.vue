<script setup lang="ts">
export interface KakaoSample {
  id: string
  name: string
  msgType: 'basic' | 'channel' | 'extra' | 'composite'
  emphasis: 'none' | 'highlight' | 'image' | 'itemlist'
  body: string
  extra?: string
}

withDefaults(defineProps<{ open: boolean, title?: string }>(), { title: '샘플 템플릿 선택' })
const emit = defineEmits<{ close: [], pick: [tpl: KakaoSample] }>()

const MSG_TYPES = [
  { v: 'basic', l: '기본형' },
  { v: 'channel', l: '채널 추가형' },
  { v: 'extra', l: '부가 정보형' },
  { v: 'composite', l: '복합형' },
] as const
const EMPHASIS = [
  { v: 'none', l: '선택 안함' },
  { v: 'highlight', l: '강조 표기형' },
  { v: 'image', l: '이미지형' },
  { v: 'itemlist', l: '아이템 리스트형' },
] as const

const SAMPLES: KakaoSample[] = [
  { id: 's1', name: '회원가입 환영', msgType: 'basic', emphasis: 'none', body: '#{name}님, 가입을 환영합니다.\n쏠쏠과 함께 즐거운 활동을 시작해 보세요.' },
  { id: 's2', name: '본인 인증 코드', msgType: 'basic', emphasis: 'highlight', body: '아래 인증번호를 입력해 주세요.\n유효 시간: 3분' },
  { id: 's3', name: '신상품 출시 안내', msgType: 'basic', emphasis: 'image', body: '신상품이 출시되었습니다.\n지금 바로 확인해 보세요!' },
  { id: 's4', name: '주문 내역 확인', msgType: 'basic', emphasis: 'itemlist', body: '#{name}님의 주문이 정상 접수되었습니다.' },
  { id: 's5', name: '결제 완료 안내', msgType: 'extra', emphasis: 'none', body: '결제가 완료되었습니다.\n주문번호: #{orderNo}', extra: '주문 내역은 마이페이지에서 확인하실 수 있습니다.' },
  { id: 's6', name: '적립금 만료 안내', msgType: 'extra', emphasis: 'image', body: '#{name}님의 적립금 #{point}P가 곧 만료됩니다.', extra: '만료 전 사용해 주세요.' },
  { id: 's7', name: '채널 추가 안내', msgType: 'channel', emphasis: 'none', body: '채널을 추가하고 다양한 소식을 가장 먼저 받아보세요.' },
  { id: 's8', name: '이벤트 종합 안내', msgType: 'composite', emphasis: 'itemlist', body: '이번 달 진행 중인 이벤트를 한눈에 확인하세요.' },
]

const tab = ref<KakaoSample['msgType']>('basic')
const emphasis = ref<'all' | KakaoSample['emphasis']>('all')
const search = ref('')
const picked = ref<KakaoSample | null>(null)

function selectTab(t: KakaoSample['msgType']) {
  tab.value = t
  emphasis.value = 'all'
  picked.value = null
}

const filtered = computed(() => SAMPLES.filter(s =>
  s.msgType === tab.value
  && (emphasis.value === 'all' || s.emphasis === emphasis.value)
  && (!search.value || s.name.includes(search.value))))

function emphasisLabel(e: KakaoSample['emphasis']) {
  return EMPHASIS.find(x => x.v === e)?.l ?? ''
}
function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" :title="title" :width="820" @close="emit('close')">
    <div class="tabs" style="margin-bottom: 14px">
      <div
        v-for="t in MSG_TYPES"
        :key="t.v"
        :class="['tab', { active: tab === t.v }]"
        @click="selectTab(t.v)"
      >
        {{ t.l }}
      </div>
    </div>

    <div class="ks-grid">
      <div>
        <div class="ks-chips">
          <span class="ks-chip-label">강조 유형</span>
          <button
            type="button"
            class="ks-chip"
            :class="{ on: emphasis === 'all' }"
            @click="emphasis = 'all'"
          >
            전체
          </button>
          <button
            v-for="e in EMPHASIS"
            :key="e.v"
            type="button"
            class="ks-chip"
            :class="{ on: emphasis === e.v }"
            @click="emphasis = e.v"
          >
            {{ e.l }}
          </button>
        </div>

        <div class="ks-search">
          <input v-model="search" class="input" placeholder="샘플 템플릿명을 입력하세요.">
          <UIcon name="i-lucide-search" class="text-sm ks-search-icon" />
        </div>

        <div class="ks-cards">
          <button
            v-for="s in filtered"
            :key="s.id"
            type="button"
            class="ks-card"
            :class="{ on: picked?.id === s.id }"
            @click="picked = s"
          >
            <div class="ks-card-name">
              {{ s.name }}
            </div>
            <div class="ks-card-body">
              {{ s.body }}
            </div>
            <div class="ks-card-tags">
              <span class="ks-tag">{{ MSG_TYPES.find(m => m.v === s.msgType)?.l }}</span>
              <span v-if="s.emphasis !== 'none'" class="ks-tag ks-tag--em">{{ emphasisLabel(s.emphasis) }}</span>
            </div>
          </button>
          <div v-if="!filtered.length" class="ks-empty">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>

      <div class="ks-preview">
        <AppKakaoPreview
          profile-name="맑은소프트"
          :body="picked ? picked.body : ''"
          :extra="picked?.extra ?? ''"
        />
        <p v-if="!picked" class="ks-preview-hint">
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
.ks-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 18px;
}
@media (max-width: 720px) {
  .ks-grid { grid-template-columns: 1fr; }
}

.ks-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.ks-chip-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-right: 4px;
}
.ks-chip {
  padding: 5px 11px;
  border: 1px solid var(--line);
  border-radius: var(--r-full);
  background: var(--white);
  font-size: var(--fz-sm);
  color: var(--ink-600);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.ks-chip:hover {
  border-color: var(--ink-200);
}
.ks-chip.on {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-weight: 600;
}

.ks-search {
  position: relative;
  margin-bottom: 12px;
}
.ks-search .input {
  width: 100%;
  padding-right: 34px;
}
.ks-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
}

.ks-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-height: 360px;
  overflow: auto;
}
@media (max-width: 560px) {
  .ks-cards { grid-template-columns: 1fr; }
}
.ks-card {
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  padding: 13px 14px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.ks-card:hover {
  border-color: var(--ink-200);
}
.ks-card.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.ks-card-name {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 6px;
}
.ks-card-body {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.6;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
}
.ks-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.ks-tag {
  font-size: var(--fz-xs);
  padding: 2px 8px;
  border-radius: var(--r-sm);
  background: var(--ink-100);
  color: var(--ink-600);
}
.ks-tag--em {
  background: var(--accent-soft);
  color: var(--accent-ink);
}
.ks-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 36px 0;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}

.ks-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.ks-preview-hint {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  text-align: center;
}
</style>
