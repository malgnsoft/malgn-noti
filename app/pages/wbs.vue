<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: 'WBS · 맑은 메시징' })

type Status = 'done' | 'in_progress' | 'pending' | 'blocked'

interface Task {
  id: string
  group?: string
  title: string
  status: Status
  owner: string
  note?: string
  targetDate?: string
  completionDate?: string
  href?: string
}

interface Stage {
  id: string
  no: string
  emoji: string
  name: string
  summary: string
  weight: number
  progress: number
  tasks: Task[]
}

interface WbsDocument {
  projectName: string
  lastUpdated: string
  stages: Stage[]
}

/* ── 상태 ───────────────────────────────────────────────────────────────── */
const api = useApi()
const auth = useAuthStore()
const toast = useToast()

const doc = ref<WbsDocument | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)

async function fetchDoc() {
  loading.value = true
  loadError.value = null
  try {
    const res = await api<{ data: WbsDocument }>('/wbs')
    doc.value = res.data
  }
  catch (e) {
    loadError.value = e instanceof Error ? e.message : 'WBS 조회 실패'
  }
  finally {
    loading.value = false
  }
}

await fetchDoc()

const STAGES = computed<Stage[]>(() => doc.value?.stages ?? [])
const PROJECT_NAME = computed(() => doc.value?.projectName ?? '맑은 메시징')
const LAST_UPDATED = computed(() => doc.value?.lastUpdated ?? '—')

/* ── 가중평균 / 합계 ─────────────────────────────────────────────────────── */
const weightedAverage = computed(() => {
  const stages = STAGES.value
  if (stages.length === 0) return 0
  const totalWeight = stages.reduce((s, x) => s + x.weight, 0)
  const numerator = stages.reduce((s, x) => s + x.weight * x.progress, 0)
  return Math.round((numerator / totalWeight) * 10) / 10
})

const allTasks = computed(() => STAGES.value.flatMap(s => s.tasks))
const totalCounts = computed(() => {
  const acc: Record<Status, number> = { done: 0, in_progress: 0, pending: 0, blocked: 0 }
  for (const t of allTasks.value) acc[t.status]++
  return acc
})

const statusMeta: Record<Status, { label: string, dot: string, chip: string }> = {
  done: { label: '완료', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: '진행 중', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  pending: { label: '대기', dot: 'bg-neutral-300', chip: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
  blocked: { label: '보류', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
}

/* ── 날짜 포맷 ──────────────────────────────────────────────────────────────
 * 정본 저장 포맷: `YYYY.MM.DD` (예: 2026.06.04).
 * 표시·편집 모두 이 포맷으로 통일.
 * 레거시(`5/8`·`5/11` 등 year 없는 값)는 2026년 기준으로 표시 변환만(R2 저장값은 다음 편집 시 정합화).
 */
function formatYmd(raw?: string): string {
  if (!raw) return ''
  if (/^\d{4}\.\d{2}\.\d{2}$/.test(raw)) return raw
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw.replace(/-/g, '.')
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})$/)
  if (m) return `2026.${m[1]!.padStart(2, '0')}.${m[2]!.padStart(2, '0')}`
  return raw
}

// `<input type="date">` 는 `YYYY-MM-DD`만 받음.
function toDateInputValue(raw?: string): string {
  const ymd = formatYmd(raw)
  return /^\d{4}\.\d{2}\.\d{2}$/.test(ymd) ? ymd.replace(/\./g, '-') : ''
}

// 저장 시 `YYYY-MM-DD` → `YYYY.MM.DD`.
function fromDateInputValue(v: string): string | null {
  const t = v.trim()
  if (!t) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null
  return t.replace(/-/g, '.')
}

function progressFill(pct: number) {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 30) return 'bg-amber-500'
  if (pct > 0) return 'bg-neutral-400'
  return 'bg-neutral-200'
}

