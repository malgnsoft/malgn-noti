# 2026-05-26 — malgn-noti-api 데이터 모델·초기 DDL·Hyperdrive 연결·첫 프로덕션 배포 + 운영 컨벤션 명문화 + malgn-noti 배포 #53 + Aurora DDL 적용

## 한 줄 요약

`malgn-noti-api`의 **데이터 모델링부터 첫 프로덕션 배포까지** 한 흐름으로 진행 — 사용자단 화면·소스·MD를 읽고 49개 테이블 데이터 모델 작성(**TB_** 접두어, `company_id` FK, `status INT` 1/0/-1 + `*_state VARCHAR` 분리, `*_yn CHAR(1)` Y/N, `loginid`/`email` 분리), 시각 ERD를 Mermaid 9종으로 작성, 발송량 시나리오 분석 후 **월 RANGE 파티셔닝 + Hot/Warm/Cold + R2 오프로드** 확장성 전략을 정본 §13 + 별도 `SCALABILITY.md`로 정리, 49 테이블 초기 마이그레이션 SQL(파티션 5종 + `raw_payload_r2_key` 포함)을 작성, **Hyperdrive(MySQL) 바인딩 `a2ba4efe7421464da1d5ff5e620b33a3`** 연결 + `drizzle-orm/mysql2` 셋업 + `/health/db` 헬스 체크 + `wrangler dev --remote` 로 로컬에서도 실제 Aurora MySQL 8.0.42 응답 확인, **`https://malgn-noti-api.malgnsoft.workers.dev` 프로덕션 첫 배포** 완료 (모든 엔드포인트 200, `/health/db` mysql_version 8.0.42). 이어 `malgn-noti-api/CLAUDE.md §8.1`에 **배포·Git·작업 이력 운영 컨벤션을 명문화**하여, 프론트와 동일한 디스플린(typecheck → 배포 → 검증 → 커밋·푸시·history)을 백엔드에서도 강제하도록 정리. 작업 이력은 `malgn-noti/doc/history/`가 3 레포 공통 정본임을 §8.1에 못박음.

## 1. 데이터 모델 (`malgn-noti-api/doc/DATA-MODEL.md`)

- 입력: `malgn-noti`의 화면 73개·`app/types/*`·목업 데이터, `malgn-noti-api/CLAUDE.md §5 1차 모델`, `doc/DESIGN.md §14`.
- **49개 테이블** / 9개 도메인. Aurora MySQL 8.0 / Drizzle 대상.
- 공통 규칙:
  - **`TB_` 접두어 + 대문자 스네이크** (`TB_DISPATCH_REQUEST`).
  - 컬럼 `snake_case`, 고객사 FK는 `company_id`. 멀티 테넌트 격리(`§1.2`).
  - 시간 `DATETIME` UTC. PK `BIGINT UNSIGNED AUTO_INCREMENT`.
  - 불리언 `CHAR(1)` `'Y'`/`'N'`, 컬럼명 `*_yn` (`§1.11`).
  - **`status INT NOT NULL DEFAULT 1`** — `1`=정상/`0`=중지/`-1`=삭제 (`§1.12`).
  - 다단계 업무 상태는 **`*_state VARCHAR(20)`** 으로 분리 — `dispatch_state`/`review_state`/`approval_state`/`pay_state`/`answer_state` 등 16개.
  - `enum` 회피 → `VARCHAR` + Zod 검증.
  - JSON 컬럼(`spec`, `message_spec`, `nodes`)으로 채널 형상 다양성 흡수.
- **TB_USER** — `loginid` (로그인 ID, `UNIQUE(company_id, loginid)`) + `email` (알림·영수증 수신) 분리.
- 도메인별 §3~§10 — 계정/인증, 크레딧/결제, 발신정보, 주소록, 템플릿, 발송·Flow·캠페인, 이력/Export, 문의/시스템.

## 2. ERD (`malgn-noti-api/doc/ERD.md`)

- Mermaid `erDiagram` **9종** — 전체 관계 개관 1 + 도메인 8 (§2~§9).
- 모든 컬럼에 코멘트 4번째 항목 추가 — 박스 내부에 `bigint id PK "고객사 식별자"` 형태로 렌더링.
- 카디널리티 `||--o{`(1:N)·`||--||`(1:1)·`||--o|`(1:0/1)·M:N(junction)·자기참조(트리·중첩답글)·복합 PK 모두 표현.

## 3. 확장성·파티셔닝 전략 (`malgn-noti-api/doc/SCALABILITY.md`)

