<script setup lang="ts">
interface Tpl {
  id: number
  name: string
  subject?: string
  body: string
  vars: string[]
  type?: string
  images?: { name: string, size: number }[]
}

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], pick: [Tpl] }>()

const tab = ref<'sms' | 'lms' | 'mms'>('sms')
const search = ref('')
const picked = ref<Tpl | null>(null)

const templates: Record<string, Tpl[]> = {
  sms: [
    { id: 1, name: '웃음 3월', body: '웃음의 분량이 곧 행복의 분량입니다^^ 오늘도 실컷 웃고 행복하세요♥……^ 멋진 3월(^o^)', vars: [] },
    { id: 2, name: '3월의 활기', body: '새로운 세상이 눈앞에 펼쳐지는 설렘 가득한 3월입니다. 봄의 활기를 한껏 즐기는 하루 되세요~', vars: [] },
    { id: 3, name: '3월 중순', body: '언뜻 달력 보니 벌써 3월 중순을 향해 달려가고 있어요. 곧 벚꽃이 만개한 봄이 다가오겠네요.', vars: [] },
    { id: 4, name: '3월, 봄바람', body: '불어오는 봄바람이 한층 포근해진 3월입니다. 계절의 흐름이 느껴지는 달. 봄기운 충전하세요^^!', vars: [] },
    { id: 5, name: '봄기운 3월', body: '얼었던 땅이 녹으면 봄나물들이 올라와 봄기운을 한층 북돋아줍니다. 봄처럼활기넘치는3월되세요', vars: [] },
    { id: 6, name: '봄맞이 3월', body: '마음이 간질간질해지는봄, 새롭게 시작하는 3월입니다. 웅크린 마음을 열고 미소짓는 하루되세요', vars: [] },
    { id: 7, name: '3월의 시작', body: '완연한 봄을 맞이하는 3월입니다. 포근한 봄처럼 마음까지 따스한 3월 보내시길 바랄게요~', vars: [] },
    { id: 8, name: '3월 경칩', body: '만물이 움트는 3월의 절기 경칩입니다. 행복한 봄맞이 시작해보세요^^ 당신을 응원합니다!', vars: [] }
  ],
  lms: [
    { id: 11, name: 'VIP 회원 안내', subject: 'VIP 회원 등급 안내', body: '#{이름}님께서 VIP 등급으로 승급되셨습니다.\n\n- 5% 추가 적립\n- 무료 배송\n- 전용 상담 전화\n\n앞으로도 최고의 혜택으로 보답하겠습니다.', vars: ['이름'] },
    { id: 12, name: '이벤트 안내', subject: '봄맞이 특별 이벤트', body: '봄맞이 최대 40% 할인 이벤트가 진행 중입니다.\n\n쿠폰코드: SPRING\n적용기간: 3월 31일까지\n\n지금 바로 만나보세요.', vars: [] }
  ],
  mms: [
    { id: 21, name: '봄 신상품 화보', subject: '봄 신상품 출시', body: '봄 신상품이 도착했습니다. 화보로 먼저 만나보세요.', vars: [], images: [{ name: 'spring-lookbook.jpg', size: 248_000 }] },
    { id: 22, name: '할인 쿠폰', subject: '15% 할인 쿠폰 도착', body: '#{이름}님께 드리는 15% 할인 쿠폰입니다. 이미지를 매장에서 보여주세요.', vars: ['이름'], images: [{ name: 'coupon-15.jpg', size: 162_000 }] },
    { id: 23, name: '리뉴얼 매장 안내', subject: '리뉴얼 매장 안내', body: '리뉴얼 오픈한 매장 안내도입니다. 많은 방문 바랍니다.', vars: [], images: [{ name: 'store-map.jpg', size: 205_000 }, { name: 'store-front.jpg', size: 188_000 }] }
  ]
}

function selectTab(t: 'sms' | 'lms' | 'mms') {
  tab.value = t
  picked.value = null
}
const filtered = computed(() =>
  (templates[tab.value] ?? []).filter(t => !search.value || t.name.includes(search.value)))

function confirm() {
  if (picked.value) {
    emit('pick', { ...picked.value, type: tab.value })
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" title="샘플 템플릿 선택" :width="860" @close="emit('close')">
    <div class="tabs" style="margin-bottom: 16px">
      <div
        v-for="t in (['sms', 'lms', 'mms'] as const)"
        :key="t"
        :class="['tab', { active: tab === t }]"
        @click="selectTab(t)"
      >
        {{ t.toUpperCase() }} {{ t === 'sms' ? '(단문)' : t === 'lms' ? '(장문)' : '(포토)' }}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 280px; gap: 16px">
      <div>
        <div style="position: relative; margin-bottom: 12px">
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
        <div class="tpl-grid">
          <button
            v-for="t in filtered"
            :key="t.id"
            type="button"
            class="tpl-card"
            :class="{ on: picked?.id === t.id }"
            @click="picked = t"
          >
            <div class="tpl-name">
              {{ t.name }}
            </div>
            <div v-if="t.subject" class="tpl-subject">
              {{ t.subject }}
            </div>
            <div class="tpl-body">
              {{ t.body }}
            </div>
            <div class="tpl-byte">
              {{ byteLen(t.body) }}byte
            </div>
          </button>
          <div v-if="filtered.length === 0" class="muted" style="grid-column: 1 / -1; text-align: center; padding: 32px 0">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>

      <div style="display: grid; place-items: start center">
        <AppPhonePreview
          sender-name="1588-1234"
          :message="picked ? picked.body : ''"
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
.tpl-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 440px;
  overflow: auto;
}
@media (max-width: 720px) {
  .tpl-grid { grid-template-columns: 1fr; }
}
.tpl-card {
  position: relative;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  padding: 14px 14px 26px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.tpl-card:hover { border-color: var(--ink-200); }
.tpl-card.on { border-color: var(--accent); background: var(--accent-soft); }
.tpl-name {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 6px;
}
.tpl-subject {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-700);
  margin-bottom: 4px;
}
.tpl-body {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tpl-byte {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--info);
}
</style>
