# 2026-05-27 — malgn-noti-admin Nuxt 3 부트스트랩 + 셸 레이아웃 + 첫 프로덕션 배포 + malgn-noti-api 멱등 수정·NHN 어댑터·Queues·배포 #6

## 한 줄 요약

두 트랙 병행. **(A) malgn-noti-admin** — 비어 있던 BackOffice 레포를 **Nuxt 3 + Nuxt UI v3로 부트스트랩** + `design_handoff_customer_detail` 정본 참조 **LNB(256px sticky · 8 그룹 메뉴) + TopBar(64px sticky)** 셸 레이아웃 + `https://malgn-noti-admin.pages.dev` 첫 Nuxt 앱 프로덕션 배포(정적 placeholder 대체). **(B) malgn-noti-api** — §19에서 추적한 멱등 버그를 `TB_IDEMPOTENCY` + INSERT-then-conflict race-free 패턴으로 정식 해결 + NHN SMS 어댑터(mock/real) + Cloudflare Queues(`malgn-noti-dispatch`) + consumer worker(`dispatch_state` 천이) + Producer·Consumer 동시 바인딩 프로덕션 배포 #6(Version `b30dc2a3...`).

## 1. 사전 조사

- **참조 정본**: `/Users/dotype/Projects/design_handoff_customer_detail/` — README + `prototype/` HTML/JSX 프로토타입. 고객사 상세 1화면 hi-fi 시안.
  - 권장 스택: Nuxt 3 + **Nuxt UI v3** + Tailwind v4 + DM Sans(라틴) + Pretendard(한글) + Lucide.
  - 레이아웃: LNB 256px · TopBar 64px · Content + MemoPanel 360px.
  - `prototype/lnb.jsx`에서 8개 그룹 메뉴 트리 + 액티브/배지/NEW 스타일 추출.
- **대상 상태**: `malgn-noti-admin/`은 `CLAUDE.md`(상세 운영 도메인 문서)·`doc/DESIGN-ADMIN.md`(Part A 상속 + Part B 관리자 밀도)·정적 `public/index.html`(placeholder)만 존재 — Nuxt 미부트스트랩.
- **사용자 확인**: `AskUserQuestion` — 산출물 형태 → "Nuxt 3 부트스트랩 + 셸 레이아웃", 범위 → "셸만(LNB + TopBar + 빈 콘텐츠)".

## 2. 프로젝트 부트스트랩

- **package.json**(신규): name=`malgn-noti-admin`, 사용자단과 동일 버전 라인 — `nuxt ^3.16` · `@nuxt/ui ^3.0` · `@iconify-json/lucide` · `vue ^3.5` · `vue-router ^4.4` · `typescript ^5.6` · pnpm 10.25. Pinia/Chart/Zod 제외 — 셸 범위 밖.
- **nuxt.config.ts**(신규): `compatibilityVersion: 4`(app/ 디렉터리 구조) · `modules: ['@nuxt/ui']` · `nitro.preset: 'cloudflare-pages'` · DM Sans + Pretendard 폰트 head 주입 · `noindex,nofollow` 메타.
- **tsconfig.json**(신규): Nuxt 자동생성 `.nuxt/tsconfig.json` 상속.
- **app/app.config.ts**(신규): Nuxt UI 컬러 매핑 — **primary `blue`** + neutral `slate` (핸드오프 정본).
- **app/app.vue**(신규): `<UApp :locale="ko"><NuxtLayout><NuxtPage/></NuxtLayout></UApp>` 루트.
- **app/assets/css/main.css**(신규): `@import "tailwindcss"` + `@import "@nuxt/ui"`. `@theme`에 폰트 정의(DM Sans + Pretendard), `:root`에 `--lnb-width: 256px` · `--topbar-height: 64px` · `--ring-default` · `--shadow-ring`. 본문 13px · slate-50 paper · slate-900 텍스트.

## 3. 셸 레이아웃

