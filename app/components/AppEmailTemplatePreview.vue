<script setup lang="ts">
// 이메일 템플릿 정본 미리보기 셸 — 로고 상단 바 + email-safe HTML iframe 미리보기 + 치환 변수 + HTML 소스.
// 단독(blank) 레이아웃 페이지에서 사용. 이메일 본문은 인라인 스타일 + table 레이아웃(클래스 미사용).
interface TemplateVariable {
  name: string
  desc: string
}

defineProps<{
  crumb: string
  title: string
  intro: string
  html: string
  variables: TemplateVariable[]
}>()

const showSource = ref(false)
</script>

<template>
  <div class="mail-page">
    <header class="mail-header">
      <div class="app-container mail-header-inner">
        <NuxtLink to="/home" class="mail-logo" aria-label="맑은 메시징 홈으로">
          <span class="mail-logo-mark"><AppLogoMark /></span>
          <span class="mail-logo-text">맑은</span>
          <span class="mail-logo-sub">message</span>
        </NuxtLink>
        <span class="mail-header-divider" />
        <span class="mail-header-crumb">{{ crumb }}</span>
        <span class="mail-header-title">{{ title }}</span>
      </div>
    </header>

    <main class="app-container mail-main">
      <p class="mail-intro">{{ intro }}</p>

      <section class="mail-card" aria-label="이메일 미리보기">
        <div class="mail-card-head">미리보기</div>
        <!-- email-safe HTML 을 iframe 으로 격리 렌더 (이메일 클라이언트 환경 모사) -->
        <iframe class="mail-frame" title="이메일 미리보기" :srcdoc="html" />
      </section>

      <section class="mail-card" aria-label="치환 변수">
        <div class="mail-card-head">치환 변수</div>
        <dl class="mail-vars">
          <div v-for="v in variables" :key="v.name" class="mail-var">
            <dt>{{ v.name }}</dt>
            <dd>{{ v.desc }}</dd>
          </div>
        </dl>
      </section>

      <section class="mail-card" aria-label="HTML 소스">
        <button
          type="button"
          class="mail-card-head mail-card-toggle"
          :aria-expanded="showSource"
          @click="showSource = !showSource"
        >
          <span>HTML 소스</span>
          <UIcon :name="showSource ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" />
        </button>
        <pre v-if="showSource" class="mail-source"><code>{{ html }}</code></pre>
      </section>
    </main>

    <footer class="mail-footer">
      <div class="app-container mail-footer-inner">
        <span class="mail-footer-brand">맑은 메시징</span>
        <span class="mail-footer-copy">© 2026 맑은소프트. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.mail-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--paper);
}

.mail-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--white);
  border-bottom: 1px solid var(--line);
}
.mail-header-inner {
  display: flex;
  align-items: center;
  height: var(--topbar-height);
}
.mail-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: var(--r-md);
}
.mail-logo:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
.mail-logo-mark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: var(--ink-900);
  color: var(--white);
  border-radius: var(--r-md);
}
.mail-logo-text {
  font-size: var(--fz-lg);
  font-weight: 800;
  color: var(--ink-900);
}
.mail-logo-sub {
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--ink-400);
}
.mail-header-divider {
  width: 1px;
  height: 16px;
  background: var(--line);
  margin: 0 14px;
}
.mail-header-crumb {
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--ink-400);
  margin-right: 8px;
}
.mail-header-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
}

.mail-main {
  flex: 1;
  width: 100%;
  max-width: 720px;
  padding-top: 32px;
  padding-bottom: 32px;
}
.mail-intro {
  font-size: var(--fz-md);
  line-height: 1.6;
  color: var(--ink-500);
  margin-bottom: 20px;
}

.mail-card {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  overflow: hidden;
}
.mail-card + .mail-card {
  margin-top: 16px;
}
.mail-card-head {
  padding: 12px 16px;
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-900);
  border-bottom: 1px solid var(--line);
}
.mail-card-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: none;
  cursor: pointer;
}
.mail-card-toggle[aria-expanded='false'] {
  border-bottom: none;
}
.mail-card-toggle:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.mail-frame {
  display: block;
  width: 100%;
  height: 560px;
  border: 0;
  background: var(--paper);
}

.mail-vars {
  padding: 4px 0;
}
.mail-var {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
  padding: 10px 16px;
  font-size: var(--fz-md);
}
.mail-var + .mail-var {
  border-top: 1px solid var(--line);
}
.mail-var dt {
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--accent-ink);
}
.mail-var dd {
  color: var(--ink-600);
}

.mail-source {
  margin: 0;
  padding: 16px;
  background: var(--ink-50);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  line-height: 1.6;
  color: var(--ink-700);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
}

.mail-footer {
  border-top: 1px solid var(--line);
  padding: 22px 0;
}
.mail-footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.mail-footer-brand {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--ink-700);
}
.mail-footer-copy {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

@media (max-width: 1024px) {
  .mail-var {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  .mail-footer-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
