<script setup lang="ts">
// 단독 화면(C 페이지) 공용 메시지 셸 — 로고-온리 sticky 상단 바 + 중앙 메시지 + 간단 푸터.
// 에러(404/시스템/네트워크)·점검(긴급/정기) + app/error.vue·404.vue 가 재사용.
withDefaults(
  defineProps<{
    /** 상태 톤 — 아이콘/뱃지 채도. 평상시 무채색(neutral), 에러=danger, 점검=warning */
    tone?: 'neutral' | 'danger' | 'warning'
    /** Iconify 아이콘명 (code 미지정 시 표시) */
    icon?: string
    /** 큰 상태 코드 (예: 404) — 지정 시 아이콘 대신 표시 */
    code?: string
    /** 상단 eyebrow 라벨 (예: ERROR / MAINTENANCE) */
    eyebrow?: string
    /** 상태 뱃지 라벨 (eyebrow 옆) */
    badge?: string
    /** 제목 (시맨틱 h1) */
    title: string
    /** 본문 설명 (slot description 으로 대체 가능) */
    description?: string
  }>(),
  { tone: 'neutral', icon: undefined, code: undefined, eyebrow: undefined, badge: undefined, description: undefined },
)

defineSlots<{
  description?: () => unknown
  detail?: () => unknown
  actions?: () => unknown
}>()
</script>

<template>
  <div class="sys-page" :data-tone="tone">
    <header class="sys-header">
      <div class="app-container sys-header-inner">
        <NuxtLink to="/home" class="sys-logo" aria-label="맑은 메시징 홈으로">
          <span class="sys-logo-mark"><AppLogoMark /></span>
          <span class="sys-logo-text">맑은</span>
          <span class="sys-logo-sub">message</span>
        </NuxtLink>
      </div>
    </header>

    <main class="app-container sys-main">
      <section class="sys-panel" role="alert" aria-live="polite">
        <div v-if="eyebrow || badge" class="sys-eyebrow-row">
          <span v-if="eyebrow" class="sys-eyebrow">{{ eyebrow }}</span>
          <span v-if="badge" class="sys-badge">{{ badge }}</span>
        </div>

        <div v-if="code" class="sys-code">{{ code }}</div>
        <span v-else-if="icon" class="sys-icon" aria-hidden="true"><UIcon :name="icon" /></span>

        <h1 class="sys-title">{{ title }}</h1>

        <p v-if="$slots.description || description" class="sys-desc">
          <slot name="description">{{ description }}</slot>
        </p>

        <div v-if="$slots.detail" class="sys-detail">
          <slot name="detail" />
        </div>

        <div v-if="$slots.actions" class="sys-actions">
          <slot name="actions" />
        </div>
      </section>
    </main>

    <footer class="sys-footer">
      <div class="app-container sys-footer-inner">
        <span class="sys-footer-brand">맑은 메시징</span>
        <span class="sys-footer-copy">© 2026 맑은소프트. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.sys-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--paper);
}

/* 로고만 있는 sticky 상단 바 (GNB 없음) */
.sys-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--white);
  border-bottom: 1px solid var(--line);
}
.sys-header-inner {
  display: flex;
  align-items: center;
  height: var(--topbar-height);
}
.sys-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--r-md);
}
.sys-logo:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.sys-logo-mark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: var(--ink-900);
  color: var(--white);
  border-radius: var(--r-md);
}
.sys-logo-text {
  font-size: var(--fz-lg);
  font-weight: 800;
  color: var(--ink-900);
}
.sys-logo-sub {
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--ink-400);
}

/* 중앙 메시지 영역 */
.sys-main {
  flex: 1;
  display: grid;
  place-items: center;
  padding-top: 48px;
  padding-bottom: 48px;
}
.sys-panel {
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.sys-eyebrow-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 18px;
}
.sys-eyebrow {
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-400);
}
.sys-badge {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: var(--r-md);
  font-size: var(--fz-2xs);
  font-weight: 600;
  background: var(--ink-50);
  border: 1px solid var(--ink-100);
  color: var(--ink-600);
}

/* 큰 상태 코드 (404 등) — 타이포 위계, 액센트 미사용 */
.sys-code {
  font-family: var(--font-mono);
  font-size: clamp(64px, 14vw, 96px);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: var(--ink-900);
  margin-bottom: 18px;
}

/* 아이콘 박스 — 1px hairline, 톤별 채도 */
.sys-icon {
  display: inline-grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 18px;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: var(--white);
  color: var(--ink-400);
  font-size: 26px;
}

.sys-title {
  font-size: var(--fz-4xl);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--ink-900);
}
.sys-desc {
  margin-top: 10px;
  font-size: var(--fz-md);
  line-height: 1.6;
  color: var(--ink-500);
}

/* 점검 사유·시각 등 부가 정보 패널 */
.sys-detail {
  margin-top: 22px;
  text-align: left;
}

.sys-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 26px;
}

/* 간단 푸터 */
.sys-footer {
  border-top: 1px solid var(--line);
  padding: 22px 0;
}
.sys-footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.sys-footer-brand {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--ink-700);
}
.sys-footer-copy {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

/* 톤별 아이콘 채도 — 상태에만 색 */
.sys-page[data-tone='danger'] .sys-icon {
  background: var(--danger-soft);
  border-color: var(--danger-line);
  color: var(--danger-ink);
}
.sys-page[data-tone='warning'] .sys-icon {
  background: var(--warning-soft);
  border-color: var(--warning-line);
  color: var(--warning-ink);
}

@media (max-width: 1024px) {
  .sys-footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
