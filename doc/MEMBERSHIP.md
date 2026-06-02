# 회원·인증 통합 인덱스

> **목적**: 회원가입·로그인·계정관리·인증·승인 게이트의 **모든 페이지·API·DB 테이블·정책**을 한 곳에서 조망.
> 가입 절차 단계별 상세는 [./SIGNUP.md](./SIGNUP.md), NICE 본인확인 인프라는 [./NICE_AUTH.md](./NICE_AUTH.md),
> 일자별 작업 이력은 [./history/history.20260601.md](./history/history.20260601.md) §4·§5,
> [./history/history.20260602.md](./history/history.20260602.md) §4~§10 참조.
>
> **마지막 현행화**: 2026-06-02

---

## 1. 사용자단 페이지 (`malgn-noti`)

### 1.1 가입·로그인·재설정 (인증 게이트 — `meta.auth: false`)

| 라우트 | 파일 | 목적 | 백엔드 연동 |
| --- | --- | --- | --- |
| `/signup` | [signup.vue](../app/pages/signup.vue) | 5단계 마법사. Step 3 이메일 OTP · Step 4 NICE 본인확인 · Step 5 가입 + 자동 로그인 + 유형 분기 | ✅ `/auth/email-code/*` · `/auth/nice/*` · `/auth/signup` |
| `/login` | [login/index.vue](../app/pages/login/index.vue) | 이메일/아이디 + 비밀번호 (회사 자동 매칭) | ✅ `POST /auth/login-by-email` |
| `/login/security` | [login/security.vue](../app/pages/login/security.vue) | 보안로그인 추가 인증(OTP/이메일) | ⚪ 백엔드 미구현 |
| `/reset-password` | [reset-password/index.vue](../app/pages/reset-password/index.vue) | 비밀번호 재설정 요청 | ⚪ OTP 인프라 재활용 가능 |
| `/reset-password/new` | [reset-password/new.vue](../app/pages/reset-password/new.vue) | 새 비밀번호 입력 | ⚪ |
| `/invite` | [invite.vue](../app/pages/invite.vue) | 초대 메일 링크 → 멀티계정 등록 | ⚪ `TB_MANAGER_INVITE` 라우트 미구현 |

### 1.2 계정 관리 (`/account/*`, 인증 필요)

| 라우트 | 파일 | 목적 | 백엔드 연동 |
| --- | --- | --- | --- |
| `/account/settings` | [settings.vue](../app/pages/account/settings.vue) | 회원 정보 변경 (이름·휴대폰·회사 전화·결제 이메일·광고 수신) | ✅ `GET /me` · `PATCH /me` · `PATCH /me/company`. 이메일·휴대폰 변경 다이얼로그는 OTP 미연결(후속) |
| `/account/contract` | [contract.vue](../app/pages/account/contract.vue) | 계약서·전자서명·**사업자등록증 제출/재제출** (미승인 사용자 메인 진입점) | ⚪ `TB_CONTRACT`/`TB_CONTRACT_FILE` 라우트 + R2 업로드 미구현 |
| `/account/password` | [password.vue](../app/pages/account/password.vue) | 비밀번호 변경 | ⚪ `POST /auth/password` 미구현 |
| `/account/security` | [security.vue](../app/pages/account/security.vue) | 보안로그인 토글 (2FA: OTP/이메일) | ⚪ `PATCH /me/security` 미구현 |
| `/account/multi` | [multi.vue](../app/pages/account/multi.vue) | 서비스 담당자 초대 (사업자만) | ⚪ `/manager-invites` 미구현 |
| `/account/cards` | [cards.vue](../app/pages/account/cards.vue) | 결제 카드 관리 | ⚪ `/payment-methods` 부분 |
| `/account/billing` | [billing.vue](../app/pages/account/billing.vue) | 결제 이력 | ⚪ |
| `/account/credit` | [credit.vue](../app/pages/account/credit.vue) | 크레딧 내역·영수증 | ⚪ `/credit-ledger` 부분 |
| `/account/inquiries` · `/detail` | [inquiries/](../app/pages/account/inquiries/) | 나의 문의 목록·상세 | ⚪ `/inquiries` 부분 |
| `/account/inquiry` · `/complete` | [inquiry/](../app/pages/account/inquiry/) | 문의 작성·완료 | ⚪ |

