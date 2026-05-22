<script setup lang="ts">
useHead({ title: '사이트맵' })

type SmType = 'page' | 'popup'
interface SmItem { label: string, desc: string, type: SmType, to?: string }
interface SmGroup { title: string, desc: string, items: SmItem[] }

const groups: SmGroup[] = [
  {
    title: '홈',
    desc: '대시보드',
    items: [
      { label: '대시보드', desc: '발송 현황·크레딧·최근 이력 요약', type: 'page', to: '/home' },
    ],
  },
  {
    title: '메시지 발송',
    desc: '채널별 단발 발송',
    items: [
      { label: '문자메시지 발송', desc: 'SMS/LMS/MMS 단발 발송', type: 'page', to: '/send/sms' },
      { label: '알림톡 / 친구톡 발송', desc: '카카오 비즈메시지 발송', type: 'page', to: '/send/kakao' },
      { label: 'RCS 발송', desc: '이미지·버튼 가능한 고급 메시지', type: 'page', to: '/send/rcs' },
      { label: '이메일 발송', desc: '트랜잭션·마케팅 이메일', type: 'page', to: '/send/email' },
      { label: 'PUSH 발송', desc: '앱 푸시 알림 발송', type: 'page', to: '/send/push' },
      { label: '복합 (플로우) 발송', desc: '여러 채널 순차·동시 발송', type: 'page', to: '/send/flow' },
      { label: '수신자 직접 입력', desc: '이름·연락처를 직접 입력', type: 'popup' },
      { label: '주소록 선택', desc: '주소록·그룹에서 수신자 선택', type: 'popup' },
      { label: '샘플 / 채널 템플릿 선택', desc: '템플릿 갤러리에서 선택', type: 'popup' },
      { label: 'AI 문장 다듬기', desc: 'AI로 메시지 문안 보정', type: 'popup' },
      { label: '발송 확인', desc: '수신자 수·예상 비용 확인', type: 'popup' },
      { label: '입력 초기화 확인', desc: '입력값 초기화 컨펌', type: 'popup' },
      { label: '복합 플로우 관리 / 등록·수정', desc: '플로우 목록·생성·편집', type: 'popup' },
    ],
  },
  {
    title: '발송 조회 / 통계',
    desc: '채널별 이력과 통계',
    items: [
      { label: '문자메시지 발송 조회', desc: 'SMS 발송 이력 조회', type: 'page', to: '/history/sms' },
      { label: '알림톡 발송 조회', desc: '알림톡 발송 이력 조회', type: 'page', to: '/history/kakao' },
      { label: 'RCS 발송 조회', desc: 'RCS 발송 이력 조회', type: 'page', to: '/history/rcs' },
      { label: '이메일 발송 조회', desc: '이메일 발송 이력 조회', type: 'page', to: '/history/email' },
      { label: 'PUSH 발송 조회', desc: 'PUSH 발송 이력 조회', type: 'page', to: '/history/push' },
      { label: '통계', desc: '발송·수신 통계 대시보드', type: 'page', to: '/history/stats' },
      { label: '목록 다운로드 요청', desc: '조회 결과 비동기 다운로드 요청', type: 'popup' },
      { label: '다운로드 요청 목록', desc: '다운로드 요청 진행 상태', type: 'popup' },
      { label: '발송 일괄 취소 확인', desc: '예약 발송 일괄 취소 컨펌', type: 'popup' },
    ],
  },
  {
    title: '주소록',
    desc: '연락처·그룹·수신 거부',
    items: [
      { label: '주소록 관리', desc: '연락처 목록·등록·발송', type: 'page', to: '/contacts/list' },
      { label: '그룹 관리', desc: '연락처 그룹 관리', type: 'page', to: '/contacts/groups' },
      { label: '수신 거부 관리 (휴대폰)', desc: '휴대폰 수신 거부 목록', type: 'page', to: '/contacts/optout' },
      { label: '수신 거부 관리 (이메일)', desc: '이메일 수신 거부 목록', type: 'page', to: '/contacts/optout-email' },
      { label: '수신 거부 관리 (토큰)', desc: '토큰 수신 거부 목록', type: 'page', to: '/contacts/optout-token' },
      { label: '연락처 등록 / 수정', desc: '연락처 직접 등록·편집', type: 'popup' },
      { label: '연락처 일괄 등록', desc: '엑셀 업로드로 일괄 등록', type: 'popup' },
      { label: '그룹 등록 / 수정', desc: '그룹 생성·편집', type: 'popup' },
      { label: '수신 거부 등록 / 일괄 등록', desc: '수신 거부 직접·일괄 등록', type: 'popup' },
    ],
  },
  {
    title: '발신 정보',
    desc: '발신 식별자 관리',
    items: [
      { label: '발신 번호 관리', desc: 'SMS 발신 번호 등록·인증', type: 'page', to: '/sender/numbers' },
      { label: 'RCS 브랜드 관리', desc: 'RCS 브랜드 연동·관리', type: 'page', to: '/sender/brands' },
      { label: '이메일 도메인 관리', desc: '발신 도메인·DKIM 설정', type: 'page', to: '/sender/domains' },
      { label: 'PUSH 인증 관리', desc: 'FCM·APNs 인증 설정', type: 'page', to: '/sender/push-cert' },
      { label: '발신 프로필 관리', desc: '카카오 발신 프로필 관리', type: 'page', to: '/sender/profiles' },
      { label: '080 수신 거부 관리', desc: '080 수신 거부 번호 관리', type: 'page', to: '/sender/optout-080' },
      { label: '발신 번호 등록 안내', desc: '발신 번호 등록 절차 안내', type: 'popup' },
      { label: '발신 프로필 등록 / 그룹 관리', desc: '프로필 등록 마법사·그룹 관리', type: 'popup' },
      { label: 'DKIM 설정', desc: '이메일 도메인 DKIM 설정', type: 'popup' },
    ],
  },
  {
    title: '메시지 관리',
    desc: '채널별 템플릿·상세 설정',
    items: [
      { label: '문자메시지 템플릿', desc: 'SMS 템플릿·카테고리 관리', type: 'page', to: '/manage/sms' },
      { label: '알림톡 템플릿', desc: '알림톡 템플릿·카테고리 관리', type: 'page', to: '/manage/kakao' },
      { label: 'RCS 템플릿', desc: 'RCS 템플릿 관리', type: 'page', to: '/manage/rcs' },
      { label: '이메일 템플릿', desc: '이메일 템플릿 관리', type: 'page', to: '/manage/email' },
      { label: 'PUSH 템플릿', desc: 'PUSH 템플릿 관리', type: 'page', to: '/manage/push' },
      { label: '상세 설정', desc: '대체 문자 등 발송 상세 설정', type: 'page', to: '/manage/settings' },
      { label: '랜딩페이지 만들기', desc: '랜딩페이지 목록·기본형/확장형 등록', type: 'page', to: '/manage/landing' },
      { label: '카테고리 등록 / 수정', desc: '템플릿 카테고리 편집', type: 'popup' },
      { label: 'AI 템플릿 생성', desc: 'AI로 채널별 템플릿 생성', type: 'popup' },
      { label: '샘플 템플릿 보기', desc: '시스템 제공 샘플 갤러리', type: 'popup' },
    ],
  },
  {
    title: '크레딧 / 결제',
    desc: '크레딧 충전',
    items: [
      { label: '크레딧 충전', desc: '카드로 크레딧 충전', type: 'page', to: '/charge' },
      { label: '충전 결과', desc: '충전 완료·실패 결과', type: 'page', to: '/charge/result' },
      { label: '카드 추가', desc: '결제 카드 등록 모달', type: 'popup' },
      { label: '크레딧 충전 확인', desc: '충전 진행 컨펌', type: 'popup' },
    ],
  },
  {
    title: '나의 페이지 / 문의',
    desc: '계정 설정과 1:1 문의 (좌측 메뉴 9종)',
    items: [
      { label: '회원 정보 변경', desc: '이름·연락처·기업 정보 수정', type: 'page', to: '/account/settings' },
      { label: '결제 카드 관리', desc: '결제 카드 등록·기본 카드 설정', type: 'page', to: '/account/cards' },
      { label: '비밀번호 변경', desc: '로그인 비밀번호 변경', type: 'page', to: '/account/password' },
      { label: '보안로그인 설정', desc: '로그인 보안 인증 설정', type: 'page', to: '/account/security' },
      { label: '멀티 계정 추가', desc: '서비스 담당자 초대·관리', type: 'page', to: '/account/multi' },
      { label: '계약 관리', desc: '이용계약 체결·가입서류 첨부', type: 'page', to: '/account/contract' },
      { label: '크레딧 관리', desc: '크레딧 충전·사용 내역·영수증', type: 'page', to: '/account/credit' },
      { label: '결제 내역', desc: '결제·청구 내역', type: 'page', to: '/account/billing' },
      { label: '나의 문의', desc: '1:1 문의 목록', type: 'page', to: '/account/inquiries' },
      { label: '문의 상세', desc: '문의 내용·답변 댓글 스레드', type: 'page', to: '/account/inquiries/detail' },
      { label: '1:1 문의 작성', desc: '문의 작성 폼', type: 'page', to: '/account/inquiry' },
      { label: '문의 작성 완료', desc: '문의 접수 완료', type: 'page', to: '/account/inquiry/complete' },
      { label: '서비스 담당자 초대', desc: '담당자 이름·이메일 입력 모달', type: 'popup' },
      { label: '계약서 확인 / 체결', desc: '계약서 열람·전자서명 위저드', type: 'popup' },
      { label: '영수증', desc: '크레딧 충전 영수증 모달', type: 'popup' },
    ],
  },
  {
    title: '인증',
    desc: '로그인·회원가입·비밀번호',
    items: [
      { label: '로그인', desc: '아이디·비밀번호 로그인', type: 'page', to: '/login' },
      { label: '로그인 보안 인증', desc: 'OTP·이메일 보안 인증', type: 'page', to: '/login/security' },
      { label: '회원가입', desc: 'OTP·휴대폰·약관 동의', type: 'page', to: '/signup' },
      { label: '비밀번호 재설정 요청', desc: '재설정 메일 요청', type: 'page', to: '/reset-password' },
      { label: '새 비밀번호 입력', desc: '새 비밀번호 설정', type: 'page', to: '/reset-password/new' },
      { label: '서비스 담당자 등록', desc: '초대받은 담당자 가입 절차', type: 'page', to: '/invite' },
    ],
  },
  {
    title: '시스템 / 템플릿',
    desc: '에러·점검·이메일 템플릿',
    items: [
      { label: '404 페이지', desc: '페이지를 찾을 수 없음', type: 'page', to: '/404' },
      { label: '시스템 에러', desc: '단독 시스템 에러 화면', type: 'page', to: '/error' },
      { label: '시스템 에러 (템플릿)', desc: '시스템 에러 템플릿', type: 'page', to: '/templete/error/system' },
      { label: '페이지 없음 (템플릿)', desc: '404 템플릿', type: 'page', to: '/templete/error/not-found' },
      { label: '네트워크 에러 (템플릿)', desc: '네트워크 에러 템플릿', type: 'page', to: '/templete/error/network' },
      { label: '긴급 점검', desc: '긴급 점검 안내', type: 'page', to: '/templete/inspection/emergency' },
      { label: '정기 점검', desc: '정기 점검 안내', type: 'page', to: '/templete/inspection/scheduled' },
      { label: '이메일 인증 메일', desc: '이메일 인증 메일 템플릿', type: 'page', to: '/templete/email/verify' },
      { label: '비밀번호 재설정 메일', desc: '비밀번호 재설정 메일 템플릿', type: 'page', to: '/templete/email/reset-password' },
    ],
  },
  {
    title: '디자인',
    desc: '디자인 시스템 레퍼런스',
    items: [
      { label: '디자인 가이드', desc: '토큰·컴포넌트 라이브 카탈로그', type: 'page', to: '/guide' },
      { label: '사이트맵', desc: '전체 페이지·팝업 목록', type: 'page', to: '/sitemap' },
    ],
  },
]

