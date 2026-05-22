<script setup lang="ts">
useHead({ title: '운영 가이드' })

interface GuideRoute { label: string, to: string }
interface GuideSection {
  id: string
  icon: string
  title: string
  intro: string
  routes: GuideRoute[]
  steps: string[]
  tip?: string
}

/* 운영 가이드 — 각 화면 사용법 */
const SECTIONS: GuideSection[] = [
  {
    id: 'start',
    icon: 'i-lucide-rocket',
    title: '시작하기',
    intro: '맑은 메시징 콘솔에 가입·로그인하고 서비스 이용을 시작합니다.',
    routes: [
      { label: '로그인', to: '/login' },
      { label: '회원가입', to: '/signup' },
      { label: '대시보드', to: '/home' },
    ],
    steps: [
      '회원가입 화면에서 법인 사업자 / 개인 사업자 / 개인 유형을 선택하고, 안내 · 정보 확인 · 아이디 등록 · 휴대폰 본인 인증 · 완료의 5단계 절차를 따릅니다.',
      '발급받은 이메일 아이디와 비밀번호로 로그인합니다. 보안로그인을 사용 중이면 이메일 또는 휴대전화 인증을 추가로 거칩니다.',
      '로그인 후 대시보드에서 발송 현황 · 크레딧 잔액 · 최근 이력을 한눈에 확인합니다.',
    ],
    tip: '비밀번호가 기억나지 않으면 로그인 화면의 "비밀번호 재설정"에서 메일을 받아 새 비밀번호를 설정하세요.',
  },
  {
    id: 'send',
    icon: 'i-lucide-send',
    title: '메시지 발송',
    intro: 'SMS · RCS · 알림톡/친구톡 · 이메일 · PUSH 및 복합(플로우) 채널로 메시지를 발송합니다.',
    routes: [
      { label: '문자메시지', to: '/send/sms' },
      { label: 'RCS', to: '/send/rcs' },
      { label: '알림톡/친구톡', to: '/send/kakao' },
      { label: '이메일', to: '/send/email' },
      { label: 'PUSH', to: '/send/push' },
      { label: '복합 발송', to: '/send/flow' },
    ],
    steps: [
      '상단 메뉴에서 발송할 채널을 선택합니다.',
      '발신 정보를 고르고 메시지 내용을 입력합니다. 샘플 · 채널 템플릿이나 AI 문장 다듬기를 활용할 수 있습니다.',
      '수신자를 직접 입력하거나 주소록 · 그룹에서 선택합니다.',
      '즉시 발송 또는 예약 시점을 지정하고, 발송 확인 창에서 수신자 수와 예상 크레딧을 확인한 뒤 발송합니다.',
    ],
    tip: '광고성 메시지는 (광고) 표기와 수신거부 안내가 자동 처리되며, 복합 발송은 알림톡 → 친구톡 → LMS 같은 폴백 순서를 지정할 수 있습니다.',
  },
  {
    id: 'history',
    icon: 'i-lucide-list-checks',
    title: '발송 조회 · 통계',
    intro: '채널별 발송 이력을 조회하고 발송 · 수신 통계를 확인합니다.',
    routes: [
      { label: '발송 조회', to: '/history/sms' },
      { label: '통계', to: '/history/stats' },
    ],
    steps: [
      '채널별 발송 조회 화면에서 기간 · 발송 상태 · 검색어로 이력을 필터링합니다.',
      '예약 발송 건은 목록에서 선택하여 일괄 또는 개별 취소할 수 있습니다.',
      '대량 결과는 "목록 다운로드 요청"으로 비동기 생성한 뒤 "다운로드 요청 목록"에서 내려받습니다.',
      '통계 화면에서 채널 · 기간별 발송 추이와 수신 결과를 그래프로 확인합니다.',
    ],
  },
  {
    id: 'contacts',
    icon: 'i-lucide-contact',
    title: '주소록',
    intro: '연락처와 그룹을 관리하고 수신 거부 대상을 관리합니다.',
    routes: [
      { label: '연락처', to: '/contacts/list' },
      { label: '그룹', to: '/contacts/groups' },
      { label: '수신 거부', to: '/contacts/optout' },
    ],
    steps: [
      '주소록 관리에서 연락처를 직접 등록하거나 엑셀 파일로 일괄 업로드합니다.',
      '연락처를 그룹으로 묶어 발송 시 그룹 단위로 수신자를 선택합니다.',
      '수신 거부 관리(휴대폰 · 이메일 · 토큰)에 등록된 대상은 모든 발송에서 자동 제외됩니다.',
    ],
  },
  {
    id: 'sender',
    icon: 'i-lucide-id-card',
    title: '발신 정보',
    intro: '채널별 발신 식별자를 등록하고 인증합니다. 발송 전 반드시 준비되어야 합니다.',
    routes: [
      { label: '발신 번호', to: '/sender/numbers' },
      { label: 'RCS 브랜드', to: '/sender/brands' },
      { label: '이메일 도메인', to: '/sender/domains' },
      { label: 'PUSH 인증', to: '/sender/push-cert' },
      { label: '발신 프로필', to: '/sender/profiles' },
      { label: '080 수신 거부', to: '/sender/optout-080' },
    ],
    steps: [
      '문자 발송 전 발신 번호를 등록하고 통신사 인증을 완료합니다.',
      '이메일 발송은 발신 도메인을 등록하고 안내된 DKIM 레코드를 DNS에 설정합니다.',
      'RCS 브랜드, PUSH 인증서(FCM · APNs), 카카오 발신 프로필을 각 채널에 맞게 등록합니다.',
    ],
    tip: '광고 문자를 발송하려면 080 수신 거부 번호를 함께 등록해야 합니다.',
  },
  {
    id: 'manage',
    icon: 'i-lucide-layout-template',
    title: '메시지 관리',
    intro: '채널별 템플릿을 만들어 발송 시 재사용합니다.',
    routes: [
      { label: '문자 템플릿', to: '/manage/sms' },
      { label: '알림톡 템플릿', to: '/manage/kakao' },
      { label: '랜딩페이지', to: '/manage/landing' },
      { label: '상세 설정', to: '/manage/settings' },
    ],
    steps: [
      '채널별 템플릿 화면에서 카테고리를 만들고 자주 쓰는 문안을 템플릿으로 등록합니다.',
      '시스템이 제공하는 샘플 템플릿이나 AI 템플릿 생성 기능을 활용할 수 있습니다.',
      '상세 설정에서 대체 문자 등 발송 옵션을 채널별로 지정합니다.',
    ],
  },
  {
    id: 'credit',
    icon: 'i-lucide-wallet',
    title: '크레딧 충전',
    intro: '메시지 발송에 사용하는 크레딧을 충전하고 결제 수단을 관리합니다.',
    routes: [
      { label: '크레딧 충전', to: '/charge' },
      { label: '크레딧 관리', to: '/account/credit' },
      { label: '결제 카드 관리', to: '/account/cards' },
    ],
    steps: [
      '크레딧 충전 화면에서 충전 금액을 선택하고 등록된 카드로 결제합니다.',
      '결제 카드 관리에서 카드를 추가하고 기본 결제 카드를 지정합니다.',
      '크레딧 관리에서 충전 · 사용 내역을 조회하고, 충전 건의 영수증을 확인합니다.',
    ],
    tip: '발송 시점에 크레딧이 부족하면 발송이 보류됩니다. 정기 발송이 있다면 잔액을 미리 확보하세요.',
  },
  {
    id: 'account',
    icon: 'i-lucide-user-cog',
    title: '나의 페이지',
    intro: '회원 정보와 계정 보안, 멀티 계정, 이용계약을 관리합니다.',
    routes: [
      { label: '회원 정보 변경', to: '/account/settings' },
      { label: '비밀번호 변경', to: '/account/password' },
      { label: '보안로그인 설정', to: '/account/security' },
      { label: '멀티 계정 추가', to: '/account/multi' },
      { label: '계약 관리', to: '/account/contract' },
    ],
    steps: [
      '회원 정보 변경에서 서비스 담당자 정보와 결제 이메일을 수정합니다.',
      '비밀번호 변경 · 보안로그인 설정으로 계정 보안을 강화합니다.',
      '멀티 계정 추가에서 서비스 담당자를 이메일로 초대하면, 초대받은 담당자는 메일 링크에서 비밀번호 설정과 본인 인증을 거쳐 등록을 완료합니다.',
      '계약 관리에서 이용계약을 전자서명으로 체결하고 사업자등록증 등 가입 서류를 첨부합니다.',
    ],
  },
  {
    id: 'inquiry',
    icon: 'i-lucide-message-circle-question',
    title: '문의',
    intro: '서비스 이용 중 궁금한 점을 1:1로 문의하고 답변을 확인합니다.',
    routes: [
      { label: '문의하기', to: '/account/inquiry' },
      { label: '나의 문의', to: '/account/inquiries' },
    ],
    steps: [
      '문의하기에서 문의 유형을 선택하고 제목 · 내용 · 첨부파일을 작성해 접수합니다.',
      '나의 문의에서 문의별 답변 상태(답변대기 · 답변중 · 답변완료)를 확인합니다.',
      '문의 상세에서 댓글로 추가 문의를 이어갈 수 있습니다.',
    ],
  },
]
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">GUIDE</div>
      <h1>운영 가이드</h1>
      <p>맑은 메시징 콘솔의 주요 화면별 사용법을 안내합니다. 각 단계의 화면 이름을 클릭하면 해당 화면으로 이동합니다.</p>
    </div>

    <div class="guide-layout">
      <!-- 목차 -->
      <aside class="guide-toc">
        <div class="toc-label">목차</div>
        <a v-for="(s, i) in SECTIONS" :key="s.id" :href="`#${s.id}`" class="toc-item">
          <span class="toc-no">{{ String(i + 1).padStart(2, '0') }}</span>
          <UIcon :name="s.icon" class="toc-icon" />
          <span>{{ s.title }}</span>
        </a>
      </aside>

      <!-- 본문 -->
      <div class="guide-body">
        <section v-for="(s, i) in SECTIONS" :id="s.id" :key="s.id" class="card guide-sec">
          <div class="gs-head">
            <span class="gs-icon"><UIcon :name="s.icon" /></span>
            <div class="gs-head-text">
              <div class="gs-title-row">
                <span class="gs-no">STEP {{ i + 1 }}</span>
                <h2>{{ s.title }}</h2>
              </div>
              <p class="gs-intro">{{ s.intro }}</p>
            </div>
          </div>

          <div class="gs-routes">
            <span class="gs-routes-label">관련 화면</span>
            <NuxtLink v-for="r in s.routes" :key="r.to" :to="r.to" class="gs-route">
              {{ r.label }}
              <UIcon name="i-lucide-arrow-up-right" class="gs-route-icon" />
            </NuxtLink>
          </div>

          <ol class="gs-steps">
            <li v-for="(step, j) in s.steps" :key="j">
              <span class="gs-step-no">{{ j + 1 }}</span>
              <span class="gs-step-text">{{ step }}</span>
            </li>
          </ol>

          <div v-if="s.tip" class="gs-tip">
            <UIcon name="i-lucide-lightbulb" class="gs-tip-icon" />
            <span><b>TIP</b> {{ s.tip }}</span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guide-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