공통 셸: [`AppMyPageShell`](../app/components/AppMyPageShell.vue) — 좌측 메뉴 + 본문 슬롯.

### 1.3 회원·인증 관련 공용 컴포넌트

| 컴포넌트 | 용도 |
| --- | --- |
| [AppApprovalBanner](../app/components/AppApprovalBanner.vue) | **사업자등록증 심사 상태 글로벌 띠** — layout 최상단, pending=warning/rejected=danger+사유 |
| [AppSignupTermsDialog](../app/components/AppSignupTermsDialog.vue) | 약관 동의 모달 |
| [AppMemberInfoPanel](../app/components/AppMemberInfoPanel.vue) | 회원 정보 표시·편집 패널 — 승인 배너 + isLocked 입력 disabled |
| [AppEmailChangeDialog](../app/components/AppEmailChangeDialog.vue) | 이메일 변경 + OTP (실 API 미연결) |
| [AppPhoneVerifyDialog](../app/components/AppPhoneVerifyDialog.vue) | 휴대폰 본인 인증 (실 API 미연결) |
| [AppCardListPanel](../app/components/AppCardListPanel.vue) · [AppCardAddDialog](../app/components/AppCardAddDialog.vue) | 결제 카드 |
| [AppManagerInviteDialog](../app/components/AppManagerInviteDialog.vue) | 서비스 담당자 초대 |
| [AppContractPanel](../app/components/AppContractPanel.vue) · [AppContractSignDialog](../app/components/AppContractSignDialog.vue) · [AppContractViewDialog](../app/components/AppContractViewDialog.vue) | 계약 관리 — 사업자등록증 제출 (실 API 미연결) |

### 1.4 인프라 (인증 글루)

| 파일 | 역할 |
| --- | --- |
| [composables/useApi.ts](../app/composables/useApi.ts) | `$fetch` 래퍼 + `auth-token` 쿠키 + Bearer 자동 주입 + 401 처리 (`/auth/*` 호출은 호출자 처리, 그 외 만료 시 `/login` 리다이렉트) |
| [stores/auth.ts](../app/stores/auth.ts) | Pinia: `signup`/`login`/`loginByEmail`/`fetchMe`/`updateMe`/`updateCompany`/`logout` 액션 + AuthUser/AuthCompany 풀 타입 |
| [middleware/auth.global.ts](../app/middleware/auth.global.ts) | 토큰 쿠키 가드 (SSR 안전) |
| [middleware/approval.global.ts](../app/middleware/approval.global.ts) | **사업자등록증 승인 게이트** — 미승인이면 차단 페이지 접근 시 `/account/contract`로 리다이렉트 |
| [plugins/auth.client.ts](../app/plugins/auth.client.ts) | 클라이언트 부트스트랩 — 토큰 쿠키 있으면 `/me`로 스토어 hydrate |
| [layouts/default.vue](../app/layouts/default.vue) | `AppApprovalBanner` → `AppGnb` → main → `AppFooter` |
| `auth-token` 쿠키 | JWT 7일·SameSite=Lax·secure-in-prod (HttpOnly 아님 — 후속에서 백엔드 Set-Cookie로 강화) |

### 1.5 시스템 페이지 (인증 관련 안내)

| 라우트 | 파일 | 비고 |
| --- | --- | --- |
| `/templete/email/reset-password` | [reset-password.vue](../app/pages/templete/email/reset-password.vue) | 이메일 인증 메일 템플릿(미연동) |
| `/templete/email/verify` | (시안에 있으나 미작성) | 가입 인증 메일 템플릿 |

---

## 2. 사업자등록증 심사 승인 게이트 (NEW — 2026-06-02)

> 정책: 법인사업자(corp) / 개인사업자(sole)는 가입 후 사업자등록증 심사 승인을 받아야
> 서비스 이용 및 가입 정보 수정 가능. 개인(personal)은 즉시 사용 가능.