// 전체 순번 부여
let seq = 0
const numbered = groups.map(g => ({
  ...g,
  items: g.items.map(it => ({ ...it, no: ++seq })),
}))
const total = seq
const pageCount = groups.reduce((s, g) => s + g.items.filter(i => i.type === 'page').length, 0)
const popupCount = total - pageCount

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<template>
  <div class="app-container page-body">
    <div class="page-header">
      <div class="crumb">
        사이트맵
      </div>
      <h1>전체 페이지</h1>
      <p>{{ groups.length }}개 카테고리 · 총 {{ total }}개 (페이지 {{ pageCount }} · 팝업 {{ popupCount }}). 페이지는 클릭 시 새 창으로 열립니다.</p>
    </div>

    <div class="sm-grid">
      <section v-for="g in numbered" :key="g.title" class="card sm-card">
        <div class="sm-card-head">
          <div class="sm-card-title">
            {{ g.title }}
          </div>
          <div class="sm-card-desc">
            {{ g.desc }}
          </div>
          <span class="sm-card-count">{{ g.items.length }}</span>
        </div>
        <ul class="sm-list">
          <li v-for="it in g.items" :key="it.no" class="sm-row">
            <span class="sm-no">{{ pad(it.no) }}</span>
            <span class="sm-badge" :class="it.type">{{ it.type === 'page' ? '페이지' : '팝업' }}</span>
            <NuxtLink
              v-if="it.to"
              :to="it.to"
              target="_blank"
              rel="noopener noreferrer"
              class="sm-item sm-item-link"
            >
              <span class="sm-label">{{ it.label }}</span>
              <span class="sm-desc-text">{{ it.desc }}</span>
              <span class="sm-path">{{ it.to }}</span>
            </NuxtLink>
            <div v-else class="sm-item">
              <span class="sm-label">{{ it.label }}</span>
              <span class="sm-desc-text">{{ it.desc }}</span>
              <span class="sm-path sm-path-modal">모달</span>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.sm-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sm-card {
  padding: 18px 20px 14px;
}
.sm-card-head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  column-gap: 8px;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.sm-card-title {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
}
.sm-card-desc {
  grid-column: 1;
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-top: 2px;
}
.sm-card-count {
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: var(--r-full);
  background: var(--ink-50);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--ink-600);
}
.sm-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.sm-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 7px 8px;
  border-radius: var(--r-sm);
  transition: background 0.12s;
}
.sm-row:hover {
  background: var(--ink-50);
}
.sm-no {
  flex-shrink: 0;
  width: 26px;
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  color: var(--ink-400);
  text-align: right;
}
.sm-badge {
  flex-shrink: 0;
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 18px;
  border-radius: var(--r-sm);
  font-size: var(--fz-2xs);
  font-weight: 600;
  border: 1px solid;
}
.sm-badge.page {
  background: var(--info-soft, #eff6ff);
  border-color: var(--info-line, #bfdbfe);
  color: var(--info-ink, #1d4ed8);
}
.sm-badge.popup {
  background: var(--ink-50);
  border-color: var(--ink-200);
  color: var(--ink-600);
}
.sm-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 10px;
  text-decoration: none;
}
.sm-label {
  flex-shrink: 0;
  font-size: var(--fz-md);
  color: var(--ink-800);
}
.sm-item-link:hover .sm-label {
  color: var(--accent-ink);
}
.sm-desc-text {
  flex: 1;
  min-width: 0;
  font-size: var(--fz-sm);
  color: var(--ink-500);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sm-path {
  flex-shrink: 0;
  font-family: var(--font-mono);
  font-size: var(--fz-2xs);
  color: var(--ink-400);
  white-space: nowrap;
}
.sm-path-modal {
  color: var(--ink-300);
}
</style>
