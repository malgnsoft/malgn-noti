<script setup lang="ts">
interface MenuChild {
  label: string
  to: string
}
interface MenuChildSection {
  divider?: true
}
type MenuChildItem = MenuChild | MenuChildSection

interface MenuItem {
  label: string
  to?: string
  title?: string
  children?: MenuChildItem[]
}

const mobileOpen = ref(false)

const credit = useState('credit-balance', () => 0)
const user = useState('current-user', () => ({ name: '관리자', email: 'admin@malgn.example' }))

// 데모용 인증 상태 — 추후 useAuthStore와 연결
const isAuthed = computed(() => true)

const menu = computed<MenuItem[]>(() => [
  {
    label: '서비스',
    title: '서비스',
    children: [
      { label: '서비스 소개', to: '#' },
      { label: '요금 안내', to: '#' },
      { label: '도입 사례', to: '#' }
    ]
  },
  {
    label: '메시지 발송',
    title: '메시지 발송',
    children: [
      { label: '문자메시지(SMS/LMS/MMS)', to: '/send/sms' },
      { label: 'RCS', to: '/send/rcs' },
      { label: '알림톡/친구톡', to: '/send/kakao' },
      { label: '이메일', to: '/send/email' },
      { label: 'PUSH', to: '/send/push' },
      { label: '복합(플로우)', to: '/send/flow' }
    ]
  },
  {
    label: '발송 조회/통계',
    title: '발송 조회/통계',
    children: [
      { label: '문자메시지 발송 조회', to: '/history/sms' },
      { label: 'RCS 발송 조회', to: '/history/rcs' },
      { label: '알림톡 발송 조회', to: '/history/kakao' },
      { label: '이메일 발송 조회', to: '/history/email' },
      { label: 'PUSH 발송 조회', to: '/history/push' },
      { divider: true },
      { label: '통계', to: '/history/stats' }
    ]
  },
  {
    label: '주소록',
    title: '주소록',
    children: [
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
    label: '메시지관리',
    title: '메시지관리',
    children: [
      { label: '문자메시지 템플릿', to: '/manage/sms' },
      { label: 'RCS 템플릿', to: '/manage/rcs' },
      { label: '알림톡 템플릿', to: '/manage/kakao' },
      { label: '이메일 템플릿', to: '/manage/email' },
      { label: 'PUSH 템플릿', to: '/manage/push' },
      { divider: true },
      { label: '상세 설정', to: '/manage/settings' }
    ]
  },
  { label: '캠페인 관리', to: '/campaign' },
  { label: '운영가이드', to: '#' }
])

const userMenu = computed(() => [
  { icon: 'i-lucide-user', label: '계정 설정', to: '/account/settings' },
  { icon: 'i-lucide-receipt', label: '크레딧 내역', to: '/account/credit' },
  { icon: 'i-lucide-message-square', label: '문의 내역', to: '/account/inquiries' },
  { icon: 'i-lucide-log-out', label: '로그아웃', to: '/login' }
])

function isLink(c: MenuChildItem): c is MenuChild {
  return 'to' in c
}

function avatarChar(name: string) {
  return (name?.[0] ?? '?').toUpperCase()
}
</script>

<template>
  <header class="gnb-wrapper">
    <!-- Utility Bar (상단 작은 줄) -->
    <div class="gnb-utility">
      <div class="gnb-utility-inner">
        <NuxtLink to="/inquiry" class="gnb-btn-inquiry">
          문의
        </NuxtLink>

        <template v-if="isAuthed">
          <NuxtLink to="/charge" class="gnb-btn-charge">
            충전
          </NuxtLink>
          <div class="gnb-user-dropdown">
            <button type="button" class="gnb-user-btn">
              <span class="gnb-user-avatar">{{ avatarChar(user.name) }}</span>
              <span class="gnb-user-name">{{ user.name }}</span>
              <UIcon name="i-lucide-chevron-down" class="gnb-chevron" />
            </button>
            <div class="gnb-user-menu">
              <div class="gnb-credit-block">
                <div class="gnb-credit-label">
                  잔여 크레딧
                </div>
                <div class="gnb-credit-value">
                  <span class="gnb-credit-coin">C</span>
                  <span class="gnb-credit-amount">{{ credit.toLocaleString() }}</span>
                </div>
                <NuxtLink to="/account/credit" class="gnb-credit-link">
                  자세히 보기
                </NuxtLink>
              </div>
              <div class="gnb-dropdown-divider" />
              <NuxtLink
                v-for="m in userMenu"
                :key="m.label"
                :to="m.to"
                class="gnb-user-menu-item"
              >
                <UIcon :name="m.icon" class="gnb-menu-icon" />
                <span>{{ m.label }}</span>
              </NuxtLink>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="gnb-login-link">
            로그인
          </NuxtLink>
          <NuxtLink to="/signup" class="gnb-btn-signup">
            회원가입
          </NuxtLink>
        </template>
      </div>
    </div>

    <!-- Main GNB (로고 + 메뉴) -->
    <div class="gnb">
      <div class="gnb-inner">
        <!-- 로고 -->
        <NuxtLink to="/home" class="gnb-logo">
          <UIcon name="i-lucide-message-square-text" class="gnb-logo-icon" />
          <span class="gnb-logo-text-group">
            <span class="gnb-logo-text">맑은</span>
            <span class="gnb-logo-sub">메시징</span>
          </span>
        </NuxtLink>

        <!-- 데스크톱 메뉴 -->
        <nav class="gnb-nav-wrap">
          <ul class="gnb-nav">
            <li v-for="item in menu" :key="item.label" class="gnb-nav-item">
              <NuxtLink v-if="item.to" :to="item.to" class="gnb-nav-link">
                {{ item.label }}
              </NuxtLink>
              <button v-else type="button" class="gnb-nav-link">
                {{ item.label }}
                <UIcon name="i-lucide-chevron-down" class="gnb-chevron" />
              </button>

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
            </li>
          </ul>
        </nav>

        <button type="button" class="gnb-burger" aria-label="메뉴 열기" @click="mobileOpen = true">
          <UIcon name="i-lucide-menu" />
        </button>
      </div>
    </div>

    <!-- 모바일 메뉴 슬라이드 -->
    <USlideover v-model:open="mobileOpen" side="left" :ui="{ content: 'w-80' }">
      <template #content>
        <div class="p-6 space-y-6 overflow-y-auto h-full">
          <NuxtLink to="/home" class="flex items-center gap-2" @click="mobileOpen = false">
            <UIcon name="i-lucide-message-square-text" class="text-xl" style="color: var(--color-indigo)" />
            <span class="font-bold">맑은 메시징</span>
          </NuxtLink>
          <div v-for="item in menu" :key="item.label" class="space-y-1">
            <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              {{ item.label }}
            </div>
            <NuxtLink
              v-if="item.to"
              :to="item.to"
              class="block px-3 py-2 rounded-md hover:bg-gray-100 text-sm font-medium"
              @click="mobileOpen = false"
            >
              {{ item.label }}
            </NuxtLink>
            <template v-else>
              <template v-for="(c, i) in item.children" :key="i">
                <NuxtLink
                  v-if="isLink(c)"
                  :to="c.to"
                  class="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                  @click="mobileOpen = false"
                >
                  {{ c.label }}
                </NuxtLink>
              </template>
            </template>
          </div>
        </div>
      </template>
    </USlideover>
  </header>
</template>

<style scoped>
.gnb-wrapper {
  position: sticky;
  top: 0;
  z-index: 1030;
  background: #fff;
}

/* Utility Bar (상단 작은 줄) */
.gnb-utility {
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.gnb-utility-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  height: var(--gnb-utility-height);
  width: 100%;
  max-width: var(--content-max);
  margin-inline: auto;
  padding: 0 24px;
}

@media (max-width: 1023px) {
  .gnb-utility { display: none; }
}

/* Main GNB */
.gnb {
  background: #fff;
  border-bottom: 1px solid var(--gray-200);
  height: var(--gnb-height);
  display: flex;
  align-items: center;
}

.gnb-inner {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: var(--content-max);
  margin-inline: auto;
  height: 100%;
  padding: 0 24px;
}

.gnb-logo {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 32px;
  flex-shrink: 0;
  text-decoration: none;
  line-height: 1;
}

.gnb-logo-icon {
  font-size: 24px;
  color: var(--color-indigo);
  display: inline-flex;
  align-items: center;
  line-height: 1;
}
.gnb-logo-text-group {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  line-height: 1;
}
.gnb-logo-text {
  font-size: 22px;
  font-weight: 900;
  color: var(--gray-700);
  letter-spacing: -1px;
  line-height: 1;
}
.gnb-logo-sub {
  font-size: 20px;
  font-weight: 300;
  color: var(--gray-500);
  letter-spacing: -0.5px;
  line-height: 1;
}
.gnb-logo:hover .gnb-logo-text { color: var(--gray-900); }
.gnb-logo:hover .gnb-logo-sub  { color: var(--gray-600); }

.gnb-nav-wrap {
  display: none;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
  height: 100%;
}

@media (min-width: 1024px) {
  .gnb-nav-wrap { display: flex; }
}

.gnb-nav {
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  height: 100%;
  gap: 4px;
}

.gnb-nav-item {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
}

.gnb-nav-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--gray-700);
  text-decoration: none;
  background: transparent;
  border: 0;
  cursor: pointer;
  white-space: nowrap;
  height: 100%;
  transition: color 0.15s;
}
.gnb-nav-link:hover { color: var(--gray-900); }

