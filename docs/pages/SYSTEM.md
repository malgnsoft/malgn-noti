# 시스템 페이지 6종 — 기획·문구·이메일 템플릿 정본

> **목적**: 정상 업무 플로우 밖에서 노출되는 **시스템 안내 화면 묶음**(에러·점검)과 **인증 메일 HTML 템플릿**의 문구·구조·변수를 한곳에 확정한다. 시안의 "쏠쏠 브랜드" 잔재를 제거하고 맑은 메시징 브랜드 + Relay 디자인 시스템으로 통일.
>
> **연관 정본**: [디자인 SoT `../DESIGN.md`](../DESIGN.md) §단독 화면(blank) · 설계 spec [`malgn-noti-mng/docs/superpowers/specs/2026-06-17-system-pages-design.md`](../../../malgn-noti-mng/docs/superpowers/specs/2026-06-17-system-pages-design.md) · WBS `사용자 · 시스템`(2026-06-15~06-17)
>
> **마지막 현행화**: 2026-06-17 (신설)

---

## 1. 개요

이 묶음은 **로그인/업무 흐름 밖에서 단독으로 노출되는 화면 5종 + 발송용 이메일 HTML 템플릿 2종**으로 구성된다.

| 성격 | 구성 |
| --- | --- |
| **에러 화면 3종** | 404 / 시스템 에러 / 네트워크 에러 |
| **점검 화면 2종** | 점검(긴급) / 점검(정기) |
| **이메일 템플릿 2종** | 이메일 인증(verify) / 비밀번호 재설정(reset-password) |

### 공통 성격

- **레이아웃**: 화면 5종(에러·점검)은 모두 **`blank` 레이아웃** — 앱 GNB 없이 **로고-온리 sticky 상단 바 + 콘텐츠 + 간단 푸터**([`../DESIGN.md`](../DESIGN.md) §단독 화면). 좌측 사이드바·하단 GNB 없음.
- **권한**: 전부 `definePageMeta({ layout: 'blank', auth: false })` — 비인증 상태에서도 노출되어야 하므로 인증 미들웨어 우회.
- **공용 컴포넌트**: 에러·점검 5종은 **`AppSystemMessage`**(로고-온리 + 아이콘/제목/설명/액션 슬롯)를 재사용. `app/error.vue`·`app/pages/404.vue`도 동일 컴포넌트·룩 공유.
- **색 사용**: 평상시 ink 무채색. 채도색은 **상태에만** — 에러=danger, 점검=warning. 그린 액센트는 액션 버튼 등 최소(≤6회), 1px hairline·저밀도([`../DESIGN.md`](../DESIGN.md) 준수).
- **접근성**: 시맨틱 heading(`h1`), 액션 `aria-label`, focus ring, `prefers-reduced-motion`, 1024 반응형.
- **이메일 템플릿 2종**은 화면이 아니라 **실제 발송 메일 본문 HTML**(§5). 웹 디자인 시스템 클래스를 쓰지 않고 **인라인 스타일 + table 레이아웃**으로 작성한다(이메일 클라이언트 호환).

---

## 2. 페이지별 라우트·파일

| # | 페이지 | 라우트 | 파일 | 비고 |
| --- | --- | --- | --- | --- |
| 1 | 404 (Not Found) | `/templete/error/not-found` · `/404` | [`app/pages/templete/error/not-found.vue`](../../app/pages/templete/error/not-found.vue) · [`app/pages/404.vue`](../../app/pages/404.vue) | 시안 미리보기 + 단독 404 |
| 2 | 시스템 에러 | `/templete/error/system` | [`app/pages/templete/error/system.vue`](../../app/pages/templete/error/system.vue) · 실 핸들러 [`app/error.vue`](../../app/error.vue) | `error.vue`가 statusCode 분기 |
| 3 | 네트워크 에러 | `/templete/error/network` | [`app/pages/templete/error/network.vue`](../../app/pages/templete/error/network.vue) | 연결 실패 안내 |
| 4 | 점검(긴급) | `/templete/inspection/emergency` | [`app/pages/templete/inspection/emergency.vue`](../../app/pages/templete/inspection/emergency.vue) | 사유·예상 종료 시각 placeholder |
| 5 | 점검(정기) | `/templete/inspection/scheduled` | [`app/pages/templete/inspection/scheduled.vue`](../../app/pages/templete/inspection/scheduled.vue) | 점검 일시(시작~종료) placeholder |
| 6 | 인증 메일(verify) | `/templete/email/verify` | [`app/pages/templete/email/verify.vue`](../../app/pages/templete/email/verify.vue) | 이메일 HTML 미리보기/정본 소스 |
| 6 | 비밀번호 재설정 메일 | `/templete/email/reset-password` | [`app/pages/templete/email/reset-password.vue`](../../app/pages/templete/email/reset-password.vue) | 이메일 HTML 미리보기/정본 소스 |

