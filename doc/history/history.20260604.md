# 2026-06-04 — Hyperdrive Cloudflare Tunnel 전환 + 관리자단 핸드오프 17 페이지 풀세트 + NICE IPv6 진단 + WBS R2 편집

## 한 줄 요약

오늘 5건 처리. **(§1)** NICE 자격증명 재확인 + 옵션 B(Cloudflare 대역 등록) 시도 → 여전히 1007. 진단용 `/diag/egress`로 Workers의 outbound가 **IPv6**(`2a06:98c0:3600::103`, Cloudflare `2a06:98c0::/29`)임을 확인. NICE 콘솔에 IPv4 대역만 등록된 게 원인 — IPv6 대역(7개) 추가 등록 안내 + mock 복귀. **(§2)** Hyperdrive 바인딩 교체 — `a2ba4efe...` → `439b109d...`. 신규 Hyperdrive는 **Cloudflare Tunnel(Access)** 기반(host `malgn-dev-db.apiserver.kr` + `access_client_id`). Aurora SG egress IP 화이트리스트 운영 부담 해소 — CLAUDE.md §12 TODO "SG 갱신 운영 절차" 항목 달성. 관련 정본 3개(API CLAUDE.md §3·§12·§8, SCALABILITY.md §6 신규 절, MIGRATION.md §1) 동기화. **(§3)** **관리자단 핸드오프 풀세트** — `handoff_noti_admin` (3,129줄 jsx)을 Vue 3 + Nuxt UI v3로 1:1 포팅. 셸(LNB 메뉴 트리 완전 재정비 + Topbar 동적 브레드크럼) · 공유 컴포넌트 14종(PageHeader/SectionCard/Tabs/Segmented/FilterBar/DateRange/DataTable generic+slot/Pagination/StatusBadge 자동 매핑/ChannelChip/StatCard/Drawer/Modal/Field/EmptyState) · 차트 4종(Bar/Area SVG path+gradient/Donut stroke-dasharray/Progress) · **17 페이지**(대시보드·고객사·고객사 상세·계정·모니터링·발신번호·발신프로필·템플릿검수·결제·채널단가·충전쿠폰·1:1문의·FAQ·공지·통계·운영자·권한그룹·API). app.config.ts `info: 'indigo'` 매핑으로 핸드오프 indigo 강조색을 Nuxt UI semantic으로. 18 라우트 라이브 200. **(§4)** 사용자 보고 후속 — admin의 폰트 사이즈가 핸드오프와 다르다는 신고에서 **두 원인 동시 발견**: (a) `main.css` `html,body{font-size:13px}`가 모든 Tailwind 토큰을 18% 축소시킴(핸드오프는 base font-size 명시 없음 = 16px), (b) 직전 turn의 cwd가 사용자단이라 **사용자단 dist를 admin 프로젝트로 배포**한 상태였음(chunk 600개 / GNB·메모·계약 컴포넌트 등 사용자단 자산이 admin URL에 노출). 둘 다 정정: 13px 제거 + `letter-spacing: -0.01em` 추가, admin 디렉토리에서 clean rebuild + 재배포. Pages alias `8852d5da.malgn-noti-admin.pages.dev` (chunk 96개로 정상화). **(§5)** WBS 페이지 편집 기능 — DB 미사용 / R2 단일 JSON 객체 정본(`wbs/wbs.json`). API에 GET 공개 + PATCH 인증 2 라우트 + 142 task 시드. 사용자단은 임베디드 STAGES 제거 → API 비동기 로드 + 인라인 편집 모달(5 필드, 빈값=`null`=필드 제거). Workers Version `28f3e6a8...`, Pages alias `02bb58e6`.

---

# §1. NICE IPv6 진단 — 옵션 B 시도 → IPv4만 등록되어 여전히 1007

## 한 줄