### 2.1 승인 상태 (`approval_state`)

| 상태 | 의미 | 가능한 동작 |
| --- | --- | --- |
| `pending` | 사업자가 가입 직후 — 심사 대기 | 조회·계약 관리·1:1 문의만 |
| `approved` | 운영자가 승인 또는 개인 가입자 | 모든 서비스 |
| `rejected` | 운영자가 반려 (`rejected_reason` 함께) | 조회·계약 관리(재제출)·1:1 문의만 |

### 2.2 미승인 사용자 UX 흐름

1. **가입 완료** → Step 5 → 사업자: `/account/contract` / 개인: `/home`
2. **로그인** → `fetchMe` → `approval_state='pending'` → 어떤 경로로 가도 미들웨어가 `/account/contract`로 자동 이동
3. **글로벌 띠** (모든 페이지 상단) — `AppApprovalBanner` CTA "계약 관리" → `/account/contract`
4. **다른 페이지 시도** (`/home`·`/send/*`·`/contacts` 등) → 즉시 `/account/contract`로 리다이렉트
5. **승인 완료** → 모든 페이지 정상 접근 + `/home` 진입 가능

### 2.3 백엔드 가드

`src/middleware/approval.ts` — `requireApproved()` 미들웨어를 18 라우트(`send`·`contacts`·`sender-phones` 등)에 일괄 적용. **`mutate-only` 모드 — POST/PATCH/PUT/DELETE만 차단**, GET 조회는 허용. `/me`의 PATCH도 §7에서 인라인으로 차단.

예외:
- `/inquiries` — 승인 관련 문의 가능해야 함 → 미적용
- `/dispatch-history` · `/credit-ledger` — GET 전용이라 자동 통과

### 2.4 프런트 가드

`middleware/approval.global.ts` — 허용 경로 외 접근 시 자동 리다이렉트:

**허용**:
- `/account/*` (계약·회원 정보·문의)
- `/help` · `/guide` · `/wbs` (정적 문서)
- `/inquiry` (1:1 문의)
- `meta.auth: false` (로그인·가입 등)

**차단 → `/account/contract`**:
- `/home` · `/send/*` · `/history/*` · `/contacts/*` · `/sender/*` · `/manage/*` · `/campaign*` · `/charge*`

---

## 3. 운영자단 페이지 (`malgn-noti-admin`, 기획 MD만 존재)

| 기획 MD | 라우트(예정) | 역할 |
| --- | --- | --- |
| [member/company.md](../../malgn-noti-admin/doc/pages/member/company.md) | `/admin/member/company` · `/[id]` | 고객사 목록·**승인/반려**·한도·차단 |
| [member/account.md](../../malgn-noti-admin/doc/pages/member/account.md) | `/admin/member/account` · `/[id]` | 개별 사용자 계정·OTP 진단·임시 비번·2FA 초기화 |
| [member/audit.md](../../malgn-noti-admin/doc/pages/member/audit.md) | `/admin/member/audit` | 감사 로그 |
| [member/block.md](../../malgn-noti-admin/doc/pages/member/block.md) | `/admin/member/block` | 강제 차단·복구 |

→ **운영자단 화면은 모두 미개발**(셸 + 기획만). 사업자 승인은 현재 라이브 DB 직접 UPDATE로만 처리 가능. **승인 화면은 P0 1순위**.

---

## 4. API 엔드포인트 (`malgn-noti-api`)

### 4.1 인증 (`src/routes/auth.ts`)

