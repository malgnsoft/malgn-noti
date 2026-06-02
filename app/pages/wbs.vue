<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: 'WBS · 맑은 메시징' })

type Status = 'done' | 'in_progress' | 'pending' | 'blocked'

interface Task {
  id: string
  group?: string
  title: string
  status: Status
  owner: string
  note?: string
  targetDate?: string
  completionDate?: string
  href?: string
}

interface Stage {
  id: string
  no: string
  emoji: string
  name: string
  summary: string
  weight: number
  progress: number
  tasks: Task[]
}

const PROJECT_NAME = '맑은 메시징'
const LAST_UPDATED = '2026-06-01'

/* 본 데이터는 doc/WBS.md를 정본으로 하여 동기화한다. 양쪽이 어긋나면 MD가 우선. */
const STAGES: Stage[] = [
  {
    id: 'step-1',
    no: 'Step 1',
    emoji: '🎯',
    name: '프로젝트 준비',
    summary: 'R&R · 사업 기획 · 계약서 초안 · 커뮤니케이션 · 환경 셋팅',
    weight: 10,
    progress: 55,
    tasks: [
      { id: '1-1-1', group: 'R&R · 사업 기획', title: '작업 R&R 분배', status: 'done', owner: '김덕조', note: '메모 확인', targetDate: '5/8', completionDate: '5/8' },
      { id: '1-1-2', group: 'R&R · 사업 기획', title: '경쟁 서비스 가격 분석', status: 'done', owner: '컨설팅팀', note: '경쟁사 단가표' },
      { id: '1-1-3', group: 'R&R · 사업 기획', title: '당사 원가 확인 및 가격 정책 결정 (단가)', status: 'in_progress', owner: '컨설팅팀', note: '기본 단가 책정(할인률 정책) · MMS 이미지 3장까지 비용설계 · 단가표(기획안)' },
      { id: '1-2-1', group: '사업 준비', title: '특수 유형의 메시징 사업자 신청', status: 'pending', owner: '컨설팅팀', note: '프로젝트 추진 중간평가 이후' },
      { id: '1-2-2', group: '사업 준비', title: '통신판매사업자 신청', status: 'pending', owner: '컨설팅팀', note: '중간평가 이후' },
      { id: '1-2-3', group: '사업 준비', title: '자본 Up 방안', status: 'pending', owner: '—', note: '중간평가 이후' },
      { id: '1-2-4', group: '사업 준비', title: '관련 계약서 작성', status: 'in_progress', owner: '컨설팅팀', note: '가입신청서·이용약관·개인정보처리방침·요금신고내역 초안 / 1차 검토 완료 → 2차 수정본 / 전무님 검토 필요' },
      { id: '1-3-1', group: '커뮤니케이션', title: '그룹 텔레그램 개설', status: 'done', owner: '김도형', note: '맑은메시지 TF', targetDate: '5/8', completionDate: '5/8' },
      { id: '1-3-2', group: '커뮤니케이션', title: '화면설계 · 피그마 정본', status: 'done', owner: '김경은', note: '피그마', targetDate: '5/11', completionDate: '5/11' },
      { id: '1-3-3', group: '커뮤니케이션', title: '문서 공유 폴더', status: 'pending', owner: '김덕조', note: '프로젝트 폴더' },
      { id: '1-4-1', group: '서비스 메타', title: '서비스 도메인 결정', status: 'pending', owner: '김덕조' },
      { id: '1-4-2', group: '서비스 메타', title: '브랜딩 (맑은메시지 외 아이데이션)', status: 'pending', owner: '김덕조' },
      { id: '1-4-3', group: '서비스 메타', title: '마케팅 기획', status: 'pending', owner: '안병훈', note: '기존 고객군 & 메시징 only 고객군' },
      { id: '1-5-1', group: '환경 셋팅', title: '커뮤니케이션 문서 폴더 운영', status: 'done', owner: '김덕조', note: '폴더 셋팅', targetDate: '5/8', completionDate: '5/8' },
      { id: '1-5-2', group: '환경 셋팅', title: 'GitHub(malgnsoft) · Cloudflare 셋팅', status: 'done', owner: '김도형', note: '3 레포 + Pages 2 + Workers 1', targetDate: '5/11', completionDate: '5/11' },
      { id: '1-5-3', group: '환경 셋팅', title: '사용자단', status: 'done', owner: '김도형', href: 'https://malgn-noti.pages.dev/', targetDate: '5/11', completionDate: '5/11' },
      { id: '1-5-4', group: '환경 셋팅', title: '관리자단', status: 'done', owner: '김도형', href: 'https://malgn-noti-admin.pages.dev/', targetDate: '5/11', completionDate: '5/11' },
      { id: '1-5-5', group: '환경 셋팅', title: 'API 서버', status: 'done', owner: '김도형', href: 'https://malgn-noti-api.malgnsoft.workers.dev/', targetDate: '5/11', completionDate: '5/11' },
    ],
  },
  {
    id: 'step-2',
    no: 'Step 2',
    emoji: '📐',
    name: '주요 서비스 정책 이슈 정리',
    summary: '프로토타입 · 회원/결제/계약 · 메시지 채널 · 캠페인 · 주소록 정책',
    weight: 15,
    progress: 55,
    tasks: [
      { id: '2-1-1', group: '프로토타입 · 문서', title: 'Front 프로토타입', status: 'in_progress', owner: '김덕조', note: 'IA 정본(263 페이지)', href: 'https://malgn-notifications.pages.dev/#/' },
      { id: '2-1-2', group: '프로토타입 · 문서', title: 'Front 메뉴 및 스펙', status: 'pending', owner: '—', href: 'https://malgn-notifications.pages.dev/#/sitemap' },
      { id: '2-1-3', group: '프로토타입 · 문서', title: 'Front 페이지 리스트', status: 'pending', owner: '김덕조', href: 'https://malgn-notifications.pages.dev/#/pagelists' },
      { id: '2-1-4', group: '프로토타입 · 문서', title: 'BackOffice 프로토타입', status: 'pending', owner: '김경은', note: '만들지 말지 결정' },
      { id: '2-1-5', group: '프로토타입 · 문서', title: 'BackOffice 메뉴 및 스펙', status: 'pending', owner: '—' },
      { id: '2-2-1', group: '주요 서비스 참조', title: 'NHN Cloud Notification 서비스', status: 'pending', owner: '—', note: '통합 대상' },
      { id: '2-2-2', group: '주요 서비스 참조', title: '비즈 뿌리오 서비스', status: 'pending', owner: '—', note: '참조' },
      { id: '2-3-1', group: '캠페인', title: '벤치마킹 조사', status: 'pending', owner: '안병훈', note: '솔라피(CRM 결합) + 개별 문자 발송' },
      { id: '2-4-1', group: '회원·결제·계약', title: '회원가입·판매방식 — 후불 정산 / 개인 회원 추가', status: 'in_progress', owner: '김덕조', note: '법인·개인사업자·개인 3유형 / 카드 충전식 vs 후불 결제 / 계약관리에 지급이행보증보험 첨부', targetDate: '5/12', completionDate: '5/12' },
      { id: '2-4-2', group: '회원·결제·계약', title: '회원 구조 — 멀티 계정 (주·보조)', status: 'in_progress', owner: '김덕조', note: '법인·개인사업자만 멀티계정 탭 노출, 개인은 미노출', targetDate: '5/12', completionDate: '5/12' },
      { id: '2-4-3', group: '회원·결제·계약', title: '결제 — 자동충전', status: 'pending', owner: '김덕조', note: '향후 재논의' },
      { id: '2-4-4', group: '회원·결제·계약', title: '결제내역 — 결제 페이지 추가', status: 'pending', owner: '김덕조' },
      { id: '2-4-5', group: '회원·결제·계약', title: '결제 — 후불 결제 고려', status: 'pending', owner: '김덕조', note: '내부로직 -크레딧 / 후불시 사용 크레딧 / 다음 결제일' },
      { id: '2-4-6', group: '회원·결제·계약', title: '계약관리 정책', status: 'pending', owner: '—', note: '법인·개인사업자 온라인 계약 + BackOffice 승인 / 개인은 즉시 사용' },
      { id: '2-5-1', group: '메시지 채널 정책', title: 'AI 문장 다듬기 기능', status: 'in_progress', owner: '김덕조', note: '발송창(알림톡 제외) AI검토 / 문자·RCS·이메일 적용', targetDate: '5/12', completionDate: '5/12' },
      { id: '2-5-2', group: '메시지 채널 정책', title: '광고용 선택 시 수신거부 전화번호 이슈', status: 'pending', owner: '김덕조', note: '맨 마지막에 입력창 분리 / 재확인 후 설계' },
      { id: '2-5-3', group: '메시지 채널 정책', title: '순차발송', status: 'in_progress', owner: '김덕조', note: '알림톡 미수신시 SMS/LMS 폴백 / 복합(플로우) Default 알림톡→SMS→이메일', targetDate: '5/12', completionDate: '5/12' },
      { id: '2-5-4', group: '메시지 채널 정책', title: '랜딩페이지 만들기 추가', status: 'in_progress', owner: '김덕조', note: '기본형·확장형 화면 추가', targetDate: '5/12', completionDate: '5/12' },
      { id: '2-5-5', group: '메시지 채널 정책', title: '발신번호 관리에 휴대폰번호 추가', status: 'in_progress', owner: '김덕조', note: '유선(증명서) + 휴대폰(본인인증 PASS)', targetDate: '5/12', completionDate: '5/12' },
      { id: '2-6-1', group: '캠페인 · 주소록 · 브랜드', title: '캠페인 관리 — AB 테스트 기능', status: 'pending', owner: '김덕조', note: '캠페인 관리 기능 최종 정의 후' },
      { id: '2-6-2', group: '캠페인 · 주소록 · 브랜드', title: '주소록 — CRM 기능 확대', status: 'in_progress', owner: '김덕조', note: '단건 발송 레이어 팝업 / 연락처·그룹 채널 바로가기 / CRM 예제 화면 수집', targetDate: '5/12', completionDate: '5/12' },
      { id: '2-6-3', group: '캠페인 · 주소록 · 브랜드', title: '브랜드 네임', status: 'pending', owner: '안병훈 외 전체' },
    ],
  },
  {
    id: 'step-3',
    no: 'Step 3',
    emoji: '📋',
    name: '서비스 기획 (화면설계)',
    summary: 'Front 프로토타입 대체 + BackOffice 1·2차 화면 명세',
    weight: 20,
    progress: 35,
    tasks: [
      { id: '3-1-1', group: 'Front', title: '프로토타입으로 대체', status: 'in_progress', owner: '김덕조·김경은', href: 'https://malgn-notifications.pages.dev/#/' },
      { id: '3-1-2', group: 'Front', title: '서비스 메뉴 콘텐츠', status: 'pending', owner: '컨설팅팀·김경은' },
      { id: '3-1-3', group: 'Front', title: '운영가이드', status: 'pending', owner: '김덕조·김경은', note: '사용자단 /help 라이브 — 컨텐츠 보강 필요', href: 'https://malgn-noti.pages.dev/help' },
      { id: '3-2-1', group: 'BackOffice 1차', title: '공통 · 로그인 · 계정 관리', status: 'in_progress', owner: '김경은', targetDate: '5/22' },
      { id: '3-2-2', group: 'BackOffice 1차', title: '회원 · 고객사 관리', status: 'in_progress', owner: '김경은', note: '회원 발송 이력 / 결제 상세 / 환불신청 제외', targetDate: '5/22' },
      { id: '3-2-3', group: 'BackOffice 1차', title: '시스템 관리', status: 'in_progress', owner: '김경은', note: '운영자 계정 / RBAC / 감사 로그', targetDate: '5/22' },
      { id: '3-2-4', group: 'BackOffice 1차', title: '요금 · 단가 관리', status: 'in_progress', owner: '김경은', targetDate: '5/29' },
      { id: '3-2-5', group: 'BackOffice 1차', title: '고객지원', status: 'in_progress', owner: '김경은', note: '운영 가이드 관리 제외', targetDate: '5/29' },
      { id: '3-2-6', group: 'BackOffice 1차', title: '발송 운영 모니터링', status: 'pending', owner: '김경은', note: '캠페인 제외', targetDate: '6/12' },
      { id: '3-2-7', group: 'BackOffice 1차', title: '발신 정보 검수', status: 'pending', owner: '김경은', targetDate: '6/12' },
      { id: '3-2-8', group: 'BackOffice 1차', title: '결제 · 크레딧 관리 + 고객사 상세 결제 탭', status: 'pending', owner: '김경은', targetDate: '6/19' },
      { id: '3-2-9', group: 'BackOffice 1차', title: '템플릿 검수 · 관리', status: 'pending', owner: '김경은', note: '샘플·AI 템플릿 정책 제외', targetDate: '6/24' },
      { id: '3-2-10', group: 'BackOffice 1차', title: '수신거부 (운영)', status: 'pending', owner: '김경은', targetDate: '6/24' },
      { id: '3-3-1', group: 'BackOffice 2차', title: '통계 · 리포트', status: 'pending', owner: '김경은' },
      { id: '3-3-2', group: 'BackOffice 2차', title: '대시보드', status: 'pending', owner: '김경은' },
      { id: '3-3-3', group: 'BackOffice 2차', title: '템플릿 검수 · 관리 (AI 템플릿 정책)', status: 'pending', owner: '김경은' },
      { id: '3-3-4', group: 'BackOffice 2차', title: '발송 운영 모니터링 (캠페인)', status: 'pending', owner: '김경은' },
      { id: '3-3-5', group: 'BackOffice 2차', title: '고객지원', status: 'pending', owner: '김경은', note: '운영 가이드 관리' },
      { id: '3-3-6', group: 'BackOffice 2차', title: '콘텐츠 · 사이트 관리', status: 'pending', owner: '김경은', note: '시스템 설정 / 점검 모드 / 외부 연동' },
      { id: '3-3-7', group: 'BackOffice 2차', title: '시스템 관리', status: 'pending', owner: '김경은' },
      { id: '3-3-8', group: 'BackOffice 2차', title: 'API 관리', status: 'pending', owner: '김경은' },
    ],
  },
  {
    id: 'step-4',
    no: 'Step 4',
    emoji: '🎨',
    name: '디자인 / 퍼블리싱',
    summary: '디자인 스타일 가이드 + 퍼블리싱 MD (개발 측 DESIGN.md + /guide 카탈로그로 대체 운영 중)',
    weight: 10,
    progress: 20,
    tasks: [
      { id: '4-1', title: '디자인 스타일 가이드', status: 'pending', owner: '김양현', note: '(개발: doc/DESIGN.md Relay-inspired v1.0 + /guide 카탈로그 운영). 디자인팀 정식 산출물은 별도 필요.', href: 'https://malgn-noti.pages.dev/guide' },
      { id: '4-2', title: '퍼블리싱 MD 파일', status: 'pending', owner: '김양현', note: '(개발: Nuxt 3 + Nuxt UI v3 + Tailwind v4로 직접 퍼블리싱 중)' },
    ],
  },
  {
    id: 'step-5',
    no: 'Step 5',
    emoji: '🛠️',
    name: '서비스 개발',
    summary: '3 트랙 분리 (6/2): UI 거의 완료 · API 약 60% · 화면↔API 연동 약 7% (이번주 본격 작업) · 관리자단 셸·기획만',
    weight: 45,
    progress: 40,
    tasks: [
      /* 5-1 설계 및 준비 */
      { id: '5-1-1', group: '설계 및 준비', title: '아키텍처 설계', status: 'done', owner: '김도형', note: 'STACK.md — 3 레포 책임 + Cloudflare/AWS 혼합 + NHN 통합', href: 'https://github.com/malgnsoft/malgn-noti/blob/main/doc/STACK.md', targetDate: '5/14', completionDate: '5/14' },
      { id: '5-1-2', group: '설계 및 준비', title: '데이터 모델링', status: 'done', owner: '김도형', note: '49 테이블 + Mermaid ERD 9종 + 확장성 전략(파티셔닝·Hot/Warm/Cold·R2 오프로드)', targetDate: '5/22', completionDate: '5/27' },
      { id: '5-1-3', group: '설계 및 준비', title: '사용자단 디자인 시스템', status: 'done', owner: '김도형', note: 'Relay-inspired v1.0 — ink 11단 + 그린 #00DC82 + Inter/JetBrains Mono/Pretendard', targetDate: '5/18', completionDate: '5/18' },
      { id: '5-1-4', group: '설계 및 준비', title: '사용자단 디자인 가이드 (라이브 카탈로그)', status: 'done', owner: '김도형', href: 'https://malgn-noti.pages.dev/guide', targetDate: '5/19', completionDate: '5/19' },
      { id: '5-1-5', group: '설계 및 준비', title: '관리자단 부트스트랩 + 셸 (LNB + TopBar)', status: 'done', owner: '김도형', note: 'Nuxt 3 + Nuxt UI v3 + LNB 256px·8그룹 + TopBar 64px', targetDate: '5/27', completionDate: '5/27' },
      { id: '5-1-6', group: '설계 및 준비', title: '관리자단 디자인 가이드', status: 'done', owner: '김도형', href: 'https://malgn-noti-admin.pages.dev/guide', targetDate: '5/27', completionDate: '5/27' },
      { id: '5-1-7', group: '설계 및 준비', title: '관리자단 페이지 기획 MD (33종)', status: 'done', owner: '김도형', note: 'P0 14 / P1 13 / P2 5 — 8 그룹', targetDate: '5/27', completionDate: '5/27' },
      /* 5-2 API */
      { id: '5-2-1', group: 'API 서버', title: 'Hono on Workers 부트스트랩 + Hyperdrive(Aurora)', status: 'done', owner: '김도형', note: 'drizzle-orm/mysql2 + /health/db + 배포 #1', targetDate: '5/26', completionDate: '5/26' },
      { id: '5-2-2', group: 'API 서버', title: 'DB 마이그레이션 — 49 테이블 + 파티션 5종', status: 'done', owner: '김도형', note: '0000_initial.sql 적용 (49 + 75 파티션)', targetDate: '5/26', completionDate: '5/26' },
      { id: '5-2-3', group: 'API 서버', title: '기초 도메인 CRUD (14 도메인)', status: 'done', owner: '김도형', note: '/me /contacts /contact-groups /sender-* 등 + errors/pagination/auth/Drizzle', targetDate: '5/26', completionDate: '5/26' },
      { id: '5-2-4', group: 'API 서버', title: 'OpenAPI 문서 (Scalar UI)', status: 'done', owner: '김도형', note: 'paths 37 / schemas 45+, 루트 / → /doc 302', href: 'https://malgn-noti-api.malgnsoft.workers.dev/doc', targetDate: '5/26', completionDate: '5/27' },
      { id: '5-2-5', group: 'API 서버', title: '인증 — signup/login/JWT/PBKDF2', status: 'done', owner: '김도형', note: 'Phase 1·2·3 + JWT_SECRET secret', targetDate: '5/26', completionDate: '5/26' },
      { id: '5-2-6', group: 'API 서버', title: '발송 producer — 5채널 (SMS·Email·Kakao·Push·RCS)', status: 'done', owner: '김도형', note: '발신정보 검증·옵트아웃·크레딧 hold·트랜잭션 + 채널 branching generic화', targetDate: '5/26', completionDate: '5/27' },
      { id: '5-2-7', group: 'API 서버', title: '멱등성 — TB_IDEMPOTENCY + INSERT-then-conflict', status: 'done', owner: '김도형', note: '0001_idempotency.sql race-free', targetDate: '5/27', completionDate: '5/27' },
      { id: '5-2-8', group: 'API 서버', title: 'NHN 어댑터 — 5채널 (mock/real)', status: 'done', owner: '김도형', note: 'src/adapters/nhn/{sms,email,kakao,push,rcs}.ts', targetDate: '5/27', completionDate: '5/27' },
      { id: '5-2-9', group: 'API 서버', title: 'Cloudflare Queues + Consumer Worker', status: 'done', owner: '김도형', note: 'malgn-noti-dispatch + dispatch_state 천이', targetDate: '5/27', completionDate: '5/27' },
      { id: '5-2-10', group: 'API 서버', title: 'NHN Webhook 핸들러 (SMS · RCS)', status: 'in_progress', owner: '김도형', note: 'HMAC-SHA256 + dedup_key. Email/Kakao/Push 미.', targetDate: '5/27' },
      { id: '5-2-11', group: 'API 서버', title: 'Export 잡 (다운로드 요청)', status: 'in_progress', owner: '김도형', note: 'TB_EXPORT_JOB ✅ DDL 적용 + /export-jobs CRUD ✅ 라이브 검증 (POST 201, GET 200). 처리 worker + R2 미' },
      { id: '5-2-12', group: 'API 서버', title: 'Flow 정의 (복합 발송)', status: 'in_progress', owner: '김도형', note: 'TB_FLOW_DEFINITION/RUN/STEP_RUN ✅ DDL 적용 (FK 6) + /flow-definitions CRUD ✅ 라이브 검증. 실행 엔진 미' },
      { id: '5-2-13', group: 'API 서버', title: '캠페인 API (스케줄러·시뮬레이션·테스트)', status: 'pending', owner: '김도형' },
      { id: '5-2-14', group: 'API 서버', title: 'PG(결제) 어댑터 + 카드 등록·결제·취소', status: 'pending', owner: '김도형', note: '게이트웨이 미정 (토스 / 포트원 / 나이스)' },
      { id: '5-2-15', group: 'API 서버', title: 'AI 템플릿 게이트웨이 (LLM)', status: 'pending', owner: '김도형', note: '제공자 미정' },
      { id: '5-2-16', group: 'API 서버', title: 'NHN 실 모드 전환 + envelope 암호화', status: 'pending', owner: '김도형', note: '현재 NHN_MOCK=1' },
      /* 5-3 사용자단 화면 개발 */
      { id: '5-3-1', group: '사용자단 화면 UI (목업)', title: '인증·계정 — 로그인 / 회원가입 5단계 / 비번 재설정 / 보안 인증', status: 'done', owner: '김도형', note: '/login · /login/security · /reset-password · /reset-password/new · /signup' },
      { id: '5-3-2', group: '사용자단 화면 UI (목업)', title: '발송 6채널 (SMS/RCS/Kakao/Email/Push/Flow)', status: 'done', owner: '김도형', note: '/send/* + PU 풀세트(수신자·주소록·광고수신·컨펌·초기화)' },
      { id: '5-3-3', group: '사용자단 화면 UI (목업)', title: '이력 / 통계 — 5채널 + 통계 대시보드', status: 'done', owner: '김도형', note: '/history/* + 비동기 다운로드 요청 패턴' },
      { id: '5-3-4', group: '사용자단 화면 UI (목업)', title: '주소록 — 연락처 / 그룹 / 수신거부', status: 'done', owner: '김도형', note: '/contacts/{list,groups,optout}' },
      { id: '5-3-5', group: '사용자단 화면 UI (목업)', title: '발신 정보 6종', status: 'done', owner: '김도형', note: '/sender/{numbers,brands,domains,push-cert,profiles,optout-080} + 등록 마법사' },
      { id: '5-3-6', group: '사용자단 화면 UI (목업)', title: '템플릿 관리 — 5채널 + 발송 상세 설정', status: 'done', owner: '김도형', note: '/manage/{sms,rcs,kakao,email,push,settings}' },
      { id: '5-3-7', group: '사용자단 화면 UI (목업)', title: '캠페인 — 본안 + 변형(v3)', status: 'done', owner: '김도형', note: '/campaign · /campaign3' },
      { id: '5-3-8', group: '사용자단 화면 UI (목업)', title: '크레딧 / 결제 — 충전·결과·내역·영수증·카드 관리', status: 'done', owner: '김도형', note: '/charge · /charge/result · /account/{credit,cards}' },
      { id: '5-3-9', group: '사용자단 화면 UI (목업)', title: '문의 — 작성 / 완료 / 내 문의 / 상세', status: 'done', owner: '김도형', note: '/inquiry · /inquiry/complete · /account/inquiries(/detail)' },
      { id: '5-3-10', group: '사용자단 화면 UI (목업)', title: '나의 페이지 — 9 라우트', status: 'done', owner: '김도형', note: 'AppMyPageShell + /account/{settings,cards,password,security,multi,contract,credit,billing,inquiries}' },
      { id: '5-3-11', group: '사용자단 화면 UI (목업)', title: '메시지 관리 랜딩페이지', status: 'done', owner: '김도형', note: '목록 · 기본형/확장형 등록 폼 · 미리보기' },
      { id: '5-3-12', group: '사용자단 화면 UI (목업)', title: '공개 랜딩페이지 + 운영 가이드', status: 'done', owner: '김도형', note: '/ (히어로·5채널·장점·단가 비교·CTA) + /help', href: 'https://malgn-noti.pages.dev/' },
      { id: '5-3-13', group: '사용자단 화면 UI (목업)', title: '디자인 가이드 (라이브 카탈로그)', status: 'done', owner: '김도형', href: 'https://malgn-noti.pages.dev/guide' },
      { id: '5-3-14', group: '사용자단 화면 UI (목업)', title: '시스템 페이지 — 404 / system error', status: 'in_progress', owner: '김도형', note: '단독 일부 라이브. 점검 / 네트워크 / 인증 메일 템플릿 미' },
      /* 5-3C 사용자단 ↔ API 연동 (실 데이터 흐름) — 새 트랙 */
      { id: '5-3C-1', group: '사용자단 ↔ API 연동', title: '인증·계정 (/auth/signup·/auth/login·/me)', status: 'done', owner: '김도형', note: '6/1 §4. JWT 쿠키 + 가드 미들웨어 + 클라이언트 부트스트랩 플러그인', targetDate: '6/1', completionDate: '6/1' },
      { id: '5-3C-1a', group: '사용자단 ↔ API 연동', title: '이메일 OTP (/auth/email-code/send·/verify)', status: 'done', owner: '김도형', note: '6/1 §5. signup.vue Step 3에서 실 API 호출 + mockCode 개발 편의', targetDate: '6/1', completionDate: '6/1' },
      { id: '5-3C-2', group: '사용자단 ↔ API 연동', title: '로그아웃 — GNB 실 연결 (P0)', status: 'pending', owner: '김도형', note: 'useAuthStore().logout() 호출로 데모 토글 교체' },
      { id: '5-3C-3', group: '사용자단 ↔ API 연동', title: '비밀번호 재설정 — OTP 인프라 재활용 (P0)', status: 'pending', owner: '김도형', note: "purpose='reset_password' + POST /auth/password/reset 신설" },
      { id: '5-3C-4', group: '사용자단 ↔ API 연동', title: 'POST /auth/login-by-email — companyId UX 개선 (P0)', status: 'pending', owner: '김도형' },
      { id: '5-3C-5', group: '사용자단 ↔ API 연동', title: '약관 동의 적재 (POST /auth/agree-terms) (P1)', status: 'pending', owner: '김도형', note: 'TB_TERMS_AGREEMENT 적재' },
      { id: '5-3C-6', group: '사용자단 ↔ API 연동', title: 'companyType 전달·저장 + 화면 분기 (P1)', status: 'pending', owner: '김도형', note: 'TB_COMPANY.company_type + signup 스키마 확장 + 개인 유형 화면 미노출' },
      { id: '5-3C-7', group: '사용자단 ↔ API 연동', title: 'PATCH /me + /account/settings (P2)', status: 'pending', owner: '김도형' },
      { id: '5-3C-8', group: '사용자단 ↔ API 연동', title: 'POST /auth/password + /account/password (P2)', status: 'pending', owner: '김도형' },
      { id: '5-3C-9', group: '사용자단 ↔ API 연동', title: '/account/security (2FA) + PATCH /me/security (P2)', status: 'pending', owner: '김도형', note: 'TB_VERIFICATION 재사용' },
      { id: '5-3C-10', group: '사용자단 ↔ API 연동', title: '/account/multi + /manager-invites (P2)', status: 'pending', owner: '김도형' },
      { id: '5-3C-11', group: '사용자단 ↔ API 연동', title: '/account/contract + R2 업로드 (P2)', status: 'pending', owner: '김도형' },
      { id: '5-3C-12', group: '사용자단 ↔ API 연동', title: '발송 6채널 — UI에 실 API 호출 (Idempotency-Key 헤더)', status: 'pending', owner: '김도형', note: 'NHN 자격증명 등록 전까지 mock 응답' },
      { id: '5-3C-13', group: '사용자단 ↔ API 연동', title: '이력/통계 — 목록·통계 라우트 연동', status: 'pending', owner: '김도형', note: 'API 일부 미 — 5-2 동시 진행' },
      { id: '5-3C-14', group: '사용자단 ↔ API 연동', title: '주소록·발신정보·템플릿 — CRUD 연동 (API ✅)', status: 'pending', owner: '김도형' },
      { id: '5-3C-15', group: '사용자단 ↔ API 연동', title: '크레딧·결제 — PG 어댑터 미정 (블로커)', status: 'pending', owner: '김도형' },
      { id: '5-3C-16', group: '사용자단 ↔ API 연동', title: '문의 — /inquiries 연동', status: 'pending', owner: '김도형' },
      /* 5-4 관리자단 화면 개발 */
      { id: '5-4-1', group: '관리자단 화면', title: '셸 + LNB(8 그룹) + TopBar + 디자인 가이드', status: 'done', owner: '김도형', note: '부트스트랩 · 라이브' },
      { id: '5-4-2', group: '관리자단 화면', title: '페이지 기획 MD (33종)', status: 'done', owner: '김도형', note: 'P0 14 / P1 13 / P2 5' },
      { id: '5-4-3', group: '관리자단 화면', title: '회원 · 고객사 관리 (P0)', status: 'pending', owner: '김도형' },
      { id: '5-4-4', group: '관리자단 화면', title: '시스템 관리 (P0) — 운영자 / RBAC / 감사 로그', status: 'pending', owner: '김도형' },
      { id: '5-4-5', group: '관리자단 화면', title: '요금 · 단가 관리 (P0)', status: 'pending', owner: '김도형' },
      { id: '5-4-6', group: '관리자단 화면', title: '고객지원 (P0)', status: 'pending', owner: '김도형' },
      { id: '5-4-7', group: '관리자단 화면', title: '발송 운영 모니터링 (P1)', status: 'pending', owner: '김도형' },
      { id: '5-4-8', group: '관리자단 화면', title: '발신 정보 검수 (P0)', status: 'pending', owner: '김도형' },
      { id: '5-4-9', group: '관리자단 화면', title: '결제 · 크레딧 + 고객사 상세 결제 탭 (P0)', status: 'pending', owner: '김도형' },
      { id: '5-4-10', group: '관리자단 화면', title: '템플릿 검수 · 관리 (P0)', status: 'pending', owner: '김도형' },
      { id: '5-4-11', group: '관리자단 화면', title: '수신거부 (운영) (P1)', status: 'pending', owner: '김도형' },
      { id: '5-4-12', group: '관리자단 화면', title: '통계 · 리포트 + 대시보드 (P2)', status: 'pending', owner: '김도형' },
      { id: '5-4-13', group: '관리자단 화면', title: '콘텐츠 · 사이트 + 시스템 관리 + API 관리 (P2)', status: 'pending', owner: '김도형' },
      /* 5-5 통합·배포 */
      { id: '5-5-1', group: '통합 · 배포', title: '사용자단 Cloudflare Pages 배포 #1~#46', status: 'in_progress', owner: '김도형', note: '매 마일스톤 직후 배포' },
      { id: '5-5-2', group: '통합 · 배포', title: '관리자단 Cloudflare Pages 첫 Nuxt 배포', status: 'done', owner: '김도형', note: '정적 placeholder → 실 Nuxt 앱' },
      { id: '5-5-3', group: '통합 · 배포', title: 'API Workers 배포 #1~#8', status: 'done', owner: '김도형', note: '최신 Version 95f9f894...' },
      { id: '5-5-4', group: '통합 · 배포', title: 'DDL — 0002_export_flow.sql 적용', status: 'done', owner: '김도형', note: '라이브 적용 확인 (6/1). 라이브 정본이 우리 초안보다 더 정교(FK 6 + 의미 인덱스명) — 초안 SQL을 라이브 정본에 맞춰 동기화', targetDate: '6/1', completionDate: '6/1' },
      { id: '5-5-5', group: '통합 · 배포', title: 'NHN 실 자격증명 등록 + real 모드 전환', status: 'pending', owner: '김도형' },
      { id: '5-5-6', group: '통합 · 배포', title: 'PG 카드 결제 연동', status: 'pending', owner: '김도형' },
      { id: '5-5-7', group: '통합 · 배포', title: 'AI 템플릿 게이트웨이 연동', status: 'pending', owner: '김도형' },
    ],
  },
]

