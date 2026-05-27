# 2026-05-27 — malgn-noti-admin Nuxt 3 부트스트랩 + 셸 레이아웃 + 첫 프로덕션 배포

## 한 줄 요약

비어 있던 `malgn-noti-admin`(BackOffice) 레포를 **Nuxt 3 + Nuxt UI v3로 부트스트랩**하고 — `design_handoff_customer_detail` 정본을 참조해 **LNB(256px sticky · 8 그룹 메뉴) + TopBar(64px sticky · 브레드크럼·시스템 상태·사용자 chip) 셸 레이아웃**을 구성, `https://malgn-noti-admin.pages.dev`에 **첫 실 Nuxt 앱 프로덕션 배포** 완료 (기존 정적 placeholder 대체). 콘텐츠 페이지는 셸 단계 이후 별도 구성 예정.

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

## 다음 단계 / 알려진 한계

- 셸만 구성 — 각 라우트(`/customer`, `/send`, `/template`, `/report`, `/billing`, `/ops` …)의 페이지/컴포넌트는 미구현. LNB 메뉴 항목은 시각 동작만(클릭 시 라우트 이동 없음, 액티브 키만 변경).
- `MemoPanel`(우측 360px sticky)·고객사 상세의 InfoCard·계정 테이블·BarChart·ActivityList·권한 변경 모달 — 핸드오프 정본에 있으나 셸 범위 밖.
- `doc/DESIGN-ADMIN.md`의 primary `#6366f1`(indigo)과 부트스트랩 정본 `blue(#3b82f6)` **불일치** — 핸드오프를 우선해 구현, DESIGN-ADMIN.md 정합화는 후속 작업.
- `malgn-noti-admin/CLAUDE.md`에 사용자단 §7.1 유사한 **배포·Git·작업 이력 운영 컨벤션** 미수록 — 후속 작성 필요(현재는 사용자단 컨벤션을 준용해 진행).
- 인증 미들웨어·RBAC·`Cmd+K` 명령 팔레트·다크 모드 — 모두 셸 이후 별도 작업.
