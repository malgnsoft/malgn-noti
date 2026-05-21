<script setup lang="ts">
useHead({ title: '크레딧 충전' })

const toast = useToast()

/* 보유 크레딧 (목업 — 백엔드 연동 시 교체) */
const balance = 120000

/* 충전 금액 옵션 */
const AMOUNTS = [
  { value: 10000, bonus: 0 },
  { value: 50000, bonus: 0 },
  { value: 100000, bonus: 5000 },
  { value: 300000, bonus: 19500 },
  { value: 500000, bonus: 40000 },
  { value: 1000000, bonus: 100000 },
]
const selectedAmount = ref(100000)

/* 결제 카드 */
interface PayCard {
  id: string
  brand: string
  last4: string
  alias?: string
}
const cards = ref<PayCard[]>([
  { id: 'master', brand: 'MASTER', last4: '5547' },
  { id: 'visa', brand: 'VISA', last4: '6118' },
])
const selectedCard = ref('master')
const cardDialogOpen = ref(false)

const agreed = ref(false)
const canPay = computed(() => agreed.value && !!selectedCard.value)
const confirmOpen = ref(false)

const selectedMeta = computed(() => AMOUNTS.find(a => a.value === selectedAmount.value) ?? AMOUNTS[0]!)
const selectedCardMeta = computed(() => cards.value.find(c => c.id === selectedCard.value))

function addCard() {
  cardDialogOpen.value = true
}
function onCardRegistered(card: { brand: string, last4: string, alias: string }) {
  const id = `c${Date.now()}`
  cards.value = [...cards.value, { id, brand: card.brand, last4: card.last4, alias: card.alias || undefined }]
  selectedCard.value = id
  cardDialogOpen.value = false
}
function pay() {
  if (!canPay.value) {
    toast.add({ title: '구매 조건 동의 후 결제를 진행해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  confirmOpen.value = true
}
function confirmPay() {
  confirmOpen.value = false
  const card = selectedCardMeta.value
  navigateTo({
    path: '/charge/result',
    query: {
      amount: String(selectedAmount.value),
      bonus: String(selectedMeta.value.bonus),
      brand: card?.alias || card?.brand || 'CARD',
      last4: card?.last4 ?? '',
      before: String(balance),
    },
  })
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">CHARGE</div>
      <h1>충전하기</h1>
    </div>

    <div class="charge-grid">
      <!-- 좌측 — 충전 금액 선택 -->
      <section class="charge-card">
        <h2 class="cc-head">크레딧 충전 금액 선택</h2>

        <div class="balance-box">
          <span class="bal-ico"><UIcon name="i-lucide-wallet" /></span>
          <span class="bal-label">보유 크레딧</span>
          <span class="bal-amount">{{ balance.toLocaleString() }}</span>
          <span class="bal-note"><span class="cred-ico">C</span> = 1원 입니다</span>
        </div>

        <div class="amount-list">
          <label
            v-for="a in AMOUNTS"
            :key="a.value"
            class="amount-row"
            :class="{ on: selectedAmount === a.value }"
          >
            <input v-model="selectedAmount" type="radio" :value="a.value">
            <span class="amount-val">{{ a.value.toLocaleString() }}</span>
            <span class="cred-ico">C</span>
            <span v-if="a.bonus" class="amount-bonus">+ 보너스 {{ a.bonus.toLocaleString() }}</span>
          </label>
        </div>

        <div class="pay-amount">
          <span class="pa-label">결제 예정 금액</span>
          <div class="pa-value">
            {{ selectedAmount.toLocaleString() }} <span class="pa-unit">원</span>
          </div>
          <span class="pa-note">VAT 포함</span>
        </div>
      </section>

      <!-- 우측 — 결제하기 -->
      <section class="charge-card">
        <h2 class="cc-head">결제하기</h2>

        <h3 class="cc-sub">결제카드 등록</h3>
        <div class="card-list">
          <label
            v-for="c in cards"
            :key="c.id"
            class="card-row"
            :class="{ on: selectedCard === c.id }"
          >
            <input v-model="selectedCard" type="radio" :value="c.id">
            <span class="card-visual">{{ c.brand }}</span>
            <span class="card-info">
              <span class="card-brand">{{ c.alias || c.brand }}</span>
              <span class="card-num">**********{{ c.last4 }}</span>
            </span>
          </label>
        </div>
        <button type="button" class="btn btn-outline-dark add-card" @click="addCard">
          <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 카드 추가
        </button>

        <div class="refund-box">
          <strong class="rb-title">결제 및 환불안내</strong>
          <ul>
            <li>크레딧 유효기간은 없습니다. 단, 보너스 지급 크레딧의 유효기간은 1년이며, 유효기간 만료될 경우 자동 소멸됩니다.</li>
            <li>크레딧 차감은 보너스로 주어진 크레딧부터 차감됩니다.</li>
            <li>크레딧 환불시 보너스를 제외한 충전금액(기준 금액)에서 보너스를 포함한 실 사용 크레딧을 차감한 후 환불됩니다.</li>
            <li>크레딧 충전 관련하여 문의나 요청이 있으실 경우 <NuxtLink to="/account/inquiry" class="rb-link">문의하기</NuxtLink>로 연락주세요.</li>
          </ul>
        </div>

        <label class="checkbox agree-row">
          <input v-model="agreed" type="checkbox">
          <span>구매 조건을 확인하였으며 결제 진행에 동의합니다</span>
        </label>

        <button type="button" class="btn btn-primary pay-btn" :disabled="!canPay" @click="pay">
          결제하기
        </button>
      </section>
    </div>

    <AppCardAddDialog
      :open="cardDialogOpen"
      @close="cardDialogOpen = false"
      @registered="onCardRegistered"
    />

    <AppModal :open="confirmOpen" title="" :width="360" hide-close @close="confirmOpen = false">
      <div class="pay-confirm">
        <span class="pc-check"><UIcon name="i-lucide-check" /></span>
        <p class="pc-msg">크레딧 충전을 진행하시겠어요?</p>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-dark pc-btn" @click="confirmOpen = false">
          취소
        </button>
        <button type="button" class="btn btn-primary pc-btn" @click="confirmPay">
          확인
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.charge-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}
@media (max-width: 900px) {
  .charge-grid { grid-template-columns: 1fr; }
}

.charge-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 28px;
}
.cc-head {
  text-align: center;
  font-size: var(--fz-xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 20px;
}
.cc-sub {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 10px;
}

/* 크레딧 단위 아이콘 */
.cred-ico {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--ink-900);
  color: var(--white);
  font-size: var(--fz-2xs);
  font-weight: 700;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

/* 보유 크레딧 박스 */
.balance-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: var(--accent-soft);
  border: 1px solid rgba(0, 220, 130, 0.25);
  border-radius: var(--r-md);
  margin-bottom: 20px;
}
.bal-ico {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--r-md);
  background: var(--white);
  color: var(--accent-ink);
  font-size: var(--fz-lg);
}
.bal-label {
  font-size: var(--fz-sm);
  color: var(--ink-600);
}
.bal-amount {
  font-family: var(--font-mono);
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
}
.bal-note {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--fz-xs);
  color: var(--ink-500);
}

