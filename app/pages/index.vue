<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '맑은 메시징 — 통합 알림 메시징 서비스' })

/* 로그인 상태에서는 대시보드로 이동 (실제 인증 연동 시 활성화)
   현재는 인증 stub 단계라 비활성 — `/`는 항상 랜딩을 표시
const isAuthed = useAuthState()
if (isAuthed.value) await navigateTo('/home', { replace: true })
*/

interface Channel {
  icon: string
  name: string
  tag: string
  desc: string
}

const CHANNELS: Channel[] = [
  {
    icon: 'i-lucide-message-square-text',
    name: '문자메시지',
    tag: 'SMS · LMS · MMS',
    desc: '단문부터 장문·멀티미디어까지, 가장 확실하게 닿는 기본 채널.',
  },
  {
    icon: 'i-lucide-message-square-more',
    name: 'RCS',
    tag: 'Rich Communication',
    desc: '이미지·버튼·캐러셀로 브랜드 경험을 담는 차세대 리치 메시지.',
  },
  {
    icon: 'i-lucide-message-circle',
    name: '알림톡 / 친구톡',
    tag: 'KakaoTalk Bizmessage',
    desc: '카카오톡 채널로 발송하는 정보성·마케팅 비즈메시지.',
  },
  {
    icon: 'i-lucide-mail',
    name: '이메일',
    tag: 'Transactional · Marketing',
    desc: '도메인 인증(DKIM) 기반의 안정적인 트랜잭션·마케팅 이메일.',
  },
  {
    icon: 'i-lucide-bell',
    name: 'PUSH',
    tag: 'iOS · Android · Web',
    desc: 'FCM·APNs 연동으로 앱 사용자에게 보내는 푸시 알림.',
  },
  {
    icon: 'i-lucide-workflow',
    name: '복합 발송',
    tag: 'Flow',
    desc: '알림톡 → 친구톡 → LMS처럼 채널을 묶어 순차·폴백 발송.',
  },
]

interface Benefit {
  icon: string
  title: string
  desc: string
}

const BENEFITS: Benefit[] = [
  {
    icon: 'i-lucide-layout-grid',
    title: '하나의 콘솔, 5개 채널',
    desc: '채널마다 따로 계약하고 따로 발송할 필요 없이, 발송 · 이력 · 통계 · 템플릿을 한 화면에서 통합 관리합니다.',
  },
  {
    icon: 'i-lucide-badge-check',
    title: '자체 브랜드로 발송',
    desc: '발신번호 · 이메일 도메인 · RCS 브랜드 · 카카오 발신 프로필을 직접 등록해, 고객에게는 우리 브랜드 그대로 전달됩니다.',
  },
  {
    icon: 'i-lucide-wallet',
    title: '사용한 만큼만 과금',
    desc: '크레딧을 충전해 발송한 만큼만 차감합니다. 채널별 단가가 투명하게 공개되어 비용을 예측할 수 있습니다.',
  },
  {
    icon: 'i-lucide-sparkles',
    title: 'AI 템플릿 · 복합 발송',
    desc: 'AI가 채널에 맞는 문안을 만들어 주고, 채널을 묶어 실패 시 자동으로 다음 채널로 폴백 발송합니다.',
  },
]

interface PriceRow {
  channel: string
  other: string
  ours: string
}

/* 채널별 발송 단가 비교 (목업) */
const PRICES: PriceRow[] = [
  { channel: '단문문자 (SMS)', other: '8.8원', ours: '7.4원' },
  { channel: '장문문자 (LMS)', other: '29원', ours: '22원' },
  { channel: '알림톡', other: '9원', ours: '6.5원' },
  { channel: 'RCS', other: '22.7원', ours: '18원' },
]
</script>

