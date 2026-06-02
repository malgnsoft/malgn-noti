# 회원·인증 통합 인덱스

> **목적**: 회원가입·로그인·계정관리·인증 영역의 **모든 페이지·API·DB 테이블·정책**을 한 곳에서 조망.
> 가입 절차 단계별 상세는 [./SIGNUP.md](./SIGNUP.md), 일자별 작업 이력은 [./history/history.20260601.md](./history/history.20260601.md) §4·§5 참조.
>
> **마지막 현행화**: 2026-06-02

---

## 1. 사용자단 페이지 (`malgn-noti`)

### 1.1 가입·로그인·재설정 (인증 게이트 — `meta.auth: false`)

| 라우트 | 파일 | 목적 | 백엔드 연동 |
| --- | --- | --- | --- |
| `/signup` | [app/pages/signup.vue](../app/pages/signup.vue) | 5단계 마법사 (안내·정보·아이디·휴대폰·완료) | ✅ Step 4→5에서 `POST /auth/signup` · Step 3에서 `POST /auth/email-code/*` |
| `/login` | [app/pages/login/index.vue](../app/pages/login/index.vue) | 이메일+비밀번호+companyId 로그인 | ✅ `POST /auth/login` |
| `/login/security` | [app/pages/login/security.vue](../app/pages/login/security.vue) | 보안로그인 추가 인증(OTP/이메일) | ⚪ 백엔드 미구현 |
| `/reset-password` | [app/pages/reset-password/index.vue](../app/pages/reset-password/index.vue) | 비밀번호 재설정 요청 | ⚪ 미연동 (OTP 인프라 재활용 가능) |
| `/reset-password/new` | [app/pages/reset-password/new.vue](../app/pages/reset-password/new.vue) | 새 비밀번호 입력 | ⚪ 미연동 |
| `/invite` | [app/pages/invite.vue](../app/pages/invite.vue) | 초대 메일 링크 → 멀티계정 등록 | ⚪ `TB_MANAGER_INVITE` 라우트 미구현 |

### 1.2 계정 관리 (`/account/*`, 인증 필요)

| 라우트 | 파일 | 목적 | 백엔드 연동 |
| --- | --- | --- | --- |
| `/account/settings` | [app/pages/account/settings.vue](../app/pages/account/settings.vue) | 회원 정보 변경 (이름·이메일·휴대폰) | ⚪ `PATCH /me` 미구현 |
| `/account/password` | [app/pages/account/password.vue](../app/pages/account/password.vue) | 비밀번호 변경 | ⚪ `POST /auth/password` 미구현 |
| `/account/security` | [app/pages/account/security.vue](../app/pages/account/security.vue) | 보안로그인 토글 (2FA: OTP/이메일) | ⚪ `PATCH /me/security` 미구현 |
| `/account/multi` | [app/pages/account/multi.vue](../app/pages/account/multi.vue) | 서비스 담당자 초대 (법인·개인사업자만) | ⚪ `/manager-invites` 미구현 |
| `/account/contract` | [app/pages/account/contract.vue](../app/pages/account/contract.vue) | 계약서·전자서명·서류 업로드 (법인·개인사업자만) | ⚪ `TB_CONTRACT`/`TB_CONTRACT_FILE` 라우트 미구현 |
| `/account/cards` | [app/pages/account/cards.vue](../app/pages/account/cards.vue) | 결제 카드 관리 | ⚪ `/payment-methods` 부분 |
| `/account/billing` | [app/pages/account/billing.vue](../app/pages/account/billing.vue) | 결제 이력 | ⚪ |
| `/account/credit` | [app/pages/account/credit.vue](../app/pages/account/credit.vue) | 크레딧 내역·영수증 | ⚪ `/credit-ledger` 부분 |
| `/account/inquiries` | [app/pages/account/inquiries/index.vue](../app/pages/account/inquiries/index.vue) | 나의 문의 목록 | ⚪ `/inquiries` 부분 |
| `/account/inquiries/detail` | [app/pages/account/inquiries/detail.vue](../app/pages/account/inquiries/detail.vue) | 문의 상세·댓글 | ⚪ |
| `/account/inquiry` · `/account/inquiry/complete` | [app/pages/account/inquiry/](../app/pages/account/inquiry/) | 문의 작성·완료 | ⚪ |

