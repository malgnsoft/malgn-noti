<script setup lang="ts">
useHead({ title: '대시보드' })

const credit = useState('credit-balance', () => 245800)

const kpis = [
  { label: '총 발송 (이번 달)', value: '6,284', unit: '건', delta: '+12.4%', dir: 'up', sub: '지난주 대비' },
  { label: '성공률', value: '98.7', unit: '%', delta: '+0.3%p', dir: 'up', sub: '62건 실패' },
  { label: '예약 발송', value: '26', unit: '건', delta: null, dir: '', sub: '오늘 3건 예정' },
  { label: '평균 처리 시간', value: '1.2', unit: '초', delta: '-0.3초', dir: 'up', sub: '지난주 대비' }
]

const aiActions = [
  { label: '실패 1건 검토', hint: '· 필터 적용' },
  { label: '알림톡 템플릿 추천', hint: '· 자동 생성' },
  { label: '다음 발송 시점', hint: '· 오늘 14:00' }
]

const channels = [
  { to: '/send/sms', code: 'SMS', name: '문자메시지', desc: 'SMS · LMS · MMS', price: '9.9 C', tone: 'sms', count: '2,388' },
  { to: '/send/kakao', code: 'KAKAO', name: '알림톡', desc: '비즈메시지 · 사전 승인 템플릿', price: '8.0 C', tone: 'kakao', count: '1,760' },
  { to: '/send/rcs', code: 'RCS', name: 'RCS', desc: '인증 발신자 · 이미지 · 버튼', price: '12.0 C', tone: 'rcs', count: '377' },
  { to: '/send/email', code: 'EMAIL', name: '이메일', desc: '트랜잭션 / 마케팅', price: '0.65 C', tone: 'email', count: '1,131' },
  { to: '/send/push', code: 'PUSH', name: 'PUSH', desc: '앱 푸시 알림', price: '0.0 C', tone: 'push', count: '628' },
  { to: '/send/flow', code: 'FLOW', name: '복합 플로우', desc: '다채널 시퀀스', price: '노드 합산', tone: 'flow', count: '—' }
]

const quickLinks = [
  { label: '발송 조회', icon: 'i-lucide-history', to: '/history/sms' },
  { label: '통계', icon: 'i-lucide-bar-chart-3', to: '/history/stats' },
  { label: '주소록', icon: 'i-lucide-users', to: '/contacts/list' },
  { label: '발신 정보', icon: 'i-lucide-shield', to: '/sender/numbers' }
]

const recent = [
  { ch: 'SMS', tone: 'sms', title: '[몰리몰리] 주문이 출고되었습니다.', c: 142, st: 'success', time: '오늘 14:23' },
  { ch: 'KAKAO', tone: 'kakao', title: '회원가입 환영 메시지 (자동)', c: 38, st: 'success', time: '오늘 11:05' },
  { ch: 'EMAIL', tone: 'email', title: '5월 뉴스레터 — 신상품 12종', c: 1024, st: 'success', time: '오늘 09:00' },
  { ch: 'PUSH', tone: 'push', title: '타임세일 시작 알림', c: 4892, st: 'partial', time: '어제 18:00' },
  { ch: 'RCS', tone: 'rcs', title: 'VIP 등급 안내', c: 142, st: 'success', time: '어제 15:30' }
]
</script>