/* 가중평균 */
const weightedAverage = computed(() => {
  const totalWeight = STAGES.reduce((s, x) => s + x.weight, 0)
  const numerator = STAGES.reduce((s, x) => s + x.weight * x.progress, 0)
  return Math.round((numerator / totalWeight) * 10) / 10
})

const allTasks = computed(() => STAGES.flatMap(s => s.tasks))
const totalCounts = computed(() => {
  const acc: Record<Status, number> = { done: 0, in_progress: 0, pending: 0, blocked: 0 }
  for (const t of allTasks.value) acc[t.status]++
  return acc
})

const statusMeta: Record<Status, { label: string, dot: string, chip: string }> = {
  done: { label: '완료', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  in_progress: { label: '진행 중', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200' },
  pending: { label: '대기', dot: 'bg-neutral-300', chip: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
  blocked: { label: '보류', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 border-rose-200' },
}

function progressFill(pct: number) {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 30) return 'bg-amber-500'
  if (pct > 0) return 'bg-neutral-400'
  return 'bg-neutral-200'
}

function groupedTasks(stage: Stage) {
  const groups: { name: string, tasks: Task[] }[] = []
  for (const t of stage.tasks) {
    const name = t.group ?? ''
    let g = groups.find(x => x.name === name)
    if (!g) { g = { name, tasks: [] }; groups.push(g) }
    g.tasks.push(t)
  }
  return groups
}

function scrollToStage(id: string) {
  const el = document.getElementById(`stage-${id}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="wbs-page">
    <!-- 헤더 (로고 + WBS crumb) — /help와 동일 패턴 -->
    <header class="wbs-header">
      <div class="app-container wbs-header-inner">
        <NuxtLink to="/home" class="wbs-logo">
          <span class="wbs-logo-mark"><AppLogoMark /></span>
          <span class="wbs-logo-text">맑은</span>
          <span class="wbs-logo-sub">message</span>
        </NuxtLink>
        <span class="wbs-header-divider" />
        <span class="wbs-header-crumb">WBS</span>
        <span class="wbs-header-title">맑은 메시징 프로젝트 작업 내역</span>
        <a
          href="https://github.com/malgnsoft/malgn-noti/blob/main/doc/WBS.md"
          target="_blank"
          rel="noopener noreferrer"
          class="wbs-header-link"
        >
          doc/WBS.md
          <UIcon name="i-lucide-arrow-up-right" />
        </a>
      </div>
    </header>

    <main class="app-container wbs-body">
      <!-- Title -->
      <div class="wbs-title-row">
        <div>
          <h1 class="wbs-title">{{ PROJECT_NAME }}</h1>
          <p class="wbs-subtitle">
            NHN Cloud Notification Hub 기반 멀티 테넌트 메시징 SaaS · 마지막 현행화
            <b>{{ LAST_UPDATED }}</b>
          </p>
        </div>
      </div>

      <!-- HERO STATS -->
      <section class="wbs-hero">
        <!-- 전체 진행률 -->
        <div class="hero-card hero-card--wide">
          <div class="hero-card-head">
            <div>
              <p class="hero-label">전체 진행률</p>
              <p class="hero-value">
                {{ weightedAverage }}<span class="hero-value-unit">%</span>
              </p>
            </div>
            <p class="hero-note">가중평균 · 5단계</p>
          </div>
          <div class="hero-bar">
            <div class="hero-bar-fill" :style="{ width: weightedAverage + '%' }" />
          </div>
        </div>

        <!-- 완료 -->
        <div class="hero-card">
          <div class="hero-mini-head">
            <span class="hero-dot bg-emerald-500" />
            <p class="hero-label">완료</p>
          </div>
          <p class="hero-mini-value">
            {{ totalCounts.done }}<span class="hero-mini-total">/{{ allTasks.length }}</span>
          </p>
        </div>
        <!-- 진행 중 -->
        <div class="hero-card">
          <div class="hero-mini-head">
            <span class="hero-dot bg-amber-500" />
            <p class="hero-label">진행 중</p>
          </div>
          <p class="hero-mini-value">{{ totalCounts.in_progress }}</p>
        </div>
      </section>

      <!-- 단계별 진행률 (개요 리스트) -->
      <section class="mt-8">
        <div class="overview-head">
          <h2>단계별 진행률</h2>
          <p>행을 클릭하면 상세로 이동</p>
        </div>
        <ul class="overview-list">
          <li
            v-for="(s, i) in STAGES"
            :key="s.id"
            class="overview-row"
            :class="i > 0 ? 'overview-row--bordered' : ''"
            @click="scrollToStage(s.id)"
          >
            <span class="overview-emoji">{{ s.emoji }}</span>
            <span class="overview-no">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="overview-text">
              <p class="overview-name">{{ s.no }} · {{ s.name }}</p>
              <p class="overview-summary">{{ s.summary }}</p>
            </div>
            <span class="overview-count">{{ s.tasks.length }}건</span>
            <div class="overview-progress">
              <div class="overview-progress-track">
                <div :class="['overview-progress-fill', progressFill(s.progress)]" :style="{ width: s.progress + '%' }" />
              </div>
              <span class="overview-progress-text">{{ s.progress }}%</span>
            </div>
            <span class="overview-arrow">→</span>
          </li>
        </ul>
      </section>

      <!-- STAGE 상세 -->
      <section
        v-for="(s, sIdx) in STAGES"
        :id="`stage-${s.id}`"
        :key="s.id"
        class="mt-12"
      >
        <div class="stage-head">
          <div class="stage-head-left">
            <span class="stage-emoji">{{ s.emoji }}</span>
            <h2 class="stage-name">{{ s.no }} · {{ s.name }}</h2>
            <span class="stage-id">{{ s.id }}</span>
          </div>
          <div class="stage-head-right">
            <span>비중 {{ s.weight }}%</span>
            <span class="stage-sep">·</span>
            <span class="stage-progress">진행 {{ s.progress }}%</span>
          </div>
        </div>
        <p class="stage-summary">{{ s.summary }}</p>
        <div class="stage-bar">
          <div :class="['stage-bar-fill', progressFill(s.progress)]" :style="{ width: s.progress + '%' }" />
        </div>

        <!-- 그룹별 작업 -->
        <div
          v-for="(g, gIdx) in groupedTasks(s)"
          :key="g.name || sIdx + '-' + gIdx"
          class="group-card"
        >
          <div v-if="g.name" class="group-title">
            <span class="group-bullet" />
            {{ g.name }}
            <span class="group-count">{{ g.tasks.length }}건</span>
          </div>

          <ul class="task-list">
            <li v-for="t in g.tasks" :key="t.id" class="task-row">
              <div class="task-left">
                <span class="task-id">{{ t.id }}</span>
                <span :class="['task-dot', statusMeta[t.status].dot]" />
                <div class="task-main">
                  <div class="task-title-row">
                    <span class="task-title">{{ t.title }}</span>
                    <a
                      v-if="t.href"
                      :href="t.href"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="task-link"
                    >
                      <UIcon name="i-lucide-arrow-up-right" class="task-link-icon" />
                    </a>
                  </div>
                  <p v-if="t.note" class="task-note">{{ t.note }}</p>
                </div>
              </div>
              <div class="task-right">
                <span :class="['task-chip', statusMeta[t.status].chip]">
                  {{ statusMeta[t.status].label }}
                </span>
                <span class="task-owner">{{ t.owner }}</span>
                <span class="task-date">
                  <template v-if="t.targetDate || t.completionDate">
                    <span class="task-date-label">목표</span>
                    <span class="task-date-val">{{ t.targetDate || '—' }}</span>
                    <span class="task-date-sep">→</span>
                    <span class="task-date-label">완료</span>
                    <span class="task-date-val">{{ t.completionDate || '—' }}</span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </main>

    <footer class="wbs-footer">
      <div class="app-container wbs-footer-inner">
        <span class="wbs-footer-brand">맑은 메시징</span>
        <span class="wbs-footer-copy">© 2026 맑은소프트. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ── 헤더 (/help와 동일 패턴) ── */
.wbs-page { background: #fafafa; min-height: 100vh; }
.wbs-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  border-bottom: 1px solid #e4e4e7;
}
.wbs-header-inner {
  display: flex;
  align-items: center;
  height: 56px;
  gap: 0;
}
.wbs-logo {
  display: flex;
  align-items: center;
  gap: 6px;
}
.wbs-logo-mark {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  background: #111;
  color: #fff;
  border-radius: 6px;
}
.wbs-logo-text {
  font-size: 16px;
  font-weight: 800;
  color: #111;
}
.wbs-logo-sub {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #71717a;
}
.wbs-header-divider {
  width: 1px;
  height: 16px;
  background: #e4e4e7;
  margin: 0 14px;
}
.wbs-header-crumb {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #71717a;
  margin-right: 8px;
}
.wbs-header-title {
  font-size: 14px;
  font-weight: 700;
  color: #18181b;
}
.wbs-header-link {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  color: #71717a;
  padding: 6px 10px;
  border: 1px solid #e4e4e7;
  border-radius: 6px;
  background: #fff;
  transition: background-color .15s, border-color .15s, color .15s;
}
.wbs-header-link:hover {
  background: #fafafa;
  border-color: #d4d4d8;
  color: #27272a;
}

/* ── 본문 ── */
.wbs-body { padding: 32px 0 56px; }
.wbs-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
.wbs-title {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #18181b;
}
.wbs-subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #71717a;
}
.wbs-subtitle b {
  font-weight: 600;
  color: #3f3f46;
}

/* ── Hero stats ── */
.wbs-hero {
  margin-top: 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 768px) {
  .wbs-hero { grid-template-columns: repeat(4, 1fr); }
  .hero-card--wide { grid-column: span 2; }
}
.hero-card {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  padding: 20px;
}
.hero-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.hero-label { font-size: 12px; color: #71717a; }
.hero-value {
  margin-top: 4px;
  font-size: 36px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #18181b;
  font-variant-numeric: tabular-nums;
}
.hero-value-unit { margin-left: 2px; font-size: 24px; color: #a1a1aa; }
.hero-note { font-size: 13px; color: #a1a1aa; padding-bottom: 4px; }
.hero-bar {
  margin-top: 16px;
  height: 6px;
  border-radius: 999px;
  background: #f4f4f5;
  overflow: hidden;
}
.hero-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: #18181b;
  transition: width .3s;
}
.hero-mini-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}
.hero-mini-value {
  margin-top: 4px;
  font-size: 28px;
  font-weight: 600;
  color: #18181b;
  font-variant-numeric: tabular-nums;
}
.hero-mini-total { font-size: 16px; color: #a1a1aa; }

/* ── Overview 리스트 ── */
.overview-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 8px;
}
.overview-head h2 { font-size: 14px; font-weight: 600; color: #3f3f46; }
.overview-head p { font-size: 13px; color: #a1a1aa; }
.overview-list {
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  overflow: hidden;
}
.overview-row {
  display: grid;
  grid-template-columns: 28px 28px 1fr auto 180px auto;
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: background-color .15s;
}
.overview-row:hover { background: #fafafa; }
.overview-row--bordered { border-top: 1px solid #f4f4f5; }
.overview-emoji { font-size: 20px; line-height: 1; }
.overview-no {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 14px;
  color: #a1a1aa;
  font-variant-numeric: tabular-nums;
}
.overview-text { min-width: 0; }
.overview-name {
  font-size: 14px;
  font-weight: 500;
  color: #18181b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overview-summary {
  font-size: 13px;
  color: #71717a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.overview-count { font-size: 13px; color: #a1a1aa; }
.overview-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}
.overview-progress-track {
  width: 120px;
  height: 4px;
  border-radius: 999px;
  background: #f4f4f5;
  overflow: hidden;
}
.overview-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width .3s;
}
.overview-progress-text {
  width: 36px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #3f3f46;
  font-variant-numeric: tabular-nums;
}
.overview-arrow { color: #d4d4d8; }

/* ── Stage 상세 ── */
.stage-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.stage-head-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.stage-emoji { font-size: 22px; line-height: 1; }
.stage-name {
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #18181b;
}
.stage-id {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 13px;
  color: #a1a1aa;
}
.stage-head-right {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #71717a;
}
.stage-sep { color: #e4e4e7; }
.stage-progress { font-weight: 500; color: #3f3f46; }
.stage-summary {
  margin-top: 4px;
  font-size: 13px;
  color: #71717a;
}
.stage-bar {
  margin-top: 12px;
  height: 4px;
  border-radius: 999px;
  background: #f4f4f5;
  overflow: hidden;
}
.stage-bar-fill { height: 100%; border-radius: 999px; transition: width .3s; }

/* 그룹 카드 */
.group-card {
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e4e4e7;
  border-radius: 12px;
  overflow: hidden;
}
.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #3f3f46;
  background: #fafafa;
  border-bottom: 1px solid #f4f4f5;
}
.group-bullet {
  width: 4px;
  height: 12px;
  border-radius: 2px;
  background: #18181b;
}
.group-count {
  margin-left: auto;
  font-weight: 400;
  font-size: 12px;
  color: #a1a1aa;
}

/* Task 행 */
.task-list { display: flex; flex-direction: column; }
.task-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  align-items: start;
  padding: 12px 16px;
  border-top: 1px solid #f4f4f5;
}
.task-row:first-child { border-top: 0; }
.task-left {
  display: grid;
  grid-template-columns: 56px 10px 1fr;
  gap: 10px;
  align-items: start;
  min-width: 0;
}
.task-id {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #a1a1aa;
  padding-top: 4px;
}
.task-dot {
  margin-top: 6px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
}
.task-main { min-width: 0; }
.task-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.task-title {
  font-size: 14px;
  color: #18181b;
  font-weight: 500;
}
.task-link {
  color: #71717a;
  transition: color .15s;
}
.task-link:hover { color: #18181b; }
.task-link-icon { width: 14px; height: 14px; }
.task-note {
  margin-top: 2px;
  font-size: 13px;
  color: #71717a;
  line-height: 1.55;
}

.task-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.task-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  border-style: solid;
  border-width: 1px;
}
.task-owner {
  font-size: 12px;
  color: #52525b;
  min-width: 64px;
  text-align: right;
}
.task-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px;
  color: #a1a1aa;
  font-variant-numeric: tabular-nums;
  min-width: 160px;
  justify-content: flex-end;
}
.task-date-label { color: #d4d4d8; font-size: 10px; }
.task-date-val { color: #52525b; }
.task-date-sep { color: #d4d4d8; }

@media (max-width: 720px) {
  .overview-row {
    grid-template-columns: 28px 1fr;
  }
  .overview-no, .overview-count, .overview-progress, .overview-arrow { display: none; }
  .task-row { grid-template-columns: 1fr; }
  .task-right { justify-content: flex-end; flex-wrap: wrap; }
  .task-date { min-width: 0; }
}

/* ── 푸터 ── */
.wbs-footer {
  border-top: 1px solid #e4e4e7;
  margin-top: 48px;
  padding: 22px 0;
  background: #fff;
}
.wbs-footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.wbs-footer-brand { font-size: 13px; font-weight: 700; color: #3f3f46; }
.wbs-footer-copy { font-size: 12px; color: #a1a1aa; }
</style>
