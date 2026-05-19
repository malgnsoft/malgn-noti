<script setup lang="ts">
interface MenuChild {
  label: string
  to: string
}
interface MenuChildSection {
  divider?: true
  header?: string
}
type MenuChildItem = MenuChild | MenuChildSection

interface MenuItem {
  label: string
  to?: string
  title?: string
  children?: MenuChildItem[]
}

const mobileOpen = ref(false)

const credit = useState('credit-balance', () => 245800)
const user = useState('current-user', () => ({ name: '관리자', email: 'admin@malgn.example' }))

// 데모용 인증 상태 — 추후 useAuthStore와 연결
const isAuthed = computed(() => true)

const menu: MenuItem[] = [
  {
    label: '서비스',
    title: '서비스',
    children: [
      { label: '맑은 메시징 소개', to: '#' },
      { label: '이용 가이드', to: '#' },
      { label: '요금 안내', to: '/charge' }
    ]
  },
  {
    label: '메시지 발송',
    title: '발송 채널',
    children: [
      { label: '문자메시지 (SMS/LMS/MMS)', to: '/send/sms' },
      { label: '알림톡 / 친구톡', to: '/send/kakao' },
      { label: 'RCS', to: '/send/rcs' },
      { label: '이메일', to: '/send/email' },
      { label: 'PUSH', to: '/send/push' },
      { divider: true },
      { label: '복합 (플로우)', to: '/send/flow' }
    ]
  },
  {
    label: '발송 관리',
    title: '발송 관리',
    children: [
      { label: '발송 조회', to: '/history/sms' },
      { label: '통계', to: '/history/stats' },
      { divider: true },
      { label: '연락처 관리', to: '/contacts/list' },
      { label: '그룹 관리', to: '/contacts/groups' },
      { label: '수신 거부 관리', to: '/contacts/optout' }
    ]
  },
  {
    label: '발신 정보',
    title: '발신 정보',
    children: [
      { label: '발신 번호 관리', to: '/sender/numbers' },
      { label: 'RCS 브랜드 관리', to: '/sender/brands' },
      { label: '이메일 도메인 관리', to: '/sender/domains' },
      { label: 'PUSH 인증 관리', to: '/sender/push-cert' },
      { label: '발신 프로필 관리', to: '/sender/profiles' },
      { label: '080 수신 거부 관리', to: '/sender/optout-080' }
    ]
  },
  {
    label: '메시지 관리',
    title: '메시지 관리',
    children: [
      { label: '문자메시지 템플릿', to: '/manage/sms' },
      { label: '알림톡 템플릿', to: '/manage/kakao' },
      { label: 'RCS 템플릿', to: '/manage/rcs' },
      { label: '이메일 템플릿', to: '/manage/email' },
      { label: 'PUSH 템플릿', to: '/manage/push' },
      { divider: true },
      { label: '상세 설정', to: '/manage/settings' }
    ]
  },
  { label: '캠페인', to: '/campaign' },
  { label: '운영가이드', to: '#' }
]

const userMenu = [
  { icon: 'i-lucide-user', label: '계정 관리', to: '/account/settings' },
  { icon: 'i-lucide-circle-dollar-sign', label: '크레딧 관리', to: '/account/credit' },
  { icon: 'i-lucide-file-text', label: '결제 내역', to: '/account/credit' },
  { icon: 'i-lucide-log-out', label: '로그아웃', to: '/login' }
]

function isLink(c: MenuChildItem): c is MenuChild {
  return 'to' in c
}
function avatarChar(name: string) {
  return (name?.[0] ?? '?').toUpperCase()
}
</script>