/* 금액 선택 리스트 */
.amount-list {
  display: flex;
  flex-direction: column;
  background: var(--ink-50);
  border-radius: var(--r-md);
  padding: 6px 4px;
}
.amount-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--r-sm);
  cursor: pointer;
}
.amount-row:hover { background: var(--white); }
.amount-row.on { background: var(--white); }
.amount-row input[type="radio"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--ink-300);
  border-radius: 50%;
  margin: 0;
  flex-shrink: 0;
  cursor: pointer;
  background: var(--white);
  transition: all 0.12s;
}
.amount-row input[type="radio"]:checked {
  border-color: var(--ink-900);
  background: var(--ink-900);
  box-shadow: inset 0 0 0 3px var(--white);
}
.amount-val {
  font-family: var(--font-mono);
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.amount-bonus {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--accent-ink);
}

/* 결제 예정 금액 */
.pay-amount {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.pa-label {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}
.pa-value {
  font-family: var(--font-mono);
  font-size: var(--fz-5xl);
  font-weight: 700;
  color: var(--ink-900);
  letter-spacing: -0.02em;
}
.pa-unit { font-size: var(--fz-2xl); }
.pa-note {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

/* 결제카드 리스트 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.card-row:hover { border-color: var(--ink-300); }
.card-row.on {
  border-color: var(--ink-900);
  background: var(--ink-50);
}
.card-row input[type="radio"] {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--ink-300);
  border-radius: 50%;
  margin: 0;
  flex-shrink: 0;
  cursor: pointer;
  background: var(--white);
  transition: all 0.12s;
}
.card-row input[type="radio"]:checked {
  border-color: var(--ink-900);
  background: var(--ink-900);
  box-shadow: inset 0 0 0 3px var(--white);
}
.card-visual {
  width: 46px;
  height: 30px;
  border-radius: 4px;
  background: linear-gradient(135deg, var(--ink-600), var(--ink-900));
  color: var(--white);
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: calc(7px * var(--fz-scale));
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.card-brand {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.card-num {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-500);
}
.add-card {
  width: 100%;
  height: 40px;
  margin-top: 8px;
}

/* 결제 및 환불안내 */
.refund-box {
  margin-top: 16px;
  padding: 14px 16px;
  background: var(--ink-50);
  border-radius: var(--r-md);
}
.rb-title {
  display: block;
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 8px;
}
.refund-box ul {
  margin: 0;
  padding-left: 16px;
  list-style: disc;
}
.refund-box li {
  font-size: var(--fz-xs);
  color: var(--ink-500);
  line-height: 1.7;
  margin-bottom: 4px;
}
.rb-link {
  color: var(--accent-ink);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

/* 동의 + 결제 버튼 */
.agree-row {
  margin-top: 16px;
  font-size: var(--fz-sm);
  color: var(--ink-700);
}
.pay-btn {
  width: 100%;
  height: 48px;
  margin-top: 14px;
  font-size: var(--fz-lg);
  font-weight: 600;
}

/* 결제 진행 컨펌 */
.pay-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 14px 0 6px;
}
.pc-check {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font-size: var(--fz-3xl);
  color: var(--accent-ink);
}
.pc-msg {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
  margin: 0;
}
.pc-btn {
  flex: 1;
  height: 40px;
}
</style>