/* 목차 */
.guide-toc {
  position: sticky;
  top: calc(var(--topbar-height) + 24px);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.toc-label {
  font-size: var(--fz-2xs);
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--ink-400);
  padding: 0 12px 8px;
}
.toc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
  transition: background 0.12s, color 0.12s;
}
.toc-item:hover {
  background: var(--ink-50);
  color: var(--ink-900);
}
.toc-no {
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  color: var(--ink-300);
}
.toc-icon {
  font-size: var(--fz-md);
  color: var(--ink-400);
}
.toc-item:hover .toc-icon { color: var(--ink-700); }

/* 본문 */
.guide-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.guide-sec {
  padding: 24px 26px;
  scroll-margin-top: calc(var(--topbar-height) + 20px);
}

.gs-head {
  display: flex;
  gap: 14px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.gs-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-md);
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: var(--fz-xl);
  flex-shrink: 0;
}
.gs-head-text { min-width: 0; }
.gs-title-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.gs-no {
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--accent-ink);
}
.gs-head-text h2 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.gs-intro {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 4px 0 0;
}

/* 관련 화면 */
.gs-routes {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.gs-routes-label {
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-400);
  margin-right: 4px;
}
.gs-route {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 26px;
  padding: 0 9px;
  border: 1px solid var(--line);
  border-radius: var(--r-full);
  font-size: var(--fz-xs);
  font-weight: 500;
  color: var(--ink-700);
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.gs-route:hover {
  border-color: var(--ink-900);
  background: var(--ink-900);
  color: var(--white);
}
.gs-route-icon { font-size: var(--fz-xs); }

/* 단계 */
.gs-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.gs-steps li {
  display: flex;
  gap: 12px;
}
.gs-step-no {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ink-100);
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  font-weight: 700;
  color: var(--ink-700);
  flex-shrink: 0;
  margin-top: 1px;
}
.gs-step-text {
  font-size: var(--fz-sm);
  color: var(--ink-700);
  line-height: 1.65;
}

/* TIP */
.gs-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  background: var(--accent-soft);
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  color: var(--ink-700);
  line-height: 1.6;
}
.gs-tip-icon {
  font-size: var(--fz-md);
  color: var(--accent-ink);
  flex-shrink: 0;
  margin-top: 1px;
}
.gs-tip b {
  font-weight: 700;
  color: var(--accent-ink);
  margin-right: 4px;
}

@media (max-width: 860px) {
  .guide-layout { grid-template-columns: 1fr; gap: 16px; }
  .guide-toc {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .toc-label { width: 100%; padding-bottom: 4px; }
  .toc-item { width: auto; }
}
</style>