function groupedTasks(stage: Stage) {
  const groups: { name: string, tasks: Task[] }[] = []
  for (const t of stage.tasks) {
    const name = t.group ?? ''
    let g = groups.find(x => x.name === name)
    if (!g) { g = { name, tasks: [] }; groups.push(g) }
    g.tasks.push(t)
  }
  return groups
}

function scrollToStage(id: string) {
  const el = document.getElementById(`stage-${id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ── 편집 모달 ───────────────────────────────────────────────────────────── */
const editing = ref<Task | null>(null)
const editForm = reactive({
  note: '',
  href: '',
  targetDate: '',
  completionDate: '',
  owner: '',
})
const saving = ref(false)

function openEdit(t: Task) {
  if (!auth.user) {
    toast.add({ title: '편집하려면 로그인 후 다시 시도하세요.', color: 'warning' })
    return
  }
  editing.value = t
  editForm.note = t.note ?? ''
  editForm.href = t.href ?? ''
  editForm.targetDate = toDateInputValue(t.targetDate)
  editForm.completionDate = toDateInputValue(t.completionDate)
  editForm.owner = t.owner ?? ''
}

function closeEdit() {
  editing.value = null
}

async function saveEdit() {
  const t = editing.value
  if (!t) return
  saving.value = true
  try {
    /* null → 필드 제거, undefined → 유지, 그 외 → 갱신.
       빈 문자열은 "제거"로 해석 (note/href/targetDate/completionDate). owner는 빈 값 불가. */
    const payload: Record<string, string | null> = {}
    payload.note = editForm.note.trim() === '' ? null : editForm.note.trim()
    payload.href = editForm.href.trim() === '' ? null : editForm.href.trim()
    payload.targetDate = fromDateInputValue(editForm.targetDate)
    payload.completionDate = fromDateInputValue(editForm.completionDate)
    if (editForm.owner.trim()) payload.owner = editForm.owner.trim()

    const res = await api<{ data: Task }>(`/wbs/tasks/${encodeURIComponent(t.id)}`, {
      method: 'PATCH',
      body: payload,
    })

    // 로컬 상태 갱신 (전체 reload 대신 in-place patch)
    Object.assign(t, res.data)
    closeEdit()
    toast.add({ title: '저장되었습니다.', color: 'success' })
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : '저장 실패'
    toast.add({ title: msg, color: 'error' })
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="wbs-page">
    <!-- 헤더 (로고 + WBS crumb) — /help와 동일 패턴 -->
    <header class="wbs-header">
      <div class="app-container wbs-header-inner">
        <NuxtLink to="/home" class="wbs-logo">
          <span class="wbs-logo-mark"><AppLogoMark /></span>
          <span class="wbs-logo-text">맑은</span>
          <span class="wbs-logo-sub">message</span>
        </NuxtLink>
        <span class="wbs-header-divider" />
        <span class="wbs-header-crumb">WBS</span>
        <span class="wbs-header-title">맑은 메시징 프로젝트 작업 내역</span>
        <a
          href="https://github.com/malgnsoft/malgn-noti/blob/main/doc/WBS.md"
          target="_blank"
          rel="noopener noreferrer"
          class="wbs-header-link"
        >
          doc/WBS.md
          <UIcon name="i-lucide-arrow-up-right" />
        </a>
      </div>
    </header>

    <main class="app-container wbs-body">
      <!-- 로딩 / 에러 -->
      <div v-if="loading" class="wbs-state">불러오는 중…</div>
      <div v-else-if="loadError" class="wbs-state wbs-state--err">
        WBS를 불러올 수 없습니다 — {{ loadError }}
        <button type="button" class="btn btn-outline-dark btn-sm" style="margin-left: 8px" @click="fetchDoc">
          다시 시도
        </button>
      </div>

      <template v-else-if="doc">
        <!-- Title -->
        <div class="wbs-title-row">
          <div>
            <h1 class="wbs-title">{{ PROJECT_NAME }}</h1>
            <p class="wbs-subtitle">
              NHN Cloud Notification Hub 기반 멀티 테넌트 메시징 SaaS · 마지막 현행화
              <b>{{ LAST_UPDATED }}</b>
              <span v-if="!auth.user" class="wbs-readonly-hint">
                · <NuxtLink to="/login?redirect=/wbs">로그인</NuxtLink>하면 편집 가능
              </span>
            </p>
          </div>
        </div>

        <!-- HERO STATS -->
        <section class="wbs-hero">
          <div class="hero-card hero-card--wide">
            <div class="hero-card-head">
              <div>
                <p class="hero-label">전체 진행률</p>
                <p class="hero-value">
                  {{ weightedAverage }}<span class="hero-value-unit">%</span>
                </p>
              </div>
              <p class="hero-note">가중평균 · 5단계</p>
            </div>
            <div class="hero-bar">
              <div class="hero-bar-fill" :style="{ width: weightedAverage + '%' }" />
            </div>
          </div>

          <div class="hero-card">
            <div class="hero-mini-head">
              <span class="hero-dot bg-emerald-500" />
              <p class="hero-label">완료</p>
            </div>
            <p class="hero-mini-value">
              {{ totalCounts.done }}<span class="hero-mini-total">/{{ allTasks.length }}</span>
            </p>
          </div>
          <div class="hero-card">
            <div class="hero-mini-head">
              <span class="hero-dot bg-amber-500" />
              <p class="hero-label">진행 중</p>
            </div>
            <p class="hero-mini-value">{{ totalCounts.in_progress }}</p>
          </div>
        </section>

        <!-- 단계별 진행률 (개요 리스트) -->
        <section class="mt-8">
          <div class="overview-head">
            <h2>단계별 진행률</h2>
            <p>행을 클릭하면 상세로 이동</p>
          </div>
          <ul class="overview-list">
            <li
              v-for="(s, i) in STAGES"
              :key="s.id"
              class="overview-row"
              :class="i > 0 ? 'overview-row--bordered' : ''"
              @click="scrollToStage(s.id)"
            >
              <span class="overview-emoji">{{ s.emoji }}</span>
              <span class="overview-no">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="overview-text">
                <p class="overview-name">{{ s.no }} · {{ s.name }}</p>
                <p class="overview-summary">{{ s.summary }}</p>
              </div>
              <span class="overview-count">{{ s.tasks.length }}건</span>
              <div class="overview-progress">
                <div class="overview-progress-track">
                  <div :class="['overview-progress-fill', progressFill(s.progress)]" :style="{ width: s.progress + '%' }" />
                </div>
                <span class="overview-progress-text">{{ s.progress }}%</span>
              </div>
              <span class="overview-arrow">→</span>
            </li>
          </ul>
        </section>

        <!-- STAGE 상세 -->
        <section
          v-for="(s, sIdx) in STAGES"
          :id="`stage-${s.id}`"
          :key="s.id"
          class="mt-12"
        >
          <div class="stage-head">
            <div class="stage-head-left">
              <span class="stage-emoji">{{ s.emoji }}</span>
              <h2 class="stage-name">{{ s.no }} · {{ s.name }}</h2>
              <span class="stage-id">{{ s.id }}</span>
            </div>
            <div class="stage-head-right">
              <span>비중 {{ s.weight }}%</span>
              <span class="stage-sep">·</span>
              <span class="stage-progress">진행 {{ s.progress }}%</span>
            </div>
          </div>
          <p class="stage-summary">{{ s.summary }}</p>
          <div class="stage-bar">
            <div :class="['stage-bar-fill', progressFill(s.progress)]" :style="{ width: s.progress + '%' }" />
          </div>

          <div
            v-for="(g, gIdx) in groupedTasks(s)"
            :key="g.name || sIdx + '-' + gIdx"
            class="group-card"
          >
            <div v-if="g.name" class="group-title">
              <span class="group-bullet" />
              {{ g.name }}
              <span class="group-count">{{ g.tasks.length }}건</span>
            </div>

            <ul class="task-list">
              <li v-for="t in g.tasks" :key="t.id" class="task-row">
                <div class="task-left">
                  <span class="task-id">{{ t.id }}</span>
                  <span :class="['task-dot', statusMeta[t.status].dot]" />
                  <div class="task-main">
                    <div class="task-title-row">
                      <span class="task-title">{{ t.title }}</span>
                      <a
                        v-if="t.href"
                        :href="t.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="task-link"
                      >
                        <UIcon name="i-lucide-arrow-up-right" class="task-link-icon" />
                      </a>
                    </div>
                    <p v-if="t.note" class="task-note">{{ t.note }}</p>
                  </div>
                </div>
                <div class="task-right">
                  <span :class="['task-chip', statusMeta[t.status].chip]">
                    {{ statusMeta[t.status].label }}
                  </span>
                  <span class="task-owner">{{ t.owner }}</span>
                  <span class="task-date">
                    <template v-if="t.targetDate || t.completionDate">
                      <span class="task-date-label">목표</span>
                      <span class="task-date-val">{{ formatYmd(t.targetDate) || '—' }}</span>
                      <span class="task-date-sep">→</span>
                      <span class="task-date-label">완료</span>
                      <span class="task-date-val">{{ formatYmd(t.completionDate) || '—' }}</span>
                    </template>
                    <template v-else>—</template>
                  </span>
                  <button
                    v-if="auth.user"
                    type="button"
                    class="task-edit-btn"
                    title="편집"
                    @click="openEdit(t)"
                  >
                    <UIcon name="i-lucide-pencil" class="task-edit-icon" />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </template>
    </main>

    <footer class="wbs-footer">
      <div class="app-container wbs-footer-inner">
        <span class="wbs-footer-brand">맑은 메시징</span>
        <span class="wbs-footer-copy">© 2026 맑은소프트. All rights reserved.</span>
      </div>
    </footer>

    <!-- 편집 모달 -->
    <AppModal :open="!!editing" :title="`태스크 편집 — ${editing?.id ?? ''}`" :width="520" @close="closeEdit">
      <div v-if="editing" class="edit-form">
        <p class="edit-task-title">
          {{ editing.title }}
        </p>
        <div class="edit-row">
          <label class="edit-label">담당자</label>
          <input v-model="editForm.owner" type="text" class="edit-input" maxlength="60" placeholder="담당자명">
        </div>
        <div class="edit-row">
          <label class="edit-label">설명 (note)</label>
          <textarea v-model="editForm.note" class="edit-input edit-textarea" maxlength="500" placeholder="비워두면 제거됩니다" rows="3" />
        </div>
        <div class="edit-row">
          <label class="edit-label">링크 (href)</label>
          <input v-model="editForm.href" type="url" class="edit-input" maxlength="500" placeholder="https://… (비워두면 제거)">
        </div>
        <div class="edit-row edit-row--double">
          <div>
            <label class="edit-label">목표일</label>
            <input v-model="editForm.targetDate" type="date" class="edit-input">
          </div>
          <div>
            <label class="edit-label">완료일</label>
            <input v-model="editForm.completionDate" type="date" class="edit-input">
          </div>
        </div>
        <p class="edit-hint">
          빈 값으로 두면 해당 필드가 제거됩니다. 상태(완료/진행 중/대기), 단계 가중치, 진행률은 본 화면에서 편집하지 않습니다.
        </p>
      </div>
      <template #footer>
        <button type="button" class="btn btn-outline-dark" :disabled="saving" @click="closeEdit">
          취소
        </button>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="saveEdit">
          {{ saving ? '저장 중…' : '저장' }}
        </button>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
/* ── 헤더 (/help와 동일 패턴) ── */
.wbs-page { background: #fafafa; min-height: 100vh; }
.wbs-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid #e4e4e7;
}
.wbs-header-inner {
  display: flex;
  align-items: center;
  height: 56px;
  gap: 0;
}
.wbs-logo {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wbs-logo-mark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: #111;
  color: #fff;
  border-radius: 6px;
}
.wbs-logo-text {
  font-size: 16px;
  font-weight: 800;
  color: #111;
}
.wbs-logo-sub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #71717a;
}
.wbs-header-divider {
  width: 1px;
  height: 16px;
  background: #e4e4e7;
  margin: 0 14px;
}
.wbs-header-crumb {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #71717a;
  margin-right: 8px;
}
.wbs-header-title {
  font-size: 14px;
  font-weight: 700;
  color: #18181b;
}
.wbs-header-link {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: #71717a;
  padding: 6px 10px;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  background: #fff;
  transition: background-color .15s, border-color .15s, color .15s;
}
.wbs-header-link:hover {
  background: #fafafa;
  border-color: #d4d4d8;
  color: #27272a;
}

/* ── 본문 ── */
.wbs-body { padding: 32px 0 56px; }
.wbs-state {
  padding: 48px 0;
  text-align: center;
  color: #71717a;
  font-size: 14px;
}
.wbs-state--err { color: #b91c1c; }

.wbs-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
.wbs-title {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #18181b;
}
.wbs-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #71717a;
}
.wbs-subtitle b {
  font-weight: 600;
  color: #3f3f46;
}
.wbs-readonly-hint a {
  color: #18181b;
  text-decoration: underline;
}

/* ── Hero stats ── */
.wbs-hero {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 768px) {
  .wbs-hero { grid-template-columns: repeat(4, 1fr); }
  .hero-card--wide { grid-column: span 2; }
}
.hero-card {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 20px;
}
.hero-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.hero-label { font-size: 12px; color: #71717a; }
.hero-value {
  margin-top: 4px;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #18181b;
  font-variant-numeric: tabular-nums;
}
.hero-value-unit { margin-left: 2px; font-size: 24px; color: #a1a1aa; }
.hero-note { font-size: 13px; color: #a1a1aa; padding-bottom: 4px; }
.hero-bar {
  margin-top: 16px;
  height: 6px;
  border-radius: 999px;
  background: #f4f4f5;
  overflow: hidden;
}
.hero-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #18181b;
  transition: width .3s;
}
.hero-mini-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}
.hero-mini-value {
  margin-top: 4px;
  font-size: 28px;
  font-weight: 600;
  color: #18181b;
  font-variant-numeric: tabular-nums;
}
.hero-mini-total { font-size: 16px; color: #a1a1aa; }

/* ── Overview 리스트 ── */
.overview-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.overview-head h2 { font-size: 14px; font-weight: 600; color: #3f3f46; }
.overview-head p { font-size: 13px; color: #a1a1aa; }
.overview-list {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  overflow: hidden;
}
.overview-row {
  display: grid;
  grid-template-columns: 28px 28px 1fr auto 180px auto;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color .15s;
}
.overview-row:hover { background: #fafafa; }
.overview-row--bordered { border-top: 1px solid #f4f4f5; }
.overview-emoji { font-size: 20px; line-height: 1; }
.overview-no {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  color: #a1a1aa;
  font-variant-numeric: tabular-nums;
}
.overview-text { min-width: 0; }
.overview-name {
  font-size: 14px;
  font-weight: 500;
  color: #18181b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overview-summary {
  font-size: 13px;
  color: #71717a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overview-count { font-size: 13px; color: #a1a1aa; }
.overview-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}
.overview-progress-track {
  width: 120px;
  height: 4px;
  border-radius: 999px;
  background: #f4f4f5;
  overflow: hidden;
}
.overview-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width .3s;
}
.overview-progress-text {
  width: 36px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #3f3f46;
  font-variant-numeric: tabular-nums;
}
.overview-arrow { color: #d4d4d8; }

/* ── Stage 상세 ── */
.stage-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.stage-head-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.stage-emoji { font-size: 22px; line-height: 1; }
.stage-name {
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #18181b;
}
.stage-id {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #a1a1aa;
}
.stage-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #71717a;
}
.stage-sep { color: #e4e4e7; }
.stage-progress { font-weight: 500; color: #3f3f46; }
.stage-summary {
  margin-top: 4px;
  font-size: 13px;
  color: #71717a;
}
.stage-bar {
  margin-top: 12px;
  height: 4px;
  border-radius: 999px;
  background: #f4f4f5;
  overflow: hidden;
}
.stage-bar-fill { height: 100%; border-radius: 999px; transition: width .3s; }

/* 그룹 카드 */
.group-card {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  overflow: hidden;
}
.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #3f3f46;
  background: #fafafa;
  border-bottom: 1px solid #f4f4f5;
}
.group-bullet {
  width: 4px;
  height: 12px;
  border-radius: 2px;
  background: #18181b;
}
.group-count {
  margin-left: auto;
  font-weight: 400;
  font-size: 12px;
  color: #a1a1aa;
}

/* Task 행 */
.task-list { display: flex; flex-direction: column; }
.task-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
  padding: 12px 16px;
  border-top: 1px solid #f4f4f5;
}
.task-row:first-child { border-top: 0; }
.task-left {
  display: grid;
  grid-template-columns: 56px 10px 1fr;
  gap: 10px;
  align-items: start;
  min-width: 0;
}
.task-id {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #a1a1aa;
  padding-top: 4px;
}
.task-dot {
  margin-top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
}
.task-main { min-width: 0; }
.task-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.task-title {
  font-size: 14px;
  color: #18181b;
  font-weight: 500;
}
.task-link {
  color: #71717a;
  transition: color .15s;
}
.task-link:hover { color: #18181b; }
.task-link-icon { width: 14px; height: 14px; }
.task-note {
  margin-top: 2px;
  font-size: 13px;
  color: #71717a;
  line-height: 1.55;
}

.task-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.task-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border-style: solid;
  border-width: 1px;
}
.task-owner {
  font-size: 12px;
  color: #52525b;
  min-width: 64px;
  text-align: right;
}
.task-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #a1a1aa;
  font-variant-numeric: tabular-nums;
  min-width: 240px;
  justify-content: flex-end;
}
.task-date-label { color: #d4d4d8; font-size: 10px; }
.task-date-val { color: #52525b; }
.task-date-sep { color: #d4d4d8; }

.task-edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e4e4e7;
  background: #fff;
  color: #71717a;
  cursor: pointer;
  transition: background-color .15s, border-color .15s, color .15s;
}
.task-edit-btn:hover {
  background: #fafafa;
  border-color: #d4d4d8;
  color: #18181b;
}
.task-edit-icon { width: 14px; height: 14px; }

/* 편집 모달 */
.edit-form { display: flex; flex-direction: column; gap: 14px; }
.edit-task-title {
  font-size: 14px;
  font-weight: 600;
  color: #18181b;
  padding-bottom: 10px;
  border-bottom: 1px solid #f4f4f5;
}
.edit-row { display: flex; flex-direction: column; gap: 6px; }
.edit-row--double {
  flex-direction: row;
  gap: 10px;
}
.edit-row--double > div { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.edit-label { font-size: 12px; font-weight: 600; color: #52525b; }
.edit-input {
  width: 100%;
  font-size: 14px;
  padding: 8px 10px;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  background: #fff;
  color: #18181b;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.edit-input:focus {
  border-color: #18181b;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}
.edit-textarea { resize: vertical; line-height: 1.5; }
.edit-hint {
  font-size: 12px;
  color: #a1a1aa;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .overview-row {
    grid-template-columns: 28px 1fr;
  }
  .overview-no, .overview-count, .overview-progress, .overview-arrow { display: none; }
  .task-row { grid-template-columns: 1fr; }
  .task-right { justify-content: flex-end; flex-wrap: wrap; }
  .task-date { min-width: 0; }
  .edit-row--double { flex-direction: column; }
}

/* ── 푸터 ── */
.wbs-footer {
  border-top: 1px solid #e4e4e7;
  margin-top: 48px;
  padding: 22px 0;
  background: #fff;
}
.wbs-footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.wbs-footer-brand { font-size: 13px; font-weight: 700; color: #3f3f46; }
.wbs-footer-copy { font-size: 12px; color: #a1a1aa; }
</style>