.gnb-chevron { font-size: 12px; transition: transform 0.2s; }
.gnb-nav-item:hover .gnb-chevron { transform: rotate(180deg); }

.gnb-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 220px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 8px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: 1050;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
}
.gnb-nav-item:hover .gnb-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.gnb-dropdown-title {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 14px;
  padding: 8px 20px;
  pointer-events: none;
}

.gnb-dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 20px;
  font-size: 14px;
  color: var(--gray-600);
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.gnb-dropdown-item:hover {
  background: var(--gray-50);
  color: var(--gray-900);
}

.gnb-dropdown-divider {
  margin: 6px 16px;
  border-top: 1px dashed var(--gray-300);
}

.gnb-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
}

.gnb-btn-inquiry {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 14px;
  border-radius: 999px;
  background: var(--color-sky-soft);
  color: var(--color-sky-vivid);
  text-decoration: none;
  line-height: 1.6;
  transition: background 0.15s;
}
.gnb-btn-inquiry:hover { background: #d4ecfd; }

.gnb-login-link {
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-700);
  text-decoration: none;
  padding: 3px 10px;
}
.gnb-login-link:hover { color: var(--gray-900); }

.gnb-btn-signup {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 999px;
  background: var(--color-indigo);
  color: #fff;
  text-decoration: none;
  transition: background 0.15s;
}
.gnb-btn-signup:hover { background: #5343d6; }

.gnb-btn-charge {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 14px;
  border-radius: 999px;
  background: var(--color-sky-vivid);
  color: #fff;
  text-decoration: none;
  transition: background 0.15s;
}
.gnb-btn-charge:hover { background: #0167d4; }

.gnb-user-dropdown { position: relative; }

.gnb-user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px 2px 2px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 999px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-800);
  transition: background 0.15s, border-color 0.15s;
}
.gnb-user-btn:hover {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.gnb-user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-sky);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.gnb-user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gnb-user-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  min-width: 240px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: 1050;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-4px);
  transition: opacity 0.15s, transform 0.15s, visibility 0.15s;
}
.gnb-user-dropdown:hover .gnb-user-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.gnb-credit-block { padding: 16px 20px 12px; }
.gnb-credit-label { font-size: 12px; color: var(--gray-500); margin-bottom: 4px; }
.gnb-credit-value { display: flex; align-items: center; gap: 6px; }
.gnb-credit-amount {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.3px;
}
.gnb-credit-coin {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-indigo);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.gnb-credit-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--gray-500);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-300);
  padding-bottom: 1px;
}
.gnb-credit-link:hover { color: var(--gray-700); border-color: var(--gray-500); }

.gnb-user-menu-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 14px;
  color: var(--gray-700);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.gnb-user-menu-item:hover {
  background: var(--gray-50);
  color: var(--gray-900);
}

.gnb-menu-icon {
  font-size: 16px;
  color: var(--color-indigo);
  margin-right: 10px;
}

.gnb-burger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: var(--gray-700);
  font-size: 20px;
  margin-left: 4px;
}
.gnb-burger:hover { background: var(--gray-100); }

@media (min-width: 1024px) {
  .gnb-burger { display: none; }
}
</style>
