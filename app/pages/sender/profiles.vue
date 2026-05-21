<script setup lang="ts">
import type { ProfileRegisterResult } from '~/components/AppProfileRegisterDialog.vue'

useHead({ title: '발신 프로필 관리' })
const toast = useToast()

type TokenStatus = '완료' | '미완료' | '진행 중'
type ProfileStatus = '정상' | '차단' | '대기'

interface SenderProfile {
  id: string
  profileId: string
  sendKey: string
  registeredAt: string
  tokenStatus: TokenStatus
  profileStatus: ProfileStatus
}

const KAKAO_CHANNEL_URL = 'https://center-pf.kakao.com'

/* 목업 데이터 — 백엔드(malgn-noti-api) 연동 시 교체 */
const rows = ref<SenderProfile[]>([
  {
    id: 'p1',
    profileId: '@위캔디오',
    sendKey: '30c4fef0c603ab315b21b86ee5708bbc00bf86f9',
    registeredAt: '2026-02-04 13:28',
    tokenStatus: '완료',
    profileStatus: '정상',
  },
])

const search = ref('')
const selected = ref<string[]>([])
const page = ref(1)
const PAGE_SIZE = 10

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return q ? rows.value.filter(r => r.profileId.toLowerCase().includes(q)) : rows.value
})
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paged = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))
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

function tokenTone(s: TokenStatus) {
  return s === '완료' ? 'success' : s === '진행 중' ? 'warning' : 'neutral'
}
function profileTone(s: ProfileStatus) {
  return s === '정상' ? 'success' : s === '차단' ? 'error' : 'warning'
}

function onSearch() {
  page.value = 1
}
function onRefresh() {
  selected.value = []
  page.value = 1
  search.value = ''
  toast.add({ title: '발신 프로필 목록을 새로고침했습니다.', color: 'info', icon: 'i-lucide-rotate-cw' })
}

/* ── 모달 ─────────────────────────────────────────── */
const openRegister = ref(false)
const openGroup = ref(false)
const openDelete = ref(false)

function onRegistered(result: ProfileRegisterResult) {
  rows.value = [
    { id: `p${Date.now()}`, ...result },
    ...rows.value,
  ]
  page.value = 1
}