공통 셸: [`AppMyPageShell`](../app/components/AppMyPageShell.vue) — 9개 라우트 좌측 메뉴 + 본문 슬롯.

### 1.3 회원·인증 관련 공용 컴포넌트

| 컴포넌트 | 용도 |
| --- | --- |
| [AppSignupTermsDialog](../app/components/AppSignupTermsDialog.vue) | 약관 동의 모달 |
| [AppMemberInfoPanel](../app/components/AppMemberInfoPanel.vue) | 회원 정보 표시·편집 패널 |
| [AppEmailChangeDialog](../app/components/AppEmailChangeDialog.vue) | 이메일 변경 + OTP |
| [AppPhoneVerifyDialog](../app/components/AppPhoneVerifyDialog.vue) | 휴대폰 본인 인증 |
| [AppCardListPanel](../app/components/AppCardListPanel.vue) · [AppCardAddDialog](../app/components/AppCardAddDialog.vue) | 결제 카드 |
| [AppManagerInviteDialog](../app/components/AppManagerInviteDialog.vue) | 서비스 담당자 초대 |

### 1.4 인프라 (인증 글루)

| 파일 | 역할 |
| --- | --- |
| [app/composables/useApi.ts](../app/composables/useApi.ts) | `$fetch` 래퍼 + `auth-token` 쿠키 + Bearer 자동 주입 + 401 자동 로그아웃 |
| [app/stores/auth.ts](../app/stores/auth.ts) | Pinia: `signup`/`login`/`fetchMe`/`logout` 액션 |
| [app/middleware/auth.global.ts](../app/middleware/auth.global.ts) | 쿠키 존재 가드(SSR 안전) |
| [app/plugins/auth.client.ts](../app/plugins/auth.client.ts) | 클라이언트 부트스트랩 — 토큰 쿠키 있으면 `/me`로 스토어 hydrate |
| `auth-token` 쿠키 | JWT 7일·SameSite=Lax·secure-in-prod (HttpOnly 아님 — 백엔드 Set-Cookie 시 강화 예정) |
| `last-company-id` 쿠키 | 가장 최근 가입/로그인한 companyId 1년 — 다음 로그인 자동 채움 |

### 1.5 시스템 페이지 (인증 관련 안내)

| 라우트 | 파일 | 비고 |
| --- | --- | --- |
| `/templete/email/reset-password` | [app/pages/templete/email/reset-password.vue](../app/pages/templete/email/reset-password.vue) | 이메일 인증 메일 템플릿(미연동) |
| `/templete/email/verify` | (시안에 있으나 미작성) | 가입 인증 메일 템플릿 |

---

## 2. 운영자단 페이지 (`malgn-noti-admin`, 기획 MD만 존재)

| 기획 MD | 라우트(예정) | 역할 |
| --- | --- | --- |
| [doc/pages/member/company.md](../../malgn-noti-admin/doc/pages/member/company.md) | `/admin/member/company` · `/admin/member/company/[id]` | 고객사(테넌트) 목록·승인·한도·차단 |
| [doc/pages/member/account.md](../../malgn-noti-admin/doc/pages/member/account.md) | `/admin/member/account` · `/admin/member/account/[id]` | 개별 사용자 계정·OTP 진단·임시 비번·2FA 초기화 |
| [doc/pages/member/audit.md](../../malgn-noti-admin/doc/pages/member/audit.md) | `/admin/member/audit` | 사용자/테넌트 행동 감사 로그 |
| [doc/pages/member/block.md](../../malgn-noti-admin/doc/pages/member/block.md) | `/admin/member/block` | 강제 차단·복구 |

→ 4 종 모두 P0이지만 **운영자단 화면은 모두 미개발**(셸 + 기획만 완료).

---

## 3. API 엔드포인트 (`malgn-noti-api`)

### 3.1 인증 (`src/routes/auth.ts`)