6/2 §16의 1007 차단 후속. 사용자가 옵션 B(NICE 콘솔에 Cloudflare egress IP 대역 등록)를 진행했다고 알림 → 재시도 했지만 여전히 `1007 허용되지 않은 IP 접근`. 진단을 위해 임시 endpoint `GET /diag/egress`를 추가해 외부 echo(`api.ipify.org`)로 실제 출발지 IP를 8회 캡처 → **모두 IPv6 `2a06:98c0:3600::103`** (Cloudflare 공식 IPv6 `2a06:98c0::/29` 소속). NICE에 등록된 대역은 IPv4뿐이라 IPv6 출발지가 거부됨. 즉시 mock 복원 + 진단 endpoint 제거(/diag/egress → 404) + Workers 재배포. 사용자에게 NICE 콘솔에 **Cloudflare IPv6 대역 7개**(`2400:cb00::/32` · `2606:4700::/32` · `2803:f800::/32` · `2405:b500::/32` · `2405:8100::/32` · `2a06:98c0::/29` · `2c0f:f248::/32`) 추가 등록 또는 IP 검사 OFF(옵션 A) 안내 후 사용자가 IP 보류 결정. 자격증명 3개(CLIENT_ID/SECRET/RETURN_URL) 보관 유지 — 정책 해결 시 `wrangler secret delete NICE_MOCK` 한 번이면 real 전환.

## 1.1 자격증명 재확인

Cloudflare는 secret 값을 `secret list`로 노출하지 않음. 가장 확실한 방법은 사용자가 준 값으로 **덮어쓰기** — 일치하면 그대로, 다르면 정확한 값으로 교정. `wrangler secret put NICE_CLIENT_ID/SECRET`로 사용자 제공값 100% 일치 보장 처리.

## 1.2 1007 재현 → 진단 endpoint

```ts
app.get('/diag/egress', async (c) => {
  const samples: string[] = []
  for (let i = 0; i < 8; i++) {
    const r = await fetch('https://api.ipify.org?format=json', { cf: { cacheTtl: 0 } })
    const j = await r.json()
    samples.push(j.ip)
  }
  return c.json({ samples, unique: [...new Set(samples)] })
})
```

연속 2회 호출 결과 — 16번 모두 동일 IP: `2a06:98c0:3600::103`. Cloudflare 공식 IPv6 대역 `2a06:98c0::/29` 소속.

## 1.3 결정 — IPv6 대역 추가 등록 또는 IP 검사 OFF

| 옵션 | 작업 |
| --- | --- |
| A. NICE 콘솔에서 IP 인증 OFF | 콘솔 → 보안설정 토글 |
| B'. IPv6 대역 7개 추가 등록 (오늘 사용자가 했던 B는 IPv4만 등록되어 실패) | Cloudflare 공식 IPv6 목록 NICE 영업에 송부 |
| C. 고정 IP 프록시 EC2 | AWS EC2 nano + 어댑터 baseUrl 변경 |

사용자 의사로 일단 **보류** 결정. `NICE_MOCK=1` 복원해 가입 흐름은 mock 정상. 진단 endpoint는 보안상 즉시 제거 + 재배포로 라이브에서 404.

## 1.4 산출물

- 코드: 없음(진단 endpoint는 일시 추가 후 제거)
- secret: `NICE_CLIENT_ID/SECRET` 덮어쓰기(값 변경 없음, 일치 보장만), `NICE_MOCK=1` 유지
- Workers 배포 — 진단 endpoint 추가 시 Version `e77f89e0-8fed-4b27-a56a-a212d916cba3`, 제거 후 Version `0e3d3eb0-38ca-487f-8a28-355b0243a5a6`

## 1.5 보안 메모

`CLIENT_SECRET`이 6/2 채팅 평문 노출 + 오늘 한 번 더 노출. IP 정책 해결 시점에 NICE 콘솔에서 회전 권장. `doc/MEMBERSHIP.md` §9 후속 작업 21번에 이미 등록됨.

---

# §2. Hyperdrive 교체 — Cloudflare Tunnel(Access) 기반 (Workers Version a457b7dc)

## 한 줄

`wrangler.toml`의 HYPERDRIVE id를 `a2ba4efe7421464da1d5ff5e620b33a3` → `439b109dd219479e8b3e8d80eea9a240`으로 교체. 신규 Hyperdrive origin host가 `malgn-dev-db.apiserver.kr` (Cloudflare Tunnel 엔드포인트) + `access_client_id: 50b64dc493c35f1a9d9916baf4e2d735.access` (Cloudflare Access 서비스 토큰)이라, 기존 "퍼블릭 엔드포인트 + SG inbound에 Hyperdrive egress IP 화이트리스트" 구성이 "Cloudflare Tunnel 기반"으로 전환됨. 코드 변경 0 — Hyperdrive 바인딩 인터페이스 동일, mysql2 드라이버 그대로 동작. 라이브 검증 통과(`GET /health/db` mysql_version 8.0.42 + `POST /auth/nice/init` DB 쓰기 정상). 관련 정본 3개 문서 동기화.

