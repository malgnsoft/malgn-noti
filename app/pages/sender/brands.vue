<script setup lang="ts">
import type { ApprovalStatus } from '~/types/sender'

useHead({ title: 'RCS 브랜드 관리' })
const toast = useToast()

interface Brand {
  id: string
  name: string
  brandId: string
  status: ApprovalStatus
  approvedAt: string
  linkedAt: string
}

const RCS_BIZ_CENTER_URL = 'https://www.rcsbizcenter.com'

/* 목업 데이터 — 백엔드(malgn-noti-api) 연동 시 교체 */
const company = '주식회사 맑은소프트'
const rows = ref<Brand[]>([
  {
    id: 'b1',
    name: '위캔디오',
    brandId: 'BR-4wb1ika561',
    status: '승인',
    approvedAt: '2026-03-25 15:43',
    linkedAt: '2026-04-24 16:26',
  },
])

const page = ref(1)
const PAGE_SIZE = 10
const pageCount = computed(() => Math.max(1, Math.ceil(rows.value.length / PAGE_SIZE)))
const paged = computed(() => rows.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

function statusTone(s: ApprovalStatus) {
  return s === '승인' ? 'success' : s === '심사중' ? 'warning' : s === '반려' ? 'error' : 'neutral'
}

/* ── 브랜드 연동 ─────────────────────────────────── */
const openSync = ref(false)

function onSyncConfirm() {
  openSync.value = false
  rows.value = rows.value.map(r => ({
    ...r,
    linkedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  }))
  toast.add({
    title: `브랜드 연동이 완료되었습니다. 총 ${rows.value.length}개 브랜드가 조회되었습니다.`,
    color: 'success',
    icon: 'i-lucide-circle-check',
  })
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발신 정보 · RCS 브랜드
          </div>
          <h1>RCS 브랜드 관리</h1>
        </div>
        <button type="button" class="btn btn-primary" @click="openSync = true">
          <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 브랜드 연동
        </button>
      </div>
    </div>

    <!-- 안내 -->
    <ul class="notice">
      <li>
        <a :href="RCS_BIZ_CENTER_URL" target="_blank" rel="noopener" class="notice-link">RCS Biz Center</a>
        가입 후 브랜드를 등록해야 합니다. 브랜드 등록 후
        <a :href="RCS_BIZ_CENTER_URL" target="_blank" rel="noopener" class="notice-link">RCS Biz Center</a>
        브랜드 운영 관리 메뉴에서 (주)맑은소프트를 대행사로 지정하세요.
      </li>
      <li>브랜드는 본인 인증 시 첨부한 사업자등록증의 사업자등록번호를 기준으로 연동합니다.</li>
      <li>브랜드 연동이 완료되면 브랜드 목록이 조회됩니다.</li>
      <li>
        <a :href="RCS_BIZ_CENTER_URL" target="_blank" rel="noopener" class="notice-link">RCS Biz Center</a>
        에서 브랜드 정보를 변경한 경우 [브랜드 연동]을 클릭해 업데이트를 진행하세요.
      </li>
    </ul>

    <!-- 목록 -->
    <div class="list-card">
      <div class="list-toolbar">
        <div class="row" style="gap: 10px; flex-wrap: wrap">
          <span class="toolbar-count">총 <strong>{{ rows.length }}</strong>개</span>
        </div>
        <div class="company">
          업체명: <strong>{{ company }}</strong>
        </div>
      </div>

      <div class="list-table-scroll">
        <!-- B 테이블 스타일 — 검색 영역 없는 단순 목록 (doc/DESIGN.md §6.5) -->
        <table class="table" data-table-style="b">
          <thead>
            <tr>
              <th>브랜드 이름</th>
              <th>브랜드 아이디</th>
              <th>승인 상태</th>
              <th>승인 일시</th>
              <th>연동 일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id">
              <td>{{ r.name }}</td>
              <td class="cell-mono">
                {{ r.brandId }}
              </td>
              <td>
                <AppBadge :tone="statusTone(r.status)">
                  {{ r.status }}
                </AppBadge>
              </td>
              <td class="cell-mono">
                {{ r.approvedAt }}
              </td>
              <td class="cell-mono">
                {{ r.linkedAt }}
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td colspan="5" style="text-align: center; padding: 48px 12px; color: var(--ink-500)">
                연동된 브랜드가 없습니다. [브랜드 연동]을 클릭해 RCS Biz Center의 브랜드를 불러오세요.
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

    <!-- 브랜드 연동 확인 -->
    <AppConfirmDialog
      :open="openSync"
      title="브랜드 연동"
      message="RCS Biz Center에 등록된 사업자등록증의 사업자등록번호를 기준으로 브랜드를 연동합니다.
연동을 진행하시겠습니까?"
      confirm-label="연동"
      @close="openSync = false"
      @confirm="onSyncConfirm"
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
  line-height: 1.8;
}
.notice-link {
  color: var(--accent-ink);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.notice-link:hover {
  color: var(--ink-900);
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
  padding: 10px 12px 10px 20px;
  border-bottom: 1px solid var(--line);
}
.company {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.company strong {
  color: var(--ink-900);
  font-weight: 600;
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
</style>