볼륨 가정(1년차 100만~1천만/월 → 5년차 1억+/월)에서 13억 행 Aurora 누적 시나리오를 분석하고, **DDL 첫 작성 시점부터** 적용해야 사후 마이그레이션 비용을 회피할 수 있는 결정 사항을 §1~§7로 정리.

- **§1 월 RANGE 파티셔닝** — `TB_DISPATCH_REQUEST/ITEM/EVENT` + `TB_CREDIT_LEDGER` + `TB_AUDIT_LOG` 5개. PK 복합 `(id, created_at)` (또는 `received_at`) — MySQL 8 파티셔닝 제약. `DROP PARTITION`으로 회수, `DELETE` 금지.
- **§2 Hot/Warm/Cold** — Hot(Aurora 90일) → Warm(Aurora 콜드 13개월) → **Cold(R2 Parquet)**. `DROP PARTITION` 직전 Parquet 덤프 Worker Cron.
- **§3 `raw_payload` R2 오프로드** — 1 KB 미만은 인라인, 초과분은 `raw_payload_r2_key`로 분리. 평균 DB 부담 1/10 수준.
- **§4 사전 집계** — 기존 `TB_DISPATCH_STAT_DAILY` 옆에 **`TB_DISPATCH_STAT_HOURLY`** 추가 (5분 주기). 시간 범위별 출처 계층화.
- **§5 인덱스·쿼리 가드** — OFFSET 금지·커서 페이징·30일 기본 윈도우·JSON generated column.
- **§6 Aurora 토폴로지** — Writer/Reader 분리, Hyperdrive 바인딩 2개(`_W`/`_R`), Limitless 전환 기준.
- **§7 운영 트리거** — `DISPATCH_ITEM > 5억 행 → ClickHouse PoC`, `Writer CPU 60%+ → Reader 추가` 등 임계 룰북.

## 4. 초기 DDL (`malgn-noti-api/src/db/migrations/0000_initial.sql`)

- **49개 테이블** — MySQL 8.0 / Aurora MySQL 3 호환, `utf8mb4_0900_ai_ci`, `ENGINE=InnoDB`, 모든 컬럼·테이블에 `COMMENT`.
- **파티션 적용** — 5개 테이블, 2026-05~2027-06 (14개월) + `pmax`. 매월 25일 `REORGANIZE`, 매월 1일 `DROP PARTITION`(외부 Cron Worker).
- **§13.3 R2 오프로드 컬럼** — `TB_DISPATCH_EVENT.raw_payload_r2_key VARCHAR(255) NULL` 1차 스키마에 포함.
- 파티션 테이블은 MySQL 제약상 FK 미사용 → application-level 정합성, 주석 명시.
- `drizzle.config.ts` 신설 — `db:introspect`/`db:generate`/`db:migrate` 스크립트.

## 5. Hyperdrive 연결 (`malgn-noti-api/wrangler.toml` + 신규 코드)

- 사용자 제공 Hyperdrive ID: **`a2ba4efe7421464da1d5ff5e620b33a3`**.
- `wrangler.toml`:
  ```toml
  [[hyperdrive]]
  binding = "HYPERDRIVE"
  id = "a2ba4efe7421464da1d5ff5e620b33a3"
  ```
- **`src/db/client.ts`** — `drizzle-orm/mysql2` + `mysql2/promise.createConnection`. `getDb(env, ctx)` 요청 스코프 핸들(`ctx.waitUntil(conn.end())`), `pingDb(env)` 헬스. mysql2 mixin 타입 이슈는 `db.execute(sql\`...\`)`로 우회.
- **`src/index.ts`** — `GET /health/db` 추가, `Bindings.HYPERDRIVE: Hyperdrive` 타입 결합 (cf-typegen).
- **의존성**: `drizzle-orm@0.36.4`, `mysql2@3.22.3`, `drizzle-kit@0.28.1`. wrangler `4.90 → 4.94` 업그레이드.

## 6. 로컬 개발 = 실제 Hyperdrive

- 로컬 `wrangler dev` 기본 모드는 Hyperdrive를 로컬 Postgres로 에뮬레이트하려 하므로 실패 → `wrangler dev --remote` 필요.
- Hyperdrive는 4.94 시점에도 per-binding `remote = true` 미지원 (`wrangler.toml`에 메모만 남김) → `package.json` `dev` 스크립트를 **`wrangler dev --remote`** 로 변경.
- `pnpm dev` 단독으로 `http://localhost:8787` 기동, 모든 요청이 실제 Cloudflare edge 경유 Hyperdrive → Aurora.

