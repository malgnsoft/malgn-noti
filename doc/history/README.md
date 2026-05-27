# 작업 이력 (`doc/history/`)

날짜별 작업 내역을 누적해 두는 폴더입니다. **하루에 한 파일** 원칙.

## 파일명 규칙

```
history.yyyyMMdd.md
```

예: `history.20260514.md`. 작업이 있는 날만 생성합니다.

## 파일 구조 (공통)

각 파일은 다음 순서를 따릅니다.

1. **한 줄 요약** — 그 날의 가장 큰 변화
2. **번호별 작업 섹션** — 결정 사항 / 코드 변경 / 배포 / 미세 조정
3. **산출물** — 추가·수정된 파일, 배포 버전, 외부 URL
4. **다음 단계 / 알려진 한계**

## 인덱스

| 날짜 | 요약 |
| --- | --- |
| [2026-05-11](./history.20260511.md) | 프로젝트 착수 — 세 레포 부트스트랩 + 첫 GitHub 푸시 + Cloudflare 첫 배포 + 시안 GNB 도입 |
| [2026-05-12](./history.20260512.md) | 시안 정밀 매칭 — 콘텐츠 폭 1200px 통일, Utility Bar 분리, 메뉴 8개, 문서 3종(`FRONTEND`/`STACK`/`DESIGN`) |
| [2026-05-13](./history.20260513.md) | Smart Placement + 발송 페이지 풍부화 — 공용 컴포넌트 21종, `useChannelMeta`, SMS/알림톡 발송 페이지 |
| [2026-05-14](./history.20260514.md) | GitHub 일괄 푸시 + `doc/history/` 폴더 정리 |
| [2026-05-18](./history.20260518.md) | 디자인 시스템 전면 피벗 — Relay-inspired(핸드오프 정본), 셸+홈+발송 전 채널 적용, `design-system-pivot` 푸시 |
| [2026-05-19](./history.20260519.md) | 디자인 가이드 페이지(`/guide`, 18섹션 라이브 카탈로그) + Cloudflare Pages 프로덕션 배포 |
| [2026-05-20](./history.20260520.md) | 발송 페이지 UX 폴리시 2차 + PUSH 부가항목·플로우 관리 + 문서 현행화 + 발송 조회 페이지 재작업·btn-sky 제거 + 통계 페이지 재구성(Chart.js)·폰트 토큰화·zoom 제거 + 발송 템플릿 토글 개선 + 주소록 관리 페이지 강화 + 발신 번호 관리 페이지·등록 마법사 + 그룹 관리 페이지 + RCS 브랜드 관리 페이지 + 이메일 도메인 관리 페이지 (배포 #15~#26) |
| [2026-05-21](./history.20260521.md) | 발신 정보 페이지 마무리(발신 프로필·PUSH 인증·080 수신 거부) + 테이블 스타일 A/B/C 정의·발송 조회 툴바 재배치 + GNB 정리 + 수신 거부 관리 3종 + 문자메시지·알림톡 템플릿 관리 페이지 + 미리보기 시각 현재화 + 로그인 페이지 시안 IA 재구성 + 비밀번호 재설정 입력란 보정 + 메시지 관리 5채널 템플릿 페이지(SMS·알림톡·RCS·이메일·PUSH) + 보안 인증 페이지 보정 + 사이트맵 페이지 + 회원가입 5단계 마법사 + 메시지 상세 설정 페이지 + 새 비밀번호 설정 페이지 보정 + 랜딩페이지 만들기 + 문의하기 페이지 /account/inquiry 이동 + 나의 페이지 섹션 + 크레딧 충전 플로우 (배포 #27~#46) |
| [2026-05-22](./history.20260522.md) | 나의 페이지 화면 신규 구성 — 비밀번호 변경·보안로그인 설정·멀티 계정 추가·계약 관리(계약서 확인·3스텝 전자서명 위저드·PDF 미리보기) + 크레딧 관리(A형 내역 테이블·영수증 모달) + 나의 문의(목록·상세 댓글 스레드)·문의하기 LNB + 서비스 담당자 초대 플로우(/invite 등록 페이지)·문의 등록 완료 페이지 + 사이트맵 현행화 + 운영 가이드 페이지(/help)·GNB 연결 + 비로그인 공개 랜딩 페이지(/, 히어로·장점·채널 단가 비교) (배포 #47~#52) |
| [2026-05-26](./history.20260526.md) | `malgn-noti-api` 데이터 모델·초기 DDL·Hyperdrive 연결·첫 프로덕션 배포 — 49 테이블 데이터 모델(TB_·company_id·status INT 1/0/-1 + *_state·*_yn·loginid/email 분리) + Mermaid ERD 9종 + 확장성 전략(월 RANGE 파티셔닝·Hot/Warm/Cold·R2 오프로드) + 0000_initial.sql(49 테이블, 파티션 5종) + Hyperdrive(`a2ba4efe...`) 바인딩 + drizzle-orm/mysql2 + /health/db + `wrangler dev --remote`로 로컬도 실제 Aurora + `https://malgn-noti-api.malgnsoft.workers.dev` 프로덕션 첫 배포(/health/db → mysql_version 8.0.42) + `malgn-noti-api/CLAUDE.md §8.1`에 배포·Git·작업 이력 운영 컨벤션 명문화 + malgn-noti 프론트 배포 #53 (list 툴바 새로고침 버튼 일괄 제거 + guide/DESIGN 갱신) + `/admin/migrate`·`/admin/tables`·`/admin/partitions` 라우트 + 0000_initial.sql Aurora 적용 (49 테이블 + 75 파티션 라이브) + 기본 CRUD API 골격 (errors/pagination/auth/Drizzle schema + /me /contacts /contact-groups /sender-phones) + `/doc` API 가이드(Scalar UI + OpenAPI 3.1) + malgn-noti-api 프로덕션 배포 #2 (Version `1fdc3b12...`, 가드 작동 확인) + 14개 도메인 라우트 추가(발신정보 5종/optout-entries/templates 2종/inquiries/company-settings/payment-methods/landing-pages/credit-ledger) + Phase 1·2·3 (/doc 확장 paths 10→37·schemas 11→45 + signup/login + PBKDF2 + JWT HS256 + 발송 이력 read-only with 90일 윈도우 강제) + malgn-noti-api 프로덕션 배포 #3 (Version `926017d2...`, JWT_SECRET secret, 실제 /auth/signup → /me 동작 확인) + POST /send/sms 발송 producer(DB 적재까지 — 발신번호 검증·옵트아웃 필터·크레딧 hold·트랜잭션, 알려진 멱등 버그 TODO) + malgn-noti-api 프로덕션 배포 #4·#5 (Version `4d9e1fbe...` → `afaa4c89...`, /send/sms 라이브 가드·검증 흐름 9건 + 재배포 검증 4건, jwt.ts linter 캐스트 명시화) + 🐛 멱등 버그 해결 (TB_IDEMPOTENCY + INSERT-then-conflict race-free 패턴, 검증 3건 통과) + NHN SMS 어댑터(mock/real) + Cloudflare Queues(`malgn-noti-dispatch`) + consumer worker (dispatch_state 천이) + 프로덕션 배포 #6 (Version `b30dc2a3...`, Producer+Consumer 동시 바인딩 라이브, 큐 e2e는 Cloudflare 1105 회복 후 재검증) |

## 작성 시점

- 큰 마일스톤 마무리 직후
- 그날 끝낼 때 짧게라도 한 줄 요약 + 산출물 목록만이라도

## 검색

특정 결정을 언제 했는지 찾을 때 `grep`:

```bash
grep -rn "Smart Placement" doc/history/
grep -rn "Aurora 노출" doc/history/
```