## 2.1 전환 효과

| 항목 | 이전 (~6/1) | 신규 (6/4~) |
| --- | --- | --- |
| Aurora 노출 | 퍼블릭 엔드포인트 + SG 화이트리스트 | Cloudflare Tunnel 뒤 |
| 출발지 인증 | Hyperdrive egress IP가 SG에 등록되어야 통과 | Tunnel access_client_id로 인증 (출발지 IP 무관) |
| egress IP 갱신 추적 | Cloudflare 공식 IP 목록 변경 시 SG 동기화 필요 | 불필요 |
| 로컬 `drizzle-kit migrate` 직결 | SG 제약으로 불가 (admin 라우트로 우회) | Tunnel 인증 없으면 통과 불가 (동일 운영 절차 유지) |

CLAUDE.md §12 TODO 중 "**SG 갱신 운영 절차**: Hyperdrive egress IP 목록이 바뀔 때 어떻게 감지/반영할지" 항목 자연 달성 — 더 이상 필요 없음.

## 2.2 라이브 검증

- `GET /health/db` → `{ok: true, mysql_version: "8.0.42"}` ✅
- `POST /auth/nice/init` (DB 쓰기) → mockMode true + niceAuth row insert ✅
- `GET /contracts` (인증 라우트) → 401 ✅

## 2.3 정본 문서 동기화

| 파일 | 변경 |
| --- | --- |
| `malgn-noti-api/CLAUDE.md` §3 | Aurora 노출 방식을 Tunnel로 명시. 이전 SG 화이트리스트 절차 삭제. egress IP 동기화 부담 제거 |
| `malgn-noti-api/CLAUDE.md` §12 TODO | "SG 갱신 운영 절차" 항목 ✅ 완료 표시 |
| `malgn-noti-api/CLAUDE.md` §8 | `pnpm db:migrate` 안내 문구 "Aurora SG 제약" → "Tunnel 뒤"로 |
| `malgn-noti-api/doc/SCALABILITY.md` §6 | **신규 절** "Hyperdrive ↔ Aurora 연결 방식 — Cloudflare Tunnel(Access) 기반 (2026-06-02 이후)" 추가. 전/후 구성 표 + 전환 이유 + 운영 영향 + 라이브 검증 + 신규 Hyperdrive id 명시 |
| `malgn-noti-api/doc/MIGRATION.md` §1 | 통로 다이어그램에 Tunnel 단계 추가, 신규 Hyperdrive id 반영 |

## 2.4 산출물

- API: `malgn-noti-api` — 2 커밋
  - `3d779ad` chore(wrangler): Hyperdrive id 교체. Workers 배포 Version `a457b7dc-e951-4f2a-bc78-29b5496fa90f`
  - `334ee69` doc(infra): Aurora 연결 방식 Cloudflare Tunnel 전환 반영 (코드 변경 없음 — 정본만)

## 2.5 알려진 한계 / 후속

- **Aurora SG inbound 단순화** — Tunnel 전환으로 더 이상 Cloudflare egress IP 추적 불필요하므로 SG inbound는 Tunnel daemon 호스트만 허용하도록 단순화 가능. AWS 측 정리 후속.
- **Aurora `PubliclyAccessible=false` 전환 검토** — Tunnel만 노출이 되면 퍼블릭 IP 제거 가능. 운영 정책 합의 후 적용.
- **Tunnel 가용성 모니터링** — Tunnel daemon이 죽으면 전 Workers DB 호출이 실패. 인지·복구 절차(Cloudflare 대시보드 알람 + 백업 경로) 정의 후속.

---

# §3. 관리자단 핸드오프 — 17 페이지 풀세트 + 셸 + 공유 컴포넌트 + 차트 구현 (Pages alias 8852d5da)

## 한 줄

신규 핸드오프 정본 `handoff_noti_admin`(prototype 3,129줄 jsx + 스타일 가이드 + 8 스크린샷)을 받아 사용자 요청으로 17 페이지 풀세트 신규 작성. 기존 admin은 셸(`AppLnb`/`AppTopbar`)만 있는 부트스트랩 상태였고 LNB 메뉴 트리도 핸드오프와 완전히 달라서 (a) 셸 완전 재정비 + (b) 공유 컴포넌트 14종 + (c) 차트 4종 + (d) 17 페이지를 모두 신규로 작성. Vue 3 + Nuxt UI v3로 jsx → Vue 1:1 포팅 패턴. 라이브 18 라우트(17 + 동적 `/customers/:id`) 모두 200 검증.