## 7. 프로덕션 배포

- `pnpm typecheck` 통과 → `pnpm run deploy` (`wrangler deploy`).
- 산출: **`https://malgn-noti-api.malgnsoft.workers.dev`**, Version `8b0d8674-57d0-4b00-966e-bdafc4de7a83`.
- 검증:
  ```
  GET /             → 200 {"name":"malgn-noti-api","status":"placeholder","env":"production"}
  GET /health       → 200 {"ok":true,"env":"production"}
  GET /health/db    → 200 {"ok":true,"mysql_version":"8.0.42"}   ← Aurora 응답
  ```
- 의미 — `malgn-noti-api`의 **첫 프로덕션 배포**이자, Cloudflare Workers ↔ Hyperdrive ↔ AWS Aurora MySQL 경로가 살아 있음을 확인한 마일스톤.

## 8. 산출물

### 신규 파일 (`malgn-noti-api/`)
- `doc/DATA-MODEL.md` (49 테이블 정본)
- `doc/ERD.md` (Mermaid 9 다이어그램)
- `doc/SCALABILITY.md` (§13 상세 가이드)
- `src/db/migrations/0000_initial.sql` (1049라인)
- `src/db/client.ts`
- `drizzle.config.ts`
- `worker-configuration.d.ts` (cf-typegen 산출)

### 수정 파일
- `wrangler.toml` — Hyperdrive 바인딩 추가
- `src/index.ts` — `/health/db` 라우트 + 타입 확장
- `package.json` — drizzle 의존성 + `dev: wrangler dev --remote` + db 스크립트
- `pnpm-lock.yaml`

### 커밋 (malgn-noti-api)
- `eecf226` — doc: 데이터 모델 / ERD / 확장성 전략 정리
- `0653472` — db: 초기 마이그레이션 0000_initial.sql + drizzle-kit 설정
- `7a17504` — Hyperdrive(MySQL) 연결 + /health/db + Drizzle 런타임 셋업

푸시: `decfaf0..7a17504 → origin/main`.

## 10. 운영 컨벤션 명문화 (`malgn-noti-api/CLAUDE.md §8.1`)

배포 직후 사용자가 "배포 규정은 `malgn-noti/CLAUDE.md` 파일을 참고해 줘"라고 명확히 짚어 — 이번 흐름이 우연이 아니라 **명문 규정**으로 박혀야 다음에도 재현됨을 확인. `malgn-noti-api/CLAUDE.md`에 §8.1을 추가하여 다음을 정리:

- **Git** — 단일 main, 사용자 명시 요청 시에만 커밋·푸시, 한국어 제목 + 본문 불릿 + `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer, 무관 untracked 파일 끌어들이지 않음.
- **배포 (Workers)** — `pnpm typecheck → pnpm run deploy` (`pnpm deploy`는 pnpm 워크스페이스 명령과 충돌하므로 `run` 명시), 프로덕션 URL `https://malgn-noti-api.malgnsoft.workers.dev`, 검증은 `/health` + `/health/db`(mysql_version 반환), DDL/시드는 Worker 배포와 분리 멱등 적용.
- **작업 이력** — `malgn-noti/doc/history/`가 **3 레포 공통 정본**임을 명문화. API 변경도 같은 폴더의 그날 파일에 기록하며, 산출물 절에 별 레포 커밋 해시까지 함께 표기.
- §8 개발 명령어 표 갱신 — `pnpm dev`가 `wrangler dev --remote`임을 반영, `cf-typegen`·`db:introspect` 추가, `pnpm run deploy` 명시.

산출물: `malgn-noti-api: e09f70e docs: 배포·Git·작업 이력 운영 컨벤션 명문화 (§8.1)`. 푸시 `7a17504..e09f70e → origin/main`.

## 11. malgn-noti 프론트 배포 #53 — 새로고침 버튼 일괄 제거

§7.1 흐름대로 `pnpm build → npx wrangler@4 pages deploy dist --project-name=malgn-noti --branch=main --commit-dirty=true --commit-message "Remove refresh buttons from list toolbars + update guide and DESIGN"` 실행. **Working tree에 누적된 사용자 작업분**(13개 파일)을 그대로 라이브로 올리고, 직후 `52f653b` 커밋으로 main을 라이브와 동기화.