<template>
  <div class="lp">
    <!-- 헤더 -->
    <header class="lp-header">
      <div class="lp-container lp-header-inner">
        <NuxtLink to="/" class="lp-logo">
          <span class="lp-logo-mark"><AppLogoMark /></span>
          <span class="lp-logo-text">맑은</span>
          <span class="lp-logo-sub">message</span>
        </NuxtLink>
        <nav class="lp-nav">
          <a href="#channels" class="lp-nav-link">채널</a>
          <NuxtLink to="/help" target="_blank" rel="noopener noreferrer" class="lp-nav-link">운영 가이드</NuxtLink>
        </nav>
        <div class="lp-header-actions">
          <NuxtLink to="/login" class="btn btn-ghost btn-sm">로그인</NuxtLink>
          <NuxtLink to="/signup" class="btn btn-primary btn-sm">무료로 시작하기</NuxtLink>
        </div>
      </div>
    </header>

    <!-- 히어로 -->
    <section class="lp-hero">
      <div class="lp-container lp-hero-inner">
        <span class="lp-eyebrow">통합 알림 메시징 서비스</span>
        <h1 class="lp-hero-title">
          고객에게 닿는 모든 메시지,<br>
          <span class="lp-accent">맑은 메시징</span> 하나로.
        </h1>
        <p class="lp-hero-sub">
          SMS부터 RCS · 알림톡 · 이메일 · PUSH까지 —
          NHN Cloud Notification Hub 기반의 멀티 채널 메시징을
          하나의 콘솔에서 발송하고 관리하세요.
        </p>
        <div class="lp-hero-cta">
          <NuxtLink to="/signup" class="btn btn-primary btn-lg">
            무료로 시작하기
            <UIcon name="i-lucide-arrow-right" class="text-[length:var(--fz-md)]" />
          </NuxtLink>
          <NuxtLink to="/login" class="btn btn-outline-dark btn-lg">
            로그인
          </NuxtLink>
        </div>
        <div class="lp-hero-meta">
          <span><UIcon name="i-lucide-check" /> 5개 채널 + 복합 발송</span>
          <span><UIcon name="i-lucide-check" /> 사용한 만큼 크레딧 차감</span>
          <span><UIcon name="i-lucide-check" /> 자체 브랜드로 발송</span>
        </div>
      </div>
    </section>

    <!-- 채널 소개 -->
    <section id="channels" class="lp-section">
      <div class="lp-container">
        <div class="lp-section-head">
          <span class="lp-eyebrow">CHANNELS</span>
          <h2 class="lp-section-title">5개 채널, 그리고 복합 발송</h2>
          <p class="lp-section-sub">
            채널마다 따로 계약하고 따로 발송하던 메시지를, 맑은 메시징에서 한 번에.
          </p>
        </div>

        <div class="lp-channels">
          <article v-for="c in CHANNELS" :key="c.name" class="lp-channel">
            <span class="lp-channel-icon"><UIcon :name="c.icon" /></span>
            <div class="lp-channel-head">
              <h3>{{ c.name }}</h3>
              <span class="lp-channel-tag">{{ c.tag }}</span>
            </div>
            <p class="lp-channel-desc">{{ c.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 맑은 메시징의 장점 -->
    <section class="lp-section lp-section-tint">
      <div class="lp-container">
        <div class="lp-section-head">
          <span class="lp-eyebrow">WHY MALGN</span>
          <h2 class="lp-section-title">맑은 메시징의 장점</h2>
          <p class="lp-section-sub">
            메시징 운영에 필요한 모든 것을, 더 단순하고 합리적으로.
          </p>
        </div>

        <div class="lp-benefits">
          <article v-for="b in BENEFITS" :key="b.title" class="lp-benefit">
            <span class="lp-benefit-icon"><UIcon :name="b.icon" /></span>
            <h3>{{ b.title }}</h3>
            <p>{{ b.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 요금제 — 단가 비교 -->
    <section class="lp-section">
      <div class="lp-container">
        <div class="lp-section-head">
          <span class="lp-eyebrow">PRICING</span>
          <h2 class="lp-section-title">
            가입 후 90일 동안<br>
            최대 30% 저렴한 단가로 이용하세요
          </h2>
          <p class="lp-section-sub">
            주요 채널의 발송 단가를 비교해 보세요. 프로모션가는 신규 가입 후 90일간 적용됩니다.
          </p>
        </div>

        <div class="lp-pricing">
          <template v-for="p in PRICES" :key="p.channel">
            <div class="lp-price-card other">
              <div class="lp-price-top">
                <span class="lp-price-channel">{{ p.channel }}</span>
                <span class="lp-price-badge other">타사</span>
              </div>
              <div class="lp-price-amount">
                {{ p.other }} <span class="lp-price-unit">(1건당)</span>
              </div>
            </div>
            <div class="lp-price-card ours">
              <div class="lp-price-top">
                <span class="lp-price-channel">{{ p.channel }}</span>
                <span class="lp-price-badge ours">맑은 메시징</span>
              </div>
              <div class="lp-price-amount">
                {{ p.ours }} <span class="lp-price-unit">(1건당 / 프로모션가)</span>
              </div>
            </div>
          </template>
        </div>

        <p class="lp-plans-note">
          표시 단가는 부가세 별도이며, 채널 · 발송량에 따라 달라질 수 있습니다.
        </p>
      </div>
    </section>

    <!-- 마무리 CTA -->
    <section class="lp-cta">
      <div class="lp-container lp-cta-inner">
        <h2>메시지 발송, 지금 시작하세요</h2>
        <p>회원가입 후 발신 정보를 등록하면 바로 첫 메시지를 보낼 수 있습니다.</p>
        <NuxtLink to="/signup" class="btn btn-primary btn-lg">
          무료로 시작하기
          <UIcon name="i-lucide-arrow-right" class="text-[length:var(--fz-md)]" />
        </NuxtLink>
      </div>
    </section>

    <!-- 푸터 -->
    <footer class="lp-footer">
      <div class="lp-container lp-footer-inner">
        <div class="lp-footer-brand">
          <span class="lp-logo-text">맑은</span>
          <span class="lp-logo-sub">message</span>
        </div>
        <nav class="lp-footer-nav">
          <NuxtLink to="/login">로그인</NuxtLink>
          <NuxtLink to="/signup">회원가입</NuxtLink>
          <NuxtLink to="/help" target="_blank" rel="noopener noreferrer">운영 가이드</NuxtLink>
          <NuxtLink to="/account/inquiry">문의하기</NuxtLink>
        </nav>
        <p class="lp-footer-copy">© 2026 맑은소프트. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lp {
  background: var(--white);
  color: var(--ink-900);
}
.lp-container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 헤더 */
.lp-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--line);
}
.lp-header-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 64px;
}
.lp-logo {
  display: flex;
  align-items: center;
  gap: 6px;
}
.lp-logo-mark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: var(--ink-900);
  color: var(--white);
  border-radius: var(--r-md);
}
.lp-logo-text {
  font-size: var(--fz-lg);
  font-weight: 800;
  color: var(--ink-900);
}
.lp-logo-sub {
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
  color: var(--ink-400);
}
.lp-nav {
  display: flex;
  gap: 4px;
  margin-left: 12px;
}
.lp-nav-link {
  padding: 6px 10px;
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
}
.lp-nav-link:hover { background: var(--ink-50); color: var(--ink-900); }
.lp-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* 히어로 */
.lp-hero {
  background:
    radial-gradient(ellipse 70% 60% at 50% 0%, var(--accent-soft), transparent 70%),
    var(--white);
  border-bottom: 1px solid var(--line);
}
.lp-hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 84px;
  padding-bottom: 88px;
}
.lp-eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent-ink);
}
.lp-hero-title {
  font-size: clamp(30px, 5vw, 48px);
  font-weight: 800;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--ink-900);
  margin: 16px 0 0;
}
.lp-accent { color: var(--accent-ink); }
.lp-hero-sub {
  max-width: 600px;
  font-size: var(--fz-lg);
  color: var(--ink-500);
  line-height: 1.7;
  margin: 20px 0 0;
}
.lp-hero-cta {
  display: flex;
  gap: 10px;
  margin-top: 32px;
}
.lp-hero-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 18px;
  margin-top: 28px;
}
.lp-hero-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.lp-hero-meta :deep(svg) { color: var(--accent-ink); }