## 3.1 핸드오프 정본 IA

10 섹션 / 17 라우트 — `handoff_noti_admin/prototype/lnb.jsx`:

| # | 라우트 키 | 경로 | 화면 |
| --- | --- | --- | --- |
| 01 | `dashboard` | `/` | KPI4 + 발송추이(area) + 채널비중(donut) + 검수큐 + 실시간 발송 |
| 02 | `customer` | `/customers` | 필터바 + 선택 + 페이지네이션 |
| 02d | `customer/:id` | `/customers/[id]` | InfoCard(KPI5) + 탭6 + 계정 테이블 + 메모 타임라인 + 차트 + 권한변경 모달 |
| 03 | `account` | `/accounts` | 계정 목록 |
| 04 | `monitoring` | `/monitoring` | LIVE KPI4 + 처리량 라인 + 작업 큐(진행바·상태배지) |
| 05 | `sender-num` | `/senders/numbers` | 검수 목록 → 검수 Drawer(증빙·메모·승인/반려) |
| 06 | `sender-profile` | `/senders/profiles` | 동일 패턴 |
| 07 | `template` | `/templates` | KPI4 + 미리보기 Drawer + 자동검수 결과 |
| 08 | `billing` | `/billing` | KPI4 + 충전/차감/환불 내역 |
| 09 | `price-channel` | `/pricing/channels` | 채널별 단가표 |
| 10 | `price-charge` | `/pricing/coupons` | Tier 보너스 + 쿠폰/프로모션 |
| 11 | `inquiry` | `/support/inquiries` | 답변 Drawer |
| 12 | `faq` | `/support/faq` | 카테고리 사이드 + FAQ 목록 |
| 13 | `notice` | `/support/notices` | 공지 목록(고정·분류·공개) |
| 14 | `report` | `/reports` | KPI4 + 월별 추이 + 실패사유 donut + 채널 bar + Top 고객사 |
| 15 | `sys-operator` | `/system/operators` | 목록 + 운영자 추가 모달 |
| 16 | `sys-role` | `/system/roles` | 권한 그룹 카드 + 권한 매트릭스 |
| 17 | `sys-api` | `/system/api` | KPI4 + API 키 + 웹훅 |

## 3.2 셸 재정비

- **`AppLnb` 완전 재작성** — 기존 메뉴 트리(8 그룹/예약발송/FCM/APNs 등)를 폐기하고 핸드오프 정본 9 그룹 / 17 라우트로 교체. `NuxtLink` 기반 라우트 경로 매핑 + `isActive()` (path prefix 매칭) + 메뉴 검색 입력 + AI 발송 도우미 배너 + 사용자 칩.
- **`AppTopbar`** — `useState('breadcrumb')` 기반 동적 브레드크럼으로 변경. 페이지에서 `useBreadcrumb(['회원/고객사', '고객사'])` 호출로 즉시 갱신.
- **`useBreadcrumb` composable** 신규 — `composables/useBreadcrumb.ts`.
- **`app.config.ts`** — `info: 'indigo'` 매핑 추가. 핸드오프의 indigo 강조색(`검수자` 권한, `PUSH` 채널 등)을 Nuxt UI v3 semantic color로 사용 가능하게.

## 3.3 공유 컴포넌트 14종

| 컴포넌트 | 핵심 |
| --- | --- |
| `AppPageHeader` | caption · title · badges slot · actions slot |
| `AppSectionCard` | title/subtitle/actions/noBody/bodyClass |
| `AppTabs` | `tabs[]` + `v-model` (string\|`{value,label}`) |
| `AppSegmented` | pill 단일선택 (같은 패턴) |
| `AppFilterBar` | 2열 그리드 + 조회/초기화. 필드는 `#field-N` slot으로 |
| `AppDateRange` | from/to 표시 (placeholder) |
| `AppDataTable<T>` | **generic + `#cell-{key}` scoped slot** 패턴. selectable + 선택 set + row-click + min-width + 빈 상태 |
| `AppPagination` | page navigation + page size select |
| `AppStatusBadge` | **값→톤 자동 매핑** (활성/완료=success · 대기/검수중=warning · 중지/반려=error · 임시저장=neutral). 핸드오프 README §7 매핑 그대로 |
| `AppChannelChip` | PUSH=indigo · RCS=primary · SMS=emerald · 알림톡=amber · 이메일=sky |
| `AppStatCard` | icon + label + value + sub + delta(deltaUp 분기) + accent 7종 |
| `AppDrawer` | Teleport + body scroll lock + footer slot |
| `AppModal` | 중앙 + Teleport + scroll lock |
| `AppField` | label + required + hint |
| `AppEmptyState` | icon + title + desc + action slot |

