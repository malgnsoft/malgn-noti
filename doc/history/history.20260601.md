# 2026-06-01 — WBS 정본화 — `doc/WBS.md` 신규 + 사용자단 `/wbs` 라이브 카탈로그 (배포 #47)

## 한 줄 요약

`malgn-helper/doc/WBS.md` 양식 + `malgn-helper-pms/pages/wbs.vue` Notion soft SaaS 디자인을 차용해 **맑은 메시징 프로젝트 WBS 정본**을 두 산출물로 정착. `doc/WBS.md`(텍스트 정본 — 진행률 스냅샷·5단계 가중치·Step 1~5 작업 내역·알려진 한계)와 `app/pages/wbs.vue`(공개 라이브 카탈로그 — Hero stats·단계별 진행률 오버뷰·Stage 상세·그룹별 작업 카드·상태 칩·외부 링크). Step 5(서비스 개발)는 원본 WBS의 채널·도메인 단위 항목(대부분 0%)을 **2026-06-01까지의 실제 진행**(사용자단 6채널 + 전 도메인 화면 완료 / API 5채널·인증·OpenAPI·Queues·webhook 일부 완료 / 관리자단 셸+기획 / 배포 #1~#8)에 맞춰 5-1 설계·5-2 API·5-3 사용자단·5-4 관리자단·5-5 통합·배포의 5 그룹 58 작업으로 재정렬. Cloudflare Pages 프로덕션 배포 #47 (alias `0ecc825e.malgn-noti.pages.dev`).

## 1. 사전 조사

- **MD 양식 정본**: [`malgnsoft/malgn-helper/blob/main/doc/WBS.md`](https://github.com/malgnsoft/malgn-helper/blob/main/doc/WBS.md) — Phase 별 진행률 스냅샷 + 단계별 가중치 표 + 단계 상세 표(ID/작업/상태/산출물/비고) + 상태 범례(✅/🟢/⚪/⛔).
- **디자인 정본**: [`malgnsoft/malgn-helper-pms`](https://github.com/malgnsoft/malgn-helper-pms) `pages/wbs.vue` — Notion·Linear·Height 풍 "Soft SaaS". `UContainer max-w-5xl` + `rounded-xl border border-neutral-200` 카드 + 단계 이모지(🎯📐🛠️📚🧪🚀) + 가중평균 hero + 단계별 오버뷰 행 + Stage 상세 + 상태 칩(emerald/amber/neutral/rose) + 진척률 막대 컬러 룰(≥70 emerald / ≥30 amber / >0 neutral-400 / 0 neutral-200).
- **데이터 소스**: 사용자가 제공한 7장 스크린샷(Google Sheets 형식의 원본 WBS — `맑은메시지(가칭) 프로젝트 작업 내역`). Step 1~5 전체와 담당자/목표일/완료일/진척율(0~100%) 포함.
- **Step 5 재구성 근거**: `doc/history/history.20260511~20260527.md` 12 일치 누적 이력 — 사용자단 화면 15 종 ✅ / API 9 종 ✅ + 3 종 🟢 + 4 종 ⚪ / 관리자단 ✅ 셸·기획·디자인 가이드 + ⚪ 페이지 11 종 / 배포 사용자단 #1~#46·관리자단 #1·API #1~#8 + DDL `0002_export_flow.sql` ⛔(Cloudflare 1105).

## 2. 결정 사항

- **레포 위치**: 사용자단 `malgn-noti`. 관리자단·API도 후속 검토 가능하나 1차는 사용자가 가장 자주 보는 사용자단에 두기로 결정(공개·blank 레이아웃).
- **접근**: `/wbs` 공개. `definePageMeta({ layout: 'blank', auth: false })`. GNB·푸터 없는 단독 페이지 — 외부 공유에 그대로 쓸 수 있도록.
- **두 산출물 운영**: MD가 정본, Vue 페이지는 동일 데이터를 살아있는 카탈로그로 노출. 어긋나면 MD 우선. Vue 페이지 내부 데이터는 정적 embed (별도 API 없음 — helper-pms처럼 R2 영속·자동 저장은 과한 인프라).
- **5 단계 가중치**: 1 준비 10% · 2 정책 15% · 3 기획 20% · 4 디자인 10% · 5 개발 45% — 개발 비중이 큰 프로젝트라 Step 5를 45%로 가중. Step 1·2는 합의·문서 위주라 가볍게.
- **Step 5 재구성 방침**: 원본 항목(채널·도메인 단위, 대부분 0%)을 실제 산출물 단위 5 그룹으로 재구성 — `5-1 설계 및 준비`(7) / `5-2 API 서버`(16) / `5-3 사용자단 화면`(15) / `5-4 관리자단 화면`(13) / `5-5 통합·배포`(7).
- **상태 매핑**: `done` ✅ / `in_progress` 🟢 / `pending` ⚪ / `blocked` ⛔. Vue에서는 색칩 + 점 + 진척률 막대 색상으로 동시 표현.

## 3. 코드 변경

### 3.1 `doc/WBS.md` — 텍스트 정본 (신규)

[doc/WBS.md](../WBS.md) — 약 220 라인. 구조:

1. **진행률 스냅샷 (2026-06-01)** — 5 단계 × 가중치·진행률·핵심 진행 사항. 가중평균 계산식 명시(`0.10×55 + 0.15×55 + 0.20×35 + 0.10×20 + 0.45×55 ≈ 44.5`).
2. **상태 범례**.
3. **단계별 가중치** 표.
4. **Step 1 — 프로젝트 준비 (10%)** — 5 하위 섹션(R&R·사업기획 / 사업준비 / 커뮤니케이션 / 서비스 메타 / 환경 셋팅), 18 작업.
5. **Step 2 — 주요 서비스 정책 이슈 정리 (15%)** — 6 하위 섹션(프로토타입 / 주요 서비스 참조 / 캠페인 / 회원·결제·계약 / 메시지 채널 정책 / 캠페인·주소록·브랜드), 22 작업.
6. **Step 3 — 서비스 기획 (20%)** — 3 하위 섹션(Front / BackOffice 1차 / BackOffice 2차), 22 작업.
7. **Step 4 — 디자인 / 퍼블리싱 (10%)** — 2 작업 + "현재는 개발 측 `doc/DESIGN.md` + `/guide` 카탈로그로 대체 운영" 주석.
8. **Step 5 — 서비스 개발 (45%)** — ⚠️ 재구성 마커 + 5 하위 섹션(설계 및 준비 7 / API 서버 16 / 사용자단 화면 15 / 관리자단 화면 13 / 통합·배포 7), 총 58 작업.
9. **알려진 한계 / 다음 단계** — DDL 보류·백엔드 연동 미·관리자단 페이지 미·NHN real/PG/AI 게이트웨이 미정·시스템 페이지 재작업·Step 4 정식 산출물 미.

### 3.2 `app/pages/wbs.vue` — 공개 라이브 카탈로그 (신규)

[app/pages/wbs.vue](../../app/pages/wbs.vue) — 약 650 라인 (스크립트 280 + 템플릿 130 + 스타일 240).

- **definePageMeta** `{ layout: 'blank', auth: false }`. `/help`와 동일한 단독 셸 패턴.
- **데이터 형태**:
  ```ts
  type Status = 'done' | 'in_progress' | 'pending' | 'blocked'
  interface Task { id, group?, title, status, owner, note?, targetDate?, completionDate?, href? }
  interface Stage { id, no, emoji, name, summary, weight, progress, tasks }
  const STAGES: Stage[] = [/* Step 1~5, 113 tasks */]
  ```
- **헤더**: `/help` 패턴 차용 — `position: sticky` 56px 높이 + `<AppLogoMark/>` 로고 + `wbs-header-divider` + `WBS` crumb + `맑은 메시징 프로젝트 작업 내역` 타이틀 + 우측 `doc/WBS.md ↗` 외부 링크.
- **Title row** — `맑은 메시징` h1(30px·600·-0.01em) + 부제(서비스 한 줄 설명 + 마지막 현행화 날짜).
- **Hero stats** (4-col grid) — `전체 진행률`(가중평균 % + 36px tabular-nums + 너비 = 진행률인 검정 막대) span-2 + `완료`(N/총 작업 수) + `진행 중`(N).
- **단계별 진행률 오버뷰** — 카드형 ul, 행 클릭 시 `scrollToStage` smooth scroll. 6-col grid(이모지·번호·이름/요약·작업 수·진척률 막대+%·화살표).
- **Stage 상세** — 단계마다 head(이모지·이름·ID + 비중·진척률) + 작은 진척률 막대 + `groupedTasks(stage)`로 그룹 카드 분할 렌더링. 각 작업 행은 `task-id`(JetBrains Mono) + 상태 점 + 제목 + 외부 링크 아이콘 + 메모 + 우측(상태칩·담당자·목표→완료 날짜).
- **반응형** — 720px 미만에서 오버뷰 행과 작업 행 그리드를 단순화.
- **푸터** — 상단 1px border + 브랜드 + 카피.

### 3.3 데이터 채우기

- **Step 1·2** — 스크린샷 그대로 옮김.
- **Step 3** — 스크린샷 그대로 옮김. 운영가이드 메모에 "(사용자단 `/help` 라이브 — 컨텐츠 보강 필요)" 부기.
- **Step 4** — 스크린샷 그대로 옮기되 메모로 "(개발 측에서 `doc/DESIGN.md` Relay-inspired v1.0 + `/guide` 카탈로그로 대체 운영)" 부기.
- **Step 5** — 사용자 요청대로 재구성:
  - 5-1 설계 및 준비 — 아키텍처·데이터 모델링·DS·사용자단/관리자단 가이드·관리자단 셸·페이지 기획 MD 33종 ✅ 7건.
  - 5-2 API 서버 — Workers 부트스트랩·DB 49 테이블·기초 CRUD 14·OpenAPI 37·인증·발송 5채널·멱등성·NHN 어댑터 5·Queues + Consumer ✅ 9건 / Webhook 핸들러·Export·Flow 🟢 3건 / 캠페인·PG·AI·NHN real ⚪ 4건 = 16건.
  - 5-3 사용자단 화면 — 인증/계정·발송 6채널·이력 5+stats·주소록·발신정보 6·템플릿 5+settings·캠페인·크레딧/결제·문의·나의 페이지·랜딩페이지·공개 랜딩·디자인 가이드 ✅ 13건 / 시스템 페이지 🟢 1 / 백엔드 연동 ⚪ 1 = 15건.
  - 5-4 관리자단 화면 — 셸·기획 MD ✅ 2건 / P0·P1·P2 ⚪ 11건 = 13건.
  - 5-5 통합·배포 — 사용자단 Pages 🟢 / 관리자단 Pages ✅ / API Workers ✅ / DDL ⛔ / NHN real·PG·AI ⚪ = 7건.

## 4. 배포 #47 (사용자단)

- `pnpm build` → Nitro `cloudflare-pages` 프리셋 → `dist/_worker.js` 빌드 OK. `wbs-BWsapYCM.mjs` 30.3 kB / `wbs-styles.BOjKIqTn.mjs` 29.9 kB 청크 생성. Total 3.02 MB(903 kB gzip).
- `npx wrangler@4 pages deploy dist --project-name=malgn-noti --branch=main --commit-dirty=true --commit-message "deploy wbs page"`.
- alias `https://0ecc825e.malgn-noti.pages.dev`.
- 검증: `GET https://malgn-noti.pages.dev/wbs` → HTTP 200. 그렙으로 `맑은 메시징 프로젝트 작업 내역` 헤더·`wbs-header-title` 2·`전체 진행률` 1·`stage-emoji` 6 출력 확인(5 stages × 본문 + 1 hero/overview).

## 산출물

- `malgn-noti: WBS — doc/WBS.md 정본 + /wbs 공개 라이브 카탈로그 (배포 #47)`
- 신규 파일:
  - [doc/WBS.md](../WBS.md)
  - [app/pages/wbs.vue](../../app/pages/wbs.vue)
- 프로덕션: <https://malgn-noti.pages.dev/wbs> · alias `https://0ecc825e.malgn-noti.pages.dev/wbs`.

## 다음 단계 / 알려진 한계

- **MD ↔ Vue 동기화는 수동.** 가중치·진척률·작업 상태가 어긋나면 한 곳만 갱신해 두기 쉬움 — 큰 변화가 생기면 두 파일을 같이 수정하는 디스플린 유지.
- **진척률은 추정.** 실제 작업 수 대비 ✅/🟢/⚪/⛔ 비율을 기준으로 추정 — 객관 지표(완료 PR 수·테스트 통과율 등) 도입 시 더 정확히.
- **`/wbs` 인덱싱 차단 미비.** `nuxt.config.ts head`에 전체 `noindex,nofollow` 설정이 있는지 재확인 필요(검색 노출 방지).
- **외부 자료 링크 일부 placeholder.** 컨설팅팀/디자인팀 산출물(단가표·계약서·디자인 스타일 가이드 등)의 실제 URL이 정해지면 MD·Vue 양쪽에 채워 넣기.
- **Step 4 정식 산출물.** 디자인팀의 정식 디자인 스타일 가이드 + 퍼블리싱 MD는 여전히 미. 개발 측 `doc/DESIGN.md` + `/guide` 카탈로그로 대체 운영 중.
- **자동화 가능성**: helper-pms처럼 R2 영속 + 자동 저장 형태로 운영하고 싶다면, `malgn-noti-api`에 `GET /wbs` + `PUT /wbs` 추가 → 본 페이지를 편집 가능 페이지로 전환. 1차에서는 스코프에서 제외.

---

# §2. `0002_export_flow.sql` DDL — 라이브 이미 적용 확인 + 라이브 검증 + SQL 파일 동기화

## 한 줄

`wrangler dev --remote`의 1105 잔류로 `/admin/migrate` 경로가 막혀 있던 상태에서, Aurora 직결(`noti` 계정 + SSL REQUIRED)로 들어가 **4 신규 테이블(TB_EXPORT_JOB / TB_FLOW_DEFINITION / TB_FLOW_RUN / TB_FLOW_STEP_RUN)이 이미 적용돼 있음**을 확인. 컬럼은 우리 `0002_export_flow.sql`과 100% 일치, **인덱스·FK는 라이브 쪽이 더 정교**(FK 6개 + 의미 있는 인덱스명) — 출처는 사전 작업으로 추정. 라이브 워커의 `/export-jobs`·`/flow-definitions` GET/POST 4건 모두 200/201 정상 응답으로 e2e 확인. 검증 과정에서 생긴 테스트 데이터(임시 user/company 2건 + export_job/flow_def 각 1건)를 즉시 cleanup해 빈 상태 복구. `0002_export_flow.sql`을 라이브 정본(인덱스·FK 포함)에 맞춰 갱신해 신규 환경에서도 동일하게 적용되도록 동기화.

## 2.1 Cloudflare 1105 재시도 (3회) → 모두 실패

| 시도 | 시각 (UTC) | Ray ID | 결과 |
| --- | --- | --- | --- |
| 1차 | 01:47 | `a04a8ca2dd1125d4` | HTTP 503 — `Error 1105 Temporarily unavailable` |
| 2차 | 01:54 | `a04a9753cbaedd38` | HTTP 503 — 동일 |
| 3차 | 02:24~02:28 | — | HTTP 503 12회 폴링 모두 (10초 간격) |

- 모두 `wrangler dev --remote`가 띄운 임시 edge-preview 워커에서 발생. 라이브 워커(`https://malgn-noti-api.malgnsoft.workers.dev`)는 `/health`·`/health/db` 200으로 영향 없음 → **1105는 Cloudflare 측 dev/preview 인프라 한정 장애**로 확정.
- 결정: 한 번만 쓸 카드인 일회용 Aurora SG whitelist 경로로 우회. 운영 정책 갱신(Cloudflare Tunnel·RDS Proxy·bastion 등)은 별도 후속 작업으로 분리.

## 2.2 Hyperdrive ↔ Aurora 라이브 연결 정상성 사전 확인

- `wrangler hyperdrive get a2ba4efe7421464da1d5ff5e620b33a3` — 설정 정상 (origin: `malgn-dev-db.cluster-c53h9wjjbjbr.ap-northeast-2.rds.amazonaws.com:3306` / db `noti` / user `admin` / SSL REQUIRED / connection_limit 60 / 캐싱 활성).
- `/health/db` 3회 — 모두 200, `mysql_version: 8.0.42`, **cold 512ms → warm 355ms → warm 360ms** (Hyperdrive 캐시 효과 뚜렷).
- 보호 라우트 가드 — `/me`·`/contacts`·`/dispatch/requests` 모두 401 (DB 단계 진입 전 차단). `/admin/*` 404 (프로덕션 가드 정상).
- 실 DB write+read — `/auth/signup`(임시) → JWT 169자 → `/me` SELECT 2회 → **249ms 응답** + 컬럼 정상 매핑.
- 결론: 1105와 무관하게 라이브 인프라는 한 통으로 살아 있음.

## 2.3 Aurora 직결 — TCP 도달성 + mysql 인증

- 사용자 제공 — `noti` 계정 + 패스워드(채팅 외부에 기록 안 함, `MYSQL_PWD` 환경변수로만 1회 쉘에서 사용).
- 내 outbound IP — `211.119.233.35`.
- TCP probe: `nc -zv -G 5 malgn-dev-db.cluster-...:3306` → **즉시 connection succeeded** — SG 인바운드가 이미 열려 있는 상태(추정: 사전에 noti IP 또는 관련 대역이 화이트리스트됨).
- mysql 접속(`--ssl-mode=REQUIRED`): `noti@%`, DB `noti`, 서버 8.0.42 → ✅.

## 2.4 사전 DDL 적용 확인 — 컬럼 100% 일치, 인덱스·FK 더 풍부

- 전체 TB_ 카운트: **50** (= 49 initial + 1 idempotency + 4 신규 − 4 중복? 아님. 0000_initial.sql의 정확 적용본은 45 + 0001 1 + 0002 4 = 50.) — 4 신규가 50 안에 이미 포함돼 있음.
- 4 신규 테이블 컬럼 — `0002_export_flow.sql`(2026-05-31자 초안)과 **모두 일치**: 데이터 타입·NULL 여부·기본값·자동 타임스탬프 모두 동일.
- **인덱스/FK는 라이브 쪽이 더 정교**:
  - `TB_EXPORT_JOB`: 라이브 `idx_export_company_state(company_id, job_state, requested_at) + idx_export_user(user_id, requested_at) + FK fk_export_company → TB_COMPANY + FK fk_export_user → TB_USER`. 초안 안은 단일 `idx_export_company_user(company_id, user_id, requested_at) + idx_export_state(job_state, requested_at)`만 있었음.
  - `TB_FLOW_DEFINITION`: 라이브 `idx_flowdef_company_status(company_id, status, created_at) + FK fk_flowdef_company → TB_COMPANY`. 초안은 `idx_flow_def_company(company_id, created_at)`만.
  - `TB_FLOW_RUN`: 라이브 `idx_flowrun_company_state(company_id, run_state, started_at) + FK fk_flowrun_company → TB_COMPANY + FK fk_flowrun_def → TB_FLOW_DEFINITION + 보조 키 fk_flowrun_def`. 초안은 인덱스 2개만, FK 없음.
  - `TB_FLOW_STEP_RUN`: 라이브 `idx_fsr_run(flow_run_id, node_order) + idx_fsr_dispatch(dispatch_request_id) + FK fk_fsr_run → TB_FLOW_RUN`. 초안은 단일 인덱스만, FK 없음.
- 4 테이블 모두 행 수 **0** → 빈 신규 생성. **즉, 출처는 사전 작업(SG whitelist + 직결 또는 다른 운영 경로)**.

## 2.5 라이브 워커 e2e 검증 (4 호출 모두 통과)

| 호출 | 결과 |
| --- | --- |
| `GET /export-jobs` (auth) | 200 — `{data:[], nextCursor:null}` · 449ms |
| `POST /export-jobs` `{resourceType:"history_sms", params:{from,to}}` | 201 — id=1 / `jobState:"pending"` / `expires_at` 등록 +30일 자동 계산 · 306ms |
| `GET /flow-definitions` (auth) | 200 — `{data:[], nextCursor:null}` · 400ms |
| `POST /flow-definitions` (alimtalk→sms on_fail 5분 폴백) | 201 — id=1 / nodes JSON 보존 / `createdAt`·`updatedAt` 자동 / `deletedAt:null` · 563ms |

→ **라이브 워커 + 4 신규 라우트 + 라이브 DB**가 한 통으로 정상. CRUD ✅. 처리 worker / 실행 엔진은 여전히 미.

## 2.6 테스트 데이터 cleanup

- 검증 과정에서 생성: `TB_USER`(loginid `hd-check-…`·`ddl-…`) 2건 / `TB_COMPANY`(name `hyperdrive-check-…`·`ddl-live-check-…`) 2건 / `TB_EXPORT_JOB` id=1 / `TB_FLOW_DEFINITION` id=1 / `TB_TERMS_AGREEMENT` 0건(현재 약관 미배포로 자동 생성 없음).
- 단일 트랜잭션 묶음 없이 순서대로 DELETE — FK 제약을 만족하도록 자식 → 부모 순.
- 사후 카운트: `TB_EXPORT_JOB=0` / `TB_FLOW_DEFINITION=0` / `leftover_users=0` / `leftover_companies=0` ✅.
- AUTO_INCREMENT 잔류: `TB_EXPORT_JOB.AUTO_INCREMENT=2` / `TB_FLOW_DEFINITION.AUTO_INCREMENT=2` (정상 — 다음 INSERT는 id=2부터 시작).

## 2.7 `0002_export_flow.sql` 라이브 정본 동기화

- 초안 SQL 파일을 라이브 `SHOW CREATE TABLE` 결과 기준으로 갱신 — 인덱스명 변경(`idx_export_company_state` 등) + FK 6개 추가(`fk_export_company`·`fk_export_user`·`fk_flowdef_company`·`fk_flowrun_company`·`fk_flowrun_def`·`fk_fsr_run`) + 코멘트 일치(`'history_sms, contacts 등'`·`'[{order, channel, template_id, condition, delay_minutes}]'` 등).
- CLAUDE.md §5 "파티션 테이블 — FK 미사용" 원칙은 유지 — 이번 4 테이블은 모두 비파티션이라 FK 적용 가능.
- 파일 헤더에 "2026-06-01 현행화 — 라이브(Aurora) 정본과 동기화: FK 6개 + 의미 있는 인덱스명" 명시.

## 2.8 산출물

- `malgn-noti-api: src/db/migrations/0002_export_flow.sql` — 라이브 정본 동기화 (1 file, 인덱스명 변경 + FK 6 추가 + 코멘트 일치).
- 라이브 DB — 변경 없음(이미 적용된 정본 그대로 + cleanup으로 빈 상태 복원).
- 라이브 Worker — 변경 없음(이미 배포 #8 `95f9f894...`이 4 라우트를 정상 노출 중).
- `malgn-noti: doc/WBS.md` 갱신 — 5-2-11/12 🟢 (CRUD ✅, 처리 worker / 실행 엔진 미) / 5-5-4 ⛔→✅ (DDL 적용 확인).

## 2.9 다음 단계 / 알려진 한계

- **Drizzle schema.ts vs 라이브 인덱스/FK** — `src/db/schema.ts`의 export/flow 테이블 정의는 인덱스/FK를 선언하지 않음(컬럼만). 런타임 동작에는 영향 없지만, `drizzle-kit introspect` 또는 schema에서 명시적으로 `index()`/`foreignKey()`를 선언해 정합화하는 게 위생적. 후속.
- **운영 절차 갱신** — `wrangler dev --remote` 1105 같은 dev/preview 장애가 또 발생할 때를 대비, CLAUDE.md §12 후보 중 **Cloudflare Tunnel(cloudflared) → Aurora** 셋업 검토. 별도 작업.
- **SG 정책 재검토** — 사전 작업에서 어떤 IP 대역이 화이트리스트됐는지 한 번 정리. `noti` 계정의 권한 범위(CREATE TABLE 가능 여부)도 운영 문서화 필요.
- **처리 worker 미** — `/export-jobs` 처리 워커(R2 업로드 + presigned URL) / `/send/flow` 실행 엔진 + `TB_FLOW_RUN`·`TB_FLOW_STEP_RUN` 천이 — 둘 다 별도 마일스톤.
