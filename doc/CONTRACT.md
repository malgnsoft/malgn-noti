# `/account/contract` — 계약 관리 기획·로직 정본

> **목적**: 사업자등록증 등록·심사·이용계약 전자체결·가입 서류 첨부를 한 화면에서 관리.
> 회원가입한 사업자(`corp`/`sole`)의 **미승인 상태 메인 진입점** + 승인 후 계약 갱신·서류 관리 화면.
>
> **연관**: [./SIGNUP.md](./SIGNUP.md) §3·§4 / [./MEMBERSHIP.md](./MEMBERSHIP.md) §1.2·§2 /
> [./history/history.20260602.md](./history/history.20260602.md) §7·§10
>
> **마지막 현행화**: 2026-06-02

---

## 1. 페이지 개요

| 항목 | 값 |
| --- | --- |
| 라우트 | `/account/contract` |
| 파일 | [`app/pages/account/contract.vue`](../app/pages/account/contract.vue) |
| 메인 컴포넌트 | [`AppContractPanel`](../app/components/AppContractPanel.vue) (~647 라인) |
| 보조 컴포넌트 | [`AppContractViewDialog`](../app/components/AppContractViewDialog.vue) — 계약서 미리보기 / [`AppContractSignDialog`](../app/components/AppContractSignDialog.vue) — 전자서명 3-스텝 위저드 (~807 라인) |
| 공통 셸 | [`AppMyPageShell`](../app/components/AppMyPageShell.vue) — 나의 페이지 좌측 메뉴 + 본문 슬롯 |
| 접근 권한 | 인증된 사업자(`corp` / `sole`)만 — 개인(`personal`)은 메뉴 미노출(후속) |

---

## 2. 진입 경로 — 4가지

미승인 상태의 사업자가 이 화면에 도달하는 경로 4가지가 모두 정합되어 있어야 한다.

### 2.1 회원가입 직후 (자동)

```
/signup Step 5 → "계약 관리로 이동" 버튼
  → if isBusiness: navigateTo('/account/contract')
     else: navigateTo('/home')
```