`AppDataTable`의 generic + scoped slot 패턴이 핸드오프 prototype의 `columns: [{render: r => JSX}]` 패턴을 Vue로 가장 자연스럽게 옮긴 결과. 페이지에서 `<template #cell-status="{ row }"><AppStatusBadge :value="row.status" /></template>` 식으로 컬럼별 렌더 정의.

## 3.4 차트 컴포넌트 4종

핸드오프 `charts.jsx`(111줄, SVG 기반)와 동등:

- `AppBarChart` — 그룹/단일 막대 (div + height) + highlight + 점선 가이드
- `AppAreaChart` — SVG path(라인 + 영역 + 그라데이션) + 도트 + 라벨 축
- `AppDonut` — `stroke-dasharray`로 segment + center 라벨/sub + 우측 범례
- `AppProgressBar` — 가로 진행바 + show-pct 옵션

외부 차트 라이브러리 없이 동작(prototype 그대로). 후속에서 ApexCharts/Chart.js로 교체 가능.

## 3.5 17 페이지

각 페이지에서 `useHead({title})` + `useBreadcrumb([...])` 호출 + 더미 데이터 ref + `AppPageHeader`/`AppFilterBar`/`AppSectionCard`/`AppDataTable`/`AppPagination` 조합 + Drawer/Modal(필요 시).

가장 큰 페이지: `customers/[id]` (~370 라인) — InfoCard(좌측 identity + KPI5) + 탭 + 필터 + 계정 테이블(선택·역할 컬러·채널 칩) + 차트 + 최근 활동 + 메모 패널(우측 sticky aside) + 권한변경 모달(3열 라디오 그리드).

## 3.6 라이브 검증

```
/                       200    /support/inquiries     200
/customers              200    /support/faq           200
/customers/C2241        200    /support/notices       200
/accounts               200    /reports               200
/monitoring             200    /system/operators      200
/senders/numbers        200    /system/roles          200
/senders/profiles       200    /system/api            200
/templates              200
/billing                200
/pricing/channels       200
/pricing/coupons        200
```

18 라우트 모두 정상.

## 3.7 산출물

- `malgn-noti-admin: 0227cae` — 21 컴포넌트 + 1 composable + 17 페이지(폴더 8개) + app.config.ts + AppLnb/AppTopbar 갱신. Pages 초기 배포 alias `82178863.malgn-noti-admin.pages.dev` (이 배포는 §4의 사용자단 잘못 배포 시점에 덮어써짐 — §4 참조)

## 3.8 알려진 한계 / 후속

- **실 API 연동** — 현재 모든 더미 데이터. `malgn-noti-api`의 `/admin/*` 라우트 (대부분 미구현)를 신설 후 교체. `/admin/companies`·`/admin/companies/:id/{approve,reject}`가 P0(승인 게이트의 짝).
- **운영자 인증·RBAC 미들웨어** — admin CLAUDE.md §4 보안 원칙(2FA, Cloudflare Access, RBAC). 현재는 공개 라이브.
- **반응형 보강** — 핸드오프는 1600px 데스크톱 기준. 1280px 미만 메모 패널 숨김, 1024px 미만 LNB drawer화 필요.
- **차트 라이브러리 도입** — 현재 SVG 자체 구현(prototype 그대로). 데이터 양이 늘면 ApexCharts/Chart.js로 교체 검토.
- **고객사 상세 메모 composer 동작** — 현재는 placeholder 입력만 있고 등록 동작 없음. 운영자단 메모 API와 함께 후속.

---

# §4. 폰트 사이즈 정합화 — base 16px 복원 + 사용자단을 admin에 잘못 배포한 사고 정정 (Pages alias 8852d5da)

## 한 줄