| 라우트 | 요청 | 응답 | 상태 |
| --- | --- | --- | --- |
| `POST /auth/signup` | `{companyName, companyType?, loginid, password, name?, email?, phone?, niceSession?}` | `201 {data:{user, company, token}}`. companyType='corp'/'sole'면 `approval_state='pending'` 자동, 그 외 'approved' | ✅ |
| `POST /auth/login` | `{companyId, loginid, password}` | `200 {data:{user, company, token}}` (legacy — 사용 안 함) | ✅ |
| `POST /auth/login-by-email` | `{email, password}` | `200 {data:{user, company, token}}` — loginid 전역 UNIQUE 기반 단일 매치 | ✅ |
| `POST /auth/email-code/send` | `{email, purpose:'signup'/'reset_password'/'change_email'}` | `200 {data:{sent, expiresAt, mockCode?}}` | ✅ (NHN 자격증명 등록 전까지 mock fallback) |
| `POST /auth/email-code/verify` | `{email, purpose, code}` | `200 {data:{verified}}` | ✅ |
| `POST /auth/phone-code/send` | `{phone, purpose:'signup'/'reset_password'/'change_phone'}` | `200 {data:{sent, expiresAt, mockCode?}}` | ✅ (자체 SMS OTP — NICE와 별개) |
| `POST /auth/phone-code/verify` | `{phone, purpose, code}` | `200 {data:{verified}}` | ✅ |
| `POST /auth/nice/init` | `{purpose:'signup'/'change_phone'}` | `200 {data:{sessionId, authUrl, mockMode}}` | ✅ |
| `POST /auth/nice/callback` | NICE form `web_transaction_id` | HTML (자동 팝업 닫기) | ✅ |
| `GET /auth/nice/status?session=…` | — | `200 {data:{state, name?, birthdate?, ...}}` | ✅ |
| `POST /auth/password` | `{currentPassword, newPassword}` | TBD | ⚪ |
| `POST /auth/password/reset` | `{email, code, newPassword}` | TBD | ⚪ |
| `POST /auth/agree-terms` | `{terms:[{id, version, requiredYn}]}` | TBD | ⚪ |
| `POST /auth/logout` | (Bearer) | TBD | ⚪ — 클라이언트 쿠키 삭제만 |

### 4.2 현재 사용자 (`src/routes/me.ts`)

| 라우트 | 요청 | 응답 | 상태 |
| --- | --- | --- | --- |
| `GET /me` | Bearer | `200 {data:{user, company, ctxRole}}` — TB_USER 13 + TB_COMPANY 17 컬럼 풀 노출(approvalState 포함) | ✅ |
| `PATCH /me` | `{name?, phone?}` | `200 {data:...}` — `approval_state !== 'approved'`면 403 | ✅ |
| `PATCH /me/company` | `{companyPhone?, billingEmail?, adReceive?}` | `200 {data:...}` — owner/admin만 + 승인 게이트 | ✅ |
| `PATCH /me/security` | `{securityLoginYn, securityLoginMethod}` | TBD | ⚪ |

### 4.3 승인 게이트 미들웨어 (`src/middleware/approval.ts`)

`requireApproved({method?: 'mutate-only' | 'all'})` — 적용 라우트 18종:
- `/send/*` · `/contacts` · `/contact-groups` · `/optout-entries`
- `/sender-phones` · `/rcs-brands` · `/email-domains` · `/push-certs` · `/kakao-sender-profiles` · `/kakao-profile-groups` · `/optout-080-numbers`
- `/templates` · `/template-categories` · `/landing-pages`
- `/flow-definitions` · `/export-jobs`
- `/payment-methods` · `/company-settings`

미승인이면 변경(POST/PATCH/PUT/DELETE) 차단 → 403 + 상황별 메시지(pending: 심사 후 가능, rejected: 사유 안내).

### 4.4 서비스 담당자 초대 (미구현)

| 라우트 | 상태 |
| --- | --- |
| `GET/POST /manager-invites` · `POST /{token}/accept` · `DELETE /{id}` | ⚪ |

### 4.5 계약·서류 (미구현)

| 라우트 | 상태 |
| --- | --- |
| `GET /contracts` · `POST` · `GET /{id}` | ⚪ |
| `POST /contracts/{id}/files` (R2 업로드 + DB 기록) | ⚪ |

### 4.6 운영자단 (미구현, `/admin/*`)

| 라우트 | 상태 |
| --- | --- |
| `GET /admin/companies` · 목록 + 필터 | ⚪ |
| `POST /admin/companies/{id}/approve` · `POST /reject {reason}` | ⚪ — 현재 라이브 DB 직접 UPDATE |
| `GET /admin/users` · 강제 비활성·2FA 초기화·임시 비번 | ⚪ |

