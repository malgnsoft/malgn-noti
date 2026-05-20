<script setup lang="ts">
useHead({ title: '크레딧 충전' })
const toast = useToast()

const presets = [50000, 100000, 300000, 500000, 1000000]
const amount = ref(100000)
const method = ref('card')

const bonus = computed(() =>
  amount.value >= 1000000 ? Math.floor(amount.value * 0.05)
    : amount.value >= 300000 ? Math.floor(amount.value * 0.03) : 0)
const vat = computed(() => Math.round(amount.value * 0.1))
const total = computed(() => Math.round(amount.value * 1.1))

const methods = [
  { id: 'card', name: '신용 / 체크카드', desc: '즉시 충전 · 모든 카드 가능', icon: 'i-lucide-credit-card' },
  { id: 'transfer', name: '계좌이체 (가상계좌)', desc: '1~10분 내 입금 확인 · 세금계산서 가능', icon: 'i-lucide-building-2' },
  { id: 'auto', name: '자동충전 등록', desc: '잔액 부족 시 자동으로 일정 금액 충전', icon: 'i-lucide-refresh-cw' }
]
const recent = [
  { d: '2026-05-01 09:14', amt: '300,000원', m: '신용카드', g: 309000 },
  { d: '2026-04-01 10:02', amt: '100,000원', m: '신용카드', g: 100000 },
  { d: '2026-03-01 11:30', amt: '500,000원', m: '계좌이체', g: 515000 }
]
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        계정 · 충전하기
      </div>
      <h1>크레딧 충전</h1>
      <p>30만원 이상 충전 시 3%, 100만원 이상 5% 보너스 크레딧이 추가 지급됩니다.</p>
    </div>

    <div class="content-2col">
      <div>
        <div class="card" style="margin-bottom: 16px">
          <div class="card-header">
            <div class="title">
              충전 금액
            </div>
          </div>
          <div class="card-body">
            <div class="preset-grid">
              <button
                v-for="p in presets"
                :key="p"
                :class="amount === p ? 'btn btn-primary' : 'btn btn-outline'"
                style="height: 56px; font-size: 14px; font-weight: 600"
                @click="amount = p"
              >
                {{ (p / 10000).toLocaleString() }}만
              </button>
            </div>
            <div class="row" style="align-items: center; gap: 8px; margin-top: 14px">
              <input
                v-model.number="amount"
                type="number"
                class="input"
                step="10000"
                style="flex: 1; font-size: 18px; text-align: right; padding-right: 14px; height: 48px"
              >
              <strong style="font-size: 16px">원</strong>
            </div>
            <div class="charge-credit">
              <span style="font-size: 13px; color: var(--ink-700)">지급 크레딧</span>
              <strong class="num" style="font-size: 18px; color: var(--accent-ink)">
                {{ (amount + bonus).toLocaleString() }} C
                <span v-if="bonus > 0" style="font-size: 12px; font-weight: 500; margin-left: 8px; color: var(--accent-ink)">
                  +{{ bonus.toLocaleString() }} 보너스
                </span>
              </strong>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 16px">
          <div class="card-header">
            <div class="title">
              결제 수단
            </div>
          </div>
          <div class="card-body">
            <div class="col" style="gap: 6px">
              <label
                v-for="m in methods"
                :key="m.id"
                class="radio pay-method"
                :class="{ on: method === m.id }"
              >
                <input type="radio" :checked="method === m.id" @change="method = m.id">
                <div class="row" style="flex: 1; gap: 12px">
                  <UIcon :name="m.icon" class="text-xl" style="color: var(--accent-ink)" />
                  <div>
                    <div style="font-size: 14px; font-weight: 600; color: var(--ink-900)">
                      {{ m.name }}
                    </div>
                    <div style="font-size: 12px; color: var(--ink-500); margin-top: 2px">
                      {{ m.desc }}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="title">
              최근 결제 내역
            </div>
          </div>
          <div class="card-body" style="padding: 0">
            <table class="table">
              <thead>
                <tr>
                  <th>일시</th><th>금액</th><th>방법</th><th>상태</th><th />
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in recent" :key="i">
                  <td class="muted">
                    {{ r.d }}
                  </td>
                  <td class="num">
                    <strong>{{ r.amt }}</strong> <span class="muted" style="font-size: 11px">({{ r.g.toLocaleString() }} C)</span>
                  </td>
                  <td>{{ r.m }}</td>
                  <td><AppBadge tone="success" dot>완료</AppBadge></td>
                  <td>
                    <button class="btn btn-ghost btn-sm">
                      <UIcon name="i-lucide-download" class="text-[12px]" /> 영수증
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="aside" style="display: flex; flex-direction: column; gap: 16px">
        <div class="credit-hero">
          <div class="label">
            현재 잔액
          </div>
          <div class="number">
            <span>245,800</span><span class="unit">C</span>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div style="font-size: 13px; font-weight: 700; margin-bottom: 10px; color: var(--ink-900)">
              결제 요약
            </div>
            <div class="col" style="gap: 8px; font-size: 13px">
              <div class="row" style="justify-content: space-between">
                <span class="muted">충전 금액</span><span class="num">{{ amount.toLocaleString() }}원</span>
              </div>
              <div class="row" style="justify-content: space-between">
                <span class="muted">보너스 크레딧</span>
                <span class="num" style="color: var(--accent-ink)">+{{ bonus.toLocaleString() }} C</span>
              </div>
              <div class="row" style="justify-content: space-between">
                <span class="muted">부가세 (10%)</span><span class="num">{{ vat.toLocaleString() }}원</span>
              </div>
              <div class="h-divider" />
              <div class="row" style="justify-content: space-between; font-size: 15px">
                <strong>총 결제 금액</strong>
                <strong class="num" style="color: var(--accent-ink)">{{ total.toLocaleString() }}원</strong>
              </div>
            </div>
            <button
              class="btn btn-primary btn-lg"
              style="width: 100%; margin-top: 14px"
              @click="toast.add({ title: '결제 페이지로 이동합니다.', color: 'success', icon: 'i-lucide-credit-card' })"
            >
              <UIcon name="i-lucide-credit-card" class="text-[14px]" /> 결제하기
            </button>
            <div class="muted" style="font-size: 11px; margin-top: 8px; text-align: center; line-height: 1.5">
              결제 즉시 크레딧이 충전됩니다. 세금계산서 발행 가능합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preset-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
@media (max-width: 640px) {
  .preset-grid { grid-template-columns: repeat(3, 1fr); }
}
.charge-credit {
  margin-top: 12px;
  padding: 14px;
  background: var(--accent-soft);
  border: 1px solid rgba(0, 220, 130, 0.2);
  border-radius: var(--r-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pay-method {
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  cursor: pointer;
}
.pay-method.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
</style>