| 라우트 | 요청 | 응답 | 상태 |
| --- | --- | --- | --- |
| `POST /auth/signup` | `{companyName, loginid, password, name?, email?, phone?}` | `201 {data:{user, company, token}}` | ✅ |
| `POST /auth/login` | `{companyId:number, loginid, password}` | `200 {data:{user, company:{id}, token}}` | ✅ |
| `POST /auth/email-code/send` | `{email, purpose:'signup'|'reset_password'|'change_email'}` | `200 {data:{sent, expiresAt, mockCode?}}` | ✅ (NHN 자격증명 등록 전까지 메일은 mock fallback) |
| `POST /auth/email-code/verify` | `{email, purpose, code}` | `200 {data:{verified}}` | ✅ |
| `POST /auth/login-by-email` | `{email, password}` | TBD | ⚪ — companyId UX 개선용 |
| `POST /auth/password` | `{currentPassword, newPassword}` | TBD | ⚪ — 비밀번호 변경 |
| `POST /auth/password/reset` | `{email, code, newPassword}` | TBD | ⚪ — 이메일 OTP 통과 후 새 비번 설정 |
| `POST /auth/phone-code/send` · `/verify` | TBD | TBD | ⚪ — PASS·NICE 등 외부 의존 |
| `POST /auth/agree-terms` | `{terms:[{id, version, requiredYn}]}` | TBD | ⚪ — `TB_TERMS_AGREEMENT` 적재 |
| `POST /auth/logout` | (Bearer) | TBD | ⚪ — `TB_SESSION` revoke (현재는 클라이언트 쿠키 삭제만) |

### 3.2 현재 사용자 (`src/routes/me.ts`)

| 라우트 | 요청 | 응답 | 상태 |
| --- | --- | --- | --- |
| `GET /me` | Bearer | `200 {data:{user, company:{id,name,creditBalance,status}, ctxRole}}` | ✅ |
| `PATCH /me` | `{name?, email?, phone?}` | TBD | ⚪ |
| `PATCH /me/security` | `{securityLoginYn, securityLoginMethod}` | TBD | ⚪ |

### 3.3 서비스 담당자 초대 (미구현)

| 라우트 | 상태 |
| --- | --- |
| `GET /manager-invites` (테넌트의 초대 목록) | ⚪ |
| `POST /manager-invites` (초대 발송) | ⚪ |
| `POST /manager-invites/{token}/accept` (수락) | ⚪ |
| `DELETE /manager-invites/{id}` (취소) | ⚪ |

### 3.4 계약·서류 (미구현)

| 라우트 | 상태 |
| --- | --- |
| `GET /contracts` · `POST` · `GET /{id}` | ⚪ |
| `POST /contracts/{id}/files` (R2 업로드 + DB 기록) | ⚪ |

### 3.5 운영자단 (미구현, 별도 `/admin/*` 또는 `tenants.ts`)

| 라우트 | 상태 |
| --- | --- |
| `GET /admin/companies` · 승인·차단·한도 조정 | ⚪ |
| `GET /admin/users` · 강제 비활성·2FA 초기화·임시 비번 | ⚪ |

---

## 4. DB 테이블 (회원·인증 관련)

### 4.1 핵심 (라이브 적용 + schema.ts 정의)

| 테이블 | 핵심 컬럼 | schema.ts | 라이브 |
| --- | --- | --- | --- |
| `TB_COMPANY` | `name, biz_no, biz_type, ceo_name, up_tae, up_jong, address, company_phone, billing_email, credit_balance, ad_receive, status` | ✅ | ✅ |
| `TB_USER` | `company_id, loginid, email, password_hash, name, phone, role(owner/admin/member), member_type, security_login_yn, security_login_method, join_state, status, last_login_at` | ✅ | ✅ |
| `TB_COMPANY_SETTINGS` | 테넌트별 발송 설정 | ✅ | ✅ |
| `TB_VERIFICATION` | `target_type(email/phone), target, code_hash, purpose(signup/reset_password/change_email/login_2fa), attempts, expires_at, consumed_at` | ✅ | ✅ |
| `TB_SESSION` | 발급 JWT 추적용 (logout revoke 시 사용) | ⚪ | ✅ |

