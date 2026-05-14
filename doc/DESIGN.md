# 디자인 가이드 — 맑은 메시징

시안 정본([malgn-notifications.pages.dev](https://malgn-notifications.pages.dev))의 디자인 언어를 정리한 문서입니다. 디자이너·프론트엔드 개발자가 새 화면을 그릴 때의 기준이며, 토큰·컴포넌트·레이아웃·반응형·접근성까지 다룹니다.

> 코딩 컨벤션은 [FRONTEND.md](./FRONTEND.md), 기술 스택은 [STACK.md](./STACK.md).

---

## 1. 디자인 원칙

| 원칙 | 의미 |
| --- | --- |
| **정보 우선** | 발송/조회/관리는 데이터 작업이 핵심. 텍스트·표·폼이 시각적으로 가장 무거워야 함. 장식은 최소. |
| **절제된 색** | primary 인디고 + 회색 11단으로 90%, 브랜드 보조 색은 강조에만. |
| **한국어 우선** | Noto Sans KR · letter-spacing 음수로 한글 가독성 우선. 영어는 보조. |
| **시안 일치** | 디자인 시안의 클래스(`.gnb-*`, `.footer-*` 등) 명명을 그대로 차용. 시안↔구현 갭을 최소화. |
| **컴포넌트 재사용** | Nuxt UI(`U*`) 우선 → 부족하면 `App*` 자체 컴포넌트. 페이지마다 새 디자인 만들지 않음. |

---

## 2. 컬러 시스템

### 2.1 토큰 (CSS 변수 — [main.css](../app/assets/css/main.css))

#### Primary

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--primary-color` | `#6366f1` | 기본 액션, 강조 텍스트, 드롭다운 제목 |
| `--primary-hover` | `#4f46e5` | 호버 상태 |

> Tailwind `indigo-500/600`과 동일. Nuxt UI의 `primary` 색상 토큰과 자동 연동(`app.config.ts`에서 `primary: 'indigo'`).

#### 회색 11단 (Tailwind gray와 동일)

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `--gray-50`  | `#f9fafb` | body 배경 (페이지 기본 바탕) |
| `--gray-100` | `#f3f4f6` | 컴포넌트 hover 배경 |
| `--gray-200` | `#e5e7eb` | 보더, 구분선 |
| `--gray-300` | `#d1d5db` | 입력 보더, dashed divider |
| `--gray-400` | `#9ca3af` | placeholder, disabled 텍스트, empty 아이콘 |
| `--gray-500` | `#6b7280` | 보조 텍스트 (caption, label) |
| `--gray-600` | `#4b5563` | 기본 본문(소형) |
| `--gray-700` | `#374151` | 메뉴 텍스트, 본문 |
| `--gray-800` | `#1f2937` | 본문 기본 |
| `--gray-900` | `#111827` | 큰 제목, 강조 본문 |

#### 브랜드 보조

| 토큰 | 값 | 사용처 | 시각 |
| --- | --- | --- | --- |
| `--color-sky-soft` | `#E5F4FE` | "문의" pill 배경, 팁 카드 배경 | 연한 하늘 |
| `--color-sky` | `#4FC0FC` | 사용자 아바타 배경 | 밝은 하늘 |
| `--color-sky-vivid` | `#027CFA` | "충전" pill 배경, 강조 링크 | 진한 파랑 |
| `--color-indigo` | `#6756ED` | "회원가입" pill, 로고 아이콘, 메뉴 아이콘, 크레딧 코인 | 브랜드 인디고 |

> `--color-indigo`는 primary(`#6366f1`)와 미세 차이. **primary는 UI 상태색**, **brand indigo는 로고·아이덴티티색**으로 역할 분리.

### 2.2 사용 규칙

- 색은 **항상 CSS 변수로**. `bg-[#6366f1]` 같은 임의값 금지.
- 의미별 사용:
  - 액션·강조 → `var(--primary-color)`
  - 정보·링크 → `var(--color-sky-vivid)`
  - 결제·과금 → `var(--color-sky-vivid)` ("충전" 등)
  - 회원·계정 → `var(--color-indigo)` ("회원가입" 등)
  - 위험·삭제 → Nuxt UI `color="error"`
  - 경고 → Nuxt UI `color="warning"`
  - 성공 → Nuxt UI `color="success"`
- 텍스트는 90%가 `--gray-700 ~ --gray-900` 안에서 결정.
- **대비 4.5:1 이상** (WCAG AA). 본문 위 회색 텍스트는 `--gray-500`까지가 한계.

---

## 3. 타이포그래피

### 3.1 폰트

- 패밀리: **Noto Sans KR** (Google Fonts)
- 가중치: 300 / 400 / 500 / 600 / 700
- letter-spacing: 큰 제목에 `-0.5px ~ -1px` (한글은 가까이 붙어야 자연스러움)
- font-smoothing: `-webkit-font-smoothing: antialiased`

### 3.2 텍스트 스케일

| 역할 | 크기 | 가중치 | letter-spacing | 색 |
| --- | --- | --- | --- | --- |
| Display (회사명·로고) | 28px | 800–900 | -1px | `--gray-900` / 흰색 |
| H1 (페이지 제목) | 24px | 700 | -0.5px | `--gray-900` |
| H2 (섹션 제목) | 18px | 700 | -0.3px | `--gray-900` |
| H3 (카드 제목) | 15–16px | 700 | -0.2px | `--gray-900` |
| Body | 14px | 400–500 | 0 | `--gray-700` |
| Body small | 13px | 400 | 0 | `--gray-600` |
| Caption | 12px | 400–500 | 0 | `--gray-500` |
| Micro | 11–12px | 600–700 | 0 | (배지·라벨) |

### 3.3 줄 높이

- 본문: 1.5 ~ 1.7
- 제목: 1.2 ~ 1.3
- 매우 작은 라벨/숫자: 1 (꽉 차게)

---

## 4. 간격 · 그리드 · 레이아웃

### 4.1 간격 스케일 (Tailwind 표준)

`0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80px` — 8px가 기본 리듬, 4px는 보조.

### 4.2 컨테이너 폭

| 영역 | max-width | padding | 비고 |
| --- | ---: | ---: | --- |
| Utility Bar (`.gnb-utility-inner`) | 1200px | 24px | 사용자단 헤더 상단 줄 |
| Main GNB (`.gnb-inner`) | 1200px | 24px | 로고 + 메뉴 |
| 본문 (`.app-container`) | 1200px | 24px | 모든 페이지 표준 |
| Footer (`.footer-container`) | 1200px | 24px | 상하단 합쳐서 |

### 4.3 페이지 vertical rhythm

| 영역 | 상하 padding |
| --- | --- |
| Utility Bar | 0 (height 32px) |
| Main GNB | 0 (height 64px) |
| 페이지 본문 시작 | `py-8 lg:py-10` (32~40px) |
| 섹션 간 | `mb-6 ~ mb-8` |
| 카드 내부 | `p-4 ~ p-6` |
| 헤더 ↔ 카드 | `mb-6` |

### 4.4 2단 콘텐츠 (`.content-2col`)

```
┌──────────────────────────┬──────────────┐
│                          │              │
│   메인 컨텐츠 (1fr)        │  보조 360px  │
│                          │              │
└──────────────────────────┴──────────────┘
                  ↓ < 1024px
┌──────────────────────────────────────────┐
│   보조 (위로 올라옴)                       │
├──────────────────────────────────────────┤
│   메인 컨텐츠                              │
└──────────────────────────────────────────┘
```

```css
display: grid;
grid-template-columns: 1fr 360px;
gap: 32px;
```

---

## 5. 라운드 · 그림자 · 보더

### 5.1 라운드 (border-radius)

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| pill | `999px` | utility bar 버튼(문의/충전/회원가입), badge |
| sm | 6–8px | 입력, 작은 버튼 |
| md | 10–12px | 카드, 드롭다운, 모달 footer 버튼 |
| lg | 16px | 큰 카드, 강조 패널 (홈 크레딧 카드) |

### 5.2 그림자

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| dropdown | `0 8px 24px rgba(0, 0, 0, 0.08)` | GNB 드롭다운, 사용자 메뉴 |
| card-hover | `0 6px 16px rgba(0, 0, 0, 0.06)` | 카드 hover 시 lift |
| brand-glow | `0 6px 20px rgba(2, 124, 250, 0.18)` | 홈 그라데이션 크레딧 카드 |
| modal | `0 20px 50px rgba(0, 0, 0, 0.15)` | 모달 (Nuxt UI 기본) |

기본 카드는 **그림자 없이 1px 보더**(`--gray-200`)만 사용. 그림자는 떠 있어 보여야 할 때만.

### 5.3 보더

| 용도 | 색 | 두께 | 스타일 |
| --- | --- | --- | --- |
| 카드 / 입력 | `--gray-200` | 1px | solid |
| 입력 focus | `--primary-color` | 1px (+ ring 2px) | solid |
| 드롭다운 divider (강조 X) | `--gray-300` | 1px | **dashed** |
| 어드민 위험 영역 | `--error-500` | 1px (+ ring) | solid |

---

## 6. 컴포넌트 패턴

### 6.1 버튼

#### Pill 버튼 (utility bar)

| 종류 | 배경 | 텍스트 | 사용처 |
| --- | --- | --- | --- |
| 문의 | `--color-sky-soft` | `--color-sky-vivid` | 1차 보조 액션 (상시 노출) |
| 충전 | `--color-sky-vivid` | 흰색 | 강한 보조 액션 (로그인 시) |
| 회원가입 | `--color-indigo` | 흰색 | 신규 가입 유도 |
| 사용자 (아바타) | 흰 배경 + 1px 보더 | `--gray-800` | 사용자 메뉴 진입 |

공통: `padding: 3px 14px`, `border-radius: 999px`, `font-size: 12px`, `font-weight: 500–600`.

#### 본문 버튼 (Nuxt UI `UButton`)

| 변형 | 사용 |
| --- | --- |
| `color="primary"` | 기본 액션 (저장/발송/확인) |
| `color="primary" variant="soft"` | 보조 액션 (필터 적용 등) |
| `color="neutral" variant="soft"` | 취소, 보조 정보 |
| `color="error"` | 삭제, 위험 액션 |
| `variant="ghost"` | 아이콘 버튼, 메뉴 진입 |
| `variant="link"` | 인라인 텍스트 액션 |

### 6.2 카드

```
┌──────────────────────────────────────┐
│ 헤더 (제목 + 보조 링크)              │
├──────────────────────────────────────┤
│ 본문                                 │
└──────────────────────────────────────┘
```

- 배경 흰색, 보더 `--gray-200` 1px, 라운드 12–16px, padding 20px
- 헤더와 본문 사이 12px gap
- hover lift는 클릭 가능한 카드(예: 홈 채널 카드)에만

### 6.3 입력 폼

- `UForm` + `UFormField`(label · description · error) + `UInput`/`UTextarea`/`USelect`/`UInputNumber`
- label 위에 배치 (in-line label 지양)
- 필수 표시: `required` prop (별표 자동)
- 에러는 인풋 아래 빨간 텍스트
- placeholder는 보조 정보, 실제 값 예시 위주

### 6.4 모달 / 슬라이드

| 패턴 | 컴포넌트 | 폭 |
| --- | --- | --- |
| 확인/알림 | `UModal` / `AppConfirmDialog` | 400–520px |
| 폼·상세 편집 (수신자 정보 입력 등) | `USlideover` 우측 | 480–640px |
| 큰 컨텐츠 (템플릿 선택 등) | `UModal` 큰 변형 | 720–960px |

위험 액션은 반드시 사유 입력 or 명시적 확인 필수.

### 6.5 테이블 (`UTable`)

- 헤더: `--gray-50` 배경, 회색 보더 하단
- 행 hover: `--gray-50`
- 정렬 가능 컬럼은 헤더에 chevron
- 액션 컬럼: 우측 끝, ghost 아이콘 버튼
- 빈 상태: 행 대신 `EmptyState` 카드 (아이콘 + 메시지 + 1차 액션 버튼)

### 6.6 Empty state

```
┌──────────────────────────────────────┐
│                                      │
│           🛈 (회색 아이콘 32px)        │
│                                      │
│        아직 데이터가 없습니다.         │
│                                      │
│        [ 1차 액션 버튼 ]              │
│                                      │
└──────────────────────────────────────┘
```

- 아이콘: `--gray-300`
- 텍스트: `--gray-500`
- 패딩: 40px 16px (작은 컨테이너는 24px 12px)

### 6.7 알림 (Toast)

`useToast().add({ ... })`로 호출.

| 종류 | color | 아이콘 |
| --- | --- | --- |
| 성공 | `success` | `i-lucide-check-circle` |
| 경고 | `warning` | `i-lucide-alert-triangle` |
| 에러 | `error` | `i-lucide-alert-octagon` |
| 정보 | `primary` | `i-lucide-info` |
| 다운로드 진행 | `primary` | `i-lucide-download` |

위치: 우측 하단 (Nuxt UI 기본).

---

## 7. 아이콘

### 7.1 컬렉션 분담

| 컬렉션 | prefix | 용도 |
| --- | --- | --- |
| **Lucide** | `i-lucide-*` | 일반 UI — 메뉴, 액션, empty state, 버튼 안 아이콘 |
| **Heroicons** | `i-heroicons-*` | Nuxt UI 컴포넌트 기본값, 대안 |
| **Bootstrap Icons** | `i-bi-*` | 시안 매칭 — 채널 카드, 시안에서 가져온 페이지 |

### 7.2 사이즈 스케일

| 컨텍스트 | 크기 |
| --- | --- |
| 메뉴 아이콘 (dropdown 안) | 16px |
| 입력 prepend/append | 16px |
| 버튼 안 아이콘 | 16–18px |
| 카드 헤더 아이콘 | 20–22px |
| 채널 카드 큰 아이콘 | 28–32px (배경 박스 40×40 안에) |
| Empty state 아이콘 | 32px |
| 시스템 페이지(404·에러) | 48–72px |

### 7.3 색

- 일반 UI: `text-gray-500` / `text-gray-700` (컨텍스트에 맞춰)
- 강조 (브랜드): `var(--color-indigo)`
- 액션 색: 부모 버튼의 텍스트 색 따라감

---

## 8. 레이아웃 패턴

### 8.1 페이지 헤더

```vue
<div class="app-container py-8 lg:py-10">
  <header class="mb-6">
    <div class="text-xs text-primary-600 font-medium mb-1">대분류 · 소분류</div>
    <h1 class="text-2xl font-bold tracking-tight">페이지 제목</h1>
    <p class="text-sm text-neutral-500 mt-1">한 줄 설명</p>
  </header>
  <!-- 본문 -->
</div>
```

- 카테고리 텍스트: primary 색 + 12px + medium (브레드크럼 대용)
- 제목: 24px / 700 / `tracking-tight`
- 설명: 14px / `text-neutral-500`

### 8.2 GNB ([AppGnb.vue](../app/components/AppGnb.vue))

```
┌───────────────────────────────────────────────────────────┐
│                       ← max 1200px →                       │
│   Utility Bar (h 32, bg gray-50)                          │
│                          문의  충전  관 관리자 ▾           │
├───────────────────────────────────────────────────────────┤
│   Main GNB (h 64, bg white)                               │
│   로고          서비스 ▾  메시지 발송 ▾  ... 운영가이드    │
└───────────────────────────────────────────────────────────┘
```

- 두 줄 모두 sticky (총 96px 고정)
- 드롭다운: hover로 펼침, 12px 라운드, 8px 24px 그림자
- 첫 항목은 dropdown title (primary 색, pointer-events: none)
- 그룹 사이 dashed divider

### 8.3 Footer ([AppFooter.vue](../app/components/AppFooter.vue))

```
┌───────────────────────────────────────────────────────────┐
│  Footer Upper (black, padding 28)                          │
│  로고 + 슬로건         정책 링크 6개 (우측 정렬)            │
├───────────────────────────────────────────────────────────┤
│  Footer Lower (black, top-border)                          │
│  (주)맑은소프트         사업자 정보 7개 + 카피라이트         │
└───────────────────────────────────────────────────────────┘
```

- 검정 배경 (`#000`)
- 상단 텍스트: 흰색 / 12–15px
- 사업자 정보 회색(`#b0b7bf`)
- 슬로건과 회사명 사이 dashed divider 대신 1px solid `rgba(255,255,255,0.2)`

### 8.4 인증 페이지 (`auth` layout)

```
┌──────────────────────────────────┐
│           gray-50 배경            │
│                                  │
│    🗨 맑은 메시징 (로고)          │
│                                  │
│  ┌──────────────────────────┐   │
│  │                          │   │
│  │   카드 (제목 + 폼)        │   │
│  │                          │   │
│  └──────────────────────────┘   │
│                                  │
│        © 맑은소프트              │
│                                  │
└──────────────────────────────────┘
```

- 가운데 정렬, 카드 max-width 400–480px
- 위 로고 + 카드 + 아래 카피라이트의 3단

### 8.5 시스템 페이지 (`blank` layout)

- 가운데 정렬, gray-50 배경
- 큰 아이콘(48–72px) + 큰 제목(18–22px) + 보조 설명(13–14px) + 1차 액션 버튼
- 색상은 상태별: 404·일반 = primary, 시스템 오류 = error, 네트워크·점검 = warning

---

## 9. 반응형 브레이크포인트

| 이름 | 폭 | 변화 |
| --- | --- | --- |
| `sm` | 640px+ | 작은 폼 가로 정렬, 카드 간격 ↑ |
| `md` | 768px+ | 4컬럼 통계 카드 (2→4) |
| `lg` | 1024px+ | **데스크톱 기준**: GNB 메뉴 펼침, 2단 콘텐츠 적용, utility bar 표시 |
| `xl` | 1280px+ | 패딩 확대, 일부 큰 컴포넌트 |

`< 1024px`:
- GNB 메뉴 → 햄버거 + USlideover 좌측
- Utility bar 숨김 (액션은 슬라이드 메뉴 안에)
- 2단 콘텐츠 → 1단 (보조 영역이 위로)

---

## 10. 접근성

| 항목 | 기준 |
| --- | --- |
| 텍스트 대비 | WCAG AA — 본문 4.5:1, 큰 텍스트 3:1 |
| 포커스 표시 | 모든 포커스 가능 요소에 ring (Nuxt UI/Reka 기본 유지) |
| 키보드 조작 | 메뉴/모달/슬라이드 모두 Tab/Esc/Enter로 조작 가능 |
| 폼 label | 모든 입력에 visible label 또는 `aria-label` |
| 아이콘만 버튼 | `aria-label` 필수 (햄버거·알림 등) |
| 이미지 | `alt` 필수 |
| 동적 알림 | Toast는 `aria-live` (Nuxt UI 기본) |
| 색 의존성 금지 | 색 외에 아이콘/텍스트로도 의미 전달 |

---

## 11. 톤 & 마이크로카피

### 11.1 한국어 작성 규칙

- **존댓말 기본** ("저장합니다", "확인해 주세요").
- 명령형은 짧고 친근하게 ("다시 시도해 주세요" > "재시도").
- 영문 용어는 한국어 우선 → 영문 병기 ("문자메시지(SMS)").
- 숫자·단위는 한국어 표기 ("3건", "1,200 크레딧").
- 날짜: `YYYY-MM-DD HH:mm` (24시간제, KST 가정).
- 통화/크레딧: 천 단위 구분(`,`). 마이너스 차감은 빨간색 + `-` 부호.

### 11.2 빈 상태/오류 톤

| 상황 | 좋은 문장 | 피할 문장 |
| --- | --- | --- |
| 빈 목록 | "아직 발송 이력이 없습니다." | "데이터 없음" |
| 신규 유도 | "첫 발송 시작하기" | "발송하기" (맥락 없음) |
| 일반 오류 | "오류가 발생했습니다. 잠시 후 다시 시도해 주세요." | "Error 500" |
| 권한 부족 | "이 작업을 수행할 권한이 없습니다." | "Forbidden" |
| 발송 한도 초과 | "이번 달 발송 한도(SMS 5,000건)를 초과했습니다." | "Rate limit exceeded" |

### 11.3 위험 액션 컨펌

- 삭제: "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
- 예약 취소: "예약된 발송을 모두 취소합니다."
- 크레딧 사용: "발송 시 N 크레딧이 차감됩니다."
- 위험도 높은 액션은 사유 입력 필드 + 한번 더 확인.

---

## 12. 시안 매핑

### 12.1 정본 자료

| 자료 | URL |
| --- | --- |
| 페이지 목록 (IA 정본) | <https://malgn-notifications.pages.dev/#/pagelists> |
| 페이지 데이터 소스 | <https://malgn-notifications.pages.dev/src/logic/pagelists.js> |
| BackOffice 메뉴 트리 | <https://malgn-notifications.pages.dev/#/backoffice> |
| 사이트맵 + 기능명세 | <https://malgn-notifications.pages.dev/#/sitemap> |
| CSS 정본 (디자인 토큰·컴포넌트 전체) | <https://malgn-notifications.pages.dev/css/base.css> |

### 12.2 base.css → 우리 구현 매핑

| 시안 클래스 | 우리 위치 | 비고 |
| --- | --- | --- |
| `:root` 변수 | [`app/assets/css/main.css`](../app/assets/css/main.css) | 동일 변수명 유지 |
| `.layout-default`, `.page-content` | [`app/layouts/default.vue`](../app/layouts/default.vue) | flex column min-h-100vh |
| `.gnb-*` | [`app/components/AppGnb.vue`](../app/components/AppGnb.vue) | scoped style, 클래스명 그대로 |
| `.footer-upper`, `.footer-lower` | [`app/components/AppFooter.vue`](../app/components/AppFooter.vue) | 시안 그대로 |
| `.app-container` | [`app/assets/css/main.css`](../app/assets/css/main.css) | 시안 `.page-content > .container`를 단순화 |
| `.content-2col` | [`app/assets/css/main.css`](../app/assets/css/main.css) | 그대로 |
| 페이지별 스타일 (SMS·캠페인·템플릿…) | (페이지 작업 시 옮길 예정) | base.css 섹션 참조 |

### 12.3 페이지별 base.css 위치

| 라인 | 섹션 |
| ---: | --- |
| 479 | SMS 발송 |
| 1486 | 알림톡 발송 |
| 2319 | RCS 발송 |
| 3078 | 이메일 템플릿 |
| 3212 | 회원가입 |
| 4053 | 로그인/비밀번호 재설정 |
| 4606 | 충전하기 |
| 5375 | 문의하기 |
| 6022 | 문의 내역 (리스트) |
| 6452 | 문의 내역 (상세) |
| 6799 | 크레딧 관리 |
| 7424 | 계정 관리 |
| 8568 | 복합(플로우) 발송 |
| 9095 | PUSH 발송 |
| 9827 | 발송 조회 |
| 10683 | 통계 |
| 10807 | 주소록 그룹 관리 |
| 11395 | 연락처 관리 |
| 12144 | 수신 거부 관리 |
| 12309 | 발신 번호 관리 |
| 12578 | PUSH 인증 관리 |
| 12868 | RCS 브랜드 관리 |
| 13119 | 도메인 관리 |
| 13403 | 080 수신 거부 |
| 13424 | 발신 프로필 |
| 13630 | SMS 템플릿 |
| 14703 | 카카오톡 템플릿 |
| 15467 | 이메일 템플릿 |
| 15738 | PUSH 템플릿 |
| 16026 | 상세 설정 |
| 16375 | 이메일 발송 |
| 17376 | 캠페인 관리 |
| 18483 | 계약 관리 |

---

## 13. 디자인 변경 / 추가 시 절차

1. **시안에 동일/유사 패턴이 있나?** → 있으면 시안 base.css 참고해서 토큰 그대로 차용.
2. **Nuxt UI에 있나?** → 있으면 그것을 우선 사용 (`UModal`, `UTable` 등).
3. **공통 패턴인가?** → 공통이면 `App*` 컴포넌트로 추출 (예: `AppConfirmDialog`, `AppFilterBar`).
4. **새 색이 필요한가?** → 가능하면 추가하지 말고 기존 토큰으로. 정말 필요하면 `main.css`의 `:root`에 추가하고 이 문서 §2에 등록.
5. **반응형 점검** → 1024px 미만에서 사이드바·utility bar 처리 확인.
6. **접근성 점검** → focus 표시 / `aria-label` / 키보드 조작.

---

## 14. 발송 페이지 아키텍처

> 단발 발송 6종(SMS / 알림톡 / RCS / 이메일 / PUSH / Flow)을 시안 분석으로 도출한 공통 구조·타입·컴포넌트 인벤토리. 캠페인·메시지 관리 페이지도 같은 빌딩블록을 재사용하므로 이 절이 발송 도메인 전체의 토대.

### 14.1 5-카드 페이지 골격

모든 발송 페이지는 동일한 5-카드 골격을 따른다. ①은 Flow 전용 안내 박스이며 나머지 4개는 6종 공통.

```
┌────────────────────────────────────────────────┐
│  ① AppSendInfoCard      (Flow 전용, 안내 박스)  │
├────────────────────────────────────────────────┤
│  ② AppSenderOrFlowCard  (발신/플로우 selector) │
├────────────────────────────────────────────────┤
│  ③ AppRecipientCard     (4-액션 + 치환자 옵션) │
├────────────────────────────────────────────────┤
│  ④ AppMessageCard       (메시지 본문 + 미리보기)│
├────────────────────────────────────────────────┤
│  ⑤ AppSendOptionsCard   (즉시 / 예약)          │
└────────────────────────────────────────────────┘
                       ↓
     AppSendActionsBar (초기화 / 발송하기)
```

| 카드 | 책임 |
| --- | --- |
| ② Sender/Flow | 발신 식별자(채널별 5종) 또는 플로우 selector. "누가/어디로" 메타 |
| ③ Recipient | 직접입력 / 주소록 / 수정 / 삭제 4-액션. 템플릿 채널은 치환자 입력 방식(개별/공통) 추가 |
| ④ Message | 카드 내부 2-col 그리드(좌: 입력 폼 / 우: 채널별 미리보기). 채널이 본질적으로 다른 부분 — `AppChannelMessageCard`로 추출 |
| ⑤ Send Options | 즉시 / 예약 라디오. 예약 선택 시 datetime picker |

### 14.2 채널별 차이 매트릭스

| | SMS | 알림톡 | RCS | 이메일 | PUSH | Flow |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| **Sender** | 발신번호 select | 발신 프로필 검색 | 브랜드+번호 2-단 | 이메일 input | 없음 | 플로우 검색 |
| **Template** | optional | **필수** | optional | optional | optional | (플로우가 템플릿 역할) |
| **발송 목적** | 3-라디오 | template-baked | 3-라디오 | 라디오 또는 static | 2-라디오 (인증 X) | readonly per node |
| **발송 유형** | SMS/LMS/MMS 라디오 | — | **3-단 select** (또는 템플릿 사용 시 static) | — | 기본 / JSON | readonly per node |
| **본문 입력** | textarea | readonly | textarea | textarea(HTML) | input+textarea | readonly per node |
| **카운터** | byte 90/765 | — | char 100 | char 1000(제목) | — | — |
| **AI 다듬기** | ✓ | — | ✓ | ✓ | — | — |
| **치환자** | — | 개별/공통 | 개별/공통 | — | — | 개별/공통 |
| **첨부/페이로드** | — | — | 버튼 빌더 | 파일 업로더 | 6-컬렉션 빌더 | — |
| **미리보기** | iMessage 폰 | 카카오 폰 | RCS 폰(AI 모달에서만) | 이메일 카드 + iframe | Android+iOS 2-up | 선택 노드 폰 |
| **광고 모달** | 080 번호 select | — | — | 3-옵션 수신거부 | — | — |
| **만료/그룹** | — | — | 만료 select | — | 그룹 컬렉션 | — |
| **단가** | 9.9 C | 8.0 C | 12.0 C | 0.65 C | 0.0 C | 노드 합산 |

> **모든 채널 공통**: 5-카드 골격 · 4-액션 수신자 · 즉시/예약 · 초기화·발송하기 · 초기화 컨펌 · 발송 확인 · 주소록 · 직접입력 · 수정 모달.

### 14.3 ChannelMeta 타입

채널별 차이는 단일 메타 객체로 표현. 페이지·컴포넌트는 이 메타를 받아 분기.

```ts
// types/channel.ts
export type ChannelId = 'sms' | 'kakao' | 'rcs' | 'email' | 'push' | 'flow'

export type SenderKind =
  | { kind: 'phone-select' }                                    // SMS
  | { kind: 'profile-search' }                                  // 알림톡
  | { kind: 'brand-and-number' }                                // RCS
  | { kind: 'email-input'; readonlyWhenTemplated: boolean }     // 이메일
  | { kind: 'flow-select' }                                     // Flow

// "이 필드가 노출되었는지 / 잠겼는지"를 표현하는 식별자
export type FieldId =
  | 'sender' | 'purpose' | 'sendType'
  | 'subject' | 'body' | 'ai' | 'attach'
  | 'buttons' | 'extra' | 'links'

// 발송 유형(SMS) 또는 메시지 유형(알림톡)에 따른 sub-mode 정의
export type BodyVariant = {
  fields: FieldId[]                                              // 이 sub-mode에서 노출되는 필드
  subject?: { counter: { unit: 'byte' | 'char'; max: number } }
  body?:    { counter?: { unit: 'byte' | 'char'; max: number } }
  attach?: {
    kind: 'image-only' | 'any'
    maxCount: number
    perFileBytes?: number
    totalBytes?: number
    resolution?: { maxW: number; maxH: number }
    allowedExts?: string[]                                       // 화이트리스트 (MMS는 jpg/jpeg)
    bannedExts?: string[]                                        // 블랙리스트 (이메일은 .js .exe 등)
    maxFilenameLength?: number
  }
}

export type ChannelMeta = {
  id: ChannelId
  label: string

  sender?: SenderKind                                            // PUSH는 없음
  template: { mode: 'optional' | 'required' }
  purpose: { mode: 'none' | '2-radio' | '3-radio' | 'static' | 'template-baked' }

  // 본문은 sub-mode 변형 구조 — SMS는 라디오, 알림톡은 템플릿 baked, RCS는 3-단 select
  body: {
    variantBy?:
      | { kind: 'sms-type'; control: 'radio'; options: ('sms' | 'lms' | 'mms')[] }
      | { kind: 'kakao-message-type'; control: 'template-baked' }
      | { kind: 'rcs-3-stage'                                    // RCS: 템플릿 사용 안함 시 3-단 select / 사용 시 static
          stages: [
            { label: 'messageType';  options: string[] }          // SMS / MMS / ... (1단)
            { label: 'deliveryType'; options: string[] }          // 'standalone' / ... (2단)
            { label: 'fallbackType'; options: string[] }          // 'SMS' / 'unified-SMS' / ... (3단, 1단 선택에 종속)
          ] }
    variants: Record<string, BodyVariant>                         // 키 = sub-mode 식별자 (sms·lms·mms / basic·extra / default 등)
    htmlStyle?: boolean
  }

  ai?: boolean

  // 치환자 패널 (개별/공통 라디오 + 공통 input)
  // template.mode='used' 또는 'required'일 때만 활성 — 모든 템플릿 채널 공통
  // 개별 모드일 때 후속 input row는 숨겨지고, 수신자 표에 치환자 컬럼이 추가됨
  substitution?: 'individual-and-common'

  // 점진적 disclosure — 이 필드들이 채워져야 후속 카드가 활성화됨
  // 예: 알림톡 = { recipient: ['sender','template'], message: ['sender','template'] }
  prerequisites?: {
    recipient?: ('sender' | 'template')[]
    message?:   ('sender' | 'template')[]
  }

  // 템플릿 사용 시 readonly로 잠기는 필드 — 채널마다 lock 범위가 다름
  // 예: SMS    = ['sender','purpose','sendType','ai']            (subject/body/attach는 편집 가능)
  //     알림톡 = ['sender','purpose','sendType','attach','ai']    (body는 templateBodyEdit으로 별도 처리)
  //     RCS    = ['sender','purpose','sendType','ai']             (buttons·rcsExpiry는 편집 가능)
  //     이메일 = ['sender','purpose','subject','ai']
  templateLockedFields?: FieldId[]

  // 본문(body) textarea의 편집 모드 — 'body'가 templateLockedFields에 없을 때의 동작 결정
  //   'readonly'      — 잠금 (보이긴 함)
  //   'variable-only' — 본문은 잠그되 #{var} / {{%var%}} 변수 영역만 인라인 편집 (알림톡)
  //   'editable'      — 전체 편집 가능
  // 미지정 시 templateLockedFields의 'body' 포함 여부로 readonly/editable 결정.
  templateBodyEdit?: 'readonly' | 'variable-only' | 'editable'

  payload?: {
    buttons?: { mode: 'readonly' | 'editable'; types: string[] }
    rcsExpiry?: boolean
    pushExtras?: ('media' | 'androidMedia' | 'iosMedia' | 'androidLargeIcon' | 'group')[]
    inputMode?: 'basic-or-json'
  }

  preview: 'imessage' | 'kakao' | 'rcs' | 'email-iframe' | 'android-and-ios' | 'none'

  adNotice?: 'sms-080' | 'email-unsubscribe-3opt'
  pricePerUnit: number

  recipientForm: {
    fields: ('alias' | 'phone' | 'email' | 'token' | 'pushType' | 'substitution')[]
    addressBook: {
      keyColumn: 'phone' | 'email' | 'token'
      // 우측 패널 종류 — 선택 전 empty state("좌측에서 수신자를 선택해 주세요"·"수신자를 선택하세요")는
      // 모든 rightPanel 공통이므로 별도 종류 아님
      rightPanel?: 'edit' | 'preview'                              // 알림톡·RCS=edit / PUSH=preview / 나머지=undefined
    }
  }
}
```

#### 14.3.1 SMS 메타 예시

```ts
const SMS: ChannelMeta = {
  id: 'sms', label: '문자메시지',
  sender: { kind: 'phone-select' },
  template: { mode: 'optional' },
  purpose: { mode: '3-radio' },
  body: {
    variantBy: { kind: 'sms-type', control: 'radio', options: ['sms', 'lms', 'mms'] },
    variants: {
      sms: { fields: ['body'],
             body: { counter: { unit: 'byte', max: 90 } } },
      lms: { fields: ['subject', 'body'],
             subject: { counter: { unit: 'byte', max: 40 } },
             body:    { counter: { unit: 'byte', max: 2000 } } },
      mms: { fields: ['subject', 'body', 'attach'],
             subject: { counter: { unit: 'byte', max: 40 } },
             body:    { counter: { unit: 'byte', max: 2000 } },
             attach:  { kind: 'image-only', maxCount: 3,
                        perFileBytes: 300_000, totalBytes: 800_000,
                        resolution: { maxW: 1000, maxH: 1000 },
                        allowedExts: ['jpg', 'jpeg'],
                        maxFilenameLength: 45 } },
    },
  },
  ai: true,
  substitution: 'individual-and-common',                          // template.mode='used'일 때 활성
  templateLockedFields: ['sender', 'purpose', 'sendType', 'ai'],  // 본문·첨부는 편집 가능
  preview: 'imessage',
  adNotice: 'sms-080',
  pricePerUnit: 9.9,
  recipientForm: {
    fields: ['phone', 'alias', 'substitution'],
    addressBook: { keyColumn: 'phone' },
  },
}
```

#### 14.3.2 알림톡 메타 예시 (점진적 disclosure + 메시지 유형 baked)

```ts
const KAKAO: ChannelMeta = {
  id: 'kakao', label: '알림톡',
  sender: { kind: 'profile-search' },
  template: { mode: 'required' },
  purpose: { mode: 'template-baked' },
  body: {
    variantBy: { kind: 'kakao-message-type', control: 'template-baked' },
    variants: {
      basic: { fields: ['body'] },                               // 기본형
      extra: { fields: ['body', 'extra', 'links', 'buttons'] },  // 부가 정보형
      // channelAdd, auth 등 추후 추가 — §14.8 TBD-4
    },
  },
  substitution: 'individual-and-common',
  prerequisites: {
    recipient: ['sender', 'template'],
    message:   ['sender', 'template'],
  },
  templateLockedFields: ['sender', 'purpose', 'sendType', 'attach', 'ai'],
  templateBodyEdit: 'variable-only',                              // 본문은 잠그되 변수 영역만 편집
  payload: { buttons: { mode: 'readonly', types: ['web', 'app', 'phone', 'message'] } },
  preview: 'kakao',
  pricePerUnit: 8.0,
  recipientForm: {
    fields: ['phone', 'alias', 'substitution'],
    addressBook: { keyColumn: 'phone', rightPanel: 'edit' },
  },
}
```

### 14.4 App* 컴포넌트 인벤토리

추출 우선순위 = 사용 채널 수 + 의존성. 시안 분석으로 도출한 6채널 발송 페이지 기준.

#### 1순위 — 전 채널 토대 (6/6, 즉시 추출)

| 컴포넌트 | 역할 |
| --- | --- |
| `AppSendFormCard` | 5-카드의 카드 래퍼 (헤더 + 본문 + 접기 + **`:locked` prop**). 점진적 disclosure 채널(알림톡/RCS/Flow)은 prerequisite 미충족 시 본문 슬롯이 안내 문구로 대체 |
| `AppRecipientActions` | 직접입력 / 주소록 / 수정 / 삭제 4-버튼 행. 표 체크박스 선택 수에 따라 수정/삭제 enable 토글 |
| `AppRecipientTable` | 수신자 카드 본문에 임베드되는 표 (체크박스 + 별칭 + 키값 + (개별 치환자 모드일 때) 치환자 컬럼). 키값 컬럼은 채널별로 휴대폰/이메일/토큰 |
| `AppSendOptionsCard` | 즉시 / 예약 라디오 + 예약 선택 시 `AppDateTimePicker` row 노출 |
| `AppDateTimePicker` | Nuxt UI `UCalendar`(한국어 로케일) + 시간 select 조합. KST 기준, 과거 시각 불가 validation. 모든 발송 페이지의 "예약 일시"에서 재사용 |
| `AppSendActionsBar` | 초기화(neutral) + 발송하기(primary) |
| `AppConfirmDialog` | 단일 메시지 컨펌. 이미 [AppConfirmDialog.vue](../app/components/AppConfirmDialog.vue) 존재 |
| `AppSendConfirmDialog` | 비용 3-셀 + 안내. ChannelMeta props. 채널 multi-value 지원(Flow) |
| `AppAddressBookDialog` | 개별/그룹 탭 + 검색 + 표 + 페이지네이션. `columns` slot · `rightPanel`은 `'edit' \| 'preview' \| undefined` 3종 — 선택 전 empty state("좌측에서 수신자를 선택해 주세요" 등)는 모든 rightPanel 공통이라 별도 종류 아님. 그룹선택 탭 컬럼(그룹명 + 연락처 수)은 채널 무관 내장 |
| `AppRecipientFormDialog` | 직접입력·수정 통합. 필드 prop on/off |

#### 2순위 — 단일 채널 공통 (5/6, Flow 제외)

| 컴포넌트 | 역할 |
| --- | --- |
| `AppTemplateUseToggle` | "사용 안함/사용" 라디오 + 선택 버튼 (알림톡은 필수라 토글 없이 선택 버튼만) |
| `AppTemplatePickerDialog` | 좌측 리스트 + 우측 프리뷰 slot. **`:tabs` prop**으로 SMS의 `SMS(단문) / LMS(장문) / MMS(포토)` 3-탭 지원. **`card` slot**으로 카드 렌더링 위임 (SMS는 텍스트 카드, MMS는 이미지+텍스트 4-col 카드, 알림톡은 단순 row 표) |

#### 3순위 — 핵심 추상화

| 컴포넌트 | 역할 |
| --- | --- |
| `AppChannelMessageCard` | **메시지 카드 본문 + 미리보기 전체**. 단일 채널 페이지는 `mode="edit"`, Flow는 `mode="readonly"`, 캠페인은 둘 다. ChannelMeta + value 받음. **발송/Flow/캠페인을 연결하는 핵심 추상화** |

#### 4순위 — 다채널 공유 (2~3채널)

| 컴포넌트 | 등장 | 역할 |
| --- | --- | --- |
| `AppAIRewriteDialog` | SMS / RCS / 이메일 | 좌측 챗 + quick btns + 우측 채널별 프리뷰 slot |
| `AppSenderSearchSelect` | 알림톡 / RCS / Flow | 검색 가능한 selector. 시안 클래스 `kakao-profile-select`가 3곳에서 재사용됨. 옵션 hover = light blue |
| `AppSubstitutionInput` | **템플릿 사용 시 모든 채널** (SMS·알림톡·RCS·이메일·PUSH·Flow) | 개별/공통 라디오. **공통 모드에서만** 후속 input row 노출. 개별 모드일 때는 `AppRecipientTable`에 치환자 컬럼이 추가됨 |
| `AppCollectionBuilder` | RCS / PUSH / 알림톡(readonly) | "+ 추가" 버튼 + row 리스트 + per-row 편집 모달 |
| `AppPhonePreview` | SMS / 알림톡 / RCS / PUSH / Flow(내부 재사용) | 베이스 셸 + **본문 slot + 이미지 slot**(MMS). **헤더(이름/번호) prop은 reactive** — 발신 브랜드·번호 변경 시 즉시 반영(RCS) |
| `AppByteCounter` | SMS / RCS / 이메일 | byte / char + textarea-corner / input-inline 변형 |

#### 5순위 — 채널 전용

| 컴포넌트 | 채널 | 역할 |
| --- | --- | --- |
| `AppFileUploader` + `AppFileGuide` | 이메일 / SMS-MMS | 파일 선택 + 제약 리스트. **`:rules` prop**(`BodyVariant.attach`)으로 ruleset 받음 — 이메일(any · 10개 · 30MB · banned exts · 45자) vs MMS(image-only · 3개 · 300KB·800KB합산 · 1000×1000) |
| `AppTemplateVariableTextarea` | 알림톡 | 본문은 잠그되 `#{var}` / `{{%var%}}` 변수 영역만 인라인 편집 가능한 특수 textarea. `templateBodyEdit='variable-only'`일 때 사용. 변수 영역은 contenteditable span으로 렌더링, 본문은 readonly text |
| `AppEmailPreview` | 이메일 | subject + meta + iframe srcdoc + 텍스트/HTML 토글 |
| `AppMultiDevicePreview` | PUSH | Android + iOS 2-up 잠금화면 |
| `AppPayloadJsonToggle` | PUSH | basic / json 입력 모드 토글 |
| `AppHelpTooltip` | PUSH 외 다수 예상 | `?` 아이콘 + title tooltip |
| `AppAdNoticeSms080Dialog` | SMS | 광고 안내 + 080 번호 선택 |
| `AppAdNoticeEmailUnsubDialog` | 이메일 | 광고 안내 + 3-옵션 수신거부 문구 |
| `AppFlowOrderChips` | Flow | 채널 chip 시퀀스 (SMS > 알림톡) |
| `AppFlowManagerDialog` | Flow | 플로우 목록 + 생성/수정 (페이지형 대형 모달) |

#### 6순위 — Provide/Inject 컨텍스트

| 항목 | 역할 |
| --- | --- |
| `templateMode` provide | 카드의 자식 컴포넌트가 `inject('templateMode')` 받아 자동으로 readonly/disabled 전환. 각 컴포넌트에 `:disabled`를 일일이 prop drilling하지 않기 위함 |

### 14.5 모달 카탈로그

채널 × 모달 매트릭스. 폭은 가장 큰 변형 기준. ✓ = 있음 · — = 없음.

| 모달 | 폭 | SMS | 알림톡 | RCS | 이메일 | PUSH | Flow |
| --- | ---: | :-: | :-: | :-: | :-: | :-: | :-: |
| 초기화 컨펌 | 400 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 발송 확인 | 800 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 주소록 선택 | 800 | 단순 | 편집 | 편집 | 단순 | 프리뷰 | 단순 |
| 직접입력 | 480 | ✓ | ✓ | ✓ | ✓ | 멀티(토큰) | ✓ |
| 수정 | 480 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 템플릿 선택 | 800–1000 | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| AI 문장 다듬기 | 1200 | ✓ | — | ✓ | ✓ | — | — |
| 광고 안내 | 480–800 | 080 | — | — | 수신거부 3-opt | — | — |
| RCS 버튼 추가 | 400 | — | — | ✓ | — | — | — |
| PUSH 버튼/미디어/그룹 | 480 | — | — | — | — | ✓ (×6) | — |
| 플로우 생성 관리 | 큼 | — | — | — | — | — | ✓ |

> **모달 푸터 버튼 색** — 모든 모달의 **확인 버튼**은 `--color-sky-vivid` (#027CFA) 톤(시안 그라데이션). 본문 액션의 primary indigo와 구별. **취소 버튼**은 흰 배경 + 검정 1px 보더 + 검정 텍스트 (`UButton color="neutral" variant="outline"` 권장).
>
> **선택 행 강조** — 표 행 hover/selected 시 `--color-sky-soft` (#E5F4FE) 배경 + `--color-sky-vivid` 1px 보더. 표 행 hover는 일반 `--gray-50`이 아닌 sky 톤 사용 (시안 일관).

### 14.6 Flow 처리

Flow는 단일 채널 페이지와 **별도 패밀리가 아니다** — 동일한 5-카드 골격에 다음만 다르다:

- **Sender 자리**에 플로우 selector (`AppSenderSearchSelect` 재사용)
- **메시지 카드 내부**: 발송 순서 chip(`AppFlowOrderChips`) + 채널 전환 select + 선택 노드의 `AppChannelMessageCard`(readonly 모드)
- **발송 확인 모달**의 채널/단가 필드가 multi-value

따라서 `ChannelId`에 `'flow'`를 포함시키고, 페이지 셸은 동일하게 처리한다. 플로우의 노드 정의·순서는 별도 `AppFlowManagerDialog`에서만 편집.

### 14.7 구현 로드맵

1. **공용 1·2순위 컴포넌트** — `AppSendFormCard`, `AppRecipientActions`, `AppSendOptionsCard`, `AppSendActionsBar`, `AppSendConfirmDialog`, `AppAddressBookDialog`, `AppRecipientFormDialog`, `AppTemplateUseToggle`, `AppTemplatePickerDialog`.
2. **ChannelMeta 정의 + 6채널 메타 작성** — [`types/channel.ts`](../app/types/channel.ts) + [`composables/useChannelMeta.ts`](../app/composables/useChannelMeta.ts).
3. **`AppChannelMessageCard` + 채널별 sub** — `SmsMessageBody` / `KakaoMessageBody` / `RcsMessageBody` / `EmailMessageBody` / `PushMessageBody` 5개. 5-카드 골격에서 가장 위험·가치 높은 한 곳.
4. **`/send/sms` 페이지 구현** — 위 컴포넌트만으로 완성되는지 검증. 빠진 게 보이면 인벤토리 보강.
5. **`/send/kakao`** → **`/send/rcs`** → **`/send/email`** → **`/send/push`** 순으로 확장.
6. **`/send/flow`** — `AppFlowOrderChips`, `AppFlowManagerDialog` 추가하면 완성.

> 4단계까지 끝나면 발송 외 페이지(이력·통계·캠페인·메시지 관리)에서도 같은 빌딩블록이 70% 이상 재사용 가능. 5단계 이후는 추출이 아닌 적용 단계.

### 14.8 미정 / TBD

시안 확인 또는 정책 결정이 필요한 항목들. 결정될 때마다 §14 본문에 반영하고 이 절에서 제거.

| # | 항목 | 미정 사유 | 결정 후보 |
| --- | --- | --- | --- |
| TBD-3 | 이메일·PUSH의 템플릿 사용 모드에서 치환자 패널 활성 여부 | 분석한 시안에서 SMS·알림톡·RCS는 활성 확인됨. 이메일·PUSH는 해당 상태 캡쳐 미확보 | 시안 추가 캡쳐로 확인 |
| TBD-4 | 알림톡 메시지 유형 풀세트 | 시안에서 기본형·부가 정보형만 확인. 채널추가형/인증형 등 미확인 | 시안 정본 또는 NHN Bizmsg API 명세 |
| TBD-5 | RCS 메시지 유형 풀세트 (버튼 외 미디어·캐러셀 등) | 시안에서 "템플릿/LMS/기본형" 단일 케이스만 분석됨 | 시안 추가 캡쳐로 확인 |
| TBD-6 | PUSH의 발신 식별자 (앱/인증서 select) 위치 | 발송 페이지에는 없음 — 발신 정보 메뉴에서 별도 관리되나, 발송 시점 디폴트 선택 UX 미확정 | 백엔드 API 명세 + 운영 시나리오 |

> 해소된 항목: TBD-1(알림톡 본문 = 변수 치환자만 편집, `AppTemplateVariableTextarea` 도입) · TBD-2(예약 일시 = Nuxt UI 조합, `AppDateTimePicker` 도입). 2026-05-13 결정.

---

## 15. 변경 이력

새 토큰·컴포넌트·패턴 도입 시 이 절에 한 줄 추가.

| 날짜 | 변경 | PR/커밋 |
| --- | --- | --- |
| 2026-05-11 | 시안 정본 기반 디자인 토큰 도입, GNB·Footer 구조 시안 그대로 매칭 | 초기 부트스트랩 |
| 2026-05-12 | 콘텐츠/GNB/Footer 폭 1200px 통일, Utility Bar 분리, 메뉴 8개로 통합 | — |
| 2026-05-13 | §14 발송 페이지 아키텍처 신설 — 6채널+Flow 시안 분석으로 5-카드 골격 / ChannelMeta 타입 / App* 컴포넌트 인벤토리 / 모달 카탈로그 / 구현 로드맵 정본화 | — |
| 2026-05-13 | §14 정밀 분석 반영 — 점진적 disclosure(prerequisites) / body sub-mode(variantBy·variants·BodyVariant) / 치환자 패널을 모든 템플릿 채널 공통으로 격상 / templateLockedFields 매트릭스 / `AppRecipientTable` 1순위 추가 / `AppFileUploader`에 ruleset prop / 모달 컨펌 sky-vivid 명시 / §14.8 TBD 6항목 도입 | — |
| 2026-05-13 | RCS 시안 정밀 분석 — RCS 점진적 disclosure 가정 철회(처음부터 모든 카드 활성) / 발송 유형은 3-단 select(`rcs-3-stage`, 템플릿 사용 안함 시) 또는 static(사용 시) / `rightPanel`에 `'instruction'` 추가 / `AppPhonePreview` 헤더 prop reactive 명시 / `AppAddressBookDialog` 그룹 탭 컬럼 내장 명시 | — |
| 2026-05-13 | RCS 템플릿 사용 모드 정밀 — `rightPanel`을 `'edit' \| 'preview' \| undefined` 3종으로 단순화(`'instruction'` 제거, empty state는 모든 rightPanel 공통) / RCS 템플릿 사용 시 `templateLockedFields` 확정(sender/purpose/sendType/body/ai · buttons·rcsExpiry는 편집 가능) | — |
| 2026-05-13 | TBD-1·TBD-2 해소 — `ChannelMeta.templateBodyEdit` 필드 도입(`'readonly' \| 'variable-only' \| 'editable'`), 알림톡 = variable-only / `AppTemplateVariableTextarea`(5순위 알림톡 전용) 추가 / `AppDateTimePicker`(1순위, Nuxt UI 조합) 추가 / `AppSendOptionsCard`가 picker 의존 | — |
