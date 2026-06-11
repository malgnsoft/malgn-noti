<script setup lang="ts">
const toast = useToast()
const api = useApi()

/* 서버 응답(TB_PAYMENT_METHOD, billingKey 마스킹) */
interface CardRow {
  id: number
  brand: string | null
  last4: string | null
  alias: string | null
  defaultYn: 'Y' | 'N'
}
interface SavedCard {
  id: number
  brand: string
  last4: string
  alias?: string
}

const cards = ref<SavedCard[]>([])
const defaultCard = ref<number | null>(null)   /* 라디오 선택 (대기) */
const savedDefault = ref<number | null>(null)   /* 저장된 기본 카드 */
const dirty = computed(() => defaultCard.value !== savedDefault.value)

async function load() {
  const res = await api<{ data: CardRow[], nextCursor: string | null }>('/payment-methods?limit=100')
  cards.value = res.data.map(r => ({
    id: r.id,
    brand: r.brand ?? 'CARD',
    last4: r.last4 ?? '----',
    alias: r.alias ?? undefined,
  }))
  const def = res.data.find(r => r.defaultYn === 'Y')
  savedDefault.value = def?.id ?? null
  defaultCard.value = def?.id ?? cards.value[0]?.id ?? null
}

// SSR에서 실패해도 죽지 않도록 swallow — client mount 시 재시도.
try { await load() }
catch { /* ignore (미승인 테넌트는 403) */ }
onMounted(() => {
  if (!cards.value.length) load().catch(() => { /* ignore */ })
})

const addOpen = ref(false)
const deleteTarget = ref<SavedCard | null>(null)
const deleteMessage = computed(() => {
  const c = deleteTarget.value
  return c ? `${c.alias || c.brand} (**********${c.last4}) 카드를 삭제하시겠습니까?` : ''
})

async function onRegistered(card: { brand: string, last4: string, alias: string }) {
  try {
    await api('/payment-methods', {
      method: 'POST',
      body: {
        pgProvider: 'mock',
        billingKeyBase64: btoa(`mock-billing-key-${card.last4}-${cards.value.length}`),
        brand: card.brand,
        last4: card.last4,
        alias: card.alias || undefined,
      },
    })
    await load()
  }
  catch {
    toast.add({ title: '카드 등록에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  addOpen.value = false
}
async function confirmDelete() {
  const c = deleteTarget.value
  if (!c) return
  try {
    await api(`/payment-methods/${c.id}`, { method: 'DELETE' })
    await load()
    toast.add({ title: '결제 카드가 삭제되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch {
    toast.add({ title: '카드 삭제에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  deleteTarget.value = null
}
async function saveDefault() {
  if (!defaultCard.value) {
    toast.add({ title: '기본으로 저장할 카드를 선택해 주세요.', color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  try {
    await api(`/payment-methods/${defaultCard.value}`, { method: 'PATCH', body: { defaultYn: 'Y' } })
    savedDefault.value = defaultCard.value
    toast.add({ title: '기본 결제 카드가 저장되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch {
    toast.add({ title: '기본 카드 저장에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}
</script>

<template>
  <div class="card-panel">
    <div class="ms-head">
      <h3>결제 카드 관리</h3>
    </div>
    <p class="cp-desc">크레딧 충전에 사용할 결제 카드를 등록하고 기본 카드를 선택하세요.</p>

    <div class="card-rows">
      <div
        v-for="c in cards"
        :key="c.id"
        class="card-row"
        :class="{ on: defaultCard === c.id }"
      >
        <label class="card-pick">
          <input v-model="defaultCard" type="radio" :value="c.id">
          <span class="card-visual">
            <span class="cv-bottom">{{ c.last4 }} <b>{{ c.brand }}</b></span>
          </span>
          <span class="card-info">
            <span class="card-brand">{{ c.alias || c.brand }}</span>
            <span class="card-num">**********{{ c.last4 }}</span>
          </span>
        </label>
        <span v-if="savedDefault === c.id" class="badge badge-success">기본 카드</span>
        <button type="button" class="btn btn-outline-dark btn-sm card-del" @click="deleteTarget = c">
          삭제
        </button>
      </div>

      <p v-if="!cards.length" class="card-empty">등록된 결제 카드가 없습니다.</p>
    </div>

    <div class="cp-actions">
      <button type="button" class="add-card-btn" @click="addOpen = true">
        <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 카드 추가
      </button>
      <button type="button" class="btn btn-primary btn-lg save-btn" :disabled="!dirty" @click="saveDefault">
        저장하기
      </button>
    </div>

    <AppCardAddDialog
      :open="addOpen"
      @close="addOpen = false"
      @registered="onRegistered"
    />
    <AppConfirmDialog
      :open="!!deleteTarget"
      title="결제 카드 삭제"
      :message="deleteMessage"
      confirm-label="삭제"
      danger
      @close="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.ms-head {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}

.cp-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: 0 0 16px;
}

.card-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}
.card-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  transition: border-color 0.12s;
}
.card-row.on { border-color: var(--ink-900); }

.card-pick {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  cursor: pointer;
}
.card-pick input[type="radio"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--ink-300);
  border-radius: 50%;
  margin: 0;
  flex-shrink: 0;
  cursor: pointer;
  background: var(--white);
  transition: all 0.12s;
}
.card-pick input[type="radio"]:checked {
  border-color: var(--ink-900);
  background: var(--ink-900);
  box-shadow: inset 0 0 0 3.5px var(--white);
}

.card-visual {
  width: 60px;
  height: 40px;
  border-radius: 5px;
  background: linear-gradient(135deg, var(--ink-600), var(--ink-900));
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  padding: 5px 7px;
}
.cv-bottom {
  font-family: var(--font-mono);
  font-size: calc(6px * var(--fz-scale));
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.cv-bottom b { font-weight: 700; margin-left: 3px; }

.card-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.card-brand {
  font-size: var(--fz-md);
  font-weight: 600;
  color: var(--ink-900);
}
.card-num {
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--ink-500);
}

.card-del { flex: 0 0 auto; }

.card-empty {
  padding: 32px 12px;
  text-align: center;
  font-size: var(--fz-sm);
  color: var(--ink-400);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}

.add-card-btn {
  min-width: 160px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 16px;
  border: 1px dashed var(--ink-300);
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-600);
  font-size: var(--fz-md);
  font-weight: 500;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.add-card-btn:hover {
  border-color: var(--ink-400);
  background: var(--ink-50);
  color: var(--ink-900);
}

.cp-actions {
  margin-top: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
.save-btn {
  min-width: 160px;
  font-weight: 600;
}
</style>