### 4.2 멀티 계정·초대 (라이브 있음, schema.ts 미정의)

| 테이블 | 역할 |
| --- | --- |
| `TB_MEMBER_VERIFICATION` | 멀티계정 본인 확인 (`company_id, user_id, member_type, name, required_docs, verify_state(invited/pending/approved/rejected), verified_at`) |
| `TB_MANAGER_INVITE` | 서비스 담당자 초대 토큰 (라이브 컬럼 미점검 — SG 닫혀 있음) |

### 4.3 약관 (라이브 미확정)

| 테이블 | 역할 |
| --- | --- |
| `TB_TERMS` | 약관 정본 (`id, kind, version, title, body_md, required_yn, effective_at`) — 추정 |
| `TB_TERMS_AGREEMENT` | 동의 기록 (`user_id, terms_id, terms_version, agreed_at, ip`) — 추정 |

→ schema.ts에 정의 없음. 라이브 존재 여부 + 정확 컬럼은 SG 재개방 시 확인 필요.

### 4.4 계약 (라이브 있음, schema.ts 미정의)

| 테이블 | 역할 |
| --- | --- |
| `TB_CONTRACT` | 가입 계약·전자서명 |
| `TB_CONTRACT_FILE` | 계약 첨부 (R2 키) |

### 4.5 결제 (회원 가입 후 사용 연결)

| 테이블 | schema.ts | 라이브 |
| --- | --- | --- |
| `TB_PAYMENT_METHOD` | ✅ | ✅ |

---

## 5. 정책 결정 사항 (시안 정본 기준)

> 상세: [./SIGNUP.md](./SIGNUP.md), [./WBS.md](./WBS.md) §2-4·§2-6 / [./history/history.20260601.md](./history/history.20260601.md) §4·§5

### 5.1 회원 유형

`corp` (법인사업자) · `sole` (개인사업자) · `personal` (개인) 3종. 가입 후 화면 노출(`/account/multi`·`/account/contract`)이 유형에 따라 다름.

### 5.2 결제 방식

- 법인·개인사업자: **카드 충전** 또는 **후불 결제** 선택
- 개인: **카드 충전만**

### 5.3 가입 직후 승인

- 카드 충전: 즉시 사용 가능
- 후불 결제: 온라인 계약 + BackOffice 승인 + 통장사본 → 사용 가능
- 개인: 계약관리 없음 — 즉시 사용

→ **현 구현**은 모든 유형 즉시 `joinState='joined'`. 승인 게이트 미구현.

### 5.4 멀티 계정

법인·개인사업자만 주계정 + 보조계정 추가 가능. 개인은 `/account/multi` 탭 미노출(정책 — 현재 코드는 모두 노출).

### 5.5 비밀번호 정책

`min 8자` (현 검증). 영문·숫자·특수문자 조합 8자 이상 요구 문구는 있으나 검증 없음.

### 5.6 OTP

- 이메일: ✅ 6자리 숫자, TTL 10분, 재발송 시 직전 코드 만료, 5회 시도 제한, 소비 후 재사용 차단
- 휴대폰: ⚪ PASS·NICE 등 사업자 선정 필요

---

## 6. 보안 모델

| 항목 | 현재 | 비고 |
| --- | --- | --- |
| **비밀번호 저장** | PBKDF2-SHA256 (`src/lib/password.ts`) | OK |
| **JWT** | HS256, 만료 7일, sub=userId, cid=companyId, role | OK |
| **JWT 저장** | `auth-token` 쿠키, SameSite=Lax, secure-in-prod, HttpOnly **아님** | 백엔드 Set-Cookie 미사용 — 후속에서 강화 |
| **OTP 코드 저장** | SHA-256(target\|purpose\|code) 해시만 (평문 금지) | OK |
| **세션 revoke** | 클라이언트 쿠키 삭제만 (`TB_SESSION` 미구현) | ⚪ |
| **CORS 화이트리스트** | 백엔드 미설정 → 모두 허용 (워커 도메인) | 후속 |
| **Rate limit** | 발송·검증·로그인 모두 없음 | 후속 (Cloudflare KV·Durable Objects 검토) |
| **감사 로그** | mutating 액션 미적재 (`TB_AUDIT_LOG`) | 후속 |