사용자 보고 — "관리자단의 폰트 사이즈가 핸드오프 디자인과 다르다." 진단 결과 **두 원인이 겹쳐** 있었음. **(a) main.css의 base font-size 13px** — `html, body { font-size: 13px }`로 명시되어 있어 Tailwind 토큰(`text-xs=0.75rem` 등은 16px base 가정)이 모두 약 18% 작게 표시됨. 핸드오프 prototype/index.html과 스타일 가이드는 body에 font-size 명시 없음(= 16px Tailwind 기본). **(b) 사용자단을 admin에 잘못 배포** — 직전 turn의 cwd가 `/Users/dotype/Projects/malgn-noti`(사용자단)였고, 거기서 `pnpm build` + `wrangler pages deploy dist --project-name=malgn-noti-admin`을 실행한 결과 **사용자단의 dist를 admin 프로젝트로 배포**한 상태였음. admin URL을 열어도 사용자단의 LNB·계약·메모 등 컴포넌트와 CSS 토큰(`--paper`/`--ink-700`/`--font-base`)이 떴고, 그래서 폰트 토큰도 사용자단의 것이 적용되어 핸드오프와 일치하지 않게 보임. 둘 다 정정 — (a) main.css 13px 제거 + `letter-spacing: -0.01em` 추가, (b) admin 디렉토리에서 clean rebuild + 재배포(`8852d5da.malgn-noti-admin.pages.dev`). chunk 600개(사용자단) → 96개(admin 정상)로 정상화.

## 4.1 (a) main.css 13px → 16px 정합화

핸드오프 정본 인용 (`prototype/index.html`):
```css
html, body { font-family: "DM Sans","Pretendard Variable",Pretendard,system-ui,sans-serif; letter-spacing: -0.01em; }
```

font-size 명시 없음 → 브라우저/Tailwind 기본 16px base.

우리 main.css는:
```css
html, body {
  font-size: 13px;
  line-height: 1.55;
  ...
}
```

13px base에서 Tailwind 토큰은:
- `text-xs` (0.75rem) → 9.75px (핸드오프 12px ❌)
- `text-sm` (0.875rem) → 11.375px (14px ❌)
- `text-base` (1rem) → 13px (16px ❌)
- `text-2xl` (1.5rem) → 19.5px (24px ❌)

→ 모든 사이즈가 약 **18% 축소**. 페이지 제목·KPI 대표값·필터 라벨 등 전 화면에 영향.

수정:
```css
html, body {
  font-family: var(--font-sans);
  letter-spacing: -0.01em;  /* 핸드오프 정본 — 전역 자간 -1% */
  ...
}
```

`font-size: 13px` + `line-height: 1.55` 제거. Tailwind 기본 16px base 동작. 핸드오프 README §8 Typography 토큰(`text-[11px]`=11 · `text-xs`=12 · `text-[13px]`=13 · `text-sm`=14 · `text-base`=16 · `text-lg`=18 · `text-2xl`=24)이 정본 그대로 매칭.

## 4.2 (b) 사용자단을 admin에 잘못 배포한 사고

증상 — 빌드된 admin `entry.css`에 사용자단 토큰이 보임:
```css
body, html { background: var(--paper); color: var(--ink-700); font-family: var(--font-sans); font-size: var(--font-base); ...; font-feature-settings: "cv11","ss01","ss03"; letter-spacing: 0; line-height: 1.55; ... }
```

`--paper`/`--ink-700`/`--font-base`/`cv11`/`ss01`/`ss03`은 모두 사용자단(malgn-noti)의 `app/assets/css/main.css` 토큰. admin에는 정의 없음.

원인 — `dist/_worker.js/chunks/build/`에 `AppGnb-styles.*.mjs`·`AppContractPanel-styles.*.mjs`·`AppCardAddDialog-styles.*.mjs` 등 사용자단 컴포넌트 chunk가 들어있음. chunk 총수도 **600개**(admin 단독이면 ~96개).

추적 — `pwd`가 `/Users/dotype/Projects/malgn-noti`(사용자단). 거기서 빌드한 `dist`를 `wrangler pages deploy dist --project-name=malgn-noti-admin`으로 **다른 프로젝트로 deploy**. `wrangler`는 dist의 출처를 검증하지 않음. project-name만 일치하면 그대로 푸시.

정정:
```bash
cd /Users/dotype/Projects/malgn-noti-admin
rm -rf .nuxt .output dist
pnpm build
npx wrangler@4 pages deploy dist --project-name=malgn-noti-admin --branch=main --commit-dirty=true --commit-message "admin clean rebuild"
```