---

## 5. DB 테이블 (회원·인증 관련)

### 5.1 핵심 (라이브 + schema.ts)

| 테이블 | 핵심 컬럼 | schema.ts | 라이브 |
| --- | --- | --- | --- |
| `TB_COMPANY` | name, **company_type**, **approval_state**, **rejected_reason**, biz_no, biz_type, ceo_name, up_tae, up_jong, address, company_phone, billing_email, credit_balance, ad_receive, status | ✅ | ✅ |
| `TB_USER` | company_id, **loginid(UNIQUE 전역)**, email, password_hash, name, phone, **birthdate**, **gender**, **national_info**, **ci(UNIQUE)**, **mobile_co**, role, member_type, security_login_yn, security_login_method, join_state, status, last_login_at | ✅ | ✅ |
| `TB_COMPANY_SETTINGS` | 테넌트별 발송 설정 | ✅ | ✅ |
| `TB_VERIFICATION` | target_type(email/phone), target, code_hash, purpose, attempts, expires_at, consumed_at | ✅ | ✅ |
| `TB_NICE_AUTH` | request_no, transaction_id, ticket, iterators, state(pending/completed/failed/expired/consumed), name, birthdate, gender, ci, di, mobile_no, mobile_co, expires_at, consumed 후 재사용 차단 | ✅ | ✅ |
| `TB_SESSION` | 발급 JWT 추적용 (logout revoke 시) | ⚪ | ✅ |

### 5.2 멀티 계정·초대 (라이브 있음, schema.ts 미정의)

| 테이블 | 역할 |
| --- | --- |
| `TB_MEMBER_VERIFICATION` | 멀티계정 본인 확인 |
| `TB_MANAGER_INVITE` | 서비스 담당자 초대 토큰 |

### 5.3 약관 (라이브 미확정)

| 테이블 | 역할 |
| --- | --- |
| `TB_TERMS` | 약관 정본 (추정) |
| `TB_TERMS_AGREEMENT` | 동의 기록 (추정) |

→ schema.ts 미정의. 후속 작업에서 확정.

### 5.4 계약 (라이브 있음, schema.ts 미정의)

| 테이블 | 역할 |
| --- | --- |
| `TB_CONTRACT` | 가입 계약·전자서명 |
| `TB_CONTRACT_FILE` | 계약 첨부 (R2 키) |

### 5.5 결제 / DDL 이력

| 테이블 / 마이그레이션 | 상태 |
| --- | --- |
| `TB_PAYMENT_METHOD` | ✅ |
| `0001_idempotency.sql` · `0002_export_flow.sql` · `0003_user_loginid_global_unique.sql` · `0004_nice_auth.sql` · `0005_company_approval.sql` | 모두 라이브 적용 완료 |

---

## 6. 정책 결정 사항

> 상세: [./SIGNUP.md](./SIGNUP.md), [./NICE_AUTH.md](./NICE_AUTH.md), [./WBS.md](./WBS.md) §2-4·§2-6

### 6.1 회원 유형 (`company_type`)

`corp` (법인사업자) · `sole` (개인사업자) · `personal` (개인) 3종. signup 시 전달, TB_COMPANY 적재.

### 6.2 결제 방식

- 법인·개인사업자: **카드 충전** 또는 **후불 결제** 선택
- 개인: **카드 충전만**

### 6.3 가입 직후 승인 (구현 완료)

| 회사 유형 | `approval_state` | 서비스 이용 | 정보 수정 |
| --- | --- | --- | --- |
| 법인사업자 `corp` | `pending` | ❌ | ❌ |
| 개인사업자 `sole` | `pending` | ❌ | ❌ |
| 개인 `personal` | `approved` | ✅ | ✅ |

운영자 승인 → `approved` 또는 반려 → `rejected` + `rejected_reason`. 사용자단·백엔드 둘 다 게이트 적용 완료. 운영자단 승인 화면은 미구현.