/* 섹션 공통 */
.lp-section {
  padding: 88px 0;
}
.lp-section-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 44px;
}
.lp-section-title {
  font-size: clamp(24px, 3.5vw, 34px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--ink-900);
  margin: 12px 0 0;
}
.lp-section-sub {
  max-width: 520px;
  font-size: var(--fz-md);
  color: var(--ink-500);
  line-height: 1.7;
  margin: 12px 0 0;
}

/* 채널 카드 */
.lp-channels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.lp-channel {
  padding: 26px 24px;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  transition: border-color 0.14s, box-shadow 0.14s, transform 0.14s;
}
.lp-channel:hover {
  border-color: var(--ink-200);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}
.lp-channel-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--r-md);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: var(--fz-2xl);
  margin-bottom: 16px;
}
.lp-channel-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.lp-channel-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.lp-channel-tag {
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  color: var(--ink-400);
}
.lp-channel-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.65;
  margin: 8px 0 0;
}

/* 장점 */
.lp-section-tint {
  background: var(--ink-50);
  border-top: 1px solid var(--line);
}
.lp-benefits {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.lp-benefit {
  padding: 28px 26px;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
}
.lp-benefit-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-md);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: var(--fz-xl);
  margin-bottom: 14px;
}
.lp-benefit h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 8px;
}
.lp-benefit p {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.65;
  margin: 0;
}

