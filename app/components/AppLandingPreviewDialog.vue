<script setup lang="ts">
defineProps<{ open: boolean, type: 'basic' | 'extended' }>()
const emit = defineEmits<{ close: [] }>()

const categories = [
  '봄 의류 — 최대 50% 할인',
  '홈 인테리어 — 최대 40% 할인',
  '뷰티 베스트 — 1+1 또는 30% 할인',
  '캠핑·아웃도어 — 신상 입고 + 20% 즉시 할인',
]
const benefits = [
  '5만 원 이상 구매 시 무료 배송',
  '회원 등급별 추가 적립금 최대 5%',
  '모바일 앱 구매 시 즉시 사용 가능한 1,000원 쿠폰',
]
</script>

<template>
  <AppModal
    :open="open"
    :title="`미리보기 - 랜딩페이지 (${type === 'extended' ? '확장형' : '기본형'})`"
    :width="960"
    @close="emit('close')"
  >
    <div class="lp-stage">
      <div class="lp-page">
        <!-- 로고 -->
        <div class="lp-logo-row">
          <span class="lp-logo">L</span>
          <span class="lp-brand">LIVELY SHOP</span>
        </div>

        <!-- 헤로 배너 -->
        <div class="lp-hero">
          BIG SALE UP TO 50%
        </div>

        <!-- 타이틀 -->
        <div class="lp-title">
          4월, 한 해 중 가장 큰 세일
        </div>
        <div class="lp-subtitle">
          전 상품 최대 50% · 4월 30일 자정 종료
        </div>

        <!-- 콘텐츠 -->
        <div class="lp-content">
          <div class="lp-callout">
            🛒 1년에 단 한 번, 봄맞이 빅세일
          </div>
          <p class="lp-para">
            4월 한 달 동안 LIVELY SHOP의 전 상품을 최대 50% 할인된 가격으로 만나보세요.
            베스트셀러 카테고리는 단 3일간 추가 10% 쿠폰이 적용됩니다.
          </p>

          <div class="lp-sec">
            이번 세일의 추천 카테고리
          </div>
          <ul class="lp-list">
            <li v-for="c in categories" :key="c">
              {{ c }}
            </li>
          </ul>

          <div class="lp-sec">
            함께 확인하세요
          </div>
          <ul class="lp-list">
            <li v-for="b in benefits" :key="b">
              {{ b }}
            </li>
          </ul>

          <p class="lp-para">
            인기 상품은 빠르게 품절될 수 있으니 미리 장바구니에 담아 두세요.
          </p>
        </div>

        <!-- CTA -->
        <button type="button" class="lp-cta">
          세일 상품 보러가기
        </button>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-sky lp-confirm" @click="emit('close')">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.lp-stage {
  background: var(--ink-50);
  border-radius: var(--r-md);
  padding: 24px;
  min-height: 74vh;
}
.lp-page {
  max-width: 680px;
  margin: 0 auto;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 32px 28px;
}

/* 로고 */
.lp-logo-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--line);
}
.lp-logo {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: var(--r-sm);
  background: #f15a22;
  color: #fff;
  font-size: var(--fz-md);
  font-weight: 800;
}
.lp-brand {
  font-size: var(--fz-lg);
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--ink-900);
}

/* 헤로 */
.lp-hero {
  margin: 22px 0;
  padding: 56px 24px;
  background: #fbe6a4;
  border-radius: var(--r-md);
  text-align: center;
  font-size: 30px;
  font-weight: 800;
  color: #7c4a12;
  letter-spacing: 0.01em;
}

/* 타이틀 */
.lp-title {
  text-align: center;
  font-size: 21px;
  font-weight: 700;
  color: var(--ink-900);
}
.lp-subtitle {
  margin-top: 6px;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}

/* 콘텐츠 */
.lp-content {
  margin-top: 22px;
  padding: 22px;
  background: var(--ink-50);
  border-radius: var(--r-md);
}
.lp-callout {
  padding: 14px 16px;
  background: var(--white);
  border: 1px solid var(--line);
  border-left: 3px solid #f15a22;
  border-radius: var(--r-sm);
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}
.lp-para {
  margin: 14px 0;
  font-size: var(--fz-md);
  color: var(--ink-600);
  line-height: 1.8;
  white-space: pre-line;
}
.lp-sec {
  margin: 18px 0 8px;
  padding-left: 8px;
  border-left: 3px solid var(--ink-900);
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}
.lp-list {
  margin: 0;
  padding-left: 18px;
  list-style: none;
}
.lp-list li {
  position: relative;
  padding: 4px 0 4px 12px;
  font-size: var(--fz-md);
  color: var(--ink-700);
  line-height: 1.6;
}
.lp-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 13px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4fc0fc;
}

/* CTA */
.lp-cta {
  display: block;
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  border: 0;
  border-radius: var(--r-md);
  background: #f15a22;
  color: #fff;
  font-size: var(--fz-md);
  font-weight: 700;
  cursor: pointer;
}
.lp-confirm {
  width: 100%;
}
</style>