- 변경 패턴: 발송 조회·관리·연락처·발신정보·랜딩 등 **목록 페이지의 `list-toolbar` 새로고침 버튼**과 보조 CSS(`toolbar-sep`, `toolbar-refresh`)를 일괄 제거. 페이지당 평균 −27~28라인.
- 동시 변경: `app/pages/guide.vue` +162라인(가이드 확장), `doc/DESIGN.md` 86라인 갱신.
- 빌드: Nitro `cloudflare-pages` 프리셋 → `dist/`, 총 2.96 MB / gzip 889 KB.
- 배포 URL: 프로덕션 https://malgn-noti.pages.dev, alias https://127705c3.malgn-noti.pages.dev.
- 검증: `/`, `/sender/numbers`, `/history/sms` 모두 HTTP 200. 새로고침 버튼 제거 마커 확인 — `curl -s /sender/numbers | grep -c toolbar-refresh` → `0` (제거 확정).
- 산출물: `malgn-noti: 52f653b list 툴바 새로고침 버튼 일괄 제거 + guide / DESIGN 갱신` (13 files, +226 −297). 푸시 `252033d..52f653b → origin/main`.

## 12. Aurora MySQL에 0000_initial.sql 적용 — 49 테이블 + 75 파티션 라이브

Aurora가 SG로 Hyperdrive egress IP만 허용해 로컬 mysql CLI는 차단됨 → **Worker 경유 마이그레이션** 인프라를 구축하고 첫 DDL을 적용.

### 12.1 `/admin/*` 라우트 (`malgn-noti-api/src/routes/admin.ts`)

- **게이트**: 모든 `/admin/*`는 `X-Migrate-Token` 헤더 = `env.MIGRATE_TOKEN` 일치 필수. 미설정 시 라우트 전체 403. 로컬은 `.dev.vars`(gitignored, `openssl rand -hex 16`로 생성), 프로덕션은 `wrangler secret put MIGRATE_TOKEN`.
- `GET /admin/tables` — `information_schema.TABLES`에서 `TB_*` 목록 조회.
- `GET /admin/partitions` — `information_schema.PARTITIONS`에서 파티션 명세 조회.
- `POST /admin/migrate` — body로 SQL 텍스트를 받아 **statement 단위로 순차 실행**:
  - `--` 주석 제거 + `;` 줄바꿈 기준 split.
  - 이미 `TB_*` 테이블이 존재하면 409 거부(실수 방지).
  - 첫 에러에서 중단(DDL 부분 적용 위험).
  - 응답: `{ ok, statements_total, statements_succeeded, duration_ms, errors[] }`.

### 12.2 적용 절차

`pnpm dev`(`wrangler dev --remote`)로 로컬 Worker가 실제 Hyperdrive → Aurora에 접근. curl로 SQL을 본문 전달:

```bash
TOKEN=$(cat .dev.vars | cut -d= -f2)
curl -X POST http://localhost:8787/admin/migrate \
  -H "X-Migrate-Token: $TOKEN" \
  -H "Content-Type: application/sql" \
  --data-binary @src/db/migrations/0000_initial.sql
```

응답:
```json
{ "ok": true, "statements_total": 52, "statements_succeeded": 52, "duration_ms": 6684, "errors": [] }
```

### 12.3 검증

- `GET /admin/tables` → **49개 `TB_*` 테이블** 전부 생성 확인.
- `GET /admin/partitions` → **75개 파티션** (`TB_DISPATCH_REQUEST`·`TB_DISPATCH_ITEM`·`TB_DISPATCH_EVENT`·`TB_CREDIT_LEDGER`·`TB_AUDIT_LOG` × 각 15 파티션 = `p202605..p202706` + `pmax`).
- 적용 시간 6.7초.

### 12.4 산출물

- `malgn-noti-api: a390f32 admin: /admin/migrate · /admin/tables · /admin/partitions 라우트 추가` (2 files, +163).
- `.dev.vars`는 gitignored — `MIGRATE_TOKEN`만 로컬 보관. 프로덕션 배포 시에는 별도로 `wrangler secret put` 필요(현 시점 미배포 — 라이브 Worker에는 admin 라우트 없음).
- 푸시 `e09f70e..a390f32 → origin/main`.

### 12.5 결정 — admin 라우트는 **로컬 전용** (선택 A 유지)

향후 0001+ 마이그레이션도 동일 방식(`pnpm dev --remote` + curl localhost)으로 적용. 프로덕션에는 배포하지 않음. 이유: 라우트가 공개 URL에 노출되면 토큰 유출 = DB 전체 권한 탈취 위험. 마이그레이션 빈도가 낮아 로컬 적용 부담이 작음. 잦아지면 그때 별도 admin-worker 분리 또는 GitHub Actions OIDC 등 더 안전한 방식으로 전환.