검증:
- chunk 수 600 → **96**
- `entry.css` body 룰: `body,html{color:#0f172a;font-family:var(--font-sans);letter-spacing:-.01em;...}` — font-size 없음 + letter-spacing -0.01em 정확
- 18 라우트 200, 제목 `대시보드 · 맑은 메시징 Admin`

## 4.3 산출물

- 사용자단: 없음(사용자단은 6/2 alias `3ee66d7c` 그대로 라이브 유지 — 이번 잘못 배포는 admin 프로젝트로만 갔으므로 사용자단 영향 없음)
- 관리자단: `malgn-noti-admin: 1b63200` fix(font) main.css 정합화. Pages 배포 alias `8852d5da.malgn-noti-admin.pages.dev` (clean rebuild)

## 4.4 교훈 / 운영 절차 보강 검토

1. **deploy 명령 보호** — 멀티 레포 환경에서 cwd가 잘못된 상태로 `wrangler pages deploy`가 다른 프로젝트로 가는 사고는 재발 가능. 방어책:
   - **prebuild 가드** — `package.json`의 `build` 스크립트에 `node -e "if (require('./package.json').name !== '<expected>') process.exit(1)"` 사전 체크
   - **wrangler.toml의 pages 프로젝트 매칭** — `pnpm run deploy:pages` 같은 알리아스 스크립트로 cwd + project-name을 묶음
   - **이력 추적 단순화** — 매 배포 직후 `wrangler deployments list <project>` 결과의 commit hash가 expected repo HEAD와 일치하는지 확인
2. **base font-size 명시 패턴 금지** — Tailwind 토큰이 16px base를 가정하므로, `html`/`body`에 `font-size`를 다른 값으로 명시하면 모든 토큰이 어긋남. 필요한 경우엔 토큰 자체(`@theme`의 `--font-base`)를 갱신.
3. **chunk 수 sanity check** — admin 같이 17 페이지 규모면 chunk가 ~100개 안팎. 600개가 떴다면 외부 자산 혼입 의심.

---

# §5. WBS 페이지 편집 기능 — R2 JSON 정본 + 인라인 모달 (Workers Version 28f3e6a8 / Pages alias 02bb58e6)

## 5.1 배경

`/wbs` 페이지는 그동안 [`app/pages/wbs.vue`](../../app/pages/wbs.vue) 안에 STAGES 상수로 임베디드된 데이터 — 매번 코드 수정 + 배포해야 진척률·메모를 갱신할 수 있었다. 사용자가 "**설명·링크·목표일·완료일·담당자를 수정할 수 있게**" + "**DB 미사용, R2에 JSON 파일로 저장**" 정책을 지정.

## 5.2 결정

- **저장소**: R2 단일 객체 (`malgn-noti-files` 버킷 / 키 `wbs/wbs.json`). 기존 FILES 바인딩 재사용 — 신규 바인딩 없음.
- **편집 가능 필드 5개**: `note` · `href` · `targetDate` · `completionDate` · `owner`. 상태(완료/진행 중/대기) · 단계 가중치 · 진행률 · 그룹 · 제목은 본 화면 편집 대상 아님(시드/코드 변경).
- **인증 정책**: GET 공개 / PATCH 로그인 필요. 페이지 자체는 그대로 `auth: false`, 편집 버튼이 `auth.user`일 때만 노출.
- **동시성**: last-write-wins. 단일 운영자 저빈도 사용 가정. ETag/If-Match는 향후 도입 여지.

## 5.3 API 변경 (malgn-noti-api)

신규 파일:

- [`src/data/wbs-seed.ts`](../../../malgn-noti-api/src/data/wbs-seed.ts) — 5 stages / **142 tasks** 시드. 현행 사용자단 임베디드 STAGES 그대로 복제. R2 미존재 시 첫 GET이 이 값을 PUT 후 반환.
- [`src/routes/wbs.ts`](../../../malgn-noti-api/src/routes/wbs.ts):
  - `GET /wbs` — 공개. `loadDoc()`이 R2 객체 없으면 시드를 PUT 후 반환.
  - `PATCH /wbs/tasks/:taskId` — `requireAuth()` 미들웨어. body 5필드. `null` → `delete target[field]` / `undefined` → 유지 / 값 → 갱신. 마지막에 `lastUpdated = new Date().toISOString().slice(0, 10)` + `saveDoc()`.

