<script setup lang="ts">
useHead({ title: '홈' })

const credit = useState('credit-balance', () => 0)
const user = useState('current-user', () => ({ name: '관리자', email: 'admin@malgn.example' }))

const channels = [
  { label: 'SMS/LMS/MMS', desc: '문자 메시지 발송', to: '/send/sms', icon: 'i-bi-chat-text', color: '#027CFA' },
  { label: 'RCS', desc: '리치 메시지', to: '/send/rcs', icon: 'i-bi-chat-square-dots', color: '#10B981' },
  { label: '알림톡/친구톡', desc: '카카오 비즈 메시지', to: '/send/kakao', icon: 'i-bi-chat-heart', color: '#F59E0B' },
  { label: '이메일', desc: '트랜잭션/마케팅', to: '/send/email', icon: 'i-bi-envelope', color: '#6756ED' },
  { label: 'PUSH', desc: '앱 푸시 알림', to: '/send/push', icon: 'i-bi-bell', color: '#EF4444' },
  { label: '복합(플로우)', desc: '채널 폴백 발송', to: '/send/flow', icon: 'i-bi-diagram-3', color: '#6B7280' }
]

const stats = [
  { label: '오늘 발송', value: '—', icon: 'i-lucide-send' },
  { label: '예약 대기', value: '—', icon: 'i-lucide-clock' },
  { label: '실패', value: '—', icon: 'i-lucide-alert-triangle' },
  { label: '이번 달 사용 크레딧', value: '—', icon: 'i-lucide-trending-down' }
]
</script>

<template>
  <div class="home-page">
    <div class="app-container py-10">
      <!-- 헤더 -->
      <div class="home-header">
        <div>
          <h1 class="home-greeting">
            안녕하세요, <span class="home-name">{{ user.name }}</span>님
          </h1>
          <p class="home-sub">맑은 메시징에 오신 것을 환영합니다.</p>
        </div>
        <div class="home-credit-card">
          <div class="home-credit-label">잔여 크레딧</div>
          <div class="home-credit-row">
            <span class="home-credit-coin">C</span>
            <span class="home-credit-value">{{ credit.toLocaleString() }}</span>
          </div>
          <NuxtLink to="/charge" class="home-credit-btn">충전하기</NuxtLink>
        </div>
      </div>

      <!-- 요약 카드 -->
      <div class="home-stats">
        <div v-for="s in stats" :key="s.label" class="home-stat">
          <div class="home-stat-info">
            <div class="home-stat-label">{{ s.label }}</div>
            <div class="home-stat-value">{{ s.value }}</div>
          </div>
          <UIcon :name="s.icon" class="home-stat-icon" />
        </div>
      </div>

      <!-- 빠른 발송 -->
      <section class="home-section">
        <div class="home-section-head">
          <h2 class="home-section-title">빠른 발송</h2>
          <NuxtLink to="/history/sms" class="home-section-link">
            발송 조회 →
          </NuxtLink>
        </div>
        <div class="home-channels">
          <NuxtLink
            v-for="ch in channels"
            :key="ch.label"
            :to="ch.to"
            class="home-channel"
          >
            <div class="home-channel-icon" :style="{ background: `${ch.color}1A`, color: ch.color }">
              <UIcon :name="ch.icon" />
            </div>
            <div>
              <div class="home-channel-label">{{ ch.label }}</div>
              <div class="home-channel-desc">{{ ch.desc }}</div>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="home-channel-arrow" />
          </NuxtLink>
        </div>
      </section>

      <!-- 2단: 최근 활동 + 발송 추세 -->
      <section class="content-2col">
        <div class="home-card">
          <div class="home-card-head">
            <h3 class="home-card-title">최근 발송</h3>
            <NuxtLink to="/history/sms" class="home-card-link">전체 보기</NuxtLink>
          </div>
          <div class="home-empty">
            <UIcon name="i-lucide-inbox" class="home-empty-icon" />
            <div class="home-empty-text">아직 발송 이력이 없습니다.</div>
            <NuxtLink to="/send/sms" class="home-empty-cta">첫 발송 시작하기</NuxtLink>
          </div>
        </div>
        <aside class="content-2col-aside">
          <div class="home-card">
            <div class="home-card-head">
              <h3 class="home-card-title">이번 주 발송량</h3>
            </div>
            <div class="home-empty home-empty-sm">
              <UIcon name="i-lucide-bar-chart-2" class="home-empty-icon" />
              <div class="home-empty-text">데이터 없음</div>
            </div>
          </div>
          <div class="home-tip-card">
            <div class="home-tip-icon">💡</div>
            <div class="home-tip-body">
              <div class="home-tip-title">처음이신가요?</div>
              <div class="home-tip-text">
                발신 번호와 도메인을 먼저 등록한 후 첫 발송을 시작해 보세요.
              </div>
              <NuxtLink to="/sender/numbers" class="home-tip-link">
                발신 정보 설정하기 →
              </NuxtLink>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  background: var(--gray-50);
  min-height: 100%;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.home-greeting {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.5px;
  margin: 0;
}

