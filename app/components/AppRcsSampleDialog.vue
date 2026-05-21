<script setup lang="ts">
export interface RcsSample {
  id: string
  name: string
  msgType: 'sms' | 'lms' | 'mms'
  body: string
  tag: string
}

withDefaults(defineProps<{ open: boolean, title?: string }>(), { title: '샘플 템플릿 선택' })
const emit = defineEmits<{ close: [], pick: [tpl: RcsSample] }>()

const TABS = [
  { v: 'sms', l: 'SMS' },
  { v: 'lms', l: 'LMS' },
  { v: 'mms', l: 'MMS' },
] as const

const SAMPLES: RcsSample[] = [
  { id: 'r1', name: '회원가입 환영', msgType: 'sms', body: '#{name}님, 가입을 환영합니다. 쏠쏠과 함께 시작해 보세요.', tag: 'SMS' },
  { id: 'r2', name: '본인 인증 코드', msgType: 'sms', body: '인증번호: #{code}', tag: 'SMS' },
  { id: 'r3', name: '통합 SMS 카드 안내', msgType: 'sms', body: '간단한 안내 카드 메시지입니다.', tag: '통합SMS카드' },
  { id: 'r4', name: '주문 완료 안내', msgType: 'lms', body: '#{name}님, 주문이 정상 접수되었습니다.\n\n주문번호: #{orderNo}\n결제금액: #{amount}원\n\n빠르게 준비해 발송해 드리겠습니다.', tag: 'LMS' },
  { id: 'r5', name: '예약 확정 안내', msgType: 'lms', body: '예약이 확정되었습니다.\n\n일시: #{date}\n장소: #{place}\n\n변경은 마이페이지에서 가능합니다.', tag: 'LMS' },
  { id: 'r6', name: '신상품 화보', msgType: 'mms', body: '봄 신상품이 도착했습니다. 대표 이미지로 먼저 만나보세요.', tag: 'MMS' },
  { id: 'r7', name: '쿠폰 발급 안내', msgType: 'mms', body: '#{name}님께 드리는 15% 할인 쿠폰입니다. 첨부 이미지를 매장에서 보여주세요.', tag: 'MMS' },
]

const tab = ref<RcsSample['msgType']>('sms')
const search = ref('')
const picked = ref<RcsSample | null>(null)

function selectTab(t: RcsSample['msgType']) {
  tab.value = t
  picked.value = null
}
const filtered = computed(() => SAMPLES.filter(s =>
  s.msgType === tab.value && (!search.value || s.name.includes(search.value))))

function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" :title="title" :width="800" @close="emit('close')">
    <div class="tabs" style="margin-bottom: 14px">
      <div
        v-for="t in TABS"
        :key="t.v"
        :class="['tab', { active: tab === t.v }]"
        @click="selectTab(t.v)"
      >
        {{ t.l }}
      </div>
    </div>

    <div class="rs-grid">
      <div>
        <div class="rs-search">
          <input v-model="search" class="input" placeholder="샘플 템플릿명을 입력하세요.">
          <UIcon name="i-lucide-search" class="text-sm rs-search-icon" />
        </div>
        <div class="rs-cards">
          <button
            v-for="s in filtered"
            :key="s.id"
            type="button"
            class="rs-card"
            :class="{ on: picked?.id === s.id }"
            @click="picked = s"
          >
            <div class="rs-card-name">
              {{ s.name }}
            </div>
            <div class="rs-card-body">
              {{ s.body }}
            </div>
            <div class="rs-card-tag">
              {{ s.tag }}
            </div>
          </button>
          <div v-if="!filtered.length" class="rs-empty">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>

      <div class="rs-preview">
        <AppRcsPreview
          brand-name="맑은소프트"
          :body="picked ? picked.body : ''"
        />
        <p v-if="!picked" class="rs-preview-hint">
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
.rs-grid {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 18px;
}
@media (max-width: 720px) {
  .rs-grid { grid-template-columns: 1fr; }
}

.rs-search {
  position: relative;
  margin-bottom: 12px;
}
.rs-search .input {
  width: 100%;
  padding-right: 34px;
}
.rs-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
}

.rs-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-height: 360px;
  overflow: auto;
}
@media (max-width: 560px) {
  .rs-cards { grid-template-columns: 1fr; }
}
.rs-card {
  position: relative;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  padding: 13px 14px 28px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.rs-card:hover {
  border-color: var(--ink-200);
}
.rs-card.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.rs-card-name {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 6px;
}
.rs-card-body {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.6;
  white-space: pre-line;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rs-card-tag {
  position: absolute;
  right: 12px;
  bottom: 9px;
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--accent-ink);
}
.rs-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 36px 0;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}

.rs-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.rs-preview-hint {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  text-align: center;
}
</style>