function onDeleteConfirm() {
  const count = selected.value.length
  rows.value = rows.value.filter(r => !selected.value.includes(r.id))
  selected.value = []
  openDelete.value = false
  toast.add({ title: `발신 프로필 ${count}건을 삭제했습니다.`, color: 'info', icon: 'i-lucide-info' })
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="row" style="justify-content: space-between; align-items: flex-end">
        <div>
          <div class="crumb">
            발신 정보 · 발신 프로필
          </div>
          <h1>발신 프로필 관리</h1>
        </div>
        <button type="button" class="btn btn-primary" @click="openRegister = true">
          <UIcon name="i-lucide-plus" class="text-[length:var(--fz-sm)]" /> 발신 프로필 등록
        </button>
      </div>
    </div>

    <!-- 안내 -->
    <ul class="notice">
      <li>
        발신 프로필을 등록하려면 카카오톡 채널이 생성되어야 합니다. 카카오톡 홈페이지에서 카카오톡 채널을 생성하세요.
        <a :href="KAKAO_CHANNEL_URL" target="_blank" rel="noopener" class="notice-cta">[카카오톡 채널 생성 바로 가기]</a>
        <ul>
          <li>(참고) 발신 프로필을 등록하려면 카카오톡 채널 등록 후 비즈니스 인증을 받아야 합니다.</li>
        </ul>
      </li>
      <li>
        발신 프로필 등록을 위해 토큰 인증을 진행해야 합니다.
        <ul>
          <li>발신 프로필 등록 정보 입력 후 토큰 요청 시 입력한 관리자 휴대폰 번호로 토큰 번호 6자리가 전송됩니다.</li>
          <li>토큰 번호를 입력하여 발신 프로필 등록을 완료하세요.</li>
        </ul>
      </li>
      <li>
        알림톡 일별 최대 발송량은 <strong>1,000건으로 기본 설정</strong>되어 있습니다.
        일별 최대 발송량을 변경하려면 <strong>[고객 센터]</strong>로 문의하세요.
      </li>
    </ul>

    <!-- 목록 -->
    <div class="list-card">
      <div class="list-toolbar">
        <div class="row" style="gap: 6px; flex-wrap: wrap">
          <button
            type="button"
            class="btn btn-error btn-sm"
            :disabled="selected.length === 0"
            @click="openDelete = true"
          >
            발신 프로필 삭제
          </button>
          <button type="button" class="btn btn-outline-dark btn-sm" @click="openGroup = true">
            발신 프로필 그룹 관리
          </button>
          <div class="search-box">
            <input
              v-model="search"
              class="input"
              placeholder="발신 프로필 아이디를 입력하세요."
              @keydown.enter="onSearch"
            >
            <button type="button" class="search-btn" aria-label="검색" @click="onSearch">
              <UIcon name="i-lucide-search" class="text-[length:var(--fz-md)]" />
            </button>
          </div>
        </div>
        <div class="row" style="gap: 6px">
          <button type="button" class="btn btn-ghost btn-sm" @click="onRefresh">
            <UIcon name="i-lucide-rotate-cw" class="text-[length:var(--fz-sm)]" /> 새로고침
          </button>
          <span class="toolbar-count">총 <strong>{{ filtered.length }}</strong>개</span>
        </div>
      </div>

      <div class="list-table-scroll">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 36px">
                <span class="checkbox">
                  <input type="checkbox" :checked="allChecked" @change="toggleAll">
                </span>
              </th>
              <th>발신 프로필 아이디</th>
              <th>발신 키</th>
              <th>등록 일시</th>
              <th>토큰 인증 상태</th>
              <th>발신 프로필 상태</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in paged" :key="r.id" :class="{ selected: selected.includes(r.id) }">
              <td>
                <span class="checkbox">
                  <input type="checkbox" :checked="selected.includes(r.id)" @change="toggleOne(r.id)">
                </span>
              </td>
              <td>{{ r.profileId }}</td>
              <td class="cell-mono">
                {{ r.sendKey }}
              </td>
              <td class="cell-mono">
                {{ r.registeredAt }}
              </td>
              <td>
                <AppBadge :tone="tokenTone(r.tokenStatus)">
                  {{ r.tokenStatus }}
                </AppBadge>
              </td>
              <td>
                <AppBadge :tone="profileTone(r.profileStatus)">
                  {{ r.profileStatus }}
                </AppBadge>
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td colspan="6" style="text-align: center; padding: 48px 12px; color: var(--ink-500)">
                {{ search ? '검색 결과가 없습니다.' : '등록된 발신 프로필이 없습니다.' }}
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

    <!-- 모달 -->
    <AppProfileRegisterDialog
      :open="openRegister"
      @close="openRegister = false"
      @registered="onRegistered"
    />
    <AppProfileGroupDialog :open="openGroup" @close="openGroup = false" />

    <AppConfirmDialog
      :open="openDelete"
      title="발신 프로필 삭제"
      :message="`선택한 발신 프로필 ${selected.length}건을 삭제하시겠습니까?\n삭제된 발신 프로필은 알림톡 발송에 사용할 수 없습니다.`"
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
.notice > li {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.8;
}
.notice ul {
  margin: 2px 0 4px;
  padding-left: 18px;
  list-style: circle;
}
.notice ul li {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.7;
}
.notice strong {
  color: var(--ink-700);
  font-weight: 600;
}
.notice-cta {
  color: var(--danger-ink);
  font-weight: 600;
}
.notice-cta:hover {
  text-decoration: underline;
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
.search-box {
  position: relative;
  width: 260px;
  max-width: 100%;
}
.search-box .input {
  height: 28px;
  padding-right: 32px;
  font-size: var(--fz-sm);
}
.search-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 28px;
  width: 30px;
  display: grid;
  place-items: center;
  background: none;
  border: 0;
  color: var(--ink-400);
}
.search-btn:hover {
  color: var(--ink-900);
}
.toolbar-count {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  white-space: nowrap;
  padding-left: 12px;
  margin-left: 4px;
  border-left: 1px solid var(--line);
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