.home-name { color: var(--color-indigo); }

.home-sub {
  font-size: 14px;
  color: var(--gray-500);
  margin: 4px 0 0;
}

.home-credit-card {
  background: linear-gradient(135deg, var(--color-sky-vivid), var(--color-indigo));
  color: #fff;
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 240px;
  box-shadow: 0 6px 20px rgba(2, 124, 250, 0.18);
}

.home-credit-label {
  font-size: 12px;
  opacity: 0.85;
  letter-spacing: -0.2px;
}

.home-credit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-credit-coin {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.home-credit-value {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.home-credit-btn {
  display: inline-block;
  align-self: flex-start;
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: background 0.15s;
}
.home-credit-btn:hover { background: rgba(255, 255, 255, 0.28); }

.home-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .home-stats { grid-template-columns: repeat(2, 1fr); }
}

.home-stat {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-stat-label {
  font-size: 12px;
  color: var(--gray-500);
  margin-bottom: 4px;
}

.home-stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--gray-900);
  letter-spacing: -0.5px;
}

.home-stat-icon {
  font-size: 22px;
  color: var(--color-indigo);
  opacity: 0.6;
}

.home-section { margin-bottom: 32px; }

.home-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.home-section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.home-section-link {
  font-size: 13px;
  color: var(--color-sky-vivid);
  text-decoration: none;
}
.home-section-link:hover { color: #0167d4; }

.home-channels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 1024px) {
  .home-channels { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .home-channels { grid-template-columns: 1fr; }
}

.home-channel {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  text-decoration: none;
  color: var(--gray-800);
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}
.home-channel:hover {
  border-color: var(--gray-300);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.home-channel-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.home-channel-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  line-height: 1.2;
}
.home-channel-desc {
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 2px;
}

.home-channel-arrow {
  margin-left: auto;
  font-size: 16px;
  color: var(--gray-400);
}
.home-channel:hover .home-channel-arrow { color: var(--gray-700); }

.home-card {
  background: #fff;
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 20px;
}

.home-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.home-card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.home-card-link {
  font-size: 12px;
  color: var(--gray-500);
  text-decoration: none;
}
.home-card-link:hover { color: var(--gray-700); }

.home-empty {
  padding: 40px 16px;
  text-align: center;
  color: var(--gray-500);
}
.home-empty-sm { padding: 24px 12px; }

.home-empty-icon {
  font-size: 32px;
  color: var(--gray-300);
  display: block;
  margin: 0 auto 8px;
}

.home-empty-text {
  font-size: 13px;
  margin-bottom: 12px;
}

.home-empty-cta {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 999px;
  background: var(--color-indigo);
  color: #fff;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
}
.home-empty-cta:hover { background: #5343d6; }

.home-tip-card {
  margin-top: 12px;
  background: var(--color-sky-soft);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  gap: 12px;
}

.home-tip-icon { font-size: 22px; line-height: 1.2; }
.home-tip-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 4px;
}
.home-tip-text {
  font-size: 12px;
  color: var(--gray-700);
  line-height: 1.5;
}
.home-tip-link {
  display: inline-block;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-sky-vivid);
  text-decoration: none;
}
.home-tip-link:hover { color: #0167d4; }
</style>
