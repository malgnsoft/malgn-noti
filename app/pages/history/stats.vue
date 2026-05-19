<script setup lang="ts">
useHead({ title: '발송 통계' })

const daily = [
  { d: '5/12', sms: 280, kakao: 120, email: 80 },
  { d: '5/13', sms: 340, kakao: 180, email: 95 },
  { d: '5/14', sms: 410, kakao: 220, email: 120 },
  { d: '5/15', sms: 380, kakao: 190, email: 100 },
  { d: '5/16', sms: 290, kakao: 140, email: 75 },
  { d: '5/17', sms: 450, kakao: 280, email: 160 },
  { d: '5/18', sms: 520, kakao: 320, email: 180 }
]
const max = Math.max(...daily.map(d => d.sms + d.kakao + d.email))
const period = ref('7d')

// 채널 색 — DESIGN.md §2.4 채널 도트 색 체계
const C_SMS = 'var(--info)'
const C_KAKAO = '#fbbf24'
const C_EMAIL = 'var(--warning)'
const C_PUSH = 'var(--accent)'
const C_RCS = '#8b5cf6'

const donut = [
  { c: C_SMS, n: 'SMS', p: 38, v: '2,388건' },
  { c: C_KAKAO, n: '알림톡', p: 28, v: '1,760건' },
  { c: C_EMAIL, n: '이메일', p: 18, v: '1,131건' },
  { c: C_PUSH, n: 'PUSH', p: 10, v: '628건' },
  { c: C_RCS, n: 'RCS', p: 6, v: '377건' }
]
function dashOffset(i: number) {
  return -donut.slice(0, i).reduce((a, d) => a + d.p, 0)
}