- **app/layouts/default.vue**(신규): `flex min-h-screen bg-slate-50` 컨테이너 — `<AppLnb/>` + `<div class="flex-1 min-w-0 flex flex-col"><AppTopbar/><main class="flex-1 px-6 py-5"><slot/></main></div>`.
- **app/components/AppLnb.vue**(신규): 256px sticky 사이드바.
  - 브랜드 헤더 — 그라데이션 로고 + "맑은 message **Admin**".
  - ⌘K 검색 버튼(`ring-1 ring-inset` 입력형).
  - **8개 그룹 메뉴**(핸드오프 `lnb.jsx` 1:1 매핑) — 대시보드 · 회원/고객사(고객사·계정·감사로그+`3` 배지·차단/제재) · 발송 관리(PUSH·RCS·SMS/LMS·알림톡·이메일·예약 발송+NEW) · 템플릿(채널 4종+치환 변수) · 리포트(발송량·실패율·채널·크레딧·정산) · 채널/연동(FCM·APNs·RCS Biz·카카오 비즈·SMPP) · 결제/크레딧(발급·사용 내역·세금계산서) · 운영(공지·FAQ·1:1 문의).
  - 1depth 액티브 — `bg-blue-50 text-blue-700` + 아이콘 박스 `bg-blue-100`. 2depth 액티브 — 좌측 점 표식. 그룹 펼침/접힘 토글.
  - 하단 사용자 chip(아바타 + 이름/이메일 + chevron).
- **app/components/AppTopbar.vue**(신규): 64px sticky 상단 바.
  - 좌측 — 사이드바 토글 + 홈 아이콘 · 브레드크럼 "대시보드".
  - 우측 — `bg-emerald-50 ring-emerald-200` 시스템 상태 pill("시스템 정상 · 14ms"), 검색·벨(+빨간 점), 회사 스위처("맑은소프트"), 사용자 chip.
- **app/pages/index.vue**(신규): 빈 콘텐츠 데모 — 페이지 제목 "맑은 메시징 BackOffice" + 가운데 placeholder 카드("페이지 콘텐츠가 들어갈 영역입니다").

## 4. 부팅 트러블슈팅

- `pnpm install` 완료(Nuxt 3.21.6, Nuxt UI 3.3.7).
- `pnpm dev --port 3001` 백그라운드 실행 → `/` 응답이 부트스트랩 전 정적 `public/index.html`(어두운 placeholder)을 반환.
- **원인**: Nitro가 `public/` 정적 파일을 Nuxt 라우트보다 우선 처리 → `public/index.html`이 `/`를 가로챔.
- **해결**: `public/index.html` 삭제 → Nuxt SSR이 `app/pages/index.vue`를 정상 렌더, LNB 메뉴 마커(대시보드·발송 관리·템플릿·리포트) 확인.

## 5. 첫 프로덕션 배포

- `pnpm build` → `dist/` 272 kB gzip (셸 단계라 작음).
- `npx wrangler@4 pages deploy dist --project-name=malgn-noti-admin --branch=main --commit-dirty=true --commit-message "Initial admin shell: Nuxt 3 + Nuxt UI v3 + LNB + TopBar"`.
- 프로덕션 검증 — `https://malgn-noti-admin.pages.dev/` HTTP 200, "대시보드·발송 관리·템플릿·맑은 메시징" 마커 확인. alias `https://471451c7.malgn-noti-admin.pages.dev`.
- 커밋: `6cbf238 Nuxt 3 + Nuxt UI v3 부트스트랩 + LNB·TopBar 셸 레이아웃` (12 files, +9064 −24 — 대부분 `pnpm-lock.yaml`).
- 푸시: `origin/main` (`d2a6bb6..6cbf238`, `malgnsoft/malgn-noti-admin`).

## 산출물