> 공용: [`app/components/AppSystemMessage.vue`](../../app/components/AppSystemMessage.vue) — 아이콘/톤(`danger`·`warning`·`neutral`)·제목·설명·액션 슬롯. 에러·점검 5종 + `404.vue`·`error.vue`가 사용.

---

## 3. 페이지별 문구(copy) — 확정

> 한국어 정본. 줄바꿈은 화면 폭에 맞춰 컴포넌트가 처리(아래 `<br>` 위치는 권장).

### 3.1 404 (Not Found) — 톤 `neutral`

| 요소 | 값 |
| --- | --- |
| 아이콘 | `i-lucide-compass`(또는 대형 "404" 디스플레이 숫자) |
| 제목 | **페이지를 찾을 수 없습니다** |
| 설명 | 요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있어요.<br>입력하신 주소가 정확한지 다시 확인해 주세요. |
| 1차 액션 | **홈으로** → `navigateTo('/home')`(primary) |
| 2차 액션 | **이전으로** → `router.back()`(ghost/outline) |
| 디스플레이 | 대형 `404` 숫자(Instrument Serif/JetBrains Mono, ink-300) 배경 장식 가능 |

### 3.2 시스템 에러 — 톤 `danger`

| 요소 | 값 |
| --- | --- |
| 아이콘 | `i-lucide-server-crash` |
| 제목 | **일시적인 오류가 발생했습니다** |
| 설명 | 서비스 처리 중 문제가 발생했어요.<br>잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터로 문의해 주세요. |
| 1차 액션 | **다시 시도** → `reloadNuxtApp()` / 새로고침(primary) |
| 2차 액션 | **홈으로** → `navigateTo('/home')`(ghost) |
| 보조 표기 | 오류 코드(있으면) `오류 코드: {{statusCode}}` 작은 ink-400 캡션 |

### 3.3 네트워크 에러 — 톤 `danger`

| 요소 | 값 |
| --- | --- |
| 아이콘 | `i-lucide-wifi-off` |
| 제목 | **네트워크 연결이 불안정합니다** |
| 설명 | 인터넷 연결 상태를 확인한 뒤 다시 시도해 주세요.<br>잠시 후에도 같은 문제가 계속되면 고객센터로 문의해 주세요. |
| 1차 액션 | **다시 시도** → 직전 요청 재실행/새로고침(primary) |
| 2차 액션 | **홈으로** → `navigateTo('/home')`(ghost) |

### 3.4 점검(긴급) — 톤 `warning`

| 요소 | 값 |
| --- | --- |
| 아이콘 | `i-lucide-alert-triangle` |
| 제목 | **긴급 점검 중입니다** |
| 설명 | 안정적인 서비스 제공을 위해 긴급 점검을 진행하고 있습니다.<br>이용에 불편을 드려 죄송합니다. 점검이 완료되면 정상적으로 이용하실 수 있습니다. |
| placeholder 필드 | §4.1 참조 (점검 사유 · 예상 종료 시각) |
| 액션 | **다시 시도** → 새로고침(ghost). 점검 중에는 홈 이동 비노출 또는 비활성 |

### 3.5 점검(정기) — 톤 `warning`

| 요소 | 값 |
| --- | --- |
| 아이콘 | `i-lucide-calendar-clock` |
| 제목 | **정기 점검 중입니다** |
| 설명 | 더 나은 서비스를 위해 예정된 정기 점검을 진행하고 있습니다.<br>점검 시간 동안 서비스 이용이 제한됩니다. 양해 부탁드립니다. |
| placeholder 필드 | §4.2 참조 (점검 일시 시작~종료) |
| 액션 | **다시 시도** → 새로고침(ghost) |

### 3.6 공통 푸터 문구(blank 레이아웃)

- 좌: 맑은 메시징 로고(로고-온리 상단 바와 동일).
- 푸터: `ⓒ 맑은소프트 · 고객센터 문의` — 고객센터 링크는 `/inquiry`(또는 메일/전화 placeholder, §7 미정).

---

## 4. 점검 페이지 placeholder 필드 (정적 v1)

> v1은 **정적 placeholder**. 백엔드 점검 모드 연동(실제 플래그·값 주입)은 별도 차수(§7).

### 4.1 점검(긴급) 필드

