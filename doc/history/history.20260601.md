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