코드: [signup.vue `finish()`](../app/pages/signup.vue#L456)

### 2.2 로그인 직후 (자동)

```
/login → loginByEmail() → fetchMe()
  → if approvalState ∈ {pending, rejected}: navigateTo('/account/contract')
     else: navigateTo(redirect ?? '/home')
```

코드: [login/index.vue `onLogin()`](../app/pages/login/index.vue#L44)

### 2.3 미들웨어 리다이렉트 (다른 차단 페이지 시도)

```
/home·/send/*·/contacts·… 진입 시도
  → middleware/approval.global.ts
  → if approvalState !== 'approved' && path ∉ ALLOWED_PREFIXES:
       return navigateTo('/account/contract')
```

허용 경로: `/account/*` · `/help` · `/guide` · `/wbs` · `/inquiry` · `meta.auth: false`
코드: [middleware/approval.global.ts](../app/middleware/approval.global.ts)

### 2.4 글로벌 띠 CTA (수동)

[`AppApprovalBanner`](../app/components/AppApprovalBanner.vue) (모든 페이지 layout 최상단) — CTA 클릭 시:
- pending → "사업자등록증 등록"
- rejected → "다시 제출하기"

→ 모두 `/account/contract`로 이동.

---

## 3. 화면 구성 — 2 섹션

### 3.1 이용계약 체결

전자계약 방식의 이용계약서 카드 리스트.

**상태 4종**:

| `status` | 라벨 | 아이콘 | `canSign` | 의미 |
| --- | --- | --- | --- | --- |
| `initial` | 최초계약 | `square-pen` | ✅ | 가입 후 최초 1회 체결 필요 |
| `done` | 체결완료 | `circle-check` | ❌ | 정상 체결 — 서명자·체결일·만료일 표시 |
| `renew` | 계약갱신 | `circle-alert` | ✅ | 운영자가 신규 계약서 배포, 갱신 필요. **체결마감일은 빨간 강조** |
| `expired` | 만료 | (회색) | ❌ | 갱신 계약 체결 시 자동으로 기존 계약이 `expired`로 전이 |

각 카드 액션:
- **계약서 확인** (모든 상태) → `AppContractViewDialog` 모달 (요약본)
- **계약체결하기** (`canSign=true`일 때만) → `AppContractSignDialog` 3-스텝 위저드

#### 전자서명 위저드 ([AppContractSignDialog](../app/components/AppContractSignDialog.vue))

| Step | 라벨 | 내용 |
| --- | --- | --- |
| 1 | 제1장 · 총칙 및 서류 | 제1조~제8조 — 목적·정의·계약 성립·서류 등 |
| 2 | 제2장 · 이용요금 및 결제 | 단가표·청구주기·연체·환불 등 |
| 3 | 제3장 · 전자서명 / 공인인증 | 약관 동의 + 서명 |

체결 완료 시 emit `completed` → 부모(`AppContractPanel.onSignCompleted()`)가 상태를 `done`으로 전이 + 갱신 계약이면 기존 모든 계약을 `expired`로 전이.

### 3.2 가입서류 첨부

PDF만 첨부 가능, 최대 10MB.

**서류 3종**:

| 라벨 | 배지 | 활성화 조건 | 비고 |
| --- | --- | --- | --- |
| **사업자등록증** | `필수` | 항상 노출 | 신규 가입자의 핵심 제출물 |
| **대부업등록증** | `해당업체` | 체크박스 "대부업 해당" 활성 시 | 대부업 업체만 |
| **지급이행보증보험증권** | `해당업체` | 체크박스 "후불 정산 해당" 활성 시 | 후불 결제 신청 사업자만 |

#### 파일 첨부 흐름

```
[사업자등록증 업로드] 클릭
  → uploadGuideOpen 모달 ("PDF · 10MB · …")
  → 확인 → input[type=file] 트리거
  → pickFile(): MIME=application/pdf, size ≤ 10MB 검증
  → 검증 통과 시 ref 배열에 prepend({name, size, at: nowStamp(), url: blob URL})
  → 토스트 "서류가 첨부되었습니다."
```

첨부된 서류는 카드 리스트로 표시 — 파일명 / 크기 / 첨부일자 / **확인** 버튼(미리보기 모달).

---

## 4. 사용자 액션 매트릭스

| 액션 | 호출 | 결과 |
| --- | --- | --- |
| 계약서 확인 | `viewContract(c)` | `AppContractViewDialog` 모달 — 요약본 |
| 계약체결하기 | `signContract(c)` | `AppContractSignDialog` 3-스텝 → 완료 시 `done` |
| 서류 업로드 클릭 | `requestUpload(target)` | 가이드 모달 → 파일 선택 |
| 파일 선택 | `pickFile(target, e)` | MIME·크기 검증 → ref에 추가 |
| 서류 확인 | `openPreview(label, f)` | 미리보기 모달 (`AppFilePreviewDialog`) |
| 대부업/후불 해당 토글 | `loanApplicable`·`insuranceApplicable` | 첨부 인터페이스 활성/비활성 |
| 저장하기 | `save()` | 현재는 토스트만 — 실 API 미연결 |

---

## 5. 회원 유형별 서류 요구사항

[SIGNUP.md §2](./SIGNUP.md#2-핵심-차이-한눈에) 정책 표 기반:

| 가입 유형 | 카드 충전 시 | 후불 정산 시 |
| --- | --- | --- |
| **법인사업자** (`corp`) | 사업자등록증 + (대부업등록증) + 가입신청서 | 위 + 지급이행보증보험증권 + 통장사본 |
| **개인사업자** (`sole`) | 사업자등록증 + (대부업등록증) + 가입신청서 | 위 + 지급이행보증보험증권 + 통장사본 |
| **개인** (`personal`) | (가입신청서만 — 본 화면 미진입) | ❌ 후불 미지원 |

> ⚠️ **현재 코드는 회원 유형에 따른 분기가 없음** — 모든 사업자에게 동일 폼 노출. 정책에 따른 항목 토글은 후속 작업.

---

## 6. 상태 전이 (이용계약)

```
                ┌──────────────┐
                │  initial     │  ← 가입 직후 자동 생성
                └──────┬───────┘
              계약체결하기 (위저드 통과)
                       ▼
                ┌──────────────┐    운영자가 신규 약관 배포
                │  done        │ ─────────────────────────┐
                └──────────────┘                          ▼
                                                  ┌──────────────┐
                                                  │  renew       │
                                                  └──────┬───────┘
                                          계약체결하기 (갱신 위저드 통과)
                                                         ▼
                                                  ┌──────────────┐
                            기존 done 계약은 ──→  │ expired      │
                            자동으로 expired      │              │
                                                  └──────────────┘
```

코드: [AppContractPanel `onSignCompleted()`](../app/components/AppContractPanel.vue#L168) — `wasRenewal`일 때 다른 모든 계약을 expired로 전이.

---

## 7. 정책 결정 사항

### 7.1 미승인 사용자의 메인 진입점

- 회원가입한 사업자는 **반드시** 본 화면에서 사업자등록증을 등록해야 운영자 심사 → 승인 → 서비스 이용.
- 미승인 상태에서는 GNB·홈·발송·주소록 등 어떤 페이지에 가도 미들웨어가 본 화면으로 리다이렉트.

### 7.2 카드 충전 vs 후불 정산

- **카드 충전**: 사업자등록증 + (대부업등록증) — 등록 후 운영자 승인 → 즉시 카드 등록·충전·발송 가능.
- **후불 정산**: 위 + **지급이행보증보험증권** + 통장사본 — 운영자가 추가 검수 → 신용 한도 부여.
- 현재 화면은 두 경로의 서류를 모두 표시하고 사용자가 "후불 정산 해당" 체크로 선택.

### 7.3 신규 가입자의 표시 메시지

§7~§10에서 결정 — 신규 가입자는 사업자등록증을 아직 제출하지 않은 상태이므로:
- 글로벌 띠: "**사업자등록증을 등록해 주세요** — 등록 후 심사 승인이 완료되면 …"
- 가입 완료 화면: "다음 화면에서 **사업자등록증을 등록**해 주세요."
- 회원 정보 화면(`/account/settings`) 배너: "**사업자등록증을 등록해 주세요** / 계약 관리에서 사업자등록증을 등록해 주세요."

→ "심사 중"이 아니라 "등록해 주세요"가 정확한 신규 가입자 안내.

### 7.4 이용계약 자동 생성

가입 직후 운영자가 별도 작업 없이도 `initial` 상태의 이용계약 1건이 자동으로 사용자 화면에 노출되어야 한다. (현재 목업 하드코딩 — 후속에서 백엔드 트리거 필요.)

### 7.5 갱신 계약 체결 시 기존 계약 자동 만료

운영자가 신규 약관(`renew`)을 배포하고 사용자가 체결 완료하면, 동일 유형의 기존 `done` 계약은 모두 `expired`로 자동 전이 — 이중 유효 계약 방지.

### 7.6 파일 제약

- **MIME**: `application/pdf` 만 허용
- **최대 크기**: 10MB
- **검증**: 프런트에서 1차 (현재 구현) + 백엔드에서 재검증 (R2 업로드 시 — 후속)

---

## 8. API 엔드포인트 (예정 — 현재 모두 ⚪)

### 8.1 계약

| 라우트 | 역할 |
| --- | --- |
| `GET /contracts` | 본 회사의 이용계약 목록 (status·version 포함) |
| `GET /contracts/{id}` | 계약서 본문 (chapters·articles JSON) |
| `POST /contracts/{id}/sign` | 전자서명 완료 처리 — `signer` 정보 + IP·UA 적재 + `done`으로 전이 + 갱신이면 다른 `done` → `expired` |
| `GET /contracts/templates` | 운영자가 배포한 약관 템플릿 목록 (`renew` 트리거용) |

### 8.2 가입 서류 (R2 업로드)

| 라우트 | 역할 |
| --- | --- |
| `POST /contracts/files/upload-url` | R2 presigned URL 발급 (`?kind=biz/loan/insurance`) |
| `POST /contracts/files` | 업로드 완료 후 메타 등록 (`r2_key`·`size`·`mime`·`kind`·`uploaded_at`) |
| `GET /contracts/files` | 본 회사의 첨부 서류 목록 |
| `GET /contracts/files/{id}/download-url` | 미리보기·다운로드용 presigned URL |
| `DELETE /contracts/files/{id}` | 제거 (운영자 승인 전까지만) |

### 8.3 운영자 검수 (운영자단 — 미구현)

| 라우트 | 역할 |
| --- | --- |
| `GET /admin/companies/{id}/contracts` | 운영자가 회사별 계약·서류 조회 |
| `POST /admin/companies/{id}/approve` | 사업자등록증 승인 → `approval_state='approved'` |
| `POST /admin/companies/{id}/reject {reason}` | 반려 → `approval_state='rejected'` + `rejected_reason` 적재 |

---

## 9. DB 테이블 (예정)

### 9.1 `TB_CONTRACT` (라이브 있음 — schema.ts 미정의)

```sql
TB_CONTRACT (
  id              BIGINT PK,
  company_id      BIGINT NOT NULL (FK → TB_COMPANY),
  template_id     BIGINT,                 -- 운영자가 배포한 약관 정본
  status          VARCHAR(20),            -- initial/done/renew/expired
  version         VARCHAR(20),            -- v0.9 / v2.0 / 신규 / 갱신
  title           VARCHAR(160),
  signer_user_id  BIGINT,                 -- 서명자 (TB_USER FK)
  signed_at       DATETIME,
  signer_ip       VARCHAR(45),
  signer_ua       VARCHAR(255),
  expires_at      DATETIME,               -- 보통 체결 + 2년
  created_at      DATETIME,
  updated_at      DATETIME,
  INDEX (company_id, status, expires_at)
)
```

### 9.2 `TB_CONTRACT_FILE` (라이브 있음 — schema.ts 미정의)

```sql
TB_CONTRACT_FILE (
  id            BIGINT PK,
  company_id    BIGINT NOT NULL (FK → TB_COMPANY),
  kind          VARCHAR(20),         -- biz/loan/insurance/passbook
  file_name     VARCHAR(255),
  r2_key        VARCHAR(255),        -- Cloudflare R2 객체 키
  mime          VARCHAR(80),
  size_bytes    BIGINT,
  uploaded_by   BIGINT,              -- TB_USER FK
  uploaded_at   DATETIME,
  status        INT DEFAULT 1,       -- 1 정상 / -1 삭제
  INDEX (company_id, kind, uploaded_at)
)
```

### 9.3 (검토) `TB_CONTRACT_TEMPLATE`

운영자가 배포하는 약관 정본 + chapter·article JSON. 신규 배포 시 회사별 `TB_CONTRACT.status='renew'`로 자동 마이그레이션.

---

## 10. 현재 구현 상태

| 영역 | 상태 | 비고 |
| --- | --- | --- |
| 이용계약 카드 리스트 | 🟢 UI | 목업 3건 하드코딩 |
| 계약서 확인 모달 | 🟢 UI | 약관 정본 하드코딩 |
| 전자서명 위저드 (3-스텝) | 🟢 UI | 완료 시 로컬 ref 변경, 백엔드 호출 없음 |
| 갱신 → 기존 만료 자동 전이 | 🟢 UI | 로컬 로직 OK |
| 가입서류 첨부 (PDF/10MB 검증) | 🟢 UI | 파일 URL만 ref에 적재, 업로드 없음 |
| 대부업·후불 체크박스 토글 | 🟢 UI | 로컬 ref |
| 첨부 서류 미리보기 | 🟢 UI | blob URL |
| 저장하기 | 🟢 UI | 토스트만 |
| **이용계약 API 연동** | ⚪ | `GET /contracts`·`POST /sign` 미구현 |
| **서류 R2 업로드 API** | ⚪ | presigned URL + 메타 적재 미구현 |
| **회원 유형별 서류 분기** | ⚪ | 현재 모든 사업자에게 동일 폼 |
| **운영자 승인 트리거** | ⚪ | 운영자단 미개발 — DB 직접 UPDATE만 가능 |
| **미승인 사용자 UX 분기** | ⚪ | "사업자등록증 등록 전" / "등록 후 심사 중" 두 상태 시각 구분 없음 |
| **자동 이용계약 생성** | ⚪ | 가입 직후 `initial` 1건 자동 생성 트리거 필요 |

---

## 11. 알려진 한계 / 후속 작업

### P0 — 가입 후 폐쇄 루프 완성

1. **R2 업로드 API + `TB_CONTRACT_FILE` 라우트** — 사업자등록증 실 업로드 가능해야 운영자가 검수 가능. 가입 흐름의 최우선 후속.
2. **운영자단 사업자 승인 화면** — 현재 DB 직접 UPDATE로만 가능. 운영자가 본 페이지의 업로드 파일을 보고 승인/반려 처리 가능해야 함. WBS 5-4-3.
3. **자동 `initial` 이용계약 생성** — 가입 시 트리거. signup 라우트에서 INSERT 또는 운영자 일괄 배포.

### P1 — UX 분기 정합화

4. **신규 가입자 UX**: "사업자등록증을 아직 안 냈음" vs "냈는데 심사 중" 두 상태를 시각 구분.
   - 옵션 A: `approval_state`를 4단계로 세분화 (`unsubmitted`/`pending`/`approved`/`rejected`)
   - 옵션 B: `TB_CONTRACT_FILE`의 `kind='biz'` 존재 여부로 판단
5. **회원 유형별 폼 분기**: `auth.tenant.companyType`에 따라 대부업·후불 옵션 노출 여부 결정.
6. **개인 가입자의 메뉴 숨김**: `/account/contract` 항목 자체를 LNB·`AppMyPageShell`에서 미노출.

### P2 — 약관·계약 정본 관리

7. **`TB_CONTRACT_TEMPLATE`** — 운영자가 약관 본문 정본 등록·버전 관리·일괄 `renew` 배포.
8. **전자서명 인증 강화** — 현재는 위저드 통과만 = 서명 완료. 휴대폰 본인 인증(NICE) 또는 공인인증서 연계.
9. **계약서 PDF 생성** — 체결 완료 시 서명·시간·IP·UA가 들어간 PDF 자동 생성 → R2 저장 → 사용자가 다운로드.

### P3 — 위생적 작업

10. **schema.ts에 `TB_CONTRACT`·`TB_CONTRACT_FILE` 정의** — drizzle-kit drift 해소.
11. **갱신 알림** — `renew` 상태가 되면 사용자에게 이메일·SMS·인앱 알림.
12. **체결마감일 임박 경고** — `renew.metas[].danger=true` 외에 GNB 띠로 일주일 전부터 강조.