| 필드 | 라벨 | placeholder 값(v1) | 향후 주입 소스 |
| --- | --- | --- | --- |
| 점검 사유 | 점검 사유 | `긴급 시스템 점검` | 점검 모드 API `reason` |
| 예상 종료 시각 | 예상 완료 | `2026-00-00 00:00 (예정)` | 점검 모드 API `expectedEndAt` |

- 레이아웃: 설명 아래 1px hairline 카드(definition list 2행). 값 미정 시 `미정`/`확인 중` 폴백.

### 4.2 점검(정기) 필드

| 필드 | 라벨 | placeholder 값(v1) | 향후 주입 소스 |
| --- | --- | --- | --- |
| 점검 시작 | 점검 시작 | `2026-00-00 00:00` | API `startAt` |
| 점검 종료 | 점검 종료 | `2026-00-00 00:00` | API `endAt` |
| 점검 내용 | 점검 내용 | `서버 정기 점검 및 업데이트` | API `description`(선택) |

- 시간 표기: `YYYY-MM-DD HH:mm` 24시간제, tabular 숫자(JetBrains Mono). KST 기준 명시 권장(`(KST)` 캡션).

---

## 5. 이메일 템플릿 정의 (verify · reset-password)

### 5.1 공통 원칙 (email-safe)

- **웹 디자인 시스템 클래스 금지** — `@theme` 토큰/Tailwind 클래스는 메일 클라이언트에서 렌더되지 않는다. **모든 스타일은 인라인 `style=""`**, 레이아웃은 **`<table role="presentation">`** 중첩.
- 본문 폭 **600px 고정** 중앙 정렬, 외곽 배경 `#f4f4f5`(ink-100 상당), 카드 배경 `#ffffff`, 1px border `#e4e4e7`.
- 텍스트 색: 본문 `#27272a`(ink-800), 보조 `#71717a`(ink-500), 링크 `#00a36b`(그린 액센트의 메일-세이프 대비값 — 순수 `#00DC82`는 흰 배경 대비 부족하므로 어둡게 보정).
- CTA 버튼: `<a>` 패딩 버튼(배경 그린 `#00a36b`, 텍스트 흰색, `border-radius:6px`, `font-weight:600`). **VML 폴백은 필수 아님**(v1).
- 폰트: 시스템 스택 `-apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', Roboto, sans-serif`(웹폰트 임베드 안 함).
- **fallback 텍스트 링크**: 버튼 아래 "버튼이 동작하지 않으면 아래 주소를 복사해 주세요" + 전체 URL 텍스트 노출.
- 다크모드: 강제 대응 안 함(v1). 밝은 배경 기준.
- 페이지(`verify.vue`·`reset-password.vue`)는 이 HTML을 **그대로 노출**해 미리보기 겸 정본 소스로 기능(앱 셸 없이 iframe 또는 직접 렌더).

### 5.2 치환 변수

| 변수 | 의미 | 사용 템플릿 | 예시 값 |
| --- | --- | --- | --- |
| `{{userName}}` | 수신자 표시명(없으면 "고객님" 폴백) | 공통 | `홍길동` |
| `{{verifyUrl}}` | 이메일 인증 완료 링크(토큰 포함) | verify | `https://malgn-noti.pages.dev/...` |
| `{{resetUrl}}` | 비밀번호 재설정 링크(토큰 포함) | reset-password | `https://malgn-noti.pages.dev/reset-password/new?token=...` |
| `{{expireMinutes}}` | 링크 만료까지 분 | 공통 | `30` |
| `{{requestedAt}}` | 요청 시각(보안 안내용, 선택) | reset-password | `2026-06-17 14:30 (KST)` |
| `{{supportEmail}}` | 고객센터 메일(footer) | 공통 | `support@malgn.example`(미정, §7) |

> 변수 표기는 `{{ }}`(Mustache 스타일). 실제 치환 엔진은 백엔드(api) 결정 — placeholder 형식만 정본으로 고정.

### 5.3 이메일 인증 (verify)

| 요소 | 내용 |
| --- | --- |
| 제목(subject) | **[맑은 메시징] 이메일 주소를 인증해 주세요** |
| 프리헤더 | 아래 버튼을 눌러 이메일 인증을 완료해 주세요. |
| 인사 | `{{userName}}님, 안녕하세요.` |
| 본문 | 맑은 메시징 가입을 환영합니다.<br>아래 버튼을 눌러 이메일 주소 인증을 완료하시면 서비스를 정상적으로 이용하실 수 있습니다. |
| CTA 버튼 | **이메일 인증 완료** → `{{verifyUrl}}` |
| 만료 안내 | 이 인증 링크는 **`{{expireMinutes}}`분 후 만료**됩니다. 만료 시 다시 요청해 주세요. |
| fallback | 버튼이 동작하지 않으면 아래 주소를 복사해 브라우저에 붙여넣어 주세요: `{{verifyUrl}}` |
| 보안 문구 | 본 메일을 요청하지 않으셨다면 무시하셔도 됩니다. |
| footer | 맑은소프트 · 맑은 메시징 / 문의 `{{supportEmail}}` |

