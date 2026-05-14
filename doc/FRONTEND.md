# Frontend 개발 가이드 — 맑은 메시징 사용자단

이 문서는 [`malgn-noti`](..) 사용자단(고객 콘솔)의 **디자인 시스템 + HTML/CSS/JS 코딩 컨벤션**을 정리합니다. 운영자 콘솔(`malgn-noti-admin`)도 동일 스택이므로 같은 규칙을 따릅니다.

> 프로젝트 전반의 큰 그림은 [CLAUDE.md](../CLAUDE.md), 디자인 정본은 [시안 사이트](https://malgn-notifications.pages.dev/#/pagelists)를 참조.

---

## 1. 기술 스택 한눈에

| 영역 | 선택 | 비고 |
| --- | --- | --- |
| 프레임워크 | Nuxt 3 + `future.compatibilityVersion: 4` | 소스는 `app/` 디렉토리 |
| 언어 | TypeScript (strict) | `any` 금지 |
| UI | **Nuxt UI v3 (MIT)** | Reka UI + Tailwind v4 통합 |
| 스타일 | Tailwind v4 + scoped `<style>` + CSS 변수 | `@nuxtjs/tailwindcss` **설치 금지** |
| 아이콘 | Iconify (`lucide`, `heroicons`, `bi`) | 시안 매핑용 `bi` 포함 |
| 폰트 | Noto Sans KR | `--font-sans` |
| 상태 | Pinia (`@pinia/nuxt`) | 인증/크레딧/사용자 |
| 검증 | Zod | 폼/응답 |
| 배포 | Cloudflare Pages | `nitro.preset = 'cloudflare-pages'` |

---

## 2. 디렉토리 구조 (Nuxt 4 호환)

```
app/
├── app.vue                  # 진입 (UApp + NuxtLayout + NuxtPage)
├── app.config.ts            # Nuxt UI 테마(primary/neutral)
├── error.vue                # Nuxt 루트 에러 핸들러
├── assets/
│   └── css/main.css         # Tailwind + 시안 디자인 토큰
├── components/
│   ├── AppGnb.vue           # 상단 GNB
│   ├── AppFooter.vue        # 푸터
│   ├── AppConfirmDialog.vue # 위험 액션 컨펌
│   └── AppPagePlaceholder.vue
├── composables/
│   ├── useApi.ts            # $fetch 래퍼 (인증/에러 표준화)
│   ├── useExportJob.ts      # 비동기 다운로드 요청
│   └── useAiTemplate.ts     # AI 템플릿 생성
├── layouts/
│   ├── default.vue          # GNB + 본문 + Footer
│   ├── auth.vue             # 중앙 카드 (로그인/회원가입)
│   └── blank.vue            # 슬롯만 (단독 시스템 페이지)
├── middleware/
│   └── auth.global.ts
├── pages/                   # 자동 라우팅 (시안 IA 기준 16카테고리)
├── stores/
│   └── auth.ts              # Pinia
└── types/
    ├── domain.ts            # Channel, Tenant, User 등
    └── api.ts               # Paginated, ExportJob 등
```

루트:
- `nuxt.config.ts` — modules / nitro / app / runtimeConfig
- `tsconfig.json` — `extends: ./.nuxt/tsconfig.json`
- `eslint.config.mjs` — `withNuxt()`
- `.env.example` — 환경변수 템플릿

---

## 3. 디자인 시스템

### 3.1 색상 토큰 (CSS 변수 — [main.css](../app/assets/css/main.css))

시안 정본의 색상을 그대로 가져옵니다. **Tailwind 임의값(`bg-[#...]`)으로 색을 직접 박지 말고 변수를 사용**합니다.

```
--primary-color: #6366f1   /* Nuxt UI indigo-500과 동일 */
--primary-hover: #4f46e5

/* 회색 11단계 (Tailwind gray 동일) */
--gray-50 ~ --gray-900

/* 브랜드 보조 */
--color-sky:        #4FC0FC   /* 아바타·옅은 강조 */
--color-sky-vivid:  #027CFA   /* '충전' pill, 강조 링크 */
--color-sky-soft:   #E5F4FE   /* '문의' pill 배경, 팁 카드 */
--color-indigo:     #6756ED   /* 브랜드 인디고 — 회원가입 pill, 메뉴 아이콘 */

/* 레이아웃 */
--gnb-height: 64px
--content-max: 1320px
```

### 3.2 Nuxt UI 테마 ([app.config.ts](../app/app.config.ts))

```ts
export default defineAppConfig({
  ui: {
    colors: { primary: 'indigo', neutral: 'slate' }
  }
})
```

`UButton color="primary"` 등은 자동으로 indigo 토큰을 사용합니다. **하드코딩한 색상이 아니라 컴포넌트 prop으로 색을 표현하는 것을 우선**합니다.

### 3.3 폰트

```
font-family: 'Noto Sans KR', ui-sans-serif, system-ui, -apple-system, ...;
```

전역 `<link rel="stylesheet" href="...">`로 Google Fonts에서 로드 ([nuxt.config.ts](../nuxt.config.ts) `app.head.link`).

### 3.4 레이아웃 폭

| 영역 | max-width | padding |
| --- | --- | --- |
| GNB (`.gnb-inner`) | 화면 폭 | 24px |
| 본문 (`.app-container`) | **1200px** | 24px |
| 푸터 (`.footer-container`) | 1200px | 24px |

### 3.5 2단 콘텐츠 (`.content-2col`)

```css
display: grid;
grid-template-columns: 1fr 360px;
gap: 32px;
```

`<= 1024px`에서 1단으로 접히고, 보조 영역(`.content-2col-aside`)은 위로 올라옵니다.

---

## 4. HTML / Vue 작성 규칙

### 4.1 컴포넌트 형식

- **반드시 `<script setup lang="ts">`**. Options API 금지.
- 한 파일에 한 컴포넌트.
- 파일명: PascalCase (`AppGnb.vue`).
- 자체 컴포넌트는 **`App*` 접두사**, Nuxt UI는 자동 `U*` — 두 네임스페이스로 구분.

### 4.2 페이지 컴포넌트 템플릿

placeholder 단계의 표준:

```vue
<script setup lang="ts">
useHead({ title: 'XXX' })
</script>

<template>
  <AppPagePlaceholder
    title="XXX"
    category="대분류 · 소분류"
    description="간단한 설명"
  />
</template>
```

본격 구현 시:

```vue
<script setup lang="ts">
useHead({ title: 'XXX' })

// 1. 타입 / 스키마 (Zod)
// 2. 상태 (ref/computed)
// 3. 데이터 fetch (useFetch / useApi)
// 4. 핸들러
</script>

<template>
  <div class="app-container py-8">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">XXX</h1>
      <p class="text-sm text-gray-500 mt-1">설명</p>
    </header>
    <!-- 본문 -->
  </div>
</template>

<style scoped>
/* 페이지 전용 스타일 */
</style>
```

### 4.3 페이지 메타 (`definePageMeta`)

| 페이지 종류 | 설정 |
| --- | --- |
| 일반 (GNB + Footer) | (기본, 설정 없음) |
| 로그인/회원가입/재설정 | `definePageMeta({ layout: 'auth', auth: false })` |
| 404/시스템 에러/점검 | `definePageMeta({ layout: 'blank', auth: false })` |
| 리다이렉트만 하는 페이지 | `definePageMeta({ layout: false })` |

### 4.4 자동 임포트 (Nuxt 4)

다음 API/유틸은 import 없이 사용 가능:
- Vue: `ref`, `computed`, `watch`, `onMounted`, `defineProps`, `defineEmits`, `defineModel`
- Nuxt: `useHead`, `useState`, `useRoute`, `useRouter`, `useFetch`, `$fetch`, `navigateTo`, `useRuntimeConfig`, `useNuxtApp`, `useToast`
- Components: `app/components/` 아래 전부, Nuxt UI `U*` 전부
- composables: `app/composables/` 아래 전부 (`useApi`, `useExportJob` 등)
- stores: `app/stores/` 아래 전부 (`useAuthStore`)

### 4.5 접근성

- form 요소에 label 또는 `aria-label` 필수
- 키보드 조작 가능 — Nuxt UI(Reka UI)가 대부분 처리해 줍니다
- focus ring 유지 (Tailwind 기본 `focus-visible:ring-*` 또는 Nuxt UI 기본 스타일)
- 한국어 콘텐츠: `<html lang="ko">` (이미 `nuxt.config.ts`에서 설정)

---

## 5. CSS 작성 규칙

### 5.1 우선순위

1. **Nuxt UI 컴포넌트의 색·간격·라운드 기본값** 우선 사용
2. 필요하면 Nuxt UI 컴포넌트의 `class` prop 또는 `:ui` prop으로 미세 조정
3. 자체 CSS는 **`<style scoped>`** + CSS 변수(`var(--gray-200)` 등)
4. 마지막 수단으로 Tailwind 임의값 (`text-[#1f2937]`)

### 5.2 시안 매칭 CSS

시안 정본의 클래스명(`.gnb-*`, `.footer-*`, `.layout-default` 등)을 그대로 차용해도 좋습니다 — base.css와 1:1 매핑이 되어 유지보수가 쉬워집니다.

예 ([AppGnb.vue](../app/components/AppGnb.vue)):

```vue
<style scoped>
.gnb {
  position: sticky;
  top: 0;
  z-index: 1030;
  background: #fff;
  border-bottom: 1px solid var(--gray-200);
  height: var(--gnb-height);
}
.gnb-nav-item:hover .gnb-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
</style>
```

### 5.3 절대 하지 말 것

- `@nuxtjs/tailwindcss` 설치 (Nuxt UI 모듈이 Tailwind를 통합 관리)
- 인라인 `style="color: #6366f1"` 같은 하드코딩 (단, 동적 색상은 인라인 OK)
- 전역 `:root` 변수를 컴포넌트 안에서 재정의 (예외적인 경우만)
- `!important` 남용 (Tailwind v4의 우선순위가 충분히 강합니다)

### 5.4 다크 모드

현 단계: 라이트 모드 단일. CSS 변수가 다크 호환 가능한 구조라 추후 `:root[data-theme="dark"]`에서 변수 재정의로 도입.

---

## 6. JS / TS 작성 규칙

### 6.1 타입

- **`any` 금지** (불가피하면 `unknown` 후 narrow)
- 도메인 타입은 [`app/types/domain.ts`](../app/types/domain.ts), API 타입은 [`app/types/api.ts`](../app/types/api.ts)
- props/emits는 제네릭 형태:
  ```ts
  defineProps<{ title: string; count?: number }>()
  defineEmits<{ confirm: []; cancel: [] }>()
  ```
- v-model은 `defineModel`:
  ```ts
  const open = defineModel<boolean>('open', { default: false })
  ```

### 6.2 API 호출

직접 `$fetch` 호출 대신 항상 [`useApi()`](../app/composables/useApi.ts):

```ts
const api = useApi()
const items = await api<Paginated<Item>>('/messages', {
  query: { page: 1, channel: 'sms' }
})
```

장점:
- baseURL / credentials / Accept 자동
- 401 → `/login` 리다이렉트 자동
- 에러 표준화

### 6.3 composable 패턴

- 파일명·함수명 모두 `use*`로 시작
- 한 책임에 집중 (`useApi`, `useExportJob`, `useAiTemplate`)
- 반환은 객체로 (`return { data, refresh }` 같은 형태)

### 6.4 Pinia store

- 파일: `app/stores/{name}.ts` → 자동 import (`useXxxStore`)
- 옵션 API 형식 (Pinia 표준):
  ```ts
  export const useAuthStore = defineStore('auth', {
    state: () => ({ ... }),
    getters: { ... },
    actions: { async logout() { ... } }
  })
  ```

### 6.5 검증 (Zod)

폼·외부 응답은 Zod로 파싱:

```ts
import { z } from 'zod'

const SendSmsSchema = z.object({
  to: z.string().min(1),
  body: z.string().min(1).max(2000)
})
type SendSms = z.infer<typeof SendSmsSchema>
```

### 6.6 시간

UTC ISO 8601 (`2026-05-12T03:04:05Z`)로 주고받고, 표시용 변환은 프론트엔드 책임. 라이브러리 미정 (Day.js / date-fns 검토).

---

## 7. Nuxt UI 컴포넌트 매핑 가이드

시안의 반복 패턴 → Nuxt UI 컴포넌트 매핑.

| 시안 패턴 | Nuxt UI / 자체 컴포넌트 |
| --- | --- |
| 모달 (확인/알림) | `UModal` 또는 `AppConfirmDialog` |
| 패널형 팝업(수신자 정보 PU, 발송 컨펌 PU 등) | `USlideover` (옆에서 슬라이드) |
| 다운로드 요청 완료 토스트 | `useToast()` → 내부에서 `UNotification` 표시 |
| 채널/카테고리 트리 | `UNavigationMenu` (수직) 또는 자체 `AppCategoryTree` |
| 목록 + 정렬 + 페이징 | `UTable` + `UPagination` + 공용 `AppFilterBar` |
| 폼 + 검증 | `UForm` + `UFormField` + Zod 스키마 |
| 드롭다운 메뉴 | `UDropdownMenu`(click) 또는 시안 hover 스타일은 자체 CSS |
| 라디오 카드 / 체크박스 | `URadioGroup`, `UCheckbox` |
| 입력 | `UInput`, `UTextarea`, `USelect`, `UInputNumber` |
| 토글 | `USwitch` |
| 탭 | `UTabs` |
| 아바타 | `UAvatar` |
| 카드 | `UCard` (또는 직접 div + 시안 스타일) |
| 배지 | `UBadge` |
| 알림 박스 | `UAlert` |

`UModal` 사용 예 (위험 액션 컨펌):

```vue
<AppConfirmDialog
  v-model:open="open"
  title="이 캠페인을 삭제할까요?"
  description="이미 발송된 메시지는 영향을 받지 않습니다."
  confirm-color="error"
  confirm-label="삭제"
  @confirm="onDelete"
/>
```

---

## 8. 아이콘

### 8.1 컬렉션 (이미 설치됨)

| 컬렉션 | 용도 | prefix |
| --- | --- | --- |
| `lucide` | 일반 UI 아이콘 (메뉴/버튼/empty state) | `i-lucide-...` |
| `heroicons` | Nuxt UI 기본/대안 | `i-heroicons-...` |
| `bi` (Bootstrap Icons) | 시안 매칭용 (채널 카드 등) | `i-bi-...` |

### 8.2 사용 예

```vue
<UIcon name="i-lucide-send" class="text-xl text-primary-500" />
<UIcon name="i-bi-chat-text" class="text-2xl" />
```

브랜드/페이지 단위로 컬렉션을 일관되게:
- 채널 카드 → `i-bi-*` (시안 톤)
- 일반 액션·메뉴 → `i-lucide-*`

---

## 9. 레이아웃 컴포넌트

### 9.1 AppGnb ([`AppGnb.vue`](../app/components/AppGnb.vue))

- sticky top, 64px 높이
- 좌: 로고 (`맑은` + `메시징`)
- 중: 9개 메뉴 (서비스/메시지 발송/발송 조회·통계/주소록/발신 정보/메시지관리/캠페인 관리1/캠페인 관리2/운영가이드) — hover 드롭다운
- 우: 인증 분기
  - 비로그인: 문의(sky-soft) / 로그인 / 회원가입(indigo)
  - 로그인: 문의 / 충전(sky-vivid) / 사용자 아바타 드롭다운(크레딧 + 메뉴)
- `< 1024px`: 햄버거 → `USlideover` 좌측 슬라이드

### 9.2 AppFooter ([`AppFooter.vue`](../app/components/AppFooter.vue))

- 검정 배경, 상·하단 2단
- 상단: 로고/슬로건 + 정책 링크 6개
- 하단: 회사명 + 사업자 정보 7개 + 카피라이트

### 9.3 레이아웃별 적용

| layout | GNB | Footer | 용도 |
| --- | :-: | :-: | --- |
| `default` | ✓ | ✓ | 일반 페이지 (홈/발송/조회/관리…) |
| `auth` | — | — | 로그인/회원가입/비밀번호 재설정 |
| `blank` | — | — | 404/시스템 에러/점검/이메일 템플릿 |

---

## 10. 빌드 / 배포

### 10.1 로컬 명령어

```bash
pnpm install
pnpm dev              # http://localhost:3000
pnpm typecheck        # nuxt typecheck
pnpm lint
pnpm build            # nitro cloudflare-pages preset → dist/
pnpm preview          # 로컬 빌드 미리보기
```

### 10.2 Cloudflare Pages 배포

```bash
pnpm build
npx wrangler pages deploy dist \
  --project-name=malgn-noti \
  --branch=main \
  --commit-dirty=true
```

production: <https://malgn-noti.pages.dev>

### 10.3 빌드 산출물 구조 (`dist/`)

```
dist/
├── _fonts/                  # 폰트 자산
├── _nuxt/                   # 클라이언트 JS/CSS 청크
├── _worker.js/              # SSR worker (Nitro)
├── _routes.json             # Pages Functions 라우팅
├── _headers
├── _redirects
└── nitro.json
```

`_routes.json` / `_headers` 등은 Nitro가 자동 생성. 수정 금지.

---

## 11. 코딩 체크리스트 (PR 전)

- [ ] `<script setup lang="ts">` 사용
- [ ] `useHead({ title })` 페이지 제목 설정
- [ ] `any` 없음 (`tsc --noEmit` 통과)
- [ ] Zod로 외부 입력 파싱
- [ ] API 호출은 `useApi()` 경유
- [ ] 위험 액션은 `AppConfirmDialog`
- [ ] 새 아이콘은 기존 3개 컬렉션 중 선택
- [ ] 색상은 CSS 변수 또는 Nuxt UI 토큰 사용 (하드코딩 X)
- [ ] `pnpm typecheck` 통과
- [ ] `pnpm lint` 통과

---

## 12. 참고 자료

### 12.1 시안 정본

- 페이지 목록(IA 정본): <https://malgn-notifications.pages.dev/#/pagelists>
- 페이지 데이터 소스(JS): <https://malgn-notifications.pages.dev/src/logic/pagelists.js>
- BackOffice 메뉴 트리: <https://malgn-notifications.pages.dev/#/backoffice>
- 사이트맵 + 기능명세: <https://malgn-notifications.pages.dev/#/sitemap>
- CSS 정본 (디자인 토큰·컴포넌트 전체): <https://malgn-notifications.pages.dev/css/base.css>

### 12.2 base.css 섹션 카탈로그 (페이지별 스타일 참조 위치)

페이지를 본격 구현할 때 base.css의 해당 섹션을 참고하면 시안 톤을 빠르게 매칭할 수 있습니다.

| 시작 라인 | 섹션 |
| ---: | --- |
| 1 | 디자인 토큰 (`:root` 변수) |
| 39 | 레이아웃 (`.layout-default`, `.page-content`, `.content-2col`) |
| 76 | **GNB** |
| 271 | **푸터 상단** |
| 327 | **푸터 하단** |
| 358 | 에러 페이지 |
| 479 | SMS 발송 |
| 984 | SMS 모달 (W400/W480/W800) |
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

### 12.3 외부 문서

- [Nuxt 3 docs](https://nuxt.com/docs)
- [Nuxt UI v3](https://ui.nuxt.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Reka UI](https://reka-ui.com/)
- [Iconify](https://iconify.design/)
- [Pinia](https://pinia.vuejs.org/)
- [Zod](https://zod.dev/)
