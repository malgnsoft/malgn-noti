<script setup lang="ts">
import type { ApprovalStatus, SenderNumber, SenderRegisterResult } from '~/types/sender'

useHead({ title: '발신 번호 관리' })
const toast = useToast()

/* 목업 데이터 — 백엔드(malgn-noti-api) 연동 시 교체 */
const rows = ref<SenderNumber[]>([
  {
    id: 's1',
    type: '대표자 번호, 사업자 자체 번호',
    number: '16447143',
    status: '승인',
    requestedAt: '2026-04-09 17:23',
    approvedAt: '2026-04-10 16:04',
  },
])

const selected = ref<string[]>([])
const page = ref(1)
const PAGE_SIZE = 10

const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / PAGE_SIZE)))
const paged = computed(() => rows.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
const allChecked = computed(
  () => paged.value.length > 0 && paged.value.every(r => selected.value.includes(r.id)),
)

function toggleAll() {
  selected.value = allChecked.value ? [] : paged.value.map(r => r.id)
}
function toggleOne(id: string) {
  selected.value = selected.value.includes(id)
    ? selected.value.filter(x => x !== id)
    : [...selected.value, id]
}

function statusTone(s: ApprovalStatus) {
  return s === '승인' ? 'success' : s === '심사중' ? 'warning' : s === '반려' ? 'error' : 'neutral'
}

/* ── 모달 ─────────────────────────────────────────── */
const openRegister = ref(false)
const openGuide = ref(false)
const openDelete = ref(false)

function onRegistered(result: SenderRegisterResult) {
  rows.value = [
    { id: `s${Date.now()}`, ...result },
    ...rows.value,
  ]
  page.value = 1
}

function onDeleteConfirm() {
  const count = selected.value.length
  rows.value = rows.value.filter(r => !selected.value.includes(r.id))
  selected.value = []
  openDelete.value = false
  toast.add({ title: `발신 번호 ${count}건을 삭제했습니다.`, color: 'info', icon: 'i-lucide-info' })
}

</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발신 정보 · 발신 번호
          </div>
          <h1>발신 번호 관리</h1>
        </div>
        <button type="button" class="btn btn-primary" @click="openRegister = true">
          <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 발신 번호 등록
        </button>
      </div>
    </div>

    <!-- 안내 -->
    <ul class="notice">
      <li>전기통신사업법 관련 고시 준수를 위해 발신 번호 등록 시 발신 번호에 대한 명의자 인증이 필요합니다.</li>
      <li>명의자 인증 시 회원 및 발신 번호 유형에 따라 인증 방법과 필요한 서류가 결정됩니다.</li>
    </ul>

    <!-- 목록 -->
    <div class="list-card">
      <div class="list-toolbar">
        <div class="row" style="gap: 10px; flex-wrap: wrap">
          <span class="toolbar-count">총 <strong>{{ rows.length }}</strong>개</span>
        </div>
        <div class="row" style="gap: 6px; flex-wrap: wrap">
          <button type="button" class="btn btn-outline-dark btn-sm" @click="openGuide = true">
            발신 번호 등록 안내
          </button>
          <button
            type="button"
            class="btn btn-error btn-sm"
            :disabled="selected.length === 0"
            @click="openDelete = true"
          >
            선택 삭제
          </button>
        </div>
      </div>

      <div class="list-table-scroll">
        <!-- B 테이블 스타일 — 검색 영역 없는 단순 목록 (docs/DESIGN.md §6.5) -->
        <table class="table" data-table-style="b">
          <thead>
            <tr>
              <th style="width: 36px">
                <label class="checkbox"><input type="checkbox" :checked="allChecked" @change="toggleAll"></label>
              </th>
              <th>발신 번호 유형</th>
              <th>발신 번호</th>
              <th>승인 상태</th>
              <th>요청 일시</th>
              <th>승인 일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id" :class="{ selected: selected.includes(r.id) }">
              <td>
                <label class="checkbox">
                  <input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)">
                </label>
              </td>
              <td>{{ r.type }}</td>
              <td class="cell-mono">
                {{ r.number }}
              </td>
              <td>
                <AppBadge :tone="statusTone(r.status)">
                  {{ r.status }}
                </AppBadge>
              </td>
              <td class="cell-mono">
                {{ r.requestedAt }}
              </td>
              <td class="cell-mono">
                {{ r.approvedAt }}
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td colspan="6" style="text-align: center; padding: 48px 12px; color: var(--ink-500)">
                등록된 발신 번호가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="list-pager">
        <button class="pager-btn" :disabled="page === 1" aria-label="처음" @click="page = 1">
          <UIcon name="i-lucide-chevrons-left" class="text-sm" />
        </button>
        <button class="pager-btn" :disabled="page === 1" aria-label="이전" @click="page--">
          <UIcon name="i-lucide-chevron-left" class="text-sm" />
        </button>
        <button
          v-for="n in pageCount"
          :key="n"
          class="pager-btn"
          :class="{ 'pager-btn--active': n === page }"
          @click="page = n"
        >
          {{ n }}
        </button>
        <button class="pager-btn" :disabled="page === pageCount" aria-label="다음" @click="page++">
          <UIcon name="i-lucide-chevron-right" class="text-sm" />
        </button>
        <button class="pager-btn" :disabled="page === pageCount" aria-label="마지막" @click="page = pageCount">
          <UIcon name="i-lucide-chevrons-right" class="text-sm" />
        </button>
      </div>
    </div>

    <!-- 발신 번호 등록 마법사 -->
    <AppSenderRegisterDialog
      :open="openRegister"
      @close="openRegister = false"
      @registered="onRegistered"
    />

    <!-- 등록 안내 모달 -->
    <AppModal :open="openGuide" title="발신 번호 등록 안내" :width="600" @close="openGuide = false">
      <div class="guide">
        <p class="guide-intro">
          전기통신사업법 관련 고시 준수를 위해, 발신 번호 등록 시 회원 및 발신 번호 유형에 따라
          다음과 같이 인증 방법과 필요 서류가 결정됩니다.
        </p>
        <div class="guide-table-wrap">
          <table class="guide-table">
            <thead>
              <tr>
                <th class="col-type">발신 번호 유형</th>
                <th>필요 서류</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="col-type">대표자 번호, 사업자 자체 번호</td>
                <td>통신서비스 이용증명원</td>
              </tr>
              <tr>
                <td class="col-type">임직원 번호</td>
                <td>통신서비스 이용증명원, 재직증명서</td>
              </tr>
              <tr>
                <td class="col-type">타사 번호</td>
                <td>통신서비스 이용증명원, 이용승낙서, 사업자등록증, 관계 확인 문서</td>
              </tr>
              <tr>
                <td class="col-type">타인 번호</td>
                <td>통신서비스 이용증명원, 이용승낙서</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <div class="guide-footer">
          <button type="button" class="btn btn-primary" style="min-width: 120px" @click="openGuide = false">
            확인
          </button>
        </div>
      </template>
    </AppModal>

    <!-- 삭제 확인 -->
    <AppConfirmDialog
      :open="openDelete"
      title="발신 번호 삭제"
      :message="`선택한 발신 번호 ${selected.length}건을 삭제하시겠습니까?\n삭제된 발신 번호는 발송에 사용할 수 없습니다.`"
      confirm-label="삭제"
      danger
      @close="openDelete = false"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>