### 5.4 비밀번호 재설정 (reset-password)

| 요소 | 내용 |
| --- | --- |
| 제목(subject) | **[맑은 메시징] 비밀번호 재설정 안내** |
| 프리헤더 | 아래 버튼을 눌러 비밀번호를 재설정해 주세요. |
| 인사 | `{{userName}}님, 안녕하세요.` |
| 본문 | 비밀번호 재설정 요청을 접수했습니다.<br>아래 버튼을 눌러 새 비밀번호를 설정해 주세요. |
| CTA 버튼 | **비밀번호 재설정** → `{{resetUrl}}` |
| 만료 안내 | 이 재설정 링크는 **`{{expireMinutes}}`분 후 만료**됩니다. 만료 시 다시 요청해 주세요. |
| fallback | 버튼이 동작하지 않으면 아래 주소를 복사해 브라우저에 붙여넣어 주세요: `{{resetUrl}}` |
| 보안 문구 | 본인이 요청하지 않으셨다면 비밀번호가 변경되지 않으니 안심하셔도 됩니다. 계정 보안이 걱정되면 고객센터로 문의해 주세요.<br>(선택) 요청 시각: `{{requestedAt}}` |
| footer | 맑은소프트 · 맑은 메시징 / 문의 `{{supportEmail}}` |

---

## 6. 상태/분기

### 6.1 `app/error.vue` (실 핸들러)

Nuxt 전역 에러 핸들러. `error.statusCode` 기준 분기:

| statusCode | 노출 | 비고 |
| --- | --- | --- |
| `404` | §3.1 404 화면 룩 | `AppSystemMessage` 톤 `neutral` |
| 그 외(`500` 등) | §3.2 시스템 에러 화면 룩 | 톤 `danger`, `오류 코드: {{statusCode}}` 캡션 |

- `clearError({ redirect })`로 액션 처리(홈으로/재시도). statusCode 분기 로직은 유지하되 룩만 `AppSystemMessage`로 통일.

### 6.2 네트워크/점검 트리거(v1)

- 네트워크 에러(§3.3)·점검(§3.4·3.5)은 **정적 라우트**로만 존재. 실제 자동 전환(요청 실패 감지 → 네트워크 화면, 점검 플래그 → 점검 화면)은 미연동(§7).
- `404.vue`는 단독 404(레이아웃 없음 케이스) — 동일 룩 공유.

---

## 7. 알려진 한계 · 후속

| # | 항목 | 상태 |
| --- | --- | --- |
| 1 | **백엔드 점검 모드 연동** — 점검 플래그·사유·시각을 API에서 주입하고 전 페이지 자동 전환 | 별도 차수. v1은 정적 placeholder(§4) |
| 2 | **이메일 실제 발송 연결** — api가 이 HTML 템플릿을 사용해 verify/reset 메일 발송 | 별도 차수. v1은 정본 HTML 정의·미리보기까지 |
| 3 | **네트워크 에러 자동 트리거** — `useApi` 요청 실패 감지 → 네트워크 화면/토스트 분기 | 미정 |
| 4 | **고객센터 연락처(`{{supportEmail}}`·전화)** 확정 | 미정 — 운영 결정 필요 |
| 5 | **메일 그린 대비값(`#00a36b`)** — 브랜드 `#00DC82`의 메일-세이프 보정값. 디자인 최종 승인 필요 | 잠정 |
| 6 | 만료 분(`{{expireMinutes}}`) 기본값(verify/reset 각각) — 보안 정책상 확정 필요(잠정 30분) | 미정 |

---

## 8. 후속 인계

- **frontend-developer**: `AppSystemMessage` 추출 + 화면 5종(+`error.vue`·`404.vue`) 재작업, §3 문구·§4 placeholder 반영, 이메일 2종은 §5 인라인 스타일 HTML로. 디자인 토큰만 사용(하드코딩 제거).
- **api(개발자)**: §5.2 변수 placeholder 형식 확정값 수신 → 메일 발송 시 치환. §4 점검 모드 필드(`reason`/`expectedEndAt`/`startAt`/`endAt`) 스키마 협의(별도 차수).
- **QA**: 라우트 7개 렌더, statusCode 분기(§6.1), 이메일 HTML 주요 클라이언트(Gmail/Outlook/Apple Mail) 표시 확인.
