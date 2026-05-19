# 2026-05-19 — 디자인 가이드 페이지 + Cloudflare 프로덕션 배포

## 한 줄 요약

Relay-inspired 정본을 시각화한 `/guide` 라이브 카탈로그 페이지(18섹션)를 추가하고, 디자인 피벗 전체(Phase 1~2b-2 + 가이드)를 Cloudflare Pages 프로덕션에 배포. 이후 전역 UI 스케일 115% + 실제 1400px 디자인 폭 보정을 적용하며 재배포(총 3회).

---

## 1. 디자인 가이드 페이지 (`/guide`)

- `app/pages/guide.vue` 신설 — sticky 사이드 nav + 스크롤 스파이 + 18섹션 라이브 카탈로그.
  - 소개(hero) · 01 원칙(7) · 02 컬러(ink 11단/accent/semantic/채널 도트) · 03 타이포 · 04 간격 · 05 라운드·그림자 · 06 버튼 · 07 Pill · 08 폼 · 09 배지 · 10 카드 · 11 테이블 · 12 빈상태 · 13 토스트 · 14 미리보기 폰 5종 · 15 레이아웃 · 16 5-카드 골격+매트릭스 · 17 톤
  - 실제 `App*` 컴포넌트로 라이브 예시 렌더 (AppBadge/AppEmptyState/Phone·Kakao·Rcs·Email·Push Preview/AppFormRow/AppRadioGroup/AppSegmented/AppSendFormCard).
- **결정**: 핸드오프 `design-guide.jsx`는 구 토큰이 섞인 stale 아티팩트(`--color-sky-vivid`, Noto Sans KR, 1200px, indigo 그라데이션)라 그대로 복사하지 않고, **현재 정본(ink/accent, Inter/JetBrains Mono, 1400px, r-sm/md/lg, shadow-soft/popover/modal)에 맞춰 값·라벨 재작성**. 가이드 표기값 = main.css 일치.
- `app/pages/home.vue` 바로가기에 "디자인 가이드"(`/guide`) 링크 추가.
- 검증: `/guide` HTTP 200 (87.6KB), 컴파일·하이드레이션 오류 0.

## 2. Cloudflare Pages 프로덕션 배포

- 빌드: `pnpm build` (Nitro `cloudflare-pages` 프리셋) → `dist/` 1.35MB / gzip 423KB.
- 인증: `wrangler whoami` → info@malgnsoft.com (account `d2b8c552…`, 기존 배포 계정 동일).
- 배포: `npx wrangler@4 pages deploy dist --project-name=malgn-noti --branch=main` (프로덕션).
- 결과:
  - 프로덕션: https://malgn-noti.pages.dev — `/home`·`/guide` HTTP 200
  - 배포 alias: https://4b3da057.malgn-noti.pages.dev
  - 라이브 마커 확인: `gnb-wrap` · `ai-card` · `credit-hero` · Inter 폰트 · `ink-900` · "운영 콘솔"
- 배포 시점 working tree 기준이라 `guide.vue`/`home.vue`/문서가 git 미반영 상태였음 → 본 커밋으로 라이브 ↔ git 일치화.

## 3. Git

- `main` 직접 커밋·푸시 (브랜치는 main 단일 운영 — 2026-05-18 사용자 결정 유지).
- 범위: `app/pages/guide.vue`(신규), `app/pages/home.vue`(가이드 링크), `doc/DESIGN.md`(§0 현황), 이 history + README 인덱스.

---

## 4. 전역 UI 스케일 115% + 재배포

- 요청: 전체 폰트 스케일 ~115% 확대.
- **결정**: 카드 제목·헤딩·테이블 등 폰트가 px 하드코딩이라 `--font-base`만 키우면 부분만 커짐. `:root` 에 `--ui-scale: 1.15` 토큰 + `body { zoom: var(--ui-scale); }` 한 줄로 텍스트·간격·컴포넌트를 균일 비례 확대(브라우저 줌 효과). sticky GNB·모달·토스트 정상. 복원 = `--ui-scale: 1`.
- 트레이드오프: 폰트만이 아니라 레이아웃·여백도 ~15% 확대(전체 비례). 텍스트-only는 타이포 스케일 재설계 필요(범위 큼) — 보류.
- 빌드 → `wrangler pages deploy dist --branch=main` 재배포.
  - 배포 alias: https://ec3368a2.malgn-noti.pages.dev
  - 검증: 프로덕션 CSS 자산(`entry.*.css`)에 `ui-scale:1.15` · `zoom:var(--ui-scale)` 포함 확인.
- 변경 파일: `app/assets/css/main.css` 단일.

## 5. 디자인 폭 1400px 보정 + 재배포

- 요청: 디자인 너비 1400px.
- 진단: `--container-max` 토큰은 이미 `1400px`였으나 §4의 `body{zoom:1.15}`가 곱해져 화면 실제 폭 ≈ 1610px.
- **수정**: `--container-max: calc(1400px / var(--ui-scale))` → `1217.4px × 1.15 = 1400px` 화면폭. `--ui-scale` 변경 시 자동 유지(절대 디자인 폭). 본문·GNB·푸터 일괄.
- 빌드 → `wrangler pages deploy dist --branch=main` 재배포(3회차).
  - 배포 alias: https://3ae53fbd.malgn-noti.pages.dev
  - 검증: 프로덕션 CSS에 `container-max:calc(1400px/var(--ui-scale))` 포함 확인.
- 변경 파일: `app/assets/css/main.css` 단일.

---

## 산출물 (당일)

- `app/pages/guide.vue` (신규, 18섹션 라이브 가이드)
- `app/pages/home.vue` (바로가기 5번째: 디자인 가이드)
- `doc/DESIGN.md` (§0 적용 현황에 가이드 페이지 행 추가)
- `app/assets/css/main.css` (`--ui-scale: 1.15` + `body{zoom}` 전역 115%, `--container-max` 1400px 보정)
- `doc/history/history.20260519.md` + README 인덱스
- Cloudflare Pages 프로덕션 배포 ×3 (https://malgn-noti.pages.dev)

## 다음 단계 / 알려진 한계

- **Phase 2b-3 남음**: 이력·통계·주소록·발신정보·메시지관리·캠페인·충전·인증 페이지.
  - 핸드오프 `other-pages.jsx`에 발송조회/통계/주소록/충전/로그인/회원가입 시안 존재.
  - 발신정보·메시지관리·캠페인은 핸드오프 시안 없음 → 별도 협의.
- 미적용 화면은 backward-compat 별칭으로 색만 이행(간격·폰트·형태는 구 시안).
- GitHub Actions 자동 배포 미구성 — 현재는 wrangler CLI 수동 배포.