<style scoped>
.notice {
  margin: 0 0 16px;
  padding: 14px 18px 14px 34px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  list-style: disc;
}
.notice li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.7;
}

.list-card {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  overflow: hidden;
}
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.toolbar-count {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  white-space: nowrap;
}
.toolbar-count strong {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--ink-900);
}
.list-table-scroll {
  overflow-x: auto;
}

.list-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 12px;
  border-top: 1px solid var(--line);
}
.pager-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  color: var(--ink-600);
  font-size: var(--fz-sm);
  font-variant-numeric: tabular-nums;
}
.pager-btn:hover:not(:disabled):not(.pager-btn--active) {
  background: var(--ink-50);
  border-color: var(--ink-200);
}
.pager-btn:disabled {
  color: var(--ink-300);
  cursor: not-allowed;
}
.pager-btn--active {
  background: var(--ink-900);
  border-color: var(--ink-900);
  color: var(--white);
}

/* 안내 모달 */
.guide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.guide-intro {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
  margin: 0;
}
.guide-table-wrap {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
}
.guide-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fz-sm);
}
.guide-table th {
  background: var(--ink-50);
  padding: 10px 14px;
  font-weight: 600;
  color: var(--ink-700);
  text-align: left;
}
.guide-table td {
  padding: 12px 14px;
  border-top: 1px solid var(--line);
  color: var(--ink-700);
  line-height: 1.6;
}
.guide-table .col-type {
  text-align: center;
  white-space: nowrap;
  width: 220px;
}
.guide-table td.col-type {
  font-weight: 500;
  color: var(--ink-900);
}
.guide-table tbody tr:hover { background: var(--paper); }

.guide-footer {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