<template>
  <div class="app-container page-body">
    <!-- 헤더 -->
    <header class="home-head">
      <div>
        <div class="home-crumb">
          <span class="dot pulse-dot" />
          <span>대시보드 · 2026.05.18</span>
        </div>
        <h1 class="home-title">
          맑은 메시징 운영 콘솔
        </h1>
        <p class="home-lead">
          최근 30일 <span class="num strong">6,284</span>건 발송 ·
          성공률 <span class="num pos">98.7%</span> ·
          사용 크레딧 <span class="num strong">12,420 C</span>
        </p>
      </div>
      <div class="home-head-actions">
        <NuxtLink to="/history/sms" class="btn btn-outline">
          <UIcon name="i-lucide-history" class="text-[14px]" /> 이력
        </NuxtLink>
        <NuxtLink to="/send/sms" class="btn btn-primary">
          <UIcon name="i-lucide-send" class="text-[14px]" /> 새 발송
        </NuxtLink>
      </div>
    </header>

    <!-- KPI -->
    <div class="kpi-grid">
      <div v-for="s in kpis" :key="s.label" class="stat-card">
        <div class="label">
          {{ s.label }}
        </div>
        <div class="kpi-value">
          <span class="value">{{ s.value }}</span>
          <span class="kpi-unit">{{ s.unit }}</span>
        </div>
        <div :class="['delta', s.dir]">
          <template v-if="s.delta">
            <UIcon :name="s.dir === 'up' ? 'i-lucide-trending-up' : 'i-lucide-trending-down'" class="text-[11px]" />{{ s.delta }} ·
          </template>
          {{ s.sub }}
        </div>
      </div>
    </div>

    <!-- AI 요약 -->
    <section class="ai-card">
      <div class="ai-icon">
        <UIcon name="i-lucide-sparkles" class="text-[14px]" />
      </div>
      <div class="ai-body">
        <div class="ai-meta">
          <span class="ai-tag">AI · 일일 요약</span>
          <span class="ai-sub">· 방금 전 · gpt-4o · 최근 24h</span>
        </div>
        <p class="ai-text">
          오늘 트래픽은 정상 범위입니다. <span class="ai-hl">알림톡 전환률 +18%</span>으로 SMS 대비 우위가 이어지고 있습니다. 광고성 SMS 1건이 발신 차단되어 검토가 필요합니다.
        </p>
        <div class="ai-actions">
          <button v-for="a in aiActions" :key="a.label" type="button" class="ai-chip">
            {{ a.label }}
            <span class="ai-chip-hint">{{ a.hint }}</span>
            <UIcon name="i-lucide-arrow-right" class="text-[11px] ai-chip-arrow" />
          </button>
        </div>
      </div>
    </section>

    <!-- 채널 + 크레딧 -->
    <div class="home-2col">
      <div class="card">
        <div class="card-header">
          <span class="step active">01</span>
          <span class="title">발송 채널</span>
          <span class="hint">6 channels</span>
        </div>
        <div>
          <NuxtLink
            v-for="(ch, i) in channels"
            :key="ch.to"
            :to="ch.to"
            class="ch-row"
            :class="{ 'ch-row-first': i === 0 }"
          >
            <span :class="['ch-pill', ch.tone]">{{ ch.code }}</span>
            <div class="ch-info">
              <div class="ch-name">
                {{ ch.name }}
              </div>
              <div class="ch-desc">
                {{ ch.desc }}
              </div>
            </div>
            <div class="ch-count num">
              <span class="strong">{{ ch.count }}</span> 건
            </div>
            <div class="ch-price num">
              {{ ch.price }}
            </div>
            <UIcon name="i-lucide-arrow-right" class="text-[12px] ch-arrow" />
          </NuxtLink>
        </div>
      </div>

      <div class="home-aside">
        <div class="credit-hero">
          <div class="label">
            잔여 크레딧
          </div>
          <div class="number">
            <span>{{ credit.toLocaleString() }}</span>
            <span class="unit">C</span>
          </div>
          <div class="note">
            이번 달 사용 12,420 C · SMS 약 1,254건 분
          </div>
          <NuxtLink to="/charge" class="credit-charge-btn">
            <UIcon name="i-lucide-plus" class="text-[12px]" /> 충전하기
          </NuxtLink>
        </div>

        <div class="card">
          <div class="card-header">
            <span class="title">바로가기</span>
          </div>
          <div class="quick-list">
            <NuxtLink
              v-for="q in quickLinks"
              :key="q.to"
              :to="q.to"
              class="quick-item"
            >
              <UIcon :name="q.icon" class="text-[14px] quick-icon" />
              <span class="quick-label">{{ q.label }}</span>
              <UIcon name="i-lucide-arrow-right" class="text-[12px] quick-arrow" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 최근 발송 -->
    <section>
      <div class="recent-head">
        <div>
          <div class="recent-eyebrow">
            02 · RECENT
          </div>
          <h2 class="recent-title">
            최근 발송
          </h2>
        </div>
        <NuxtLink to="/history/sms" class="recent-all">
          전체 보기 →
        </NuxtLink>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width: 100px">
                채널
              </th>
              <th>제목</th>
              <th style="width: 100px; text-align: right">
                수신자
              </th>
              <th style="width: 110px">
                상태
              </th>
              <th style="width: 140px">
                발송 시각
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in recent" :key="i">
              <td><span :class="['ch-pill', r.tone]">{{ r.ch }}</span></td>
              <td class="recent-subject">
                {{ r.title }}
              </td>
              <td class="cell-mono" style="text-align: right">
                {{ r.c.toLocaleString() }}
              </td>
              <td>
                <span v-if="r.st === 'success'" class="badge badge-success">
                  <span class="badge-dot" />완료
                </span>
                <span v-else class="badge badge-warning">
                  <span class="badge-dot" />일부 실패
                </span>
              </td>
              <td class="recent-time">
                {{ r.time }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 32px;
}
.home-crumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-400);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.home-crumb .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}
.home-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--ink-900);
  letter-spacing: -0.01em;
  margin: 0;
  line-height: 1.27;
}
.home-lead {
  font-size: 13px;
  color: var(--ink-500);
  margin: 6px 0 0;
  line-height: 1.55;
  max-width: 560px;
}
.home-lead .strong { color: var(--ink-900); }
.home-lead .pos { color: var(--accent-ink); }
.home-head-actions { display: flex; gap: 6px; }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.kpi-value { display: flex; align-items: baseline; gap: 4px; margin-top: 10px; }
.kpi-unit {
  font-size: 14px;
  color: var(--ink-400);
  font-family: var(--font-mono);
}
@media (max-width: 1023px) { .kpi-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr; } }

