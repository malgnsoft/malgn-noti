<script setup lang="ts">
interface NavItem {
  label: string
  icon: string
  to: string
  desc: string
}

/* 나의 페이지 좌측 메뉴 — 각 항목은 독립 라우트 */
const NAV: NavItem[] = [
  { label: '회원 정보 변경', icon: 'i-lucide-user-round', to: '/account/settings', desc: '이름·연락처·기업 정보 등 회원 정보를 수정합니다.' },
  { label: '결제 카드 관리', icon: 'i-lucide-credit-card', to: '/account/cards', desc: '크레딧 충전에 사용할 결제 카드를 등록·관리합니다.' },
  { label: '비밀번호 변경', icon: 'i-lucide-lock', to: '/account/password', desc: '로그인에 사용하는 비밀번호를 변경합니다.' },
  { label: '보안로그인 설정', icon: 'i-lucide-shield-check', to: '/account/security', desc: 'OTP·이메일 보안 인증 등 로그인 보안을 설정합니다.' },
  { label: '멀티 계정 추가', icon: 'i-lucide-users', to: '/account/multi', desc: '하위 운영자 계정을 추가하고 권한을 부여합니다.' },
  { label: '계약 관리', icon: 'i-lucide-file-text', to: '/account/contract', desc: '서비스 이용 계약 정보를 확인합니다.' },
  { label: '크레딧 관리', icon: 'i-lucide-circle-dollar-sign', to: '/account/credit', desc: '크레딧 충전·사용 내역을 확인합니다.' },
  { label: '결제 내역', icon: 'i-lucide-receipt', to: '/account/billing', desc: '결제·청구 내역과 영수증을 확인합니다.' },
  { label: '나의 문의', icon: 'i-lucide-message-circle-question', to: '/account/inquiries', desc: '1:1 문의 내역과 답변을 확인합니다.' },
]
/* 계정 설정 그룹과 크레딧·문의 그룹 사이 구분선 위치 */
const SEP_BEFORE = '/account/credit'

const route = useRoute()
const current = computed(() =>
  NAV.find(n => route.path === n.to || route.path.startsWith(`${n.to}/`)) ?? NAV[0]!,
)
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">MY PAGE</div>
      <h1>나의 페이지</h1>
    </div>

    <div class="acct-layout">
      <!-- 좌측 부 메뉴 -->
      <aside class="acct-menu">
        <template v-for="n in NAV" :key="n.to">
          <div v-if="n.to === SEP_BEFORE" class="acct-menu-sep" />
          <NuxtLink
            :to="n.to"
            class="acct-menu-item"
            :class="{ active: current.to === n.to }"
          >
            <UIcon :name="n.icon" class="m-icon" />
            <span>{{ n.label }}</span>
          </NuxtLink>
        </template>
      </aside>

      <!-- 콘텐츠 -->
      <section class="acct-content">
        <slot v-if="$slots.default" />
        <div v-else class="acct-placeholder">
          <span class="ph-icon"><UIcon :name="current.icon" /></span>
          <h2>{{ current.label }}</h2>
          <p>{{ current.desc }}</p>
          <span class="ph-tag">화면 준비 중</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* 2단 레이아웃 — 좌측 메뉴 + 콘텐츠 */
.acct-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

/* 좌측 부 메뉴 */
.acct-menu {
  position: sticky;
  top: calc(var(--topbar-height) + 24px);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.acct-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--r-md);
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
}
.acct-menu-item:hover {
  background: var(--ink-50);
  color: var(--ink-900);
}
.acct-menu-item.active {
  background: var(--ink-50);
  color: var(--ink-900);
  font-weight: 600;
}
.acct-menu-sep {
  height: 1px;
  background: var(--line);
  margin: 8px 6px;
}
.acct-menu-item .m-icon {
  color: var(--ink-400);
  font-size: var(--fz-lg);
}
.acct-menu-item:hover .m-icon,
.acct-menu-item.active .m-icon {
  color: var(--ink-900);
}

/* 콘텐츠 패널 */
.acct-content {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  min-height: 380px;
  padding: 32px;
}
.acct-placeholder {
  max-width: 460px;
  margin: 56px auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.ph-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: var(--r-full);
  background: var(--ink-50);
  color: var(--ink-500);
  font-size: var(--fz-3xl);
  margin-bottom: 16px;
}
.acct-placeholder h2 {
  font-size: var(--fz-xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 6px;
}
.acct-placeholder p {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 14px;
}
.ph-tag {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: var(--r-full);
  background: var(--ink-50);
  border: 1px solid var(--line);
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  color: var(--ink-400);
  letter-spacing: 0.04em;
}

@media (max-width: 860px) {
  .acct-layout { grid-template-columns: 1fr; gap: 16px; }
  .acct-menu {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .acct-menu-item { width: auto; }
  .acct-menu-sep { display: none; }
}
</style>