<template>
  <div class="gnb-wrap">
    <div class="gnb-main">
      <div class="gnb-inner">
        <button
          type="button"
          class="btn btn-ghost btn-icon gnb-burger"
          aria-label="메뉴 열기"
          @click="mobileOpen = true"
        >
          <UIcon name="i-lucide-menu" class="text-xl" />
        </button>

        <!-- 로고 -->
        <NuxtLink to="/home" class="gnb-logo">
          <span class="logo-icon"><AppLogoMark /></span>
          <span class="gnb-logo-text">맑은</span>
          <span class="gnb-logo-sub">message</span>
        </NuxtLink>

        <!-- 데스크톱 메뉴 -->
        <nav class="gnb-menu gnb-menu-desktop">
          <div
            v-for="item in menu"
            :key="item.label"
            class="gnb-menu-item-wrap"
          >
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="gnb-menu-item"
            >
              {{ item.label }}
            </NuxtLink>
            <div v-else class="gnb-menu-item">
              {{ item.label }}
              <span class="icn-chev"><UIcon name="i-lucide-chevron-down" class="text-[10px]" /></span>
            </div>

            <div v-if="item.children" class="gnb-dropdown">
              <div class="gnb-dropdown-title">
                {{ item.title }}
              </div>
              <template v-for="(child, ci) in item.children" :key="ci">
                <div v-if="!isLink(child)" class="gnb-dropdown-divider" />
                <NuxtLink v-else :to="child.to" class="gnb-dropdown-item">
                  {{ child.label }}
                </NuxtLink>
              </template>
            </div>
          </div>
        </nav>

        <!-- 우측 액션 -->
        <div class="gnb-actions">
          <NuxtLink to="/inquiry" class="pill pill-inquire">
            문의
          </NuxtLink>

          <template v-if="isAuthed">
            <NuxtLink to="/charge" class="pill pill-charge">
              충전
            </NuxtLink>
            <div class="gnb-user-wrap">
              <button type="button" class="pill-user">
                <span class="avatar">{{ avatarChar(user.name) }}</span>
                <span class="gnb-user-name">{{ user.name }}</span>
                <UIcon name="i-lucide-chevron-down" class="text-[10px] text-[color:var(--ink-400)]" />
              </button>
              <div class="gnb-dropdown gnb-user-menu">
                <div class="gnb-credit-block">
                  <div class="gnb-credit-label">
                    잔여 크레딧
                  </div>
                  <div class="gnb-credit-value">
                    <span class="num gnb-credit-amount">{{ credit.toLocaleString() }}</span>
                    <span class="gnb-credit-unit">C</span>
                  </div>
                  <NuxtLink to="/charge" class="gnb-credit-link">
                    충전하기 →
                  </NuxtLink>
                </div>
                <div class="gnb-dropdown-divider gnb-divider-solid" />
                <NuxtLink
                  v-for="m in userMenu"
                  :key="m.label"
                  :to="m.to"
                  class="gnb-dropdown-item"
                >
                  <span class="icon"><UIcon :name="m.icon" class="text-sm" /></span>
                  <span>{{ m.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="pill pill-inquire">
              로그인
            </NuxtLink>
            <NuxtLink to="/signup" class="pill pill-signup">
              회원가입
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <!-- 모바일 드로어 -->
    <USlideover
      v-model:open="mobileOpen"
      side="left"
      :ui="{ content: 'w-[280px]', body: 'p-0', header: 'hidden' }"
    >
      <template #content>
        <div class="drawer-header">
          <NuxtLink to="/home" class="gnb-logo" @click="mobileOpen = false">
            <span class="logo-icon"><AppLogoMark /></span>
            <span class="gnb-logo-text">맑은</span>
            <span class="gnb-logo-sub">message</span>
          </NuxtLink>
          <button type="button" class="btn btn-ghost btn-icon" aria-label="닫기" @click="mobileOpen = false">
            <UIcon name="i-lucide-x" class="text-xl" />
          </button>
        </div>
        <div class="drawer-body">
          <div class="drawer-section">바로가기</div>
          <NuxtLink to="/charge" class="drawer-item" @click="mobileOpen = false">
            <UIcon name="i-lucide-circle-dollar-sign" class="text-base" /> 크레딧 충전
          </NuxtLink>
          <NuxtLink to="/inquiry" class="drawer-item" @click="mobileOpen = false">
            <UIcon name="i-lucide-message-square" class="text-base" /> 문의하기
          </NuxtLink>
          <template v-for="item in menu" :key="item.label">
            <div class="drawer-section">{{ item.label }}</div>
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="drawer-item"
              @click="mobileOpen = false"
            >
              <UIcon name="i-lucide-chevron-right" class="text-base" /> {{ item.label }}
            </NuxtLink>
            <template v-else>
              <template v-for="(c, i) in item.children" :key="i">
                <NuxtLink
                  v-if="isLink(c)"
                  :to="c.to"
                  class="drawer-item"
                  @click="mobileOpen = false"
                >
                  <UIcon name="i-lucide-chevron-right" class="text-base" /> {{ c.label }}
                </NuxtLink>
              </template>
            </template>
          </template>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped>
/* 드롭다운: 기본 숨김 → wrap hover 시 표시 (main.css .gnb-dropdown 보강) */
.gnb-dropdown {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
}
.gnb-menu-item-wrap:hover > .gnb-dropdown,
.gnb-user-wrap:hover > .gnb-user-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.gnb-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}
.gnb-user-wrap { position: relative; }
.gnb-user-menu { right: 0; left: auto; min-width: 220px; }
.gnb-user-name {
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gnb-credit-block { padding: 14px 16px 10px; }
.gnb-credit-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-400);
  margin-bottom: 6px;
}
.gnb-credit-value { display: flex; align-items: baseline; gap: 4px; }
.gnb-credit-amount {
  font-size: 20px;
  font-weight: 500;
  color: var(--ink-900);
  letter-spacing: -0.02em;
}
.gnb-credit-unit { font-size: 12px; color: var(--ink-400); font-family: var(--font-mono); }
.gnb-credit-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--ink-500);
  font-family: var(--font-mono);
}
.gnb-credit-link:hover { color: var(--ink-900); }
.gnb-divider-solid { border-top-color: var(--line); margin: 0; }

.gnb-burger { display: none; }
@media (max-width: 1023px) {
  .gnb-burger { display: inline-flex; }
  .gnb-menu-desktop { display: none; }
}
</style>
