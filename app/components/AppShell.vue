<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const sidebarOpen = ref(false)

const credit = useState('credit-balance', () => 0)
const user = useState('current-user', () => ({ name: '관리자', email: 'admin@example.com' }))

const nav = computed<NavigationMenuItem[][]>(() => [
  [
    { label: '홈', icon: 'i-lucide-home', to: '/home' }
  ],
  [
    {
      label: '메시지 발송',
      icon: 'i-lucide-send',
      defaultOpen: true,
      children: [
        { label: 'SMS/LMS/MMS', icon: 'i-bi-chat-text', to: '/send/sms' },
        { label: 'RCS', icon: 'i-bi-chat-square-dots', to: '/send/rcs' },
        { label: '알림톡/친구톡', icon: 'i-bi-chat-heart', to: '/send/kakao' },
        { label: '이메일', icon: 'i-bi-envelope', to: '/send/email' },
        { label: 'PUSH', icon: 'i-bi-bell', to: '/send/push' },
        { label: '복합(플로우)', icon: 'i-bi-diagram-3', to: '/send/flow' }
      ]
    },
    {
      label: '발송 조회/통계',
      icon: 'i-lucide-bar-chart-2',
      children: [
        { label: 'SMS', to: '/history/sms' },
        { label: 'RCS', to: '/history/rcs' },
        { label: '알림톡', to: '/history/kakao' },
        { label: '이메일', to: '/history/email' },
        { label: 'PUSH', to: '/history/push' },
        { label: '통계', to: '/history/stats' }
      ]
    },
    {
      label: '캠페인 관리',
      icon: 'i-lucide-megaphone',
      to: '/campaign'
    }
  ],
  [
    {
      label: '주소록',
      icon: 'i-lucide-book-user',
      children: [
        { label: '연락처', to: '/contacts/list' },
        { label: '그룹', to: '/contacts/groups' },
        { label: '수신거부', to: '/contacts/optout' }
      ]
    },
    {
      label: '발신 정보',
      icon: 'i-lucide-id-card',
      children: [
        { label: '발신번호', to: '/sender/numbers' },
        { label: 'RCS 브랜드', to: '/sender/brands' },
        { label: '이메일 도메인', to: '/sender/domains' },
        { label: 'PUSH 인증서', to: '/sender/push-cert' },
        { label: '발신 프로필', to: '/sender/profiles' },
        { label: '080 수신거부', to: '/sender/optout-080' }
      ]
    },
    {
      label: '메시지관리(템플릿)',
      icon: 'i-lucide-file-text',
      children: [
        { label: 'SMS', to: '/manage/sms' },
        { label: 'RCS', to: '/manage/rcs' },
        { label: '알림톡', to: '/manage/kakao' },
        { label: '이메일', to: '/manage/email' },
        { label: 'PUSH', to: '/manage/push' },
        { label: '상세 설정', to: '/manage/settings' }
      ]
    }
  ],
  [
    {
      label: '크레딧',
      icon: 'i-lucide-coins',
      children: [
        { label: '충전', to: '/charge' },
        { label: '내역', to: '/account/credit' }
      ]
    },
    {
      label: '문의',
      icon: 'i-lucide-help-circle',
      children: [
        { label: '1:1 문의 작성', to: '/inquiry' },
        { label: '문의 내역', to: '/account/inquiries' }
      ]
    },
    {
      label: '계정 설정',
      icon: 'i-lucide-settings',
      to: '/account/settings'
    }
  ]
])

const userMenu = computed(() => [
  [
    { label: user.value.email, type: 'label' as const }
  ],
  [
    { label: '계정 설정', icon: 'i-lucide-settings', to: '/account/settings' },
    { label: '크레딧 내역', icon: 'i-lucide-coins', to: '/account/credit' }
  ],
  [
    { label: '로그아웃', icon: 'i-lucide-log-out', onSelect: () => navigateTo('/login') }
  ]
])
</script>

<template>
  <div class="flex h-full bg-neutral-50 dark:bg-neutral-950">
    <!-- 사이드바 (md+) -->
    <aside
      class="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
    >
      <div class="px-4 h-14 flex items-center border-b border-neutral-200 dark:border-neutral-800">
        <NuxtLink to="/home" class="flex items-center gap-2">
          <UIcon name="i-lucide-message-square-text" class="text-xl text-primary-500" />
          <span class="font-bold text-base">맑은 메시징</span>
        </NuxtLink>
      </div>
      <UNavigationMenu
        :items="nav"
        orientation="vertical"
        class="flex-1 overflow-y-auto py-2"
      />
      <div class="border-t border-neutral-200 dark:border-neutral-800 px-4 py-3 text-xs text-neutral-500">
        v0.1.0
      </div>
    </aside>

    <!-- 사이드바 (모바일 슬라이드) -->
    <USlideover v-model:open="sidebarOpen" side="left" :ui="{ content: 'w-72' }">
      <template #content>
        <div class="flex flex-col h-full">
          <div class="px-4 h-14 flex items-center border-b border-neutral-200 dark:border-neutral-800">
            <NuxtLink to="/home" class="flex items-center gap-2" @click="sidebarOpen = false">
              <UIcon name="i-lucide-message-square-text" class="text-xl text-primary-500" />
              <span class="font-bold text-base">맑은 메시징</span>
            </NuxtLink>
          </div>
          <UNavigationMenu
            :items="nav"
            orientation="vertical"
            class="flex-1 overflow-y-auto py-2"
            @select="sidebarOpen = false"
          />
        </div>
      </template>
    </USlideover>

    <!-- 본문 -->
    <div class="flex-1 flex flex-col min-w-0">
      <header
        class="h-14 shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center px-4 gap-2"
      >
        <UButton
          size="sm"
          variant="ghost"
          color="neutral"
          icon="i-lucide-menu"
          class="md:hidden"
          @click="sidebarOpen = true"
        />
        <div class="flex-1" />
        <UButton
          variant="soft"
          color="neutral"
          icon="i-lucide-coins"
          :label="`크레딧 ${credit.toLocaleString()}`"
          to="/charge"
        />
        <UButton variant="ghost" color="neutral" icon="i-lucide-bell" aria-label="알림" />
        <UDropdownMenu :items="userMenu">
          <UButton variant="ghost" color="neutral" trailing-icon="i-lucide-chevron-down">
            <UAvatar size="xs" :alt="user.name" />
            <span class="hidden sm:inline text-sm">{{ user.name }}</span>
          </UButton>
        </UDropdownMenu>
      </header>
      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