.ai-card {
  background: var(--ink-900);
  border: 1px solid var(--ink-800);
  border-radius: var(--r-lg);
  padding: 20px 24px;
  margin-bottom: 32px;
  color: var(--white);
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
.ai-icon {
  width: 28px;
  height: 28px;
  background: rgba(0, 220, 130, 0.12);
  color: var(--accent);
  border-radius: var(--r-md);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.ai-body { flex: 1; min-width: 0; }
.ai-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
.ai-tag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ai-sub { font-family: var(--font-mono); font-size: 10px; color: var(--ink-400); }
.ai-text { font-size: 15px; line-height: 1.55; color: var(--white); margin: 0; }
.ai-hl { color: var(--accent); }
.ai-actions { display: flex; gap: 6px; margin-top: 14px; flex-wrap: wrap; }
.ai-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--white);
  border-radius: var(--r-md);
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 0.12s;
}
.ai-chip:hover { background: rgba(255, 255, 255, 0.1); }
.ai-chip-hint { color: var(--ink-400); font-family: var(--font-mono); font-size: 10px; }
.ai-chip-arrow { color: var(--ink-400); transition: transform 0.15s; }
.ai-chip:hover .ai-chip-arrow { transform: translateX(2px); }

.home-2col {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
@media (max-width: 1023px) { .home-2col { grid-template-columns: 1fr; } }
.home-aside { display: flex; flex-direction: column; gap: 16px; }

.ch-row {
  display: grid;
  grid-template-columns: 100px 1fr 100px 80px 18px;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-top: 1px solid var(--line);
  transition: background 0.1s;
}
.ch-row-first { border-top: 0; }
.ch-row:hover { background: var(--paper); }
.ch-info { min-width: 0; }
.ch-name { font-size: 13px; font-weight: 500; color: var(--ink-900); }
.ch-desc { font-size: 12px; color: var(--ink-500); margin-top: 2px; }
.ch-count { font-size: 12px; color: var(--ink-500); text-align: right; }
.ch-count .strong { color: var(--ink-900); }
.ch-price { font-size: 11px; color: var(--ink-500); text-align: right; }
.ch-arrow { color: var(--ink-300); }

.credit-charge-btn {
  margin-top: 16px;
  width: 100%;
  background: var(--accent);
  color: var(--ink-900);
  border-radius: var(--r-md);
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.credit-charge-btn:hover { filter: brightness(0.96); }

.quick-list { padding: 4px 0; }
.quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 20px;
  font-size: 13px;
  color: var(--ink-700);
  transition: background 0.1s;
}
.quick-item:hover { background: var(--paper); }
.quick-icon { color: var(--ink-400); }
.quick-label { flex: 1; }
.quick-arrow { color: var(--ink-300); }

.recent-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.recent-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--ink-400);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.recent-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-900);
  margin: 0;
  letter-spacing: -0.005em;
}
.recent-all {
  font-size: 12px;
  color: var(--ink-600);
  font-family: var(--font-mono);
}
.recent-all:hover { color: var(--ink-900); }
.recent-subject { color: var(--ink-900); }
.recent-time { color: var(--ink-500); font-family: var(--font-mono); font-size: 12px; }
</style>