- 신규 파일(`malgn-noti-admin/`): `package.json` · `nuxt.config.ts` · `tsconfig.json` · `pnpm-lock.yaml` · `app/app.config.ts` · `app/app.vue` · `app/assets/css/main.css` · `app/layouts/default.vue` · `app/components/{AppLnb,AppTopbar}.vue` · `app/pages/index.vue` (10종 + lockfile).
- 삭제: `public/index.html` (부트스트랩 전 placeholder, Nuxt 라우트 가로채는 충돌 해소).
- 프로덕션 URL: `https://malgn-noti-admin.pages.dev` (첫 Nuxt 앱 배포 — 이전 #2 placeholder 정적 페이지 대체).

---

# 트랙 B — malgn-noti-api 백엔드 작업

§19에서 추적한 멱등 버그 정식 해결 + 실제 NHN 발송 경로(어댑터 + 큐 + worker) 구축 + 프로덕션 배포 #6. 본 트랙의 상세는 `history.20260526.md §22·§23` 에 기록 — 26일 파일에 §N으로 누적 중이던 흐름의 연속이라 자연 위치를 따랐고, 본 27일 파일에는 요약 + 참조만 둠.

## 6. 멱등 버그 해결 (`malgn-noti-api 020307f`, `history.20260526.md §22`)

§19에서 보고했던 `/send/sms` 멱등 버그(같은 `Idempotency-Key` 재호출 시 중복 적재·크레딧 중복 차감)를 정식 수정.

- **0001_idempotency.sql** — 비파티션 추적 테이블 `TB_IDEMPOTENCY` (PK `(company_id, scope, idempotency_key)`, `result_id NULL→채움`). Aurora 적용 후 테이블 50개 라이브.
- **race-free 패턴** — MySQL이 PK 인덱스로 atomic dedup. 진행 중 트랜잭션과는 row-lock 대기 후 duplicate key error.
- `/send/sms` 신규 흐름 — `INSERT TB_IDEMPOTENCY (resultType='pending')` 점유 → 검증·트랜잭션 → 마지막에 `UPDATE result_id`. 점유 후 실패 시 `rollbackIdempotency()` 로 키 해제(재시도 가능). 처리 중이지만 commit 전이면 `202 idempotent_in_flight`.
- **검증 3건**: call 1 (key=K) → ID=8, call 2 (key=K, 같음) → **ID=8 + idempotent:true**, call 3 (key=K2) → ID=9. 통과 확인.

## 7. NHN SMS 어댑터 + Cloudflare Queues + consumer worker (`malgn-noti-api 5e1ac72`, `history.20260526.md §23.1~23.2`)

발송 흐름의 비동기 처리 인프라 구축.

- **Cloudflare Queue 생성**: `malgn-noti-dispatch` (id `6c67d698...`). `wrangler.toml`에 producer + consumer 동시 바인딩, batch 10·timeout 5s·max_retries 3.
- **NHN SMS 어댑터** (`src/adapters/nhn/`)
  - `types.ts` — `NhnCredentials` · `NhnSmsSendRequest` · `NhnSmsSendResponse` · `NormalizedSendResult`.
  - `sms.ts` — `sendSms(creds, input, mockMode)`. mock 모드는 외부 호출 없이 시뮬레이션, real 모드는 `/sms/v3.0/appKeys/{appKey}/sender/(sms|mms)` POST + `X-Secret-Key`.
- **Consumer worker** (`src/workers/dispatch.ts`) — `processDispatchBatch(batch, env)` → `processOne()` 으로 메시지마다: dispatch_request 조회 → items + sender + nhn_credential 조회 → `dispatch_state→'sending'` → `sendSms()` → item별 `send_state`·`fail_code`·`nhn_request_id` 갱신 → `dispatch_state→'delivered'/'failed'` + `completed_at`. 일시 오류는 `msg.retry({ delaySeconds: 30 })`.
- **Producer 연동** — `/send/sms` 트랜잭션 commit 후 `c.executionCtx.waitUntil(env.DISPATCH_QUEUE.send({ dispatchRequestId }))` + `dispatch_state→'queued'`.
- **스키마 확장** — `nhnCredential` 테이블 Drizzle 추가 (DATA-MODEL §10.5 반영).
- **Workers entry 변경** — `src/index.ts` 의 default export를 `{ fetch: app.fetch, queue: processDispatchBatch }` 객체로 (fetch + queue handler 분리).
- **secret** — `NHN_MOCK=1` wrangler secret 등록(프로덕션도 모의 모드로 시작).
- **로컬 검증 한계** — wrangler 경고 `"Queues are not yet supported in wrangler dev remote mode"` → 로컬 dev에서 큐 처리 검증 불가.

## 8. malgn-noti-api 프로덕션 배포 #6 (`history.20260526.md §23.1~23.3`)

§6·§7 변경을 라이브 반영.

- **Version**: `b30dc2a3-dc5a-4050-a435-c3d03a5e69a7`. 번들 2460 KiB / gzip 572. Worker Startup 74 ms.
- 배포 명세에 **`Producer for malgn-noti-dispatch`** + **`Consumer for malgn-noti-dispatch`** 동시 등록 확인.
- 검증 5건 — `/health`, `/health/db`(mysql 8.0.42), `/doc`(paths 44·ops 78·schemas 53), `/send/sms` no-auth 401, `/auth/login` JWT 발급 정상.
- **큐 e2e 검증 보류** — Cloudflare 원격 미리보기 인프라 장애(1105 Temporarily unavailable, Ray ID `a02212096ea185af`·`a02213318ecb85af` 등 30분 지속) → 로컬 `pnpm dev --remote` 가 edge-preview 토큰을 받지 못해 prod Aurora 시드 SQL 송신 자체 실패. 코드·바인딩은 정상이며 Cloudflare 회복 후 외부에서 e2e 절차로 검증 가능.

## 산출물

### 트랙 A (admin)

- 신규 파일(`malgn-noti-admin/`): `package.json` · `nuxt.config.ts` · `tsconfig.json` · `pnpm-lock.yaml` · `app/app.config.ts` · `app/app.vue` · `app/assets/css/main.css` · `app/layouts/default.vue` · `app/components/{AppLnb,AppTopbar}.vue` · `app/pages/index.vue` (10종 + lockfile).
- 삭제: `public/index.html` (부트스트랩 전 placeholder, Nuxt 라우트 가로채는 충돌 해소).
- 프로덕션 URL: `https://malgn-noti-admin.pages.dev` (첫 Nuxt 앱 배포 — 이전 #2 placeholder 정적 페이지 대체).
- 커밋: `malgn-noti-admin: 6cbf238 Nuxt 3 + Nuxt UI v3 부트스트랩 + LNB·TopBar 셸 레이아웃` (12 files, +9064 −24 — 대부분 `pnpm-lock.yaml`).

### 트랙 B (api)

- `malgn-noti-api: 020307f fix(idempotency): TB_IDEMPOTENCY + INSERT-then-conflict 패턴 — 멱등 버그 해결` (4 files, +151 −74). `0001_idempotency.sql` 신규.
- `malgn-noti-api: 5e1ac72 feat(send): NHN SMS 어댑터 + Cloudflare Queues + consumer worker (mock 모드)` (8 files, +439 −5). `src/adapters/nhn/{types,sms}.ts`·`src/workers/dispatch.ts` 신규.
- Cloudflare Queue `malgn-noti-dispatch` (id `6c67d698...`) + Workers Version `b30dc2a3-dc5a-4050-a435-c3d03a5e69a7` (배포 #6).
- `history.20260526.md §22·§23` 에 트랙 B 상세 기록.

## 다음 단계 / 알려진 한계

### 트랙 A (admin)

- 셸만 구성 — 각 라우트(`/customer`, `/send`, `/template`, `/report`, `/billing`, `/ops` …)의 페이지/컴포넌트는 미구현. LNB 메뉴 항목은 시각 동작만(클릭 시 라우트 이동 없음, 액티브 키만 변경).
- `MemoPanel`(우측 360px sticky)·고객사 상세의 InfoCard·계정 테이블·BarChart·ActivityList·권한 변경 모달 — 핸드오프 정본에 있으나 셸 범위 밖.
- `doc/DESIGN-ADMIN.md`의 primary `#6366f1`(indigo)과 부트스트랩 정본 `blue(#3b82f6)` **불일치** — 핸드오프를 우선해 구현, DESIGN-ADMIN.md 정합화는 후속 작업.
- `malgn-noti-admin/CLAUDE.md`에 사용자단 §7.1 유사한 **배포·Git·작업 이력 운영 컨벤션** 미수록 — 후속 작성 필요(현재는 사용자단 컨벤션을 준용해 진행).
- 인증 미들웨어·RBAC·`Cmd+K` 명령 팔레트·다크 모드 — 모두 셸 이후 별도 작업.

### 트랙 B (api)

- 큐 e2e 검증 — Cloudflare 1105 회복 후 `pnpm dev` + 시드 + PROD URL 발송 → `dispatch_state` 천이 추적.
- 다른 채널 send (`/send/rcs` · `/send/kakao` · `/send/email` · `/send/push` · `/send/flow`) — 각 채널 어댑터 + 라우트.
- 웹훅 핸들러 (`POST /webhooks/nhn`) — `TB_DISPATCH_EVENT` 적재 + dispatch_item.recv_state 갱신.
- 실 NHN 자격증명 등록 + `NHN_MOCK` secret 삭제 → real 모드 전환.
- Export 잡 (`/export-jobs`) — 90일 초과 이력 우회.
- 트랜잭션 rollback 시 idempotency cleanup race 추가 보강.