const topTpl = [
  { n: '주문 완료 안내 (K001)', c: '알림톡', v: 842, p: 100 },
  { n: '[몰리몰리] 출고 안내', c: 'SMS', v: 720, p: 86 },
  { n: '회원가입 환영 (K003)', c: '알림톡', v: 562, p: 67 },
  { n: '[몰리몰리] 결제 완료', c: 'SMS', v: 489, p: 58 },
  { n: '5월 뉴스레터', c: '이메일', v: 392, p: 47 }
]
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        발송 관리 · 통계
      </div>
      <h1>발송 통계</h1>
      <p>채널별 · 기간별 발송 추이와 성공률을 확인합니다.</p>
    </div>

    <div class="grid-cards grid-4" style="margin-bottom: 24px">
      <div class="stat-card">
        <div class="label">
          이번 달 총 발송
        </div>
        <div class="value">
          6,284
        </div>
        <div class="delta up">
          <UIcon name="i-lucide-trending-up" class="text-[12px]" /> +12.4%
        </div>
      </div>
      <div class="stat-card">
        <div class="label">
          성공률
        </div>
        <div class="value">
          98.7%
        </div>
        <div class="delta up">
          <UIcon name="i-lucide-trending-up" class="text-[12px]" /> +0.3%p
        </div>
      </div>
      <div class="stat-card">
        <div class="label">
          사용 크레딧
        </div>
        <div class="value">
          12,420 <span style="font-size: 14px; font-weight: 500; color: var(--ink-400)">C</span>
        </div>
        <div class="delta">
          잔액 245,800 C
        </div>
      </div>
      <div class="stat-card">
        <div class="label">
          평균 처리 시간
        </div>
        <div class="value">
          1.2 <span style="font-size: 14px; font-weight: 500; color: var(--ink-400)">초</span>
        </div>
        <div class="delta down">
          <UIcon name="i-lucide-trending-down" class="text-[12px]" /> -0.3초
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom: 24px">
      <div class="card-header">
        <div class="title">
          일별 발송량 (최근 7일)
        </div>
        <AppSegmented
          v-model="period"
          :options="[{ value: '7d', label: '7일' }, { value: '30d', label: '30일' }]"
        />
      </div>
      <div class="card-body">
        <div class="bars">
          <div v-for="(d, i) in daily" :key="i" class="bar-col">
            <div class="bar-total">
              {{ (d.sms + d.kakao + d.email).toLocaleString() }}
            </div>
            <div class="bar-stack" :style="{ height: ((d.sms + d.kakao + d.email) / max * 200) + 'px' }">
              <div :style="{ background: C_SMS, height: (d.sms / (d.sms + d.kakao + d.email) * 100) + '%' }" />
              <div :style="{ background: C_KAKAO, height: (d.kakao / (d.sms + d.kakao + d.email) * 100) + '%' }" />
              <div :style="{ background: C_EMAIL, height: (d.email / (d.sms + d.kakao + d.email) * 100) + '%' }" />
            </div>
            <div class="bar-label">
              {{ d.d }}
            </div>
          </div>
        </div>
        <div class="row" style="gap: 16px; justify-content: center; margin-top: 16px">
          <span class="lg"><span class="sw" :style="{ background: C_SMS }" />SMS</span>
          <span class="lg"><span class="sw" :style="{ background: C_KAKAO }" />알림톡</span>
          <span class="lg"><span class="sw" :style="{ background: C_EMAIL }" />이메일</span>
        </div>
      </div>
    </div>

    <div class="grid-cards grid-2">
      <div class="card">
        <div class="card-header">
          <div class="title">
            채널별 비율
          </div>
        </div>
        <div class="card-body">
          <div class="row" style="gap: 32px; justify-content: center; padding: 8px 0; flex-wrap: wrap">
            <div class="donut-wrap">
              <svg width="140" height="140" viewBox="0 0 42 42">
                <circle
                  v-for="(d, i) in donut"
                  :key="i"
                  cx="21"
                  cy="21"
                  r="15.9155"
                  fill="transparent"
                  :stroke="d.c"
                  stroke-width="6"
                  :stroke-dasharray="`${d.p} ${100 - d.p}`"
                  :stroke-dashoffset="dashOffset(i)"
                />
              </svg>
              <div class="center">
                6.3k
              </div>
            </div>
            <div class="col" style="gap: 8px; font-size: 12px; min-width: 170px">
              <div v-for="(s, i) in donut" :key="i" class="row">
                <span class="sw" :style="{ background: s.c }" />
                <span style="flex: 1">{{ s.n }}</span>
                <strong>{{ s.p }}%</strong>
                <span class="muted" style="font-size: 11px">{{ s.v }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="title">
            TOP 발송 템플릿
          </div>
        </div>
        <div class="card-body" style="padding: 0">
          <div
            v-for="(t, i) in topTpl"
            :key="i"
            class="tpl-row"
            :style="{ borderBottom: i < topTpl.length - 1 ? '1px solid var(--line)' : 'none' }"
          >
            <div class="row" style="justify-content: space-between; margin-bottom: 6px">
              <div style="font-size: 13px; display: flex; align-items: center; gap: 6px">
                <AppBadge tone="neutral">
                  {{ t.c }}
                </AppBadge>{{ t.n }}
              </div>
              <strong class="num">{{ t.v.toLocaleString() }}</strong>
            </div>
            <div class="tpl-track">
              <div class="tpl-fill" :style="{ width: t.p + '%' }" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bars {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  height: 240px;
  padding: 22px 16px 28px;
}
.bar-col {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}
.bar-total {
  font-size: 11px;
  color: var(--ink-700);
  font-weight: 600;
  font-family: var(--font-mono);
  margin-bottom: 6px;
}
.bar-stack {
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}
.bar-label {
  position: absolute;
  bottom: -24px;
  font-size: 11px;
  color: var(--ink-500);
  font-family: var(--font-mono);
}
.lg {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ink-600);
}
.sw {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}
.tpl-row { padding: 12px 20px; }
.tpl-track {
  height: 4px;
  background: var(--ink-100);
  border-radius: 2px;
}
.tpl-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
}
</style>