### 12.6 환경 가드 추가 — 실수로도 프로덕션에 안 뚫리도록 (`63ba424`)

토큰 게이트만으로도 보호되지만, 누군가 `wrangler secret put MIGRATE_TOKEN`을 실수로 프로덕션에 등록하면 라우트가 살아남. 이걸 막는 **이중 안전망**:

```ts
admin.use('*', async (c, next) => {
  if (c.env.APP_ENV !== 'local') {
    return c.json({ code: 'not_found', message: 'Route not found' }, 404)
  }
  // ... 토큰 검사 ...
})
```

- 로컬 `.dev.vars`에 `APP_ENV=local` 추가하여 오버라이드 (gitignored).
- 프로덕션 `wrangler.toml [vars] APP_ENV="production"` 유지 → 라우트가 무조건 404.
- 외부에서 보면 "라우트가 존재하지 않는 것"처럼 위장 (`{"code":"not_found"}`).
- 검증:
  - `localhost:8787/admin/tables` + 토큰 → **200**, 49 tables.
  - `localhost:8787/admin/tables` 토큰 누락 → **403**.
  - `malgn-noti-api.malgnsoft.workers.dev/admin/tables` + 유효 토큰 → **404**.

### 12.7-pdf ERD를 인쇄용 PDF로 (`malgn-noti-api/doc/ERD.pdf`, `470b55a`)

DDL과 동기화된 시각 ERD를 외부 공유·인쇄용 PDF로 생성:

- `@mermaid-js/mermaid-cli` (mmdc)가 ERD.md의 9개 mermaid 코드블록을 페이지별 PDF로 렌더 (Chromium 1회 다운로드).
- `python3 -m pip install --user pypdf` 후 `PdfWriter.append`로 9 페이지를 1 파일(925 KB)로 병합.
- 각 페이지에서 한국어 텍스트 추출 검증 (테이블·컬럼·관계 라벨 모두 정상).
- `ERD.md §10`에 재생성 절차 명문화 — 다음 누군가 갱신할 때 막힘 없음.

### 12.7 마이그레이션 절차 정본 — `malgn-noti-api/doc/MIGRATION.md` (`47afe1a`)

위 12.1~12.6의 결정·절차를 운영 문서 1개로 정리해서 정본화. 9개 섹션 — 왜 이런 절차인가(Aurora SG 제약), 사전 준비, SQL 작성 규칙, 적용 절차 step-by-step, 실패 처리 3안, FAQ 8건, 적용 이력 책임(git + history/), 파티션 운영 분리, 관련 문서. `CLAUDE.md §8`에 링크 추가, `pnpm db:migrate`는 직접 연결 불가라 비현실적임을 표기.

### 12.8 다음 단계 (마이그레이션 운영)

- 파티션 자동 운영 Cron Worker(`src/workers/partition-maintenance.ts`) — 매월 25일 다음 달 파티션 `REORGANIZE`, 매월 1일 13개월 전 파티션 R2 덤프 + `DROP PARTITION` (SCALABILITY §1·§2).
- 시드 데이터 `0001_seed.sql` (system terms, 샘플 템플릿 카탈로그).
- `pnpm db:introspect`로 `src/db/schema.ts` 자동 생성.

## 13. 다음 단계 / 알려진 한계

- **DDL 적용** — Hyperdrive 콘솔은 자격증명만 보유. Aurora 측에 `0000_initial.sql`을 적용해야 실제 테이블 생성. MySQL CLI 또는 Bastion 경유.
- **파티션 자동 운영 Cron Worker** — `src/workers/partition-maintenance.ts` (월 1일 DROP + 25일 REORGANIZE).
- **시드 데이터** — `0001_seed.sql` (system terms, 샘플 템플릿 카탈로그).
- **Drizzle 스키마 자동 생성** — DDL 적용 후 `pnpm db:introspect`로 `src/db/schema.ts` 생성, 카멜케이스 객체명 정리.
- **Reader 분리** — 트래픽 증가 시 별도 Reader Hyperdrive 추가, `HYPERDRIVE_R` 바인딩 (SCALABILITY §6).
- **`before`/`after`** — `TB_AUDIT_LOG`는 DDL에서 MySQL 예약어 충돌 회피 차 `before_json`/`after_json`으로 명명. DATA-MODEL.md 본문 표기와 다음 동기화 시 일치 필요.
- **로컬 MySQL 옵션** — 오프라인 개발이 필요해지면 `localConnectionString = "mysql://..."` 추가하고 `dev`에서 `--remote` 제거.