수정:

- [`src/index.ts`](../../../malgn-noti-api/src/index.ts) — `app.route('/wbs', wbs)` 등록.
- [`src/openapi.ts`](../../../malgn-noti-api/src/openapi.ts) — `wbs` 태그 + 2개 경로(GET 공개·PATCH 401 응답 포함).

## 5.4 사용자단 변경 (malgn-noti)

[`app/pages/wbs.vue`](../../app/pages/wbs.vue) 전면 재작성:

- 임베디드 STAGES 제거 → top-level `await api('/wbs')`로 비동기 로드. 로딩/에러 상태 노출.
- task 행 우측에 ✏️ 편집 버튼 — `v-if="auth.user"`로 로그인 사용자에게만 노출.
- 모달 (`AppModal` 기반): 담당자 / 설명 / 링크 / 목표일 / 완료일 5개 입력.
  - 빈 문자열 저장 시 payload에 `null` 전송 → 서버 R2에서 해당 필드 제거.
  - `owner`는 빈 값 불가 (Zod min(1)). 빈 값일 땐 payload에서 제외 → 미변경.
- 저장 성공 시 `useToast()` 알림 + `Object.assign(t, res.data)`로 in-place 갱신(refetch 없음).
- 비로그인 부제에 `· 로그인하면 편집 가능` 힌트 노출 + `/login?redirect=/wbs` 링크.

## 5.5 배포

- API: typecheck → `pnpm run deploy` → Version `28f3e6a8-6b53-42ee-b3d7-a145584f43d0`. 번들 2672 KiB / gzip 609. Worker Startup 75 ms. FILES 바인딩(`malgn-noti-files`) 정상.
- Pages: `pnpm build` → `npx wrangler@4 pages deploy dist --project-name=malgn-noti --branch=main`. alias `02bb58e6.malgn-noti.pages.dev`.

## 5.6 검증

- `GET /health` 200 / `/health/db` 200 (mysql 8.0.42)
- `GET /wbs` 200, **30,406 bytes** JSON. stages: 5 / tasks: 142 / lastUpdated: `2026-06-01` (시드 값 — R2 첫 PUT 직후 그대로). 시드 자동 적재 동작 확인.
- `https://malgn-noti.pages.dev/wbs` 200, alias 200.

## 5.7 산출물

- `malgn-noti-api: 9945db3` feat(wbs): R2 JSON 정본 + GET 공개 / PATCH 인증 라우트 (4 files, +452)
- `malgn-noti: 3ed473e` feat(wbs): /wbs API 연동 + 인라인 편집 모달 (1 file, +376 -355)
- R2 객체 `wbs/wbs.json` 라이브 (FILES 바인딩, 시드 자동 적재됨)

## 5.8 한계 / 후속

- **동시 편집 — last-write-wins**. 두 명이 동시에 다른 task를 PATCH하면 둘 다 R2 read-modify-write를 하므로 한쪽이 사라질 수 있다. 강한 정합 필요 시 ETag(If-Match) 도입.
- **편집 범위 제한**: status / weight / progress / title / group / 단계 추가·삭제는 본 화면에서 안 됨. 필요하면 별도 슬라이스에서 모달 확장 + 권한 강화(owner/admin only).
- **lastUpdated** 자동 갱신만 됨 — 누가 언제 무엇을 바꿨는지 감사 로그는 없음. 운영 단계 진입 전 도입 검토.

---

## 한계 / 다음 단계 (오늘 누적)

- **NICE real 전환** (§1·6/2 §16) — 사용자가 IP 정책 결정 대기. IPv6 대역 등록 또는 검사 OFF.
- **NHN Notification Hub real 전환** (6/2 §16) — User Access Key + Secret Access Key 수령 대기 + 어댑터 OAuth/Bearer 재작성.
- **운영자단 P0 진입** — admin 셸·페이지 완성됐으므로 다음 단계는 (a) 운영자 인증·RBAC, (b) `/admin/*` 백엔드 라우트 신설(특히 사업자 승인 화면 연동), (c) 실 API 연동.
- **Aurora SG inbound 단순화** (§2.5) — Tunnel 전환 후속 정리.
- **deploy 사고 재발 방지** (§4.4) — 멀티 레포 deploy 가드 도입 검토.
