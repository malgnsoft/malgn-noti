<script setup lang="ts">
import type { KakaoTpl } from '~/types/template'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], pick: [KakaoTpl] }>()

const KAKAO_TEMPLATES: KakaoTpl[] = [
  { id: 'K001', name: '주문 완료 안내', type: 'basic', body: '안녕하세요 #{이름}님,\n\n주문이 정상 접수되었습니다.\n\n■ 주문번호: #{주문번호}\n■ 상품: #{상품명}\n■ 결제금액: #{금액}원\n\n빠르게 준비하여 발송해 드리겠습니다.', buttons: [{ type: 'web', label: '주문 상세 보기' }] },
  { id: 'K002', name: '배송 시작 안내', type: 'extra', body: '#{이름}님, 주문하신 상품이 출고되었습니다.\n\n■ 운송장: #{운송장번호}\n■ 택배사: CJ대한통운\n■ 예상 도착: 내일까지', extra: '* 직접 수령이 어려운 경우 안전한 곳에 보관해 주세요.\n* 문의: 1588-1234', buttons: [{ type: 'web', label: '배송 조회' }, { type: 'phone', label: '고객센터' }] },
  { id: 'K003', name: '회원가입 환영', type: 'basic', body: '#{이름}님, 몰리몰리 회원이 되신 것을 환영합니다! 🎉\n\n신규 회원 혜택으로 10% 할인 쿠폰을 발급해 드렸어요.', buttons: [{ type: 'web', label: '쿠폰 확인하기' }] },
  { id: 'K004', name: '결제 완료 (인증)', type: 'auth', body: '결제가 정상 완료되었습니다.\n\n주문번호: #{주문번호}\n결제수단: 신용카드 #{카드사}\n승인금액: #{금액}원', buttons: [] }
]

const picked = ref<KakaoTpl | null>(null)
const search = ref('')
const filtered = computed(() => KAKAO_TEMPLATES.filter(t => !search.value || t.name.includes(search.value)))

function typeLabel(t: KakaoTpl['type']) {
  return t === 'basic' ? '기본형' : t === 'extra' ? '부가정보형' : '인증형'
}
function typeTone(t: KakaoTpl['type']) {
  return t === 'basic' ? 'neutral' : t === 'extra' ? 'primary' : 'warning'
}
function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" title="알림톡 템플릿 선택" :width="860" @close="emit('close')">
    <div style="display: grid; grid-template-columns: 340px 1fr; gap: 16px">
      <div>
        <input v-model="search" class="input" placeholder="템플릿 검색">
        <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px; max-height: 360px; overflow: auto">
          <div
            v-for="t in filtered"
            :key="t.id"
            class="ktpl"
            :class="{ 'ktpl-on': picked?.id === t.id }"
            @click="picked = t"
          >
            <div class="row" style="justify-content: space-between">
              <div style="font-size: 13px; font-weight: 600; color: var(--ink-900)">
                {{ t.name }}
              </div>
              <AppBadge :tone="typeTone(t.type)">
                {{ typeLabel(t.type) }}
              </AppBadge>
            </div>
            <div style="font-size: 11px; color: var(--ink-500); margin-top: 6px; line-height: 1.4">
              {{ t.body.split('\n')[0].slice(0, 36) }}…
            </div>
          </div>
        </div>
      </div>
      <div class="ktpl-preview">
        <AppKakaoPreview
          v-if="picked"
          profile-name="(주)몰리몰리"
          :body="picked.body"
          :extra="picked.extra"
          :buttons="picked.buttons"
        />
        <AppEmptyState
          v-else
          icon="i-lucide-message-square"
          title="템플릿을 선택해 주세요"
          desc="좌측 목록에서 사전 승인 템플릿을 고르세요."
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
.ktpl {
  padding: 12px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--white);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.ktpl:hover { border-color: var(--ink-200); }
.ktpl-on { border-color: var(--accent); background: var(--accent-soft); }
.ktpl-preview {
  display: grid;
  place-items: center;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 20px;
}
</style>