### 6.4 loginid 전역 UNIQUE

`TB_USER.loginid` 전역 UNIQUE (0003). "한 이메일 = 한 회사 = 한 로그인". 회원가입 마법사는 `loginid = email`로 발급.

### 6.5 멀티 계정

법인·개인사업자만 주계정 + 보조계정 추가 가능. 개인은 `/account/multi` 탭 미노출(현재 코드 모두 노출 — 후속).

### 6.6 비밀번호 정책

`min 8자` (현 검증). 영문·숫자·특수문자 조합 8자 이상은 표시 문구만, 검증은 없음.

### 6.7 본인 확인 / OTP

| 채널 | 단순 OTP (소유 검증) | 본인 확인 (NICE) |
| --- | --- | --- |
| 이메일 | ✅ `/auth/email-code/*` (signup·reset·change) | — |
| 휴대폰 | ✅ `/auth/phone-code/*` (signup·reset·change) | ✅ `/auth/nice/*` (signup의 Step 4 메인) |

자체 SMS OTP는 단순 휴대폰 보유 확인 — 비밀번호 재설정 등에 활용. **회원가입 본인 확인은 NICE M(휴대폰)으로 일원화** (NICE 자격증명 발급 후 real 모드 전환 — 현재 mock).

### 6.8 NICE 본인확인 + CI 중복 가입 차단

NICE 응답의 `ci`는 사이트 간 동일인 식별자. `TB_USER.ci UNIQUE`로 한 사람이 두 회사에 가입 불가. signup 시 사전 검사 — 중복이면 409 "이미 가입된 사용자입니다. 비밀번호 재설정으로 진행해 주세요."

---

## 7. 보안 모델

| 항목 | 현재 | 비고 |
| --- | --- | --- |
| **비밀번호 저장** | PBKDF2-SHA256 (`src/lib/password.ts`) | OK |
| **JWT** | HS256, 만료 7일, sub=userId, cid=companyId, role | OK |
| **JWT 저장** | `auth-token` 쿠키, SameSite=Lax, secure-in-prod, HttpOnly **아님** | 백엔드 Set-Cookie 미사용 — 후속 강화 |
| **OTP 코드 저장** | SHA-256(target\|purpose\|code) 해시만 (평문 금지) | OK |
| **NICE 본인 확인** | AES-256-GCM + PBKDF2 + HMAC 무결성 검증 (Web Crypto) | OK |
| **승인 게이트** | DB `approval_state` + 백엔드 미들웨어 + 프런트 미들웨어 | OK (운영자단 승인 UI 미) |
| **세션 revoke** | 클라이언트 쿠키 삭제만 (`TB_SESSION` 미구현) | ⚪ |
| **CORS 화이트리스트** | 백엔드 미설정 → 모두 허용 | 후속 |
| **Rate limit** | 발송·검증·로그인 모두 없음 | 후속 (Cloudflare KV·Durable Objects 검토) |
| **감사 로그** | mutating 액션 미적재 (`TB_AUDIT_LOG`) | 후속 |

---

## 8. 현 구현 상태 한눈에