---

## 7. 현 구현 상태 한눈에

| 단계 | 백엔드 | 프런트 | 비고 |
| --- | --- | --- | --- |
| 회원가입 (signup API) | ✅ | ✅ | Step 4 → 5에서 호출, 자동 로그인 |
| 이메일 OTP | ✅ | ✅ | NHN 자격증명 등록 후 실 메일 발송 |
| 로그인 (companyId+loginid+password) | ✅ | ✅ | `last-company-id` 쿠키 자동 사용 |
| 로그인 (이메일 검색) | ⚪ | ⚪ | UX 개선용 (다음 작업 후보) |
| /me 조회 | ✅ | ✅ | 클라이언트 부트스트랩에서 hydrate |
| 로그아웃 | 클라이언트 쿠키 삭제만 | ⚪ GNB 미연동 | 30분 작업 |
| 비밀번호 재설정 | ⚪ | ⚪ | OTP 인프라 재활용 — 다음 작업 후보 |
| 비밀번호 변경 | ⚪ | ⚪ | |
| 회원 정보 변경 (PATCH /me) | ⚪ | ⚪ | |
| 보안로그인 (2FA) 토글 | ⚪ | ⚪ | OTP 인프라 재활용 |
| 약관 동의 적재 | ⚪ | 화면용 토스트만 | TB_TERMS_AGREEMENT 적재 |
| 휴대폰 OTP | ⚪ | 화면용 더미 | 외부 의존 |
| 서비스 담당자 초대 | ⚪ | 화면용 더미 | TB_MANAGER_INVITE |
| 계약·서류 업로드 | ⚪ | UI만 | R2 + TB_CONTRACT* |
| 운영자단 — 고객사 승인·차단 | ⚪ | ⚪ | 운영자단 화면 미개발 |
| 실 메일 발송 (NHN) | 자격증명 미등록 → mock fallback | — | 콘솔 작업 + 자격증명 등록 |

---

## 8. 알려진 한계 / 다음 작업

### P0 — 인증 폐쇄 루프 (이번주)

1. **로그아웃 실 액션** — `AppGnb` → `useAuthStore().logout()` (30분)
2. **비밀번호 재설정** — OTP 인프라 재활용, `purpose='reset_password'` (2~3시간)
3. **`/auth/login-by-email`** — companyId UX 개선 (1~2시간)

### P1 — 회원가입 정책 통합

4. **약관 동의 적재** — `TB_TERMS` + `TB_TERMS_AGREEMENT` 라우트 + signup 통합 (1~2시간)
5. **`companyType` 전달·저장** — `TB_COMPANY.company_type` 추가 + 스키마 확장 (2~3시간)
6. **개인 유형 화면 분기** — `auth.user.companyType` 기반 LNB/계정 메뉴 (30분 — #5 직후)
7. **사업자등록번호 체크섬** — 프런트 검증만 (30분)

### P2 — 계정 관리 실 API 연동

8. **PATCH /me** + `/account/settings`
9. **POST /auth/password** + `/account/password`
10. **PATCH /me/security** + `/account/security` (TB_VERIFICATION 재사용 — 2FA)
11. **`/manager-invites`** + `/account/multi`

### P3 — 외부 의존 (후속)

12. **휴대폰 PASS** — 사업자 선정
13. **실 NHN 이메일 발송** — 자격증명 등록 (콘솔 작업 사용자)
14. **후불 BackOffice 승인 워크플로우** — 운영자단 화면 의존

### 위생적 작업

15. **`schema.ts`에 누락된 회원·인증 테이블 정의** — `TB_SESSION`, `TB_TERMS`, `TB_TERMS_AGREEMENT`, `TB_MEMBER_VERIFICATION`, `TB_MANAGER_INVITE`, `TB_CONTRACT`, `TB_CONTRACT_FILE`. drizzle-kit drift 해소.
16. **운영 절차 다중화** — Aurora 접근 경로 다중화 (Cloudflare Tunnel·RDS Proxy 등). 오늘도 SG가 다시 닫혀 라이브 컬럼 확인 불가.
