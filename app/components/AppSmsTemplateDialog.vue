<script setup lang="ts">
interface Tpl {
  id: number
  name: string
  subject?: string
  body: string
  hasImage?: boolean
  vars: string[]
  type?: string
}

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], pick: [Tpl] }>()

const tab = ref<'sms' | 'lms' | 'mms'>('sms')
const picked = ref<Tpl | null>(null)

const templates: Record<string, Tpl[]> = {
  sms: [
    { id: 1, name: '주문 완료 안내', body: '[몰리몰리] #{이름}님, 주문이 정상 접수되었습니다. 주문번호 #{주문번호}', vars: ['이름', '주문번호'] },
    { id: 2, name: '배송 시작 알림', body: '[몰리몰리] #{이름}님, 주문하신 상품이 출고되었습니다. 운송장 #{운송장번호}', vars: ['이름', '운송장번호'] },
    { id: 3, name: '결제 실패 안내', body: '[몰리몰리] 결제가 정상 처리되지 않았습니다. 카드 정보를 확인해 주세요.', vars: [] }
  ],
  lms: [
    { id: 11, name: 'VIP 회원 안내', subject: 'VIP 회원 등급 안내', body: '[몰리몰리] #{이름}님께서 VIP 등급으로 승급되셨습니다.\n\n- 5% 추가 적립\n- 무료 배송\n- 전용 상담 전화', vars: ['이름'] },
    { id: 12, name: '이벤트 안내', subject: '5월 가정의 달 이벤트', body: '[몰리몰리] 5월 가정의 달 맞이 최대 40% 할인 이벤트가 진행 중입니다.\n\n쿠폰코드: FAMILY5\n적용기간: 5월 31일까지', vars: [] }
  ],
  mms: [
    { id: 21, name: '신상품 화보', subject: '5월 신상품 출시', body: '[몰리몰리] 5월 신상품이 도착했습니다. 지금 만나보세요.', hasImage: true, vars: [] }
  ]
}

function selectTab(t: 'sms' | 'lms' | 'mms') {
  tab.value = t
  picked.value = null
}
function confirm() {
  if (picked.value) {
    emit('pick', { ...picked.value, type: tab.value })
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" title="템플릿 선택" :width="860" @close="emit('close')">
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
    <div style="display: grid; grid-template-columns: 320px 1fr; gap: 16px">
      <div style="max-height: 380px; overflow: auto; display: flex; flex-direction: column; gap: 6px">
        <div
          v-for="t in templates[tab]"
          :key="t.id"
          class="tpl-item"
          :class="{ 'tpl-item-on': picked?.id === t.id }"
          @click="picked = t"
        >
          <div style="font-size: 13px; font-weight: 600; color: var(--ink-900)">
            {{ t.name }}
          </div>
          <div style="font-size: 11px; color: var(--ink-500); margin-top: 4px">
            {{ t.subject ? t.subject + ' · ' : '' }}{{ t.vars.length }}개 치환자
          </div>
        </div>
      </div>
      <div class="tpl-preview">
        <template v-if="picked">
          <div style="font-size: 11px; color: var(--ink-500); margin-bottom: 6px">
            미리보기
          </div>
          <div v-if="picked.subject" style="font-size: 14px; font-weight: 700; margin-bottom: 8px; color: var(--ink-900)">
            {{ picked.subject }}
          </div>
          <div v-if="picked.hasImage" class="tpl-img">
            대표 이미지
          </div>
          <pre class="tpl-body">{{ picked.body }}</pre>
          <div v-if="picked.vars.length > 0" style="margin-top: 14px">
            <div style="font-size: 11px; color: var(--ink-500); margin-bottom: 6px">
              치환자
            </div>
            <div class="row" style="flex-wrap: wrap; gap: 6px">
              <AppBadge v-for="v in picked.vars" :key="v" tone="sky">
                #{{ '{' + v + '}' }}
              </AppBadge>
            </div>
          </div>
        </template>
        <AppEmptyState
          v-else
          icon="i-lucide-file-text"
          title="템플릿을 선택해 주세요"
          desc="좌측 목록에서 사용할 템플릿을 고르세요."
        />
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-sky" :disabled="!picked" @click="confirm">
        선택 완료
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.tpl-item {
  padding: 12px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--white);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.tpl-item:hover { border-color: var(--ink-200); }
.tpl-item-on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.tpl-preview {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 18px;
  min-height: 320px;
}
.tpl-img {
  height: 140px;
  background: var(--ink-100);
  border-radius: var(--r-md);
  margin-bottom: 10px;
  display: grid;
  place-items: center;
  color: var(--ink-500);
  font-weight: 600;
  font-size: 12px;
  font-family: var(--font-mono);
}
.tpl-body {
  font-family: inherit;
  white-space: pre-wrap;
  font-size: 13px;
  margin: 0;
  line-height: 1.6;
  color: var(--ink-800);
}
</style>