| 항목 | 백엔드 | 프런트 | 비고 |
| --- | --- | --- | --- |
| 회원가입 (signup) | ✅ | ✅ | companyType 전달, Step 5 유형 분기 |
| 이메일 OTP | ✅ | ✅ | NHN 자격증명 발급 후 실 메일 발송 |
| 휴대폰 SMS OTP | ✅ | ✅ | signup Step 4는 NICE로 대체 |
| NICE 본인확인 | ✅ | ✅ | mock 모드 — NICE 자격증명 발급 후 real |
| 로그인 (이메일 + 비번) | ✅ | ✅ | login-by-email 단일 매치 |
| /me 조회 | ✅ | ✅ | 풀 컬럼(승인 정보 포함) |
| 사용자 정보 변경 (PATCH /me) | ✅ | ✅ | name·phone — 승인 게이트 |
| 회사 정보 변경 (PATCH /me/company) | ✅ | ✅ | companyPhone·billingEmail·adReceive — owner/admin + 승인 게이트 |
| **승인 게이트 (DB + 18 라우트 + 프런트)** | ✅ | ✅ | 운영자단 승인 UI 미 — DB 직접 UPDATE로 임시 |
| 로그아웃 | 클라이언트 쿠키 삭제 | ⚪ GNB 미연동 | 30분 작업 |
| 비밀번호 재설정 | ⚪ | ⚪ | OTP 인프라 재활용 — 다음 작업 후보 |
| 비밀번호 변경 | ⚪ | ⚪ | |
| 보안로그인 (2FA) | ⚪ | ⚪ | OTP 인프라 재활용 |
| 약관 동의 적재 | ⚪ | 화면용 토스트 | `TB_TERMS_AGREEMENT` |
| 이메일 변경 (OTP) | ⚪ | 다이얼로그만 | `POST /me/email-change/*` |
| 서비스 담당자 초대 | ⚪ | 화면 더미 | `/manager-invites` |
| 계약·서류 업로드 (R2) | ⚪ | UI만 | `/contracts/*/files` |
| 회원 탈퇴 | ⚪ | "곧 지원" 안내 | `DELETE /me` |
| 운영자단 승인 화면 | ⚪ | ⚪ | 운영자단 화면 전체 미개발 |
| 실 메일 발송 (NHN) | mock | — | 자격증명 등록 후 |
| 실 NICE 호출 | mock | — | 자격증명 등록 후 |

---

## 9. 알려진 한계 / 다음 작업

### P0 — 인증 폐쇄 루프

1. **운영자단 사업자 승인 화면** — 현재 라이브 DB 직접 UPDATE로만 처리. 운영자단 첫 P0 작업이 될 가능성. WBS 5-4-3
2. **로그아웃 GNB 실 액션** — `useAuthStore().logout()` 연결 (30분)
3. **비밀번호 재설정** — OTP 인프라 재활용, `purpose='reset_password'` (2~3시간)
4. **계약·서류 업로드 라우트 + R2** — 미승인 사용자의 핵심 진입점인 `/account/contract`가 현재 UI만. 사업자등록증 업로드 실 API 필요

### P1 — 정책 통합

5. **약관 동의 적재** — `TB_TERMS` + `TB_TERMS_AGREEMENT` 라우트 + signup 통합
6. **개인 유형 LNB/메뉴 분기** — `/account/multi`·`/account/contract` 등 사업자 전용 메뉴 숨김
7. **사업자등록번호 체크섬** — 프런트 검증
8. **승인 완료 자동 알림** — 이메일·SMS trigger
9. **GNB 메뉴 항목 disabled (미승인)** — 시각적으로 비활성화 (현재는 미들웨어 리다이렉트만)
10. **승인 완료 후 자동 새로고침** — WebSocket 또는 폴링

### P2 — 계정 관리

11. **`POST /auth/password` + `/account/password`** — 비밀번호 변경
12. **이메일 변경 OTP** — `POST /me/email-change/{request,confirm}`
13. **`PATCH /me/security` + `/account/security`** — 2FA
14. **`/manager-invites` + `/account/multi`** — 서비스 담당자 초대
15. **`DELETE /me` (회원 탈퇴)** — soft-delete + 데이터 정책

### P3 — 외부 의존

16. **NICE 통합인증 계약 + Outbound IP 협상** — [./NICE_AUTH.md §9·§10](./NICE_AUTH.md) 참조
17. **NHN 이메일 자격증명 등록** — 실 메일 발송 활성화
18. **NHN SMS 자격증명 등록** — 비밀번호 재설정·휴대폰 변경 OTP 실 발송

### 위생적 작업

19. **`schema.ts`에 누락된 회원·인증 테이블 정의** — `TB_SESSION`·`TB_TERMS`·`TB_TERMS_AGREEMENT`·`TB_MEMBER_VERIFICATION`·`TB_MANAGER_INVITE`·`TB_CONTRACT`·`TB_CONTRACT_FILE`
20. **운영 절차 다중화** — Aurora SG 접근 다중화 (Cloudflare Tunnel·RDS Proxy 등)