/* 요금제 — 단가 비교 */
.lp-pricing {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.lp-price-card {
  padding: 24px 26px;
  border-radius: var(--r-lg);
}
.lp-price-card.other {
  background: var(--ink-50);
  border: 1px solid var(--line);
}
.lp-price-card.ours {
  background: var(--accent);
}
.lp-price-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.lp-price-channel {
  font-size: var(--fz-md);
  font-weight: 600;
}
.lp-price-card.other .lp-price-channel { color: var(--ink-500); }
.lp-price-card.ours .lp-price-channel { color: var(--ink-900); }
.lp-price-badge {
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 12px;
  border-radius: var(--r-full);
  font-size: var(--fz-xs);
  font-weight: 700;
  white-space: nowrap;
}
.lp-price-badge.other { background: var(--ink-400); color: var(--white); }
.lp-price-badge.ours { background: var(--ink-900); color: var(--white); }
.lp-price-amount {
  font-size: clamp(26px, 3.6vw, 34px);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.lp-price-card.other .lp-price-amount { color: var(--ink-400); }
.lp-price-card.ours .lp-price-amount { color: var(--ink-900); }
.lp-price-unit {
  font-size: var(--fz-sm);
  font-weight: 500;
}
.lp-price-card.other .lp-price-unit { color: var(--ink-400); }
.lp-price-card.ours .lp-price-unit { color: var(--ink-800); }
.lp-plans-note {
  text-align: center;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 28px 0 0;
}

/* 마무리 CTA */
.lp-cta {
  background: var(--ink-900);
}
.lp-cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 72px 24px;
}
.lp-cta h2 {
  font-size: clamp(24px, 3.5vw, 32px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--white);
  margin: 0;
}
.lp-cta p {
  font-size: var(--fz-md);
  color: var(--ink-400);
  margin: 12px 0 28px;
}

/* 푸터 */
.lp-footer {
  background: var(--white);
  border-top: 1px solid var(--line);
}
.lp-footer-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-top: 28px;
  padding-bottom: 28px;
}
.lp-footer-brand {
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.lp-footer-nav {
  display: flex;
  gap: 16px;
}
.lp-footer-nav a {
  font-size: var(--fz-sm);
  color: var(--ink-500);
}
.lp-footer-nav a:hover { color: var(--ink-900); }
.lp-footer-copy {
  margin: 0 0 0 auto;
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

@media (max-width: 720px) {
  .lp-nav { display: none; }
  .lp-channels { grid-template-columns: 1fr; }
  .lp-benefits { grid-template-columns: 1fr; }
  .lp-hero-inner { padding-top: 60px; padding-bottom: 64px; }
  .lp-section { padding: 60px 0; }
  .lp-footer-copy { margin: 8px 0 0; width: 100%; }
}
</style>
