# 2026-06-02 — WBS 3 트랙 분리 + 로그인 UX(고객사 ID 제거) + loginid 전역 UNIQUE + 휴대폰 OTP + 토스트 가시성 + NICE 통합인증 인프라

## 한 줄 요약

이번주 회원·인증 트랙 첫 날 5건 처리. **(§1)** WBS 3 트랙 분리(5-3A UI / 5-3M 매트릭스 / 5-3C 연동) — 진척 과대평가 문제 해소, Step 5 55%→40%. **(§2)** `POST /auth/login-by-email` 신설 + 로그인 화면 "고객사 ID" 필드 완전 제거 (Workers #10 / Pages #52). **(§3)** `TB_USER.loginid` 전역 UNIQUE 정합화 — `0003` 라이브 적용, 복수 매치 경로 + 회사 선택 UI 제거 (Workers #11 / Pages #53). **(§4)** 휴대폰 OTP 라우트 (`/auth/phone-code/send`·`/verify`) + signup.vue Step 4 SMS OTP 연동 + 로그인 401 처리 정합화(`/auth/*` 호출은 자동 리다이렉트 안 함) + 회원가입 완료 화면 고객사 ID 노출 제거 + 토스트 위치(오른쪽 위) + 크기 강화(17px). NHN_MOCK secret 적용 — 자격증명 발급 전 mock 통과. (Workers #12 / Pages #54~#58). **(§5)** **NICE 통합인증(휴대폰 본인확인)** 인프라 — `doc/NICE_AUTH.md` 신규 정본 + `0004_user_nice_auth.sql` 라이브 적용(TB_NICE_AUTH + TB_USER에 ci/birthdate/gender/national_info/mobile_co + UNIQUE ci) + NICE 어댑터(mock/real, AES-256-GCM + PBKDF2 + HMAC) + 3 라우트(init/callback/status) + `/auth/signup` 확장(niceSession 검증·CI 중복 차단·NICE 결과로 이름·휴대폰·생년월일 덮어쓰기) + signup.vue Step 4 통째로 NICE 흐름으로 교체("본인 인증하기" 버튼 + 폴링 + 결과 표시) + NICE_MOCK secret 적용. (Workers #13 / Pages #60). 라이브 e2e 모두 통과. **이메일 인증창** 차단 UX 버그 발견·수정: useApi 401 핸들러가 모든 401을 /login으로 리다이렉트해서 가입 도중 OTP 잘못 입력하면 페이지 이동되던 문제 → `/auth/*` 호출의 401은 호출자가 처리하도록 분리. **NHN 자격증명 미등록**: 메일 실 발송 0 — 가입 흐름은 NHN_MOCK + NICE_MOCK secret 켜진 mock 모드로 통과.

---


# §1. WBS 구조 개편 — 사용자단을 **3 트랙(UI / API / 연동)**으로 분리 (배포 #51)

## 한 줄

"화면 UI는 그렸지만 백엔드 연동은 안 됐는데 ✅로 표시돼 진척이 과대평가되는" 문제를 해소. WBS의 5-3을 **5-3A 화면 UI 구성**(목업 데이터로 페이지만 그리기) + **5-3M 매트릭스**(도메인별 UI/API/연동 한눈에) + **5-3C 화면 ↔ API 연동**(실 데이터 흐름) 3 트랙으로 분리. 5-3-15의 단일 "백엔드 연동" 항목을 16개 도메인별 5-3C-1~16으로 펼침(인증·계정 + 이메일 OTP 2개만 ✅, 나머지 14개 ⚪). 5-2 API 항목들은 그대로 두되 5-3M 매트릭스에서 도메인 단위로 매핑. Step 5 진척률을 55% → 40%로 재산정(연동 트랙 약 7%만 완료 반영) → 전체 가중평균 45% → 38%. `doc/WBS.md` + `app/pages/wbs.vue` 양쪽 동기, Pages 배포 #51(alias `bca573ce.malgn-noti.pages.dev`).

## 1.1 문제

5-3 항목들의 ✅는 사실상 모두 "UI 화면을 목업 데이터로 그렸다" 단계까지를 의미했는데, WBS만 보면 "발송·이력·주소록 등이 모두 완료"처럼 보였다. 6/1 (어제 history.20260601.md) §4·§5에서 "인증·계정만 실 API 연동 완료"로 5-3-15(백엔드 연동)를 추가했지만, 도메인별 단위가 아니라 한 항목으로 묶여 있어 어디까지 됐고 어디가 안 됐는지가 가시화되지 않음.

## 1.2 해결 — 3 트랙 분리

| 트랙 | 항목 ID | 의미 | ✅의 기준 |
| --- | --- | --- | --- |
| **A. 화면 UI 구성** | `5-3A-*` | 목업 데이터로 페이지 그리기 | 라우트가 라이브, 화면이 렌더링 |
| **B. API 엔드포인트** | `5-2-*` (기존) | 백엔드 라우트 구현 | 라우트가 라이브, e2e 검증 |
| **C. 화면 ↔ API 연동** | `5-3C-*` (신규) | 실 데이터 흐름 + 상태 관리 + 에러 처리 | UI가 실 API를 호출, 응답이 화면에 반영 |

추가로 **5-3M 매트릭스** — 각 도메인을 한 행에 UI/API/연동 3 칸으로 정렬해 어디까지 됐는지 한눈에. 25 도메인 × 3 트랙 = 75 칸.

## 1.3 5-3C 펼침 (16 항목)

5-3-15 단일 항목 → 도메인별 16 항목:

- ✅ 2개: 5-3C-1 (인증·계정), 5-3C-1a (이메일 OTP)
- ⚪ 14개: 로그아웃·비밀번호 재설정·login-by-email·약관 동의·companyType·`/me` 갱신·비밀번호 변경·2FA·멀티 계정·계약·발송 6채널·이력/통계·주소록 등 CRUD·결제·문의

우선순위는 [doc/MEMBERSHIP.md](../MEMBERSHIP.md) §8과 일치 — P0 3, P1 4, P2 4, P3 3.

## 1.4 진척률 재산정

| Step | 기존 | 재산정 | 사유 |
| --- | --- | --- | --- |
| 1 준비 | 55% | 55% | 변동 없음 |
| 2 정책 | 55% | 55% | 변동 없음 |
| 3 기획 | 35% | 35% | 변동 없음 |
| 4 디자인 | 20% | 20% | 변동 없음 |
| **5 개발** | **55%** | **40%** | UI(거의 완료) + API(60%) + 연동(7%)을 가중평균. UI는 7주의 작업이고 연동·API가 더 큰 비중을 차지하므로 단순 평균 |
| **전체 가중평균** | **45%** | **38%** | `0.10×55 + 0.15×55 + 0.20×35 + 0.10×20 + 0.45×40 ≈ 37.75` |

## 1.5 산출물

- [doc/WBS.md](../WBS.md) — 5-3 섹션 전면 개편 (5-3A·5-3M·5-3C). 진척률 스냅샷 갱신. 가중평균 45→38.
- [app/pages/wbs.vue](../../app/pages/wbs.vue) — group 라벨 '사용자단 화면' → '사용자단 화면 UI (목업)', 5-3-15 삭제 + 5-3C-* 16 신규, stage-5 progress 55→40 + summary 갱신.
- Pages 배포 #51 (alias `bca573ce.malgn-noti.pages.dev`). 라이브 그렙으로 17개 5-3C 항목 + 새 그룹 라벨 2종 노출 확인.

## 1.6 다음 작업 (이번주 회원·인증 트랙)

[MEMBERSHIP.md](../MEMBERSHIP.md) §8 P0 3건 + P1 4건이 이번주 본격 작업. 가장 빠른 영향 순:

1. **5-3C-2 로그아웃 GNB 실 연결** (30분, 의존 0)
2. **5-3C-3 비밀번호 재설정** (2~3시간, OTP 인프라 재활용)
3. **5-3C-4 `/auth/login-by-email`** (1~2시간, companyId UX 개선)
4. **5-3C-5 약관 동의 적재** (1~2시간)
5. **5-3C-6 `companyType` 전달·저장** (2~3시간) + 5-3C-6 따라가는 개인 유형 화면 분기 (30분)

---

# §2. 로그인 UX 개선 — `POST /auth/login-by-email` + 고객사 ID 필드 제거 (배포 #10·#52)

## 한 줄

(어제) §4의 알려진 한계("로그인이 `companyId`를 요구해 사용자가 자신의 회사 ID를 외워야 함")를 해소. 백엔드 `POST /auth/login-by-email` 신설 — 이메일(또는 아이디) + 비밀번호만으로 회사 자동 찾기, 단일 매치 시 즉시 토큰 발급, 같은 이메일로 여러 회사에 가입된 경우 `multipleCompanies: true + companies[]` 반환. 프런트 `login/index.vue`에서 **고객사 ID 필드를 완전히 제거**, 복수 매치 시 회사 선택 카드 UI 노출 → 선택 시 기존 `/auth/login`으로 명시적 로그인. 라이브 e2e 5 시나리오 통과(단일/복수/잘못된 비번/없는 이메일/같은 이메일 2회사). Workers 배포 #10(Version `a6197cc7-0f01-4612-aa10-5271f7c494a1`), Pages 배포 #52(alias `292da05d.malgn-noti.pages.dev`).

## 2.1 백엔드 — `POST /auth/login-by-email`

`src/routes/auth.ts`:

- 입력: `{email, password}` — `email` 필드명이지만 실제로는 `loginid` 또는 `email` 컬럼 매치 (회원가입 마법사가 `loginid = email`로 발급하므로 둘 다 검색)
- 검색: `WHERE user.status=1 AND company.status=1 AND (user.loginid = ? OR user.email = ?)` + INNER JOIN company
- 각 row별로 PBKDF2 비번 검증 (서로 다른 회사·다른 비밀번호 가능)
- **단일 매치**: 기존 `/auth/login`과 동일 형식의 `AuthResponse` 반환 + 토큰 발급 + `lastLoginAt` 갱신
- **복수 매치**: `{multipleCompanies: true, companies: [{id, name}, ...]}` 반환 (토큰 발급 안 함)
- **매치 0 또는 비번 모두 불일치**: 401 `unauthenticated` (계정 enumeration 방지)

OpenAPI: 신규 path 1 + 신규 schema 2(`LoginByEmailRequest`, `MultipleCompaniesResponse`). 응답 schema는 `oneOf: [AuthResponse, MultipleCompaniesResponse]` — 두 가지 가능 형태 명시.

## 2.2 프런트 — `login/index.vue` 개편

- **고객사 ID 필드 완전 제거**. 5/27 §12에서 도입한 `companyIdInput`·`needCompanyId`·`effectiveCompanyId` 로직 모두 삭제. `last-company-id` 쿠키도 더 이상 로그인 폼에서 사용하지 않음(다만 인증 후 hydrateFromAuth에서 갱신은 유지 — 이전 가입 흔적 보존).
- **`stores/auth.ts.loginByEmail()`** 액션 신규 — 반환값 `null` = 단일 매치 (로그인 완료) / `{id,name}[]` = 복수 매치 (호출자가 회사 선택 후 `login()` 재호출).
- **복수 매치 UI**: `companyChoices` ref가 비어있지 않으면 일반 폼 대신 회사 선택 카드 리스트 노출. 카드 클릭 시 `chooseCompany(companyId)` → 기존 `login()` 호출. "다시 입력" 버튼으로 초기 폼 복귀.
- **에러 처리**: 401 응답 → "아이디 또는 비밀번호가 올바르지 않습니다." 토스트. 그 외 → "로그인 중 오류가 발생했습니다."
- **이메일 placeholder**: "아이디를 입력해 주세요" → "가입 시 사용한 이메일을 입력해 주세요" + `inputmode="email"` 힌트.

## 2.3 라이브 e2e (Production)

| # | 시나리오 | 결과 |
| --- | --- | --- |
| 1 | signup → company.id=12 발급 | ✅ |
| 2 | login-by-email 단일 매치 → 200 + token (169자) | ✅ |
| 3 | 잘못된 비밀번호 → 401 `unauthenticated` | ✅ |
| 4 | 존재하지 않는 이메일 → 401 (계정 enumeration 방지) | ✅ |
| 5 | 같은 이메일로 2번째 회사 signup → login-by-email → `{multipleCompanies:true, companies:[{id:12,name:...}, {id:13,name:...}]}` | ✅ |
| 6 | 프로덕션 `/login` 페이지 그렙 — "고객사 ID" 0건 / "가입 시 사용한 이메일" 1건 | ✅ |

검증 과정의 임시 계정(company.id 12·13) 2건은 SG 재개방 시 cleanup 예정.

## 2.4 산출물

- API: 3 파일 수정 — `src/routes/auth.ts`(+85) · `src/openapi.ts`(+25) · `src/db/schema.ts` (변동 없음 — verification 정의는 §5에서 이미 반영).
- 사용자단: 2 파일 수정 — `app/stores/auth.ts`(+20) · `app/pages/login/index.vue`(전면 개편, +90/-30).
- Workers 배포 #10 Version `a6197cc7...`, Pages 배포 #52 alias `292da05d`.
- WBS 5-3C-4 ⚪ → ✅. doc/MEMBERSHIP.md §8 P0 #3 완료(로그아웃·재설정 다음).

## 2.5 보안 노트

- **로그인 가능한 입력**: `loginid` 또는 `email` 컬럼 매치. 같은 사용자가 두 컬럼에 다른 값을 가질 수 있다면(현재 회원가입 마법사는 둘 다 email로 채움) 둘 다로 로그인 가능. 운영상 의도된 동작.
- **enumeration 방지**: 잘못된 이메일·잘못된 비밀번호 모두 동일한 401 메시지("Authentication required") — 응답 내용으로 이메일 존재 여부를 알 수 없음.
- **타이밍**: 매치 row 수만큼 PBKDF2를 돌리므로 row 수가 많으면 응답 시간이 살짝 길어짐. 복수 매치는 실제로는 드물지만, 한 이메일을 의도적으로 많이 등록해 DoS 가능. 후속 rate limit 작업과 함께 검토.

## 2.6 알려진 한계

- **`last-company-id` 쿠키 잔존**: 더 이상 로그인 폼에서 사용하지 않으나, `hydrateFromAuth`에서 여전히 갱신. 후속에서 제거 또는 다른 용도로 활용 검토.
- **회원가입에서 loginid ≠ email로 가입한 사용자**: 현재 마법사 외 경로(예: 운영자단 강제 가입)로 만들어진 사용자는 이메일이 비어 있을 수 있어 login-by-email로 로그인 불가. 운영자단 흐름이 생기면 정책 정의 필요.

---

# §3. `TB_USER.loginid` 전역 UNIQUE — 정책 정합화 (배포 #11·#53)

## 한 줄

(§2에서) 도입한 `login-by-email`의 "복수 매치" 경로는 사실 `UNIQUE (company_id, loginid)` 복합 제약 때문에 같은 loginid가 회사별로 따로 존재할 수 있다는 가정에서 나왔는데, 사용자 정책 결정으로 **loginid는 회사와 무관하게 전체 시스템에서 유일해야 함**으로 정리. DDL 마이그레이션 `0003_user_loginid_global_unique.sql` 라이브 적용(`uq_user_company_loginid` DROP → `uq_user_loginid` ADD), schema.ts에 `.unique('uq_user_loginid')` 명시, 백엔드 `/auth/login-by-email`의 복수 매치 분기 제거, OpenAPI에서 `MultipleCompaniesResponse` 스키마 삭제, 프런트 `stores/auth.ts.loginByEmail()` 반환 타입 단순화 + `login/index.vue`에서 회사 선택 카드 UI 80여 라인 제거. 라이브 e2e 4 시나리오 통과(signup 정상 / 같은 loginid 재시도 409 / login-by-email 단일 토큰 / multipleCompanies 응답 사라짐). 사전 테스트 데이터 cleanup 8개 회사 + 12개 사용자(어제 검증용 임시 계정).

## 3.1 정책 변경

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| TB_USER UNIQUE | `(company_id, loginid)` 복합 | `(loginid)` 단독 |
| 같은 이메일로 여러 회사 가입 | 가능 | **불가** — signup 시 409 conflict |
| `login-by-email` 응답 분기 | 단일/복수 | **단일만** |
| 회사 선택 UI | 복수 매치 시 카드 리스트 | **삭제** |

이로써 "한 이메일 = 한 회사 = 한 로그인"이 보장됨. 멀티 계정(주계정·보조계정)은 같은 회사 내 다른 loginid로 처리.

## 3.2 DDL 마이그레이션 (라이브 적용 완료)

[src/db/migrations/0003_user_loginid_global_unique.sql](../../../malgn-noti-api/src/db/migrations/0003_user_loginid_global_unique.sql):
```sql
ALTER TABLE TB_USER
  DROP INDEX uq_user_company_loginid,
  ADD UNIQUE KEY uq_user_loginid (loginid);
```

### 적용 순서 (SG 열린 짧은 윈도우 활용)

1. **사전 cleanup** — 어제부터 누적된 검증용 임시 계정 정리:
   - `TB_USER` 6 → 4 (lbe 중복 2건 + hd-check + ddl 등)
   - `TB_COMPANY` 그에 맞춰 정리
   - `TB_VERIFICATION` 0건
2. **DDL 적용** — mysql CLI 직결로 ALTER 실행, exit=0
3. **사후 검증**:
   - 인덱스 확인: `uq_user_loginid (loginid)` 단독 노출
   - 중복 INSERT 시도: `Duplicate entry … for key 'TB_USER.uq_user_loginid'` 1062 에러 → ✅ 동작

## 3.3 코드 변경 (백엔드)

| 파일 | 변경 |
| --- | --- |
| [src/db/schema.ts](../../../malgn-noti-api/src/db/schema.ts) | TB_USER 정의에 `loginid: varchar(...).notNull().unique('uq_user_loginid')` 추가 + 헤더 코멘트 |
| [src/routes/auth.ts](../../../malgn-noti-api/src/routes/auth.ts) | `/login-by-email` 단순화 — `for of` 다중 verify 루프 → `.limit(1)` 단일 select + 단일 password check. 복수 매치 분기 + multipleCompanies 응답 코드 삭제 |
| [src/openapi.ts](../../../malgn-noti-api/src/openapi.ts) | `MultipleCompaniesResponse` 스키마 삭제. `/login-by-email` 응답 `oneOf` → 단일 `AuthResponse`로 단순화. 설명 갱신("loginid 전역 UNIQUE — 최대 1건 매치"). |

## 3.4 코드 변경 (프런트)

| 파일 | 변경 |
| --- | --- |
| [app/stores/auth.ts](../../app/stores/auth.ts) | `loginByEmail()` 반환 타입 `Promise<Company[] | null>` → `Promise<void>`. union 타입 분기 제거. |
| [app/pages/login/index.vue](../../app/pages/login/index.vue) | `companyChoices` ref / `showCompanyPicker` computed / `chooseCompany()` / `cancelCompanyPick()` 함수 + 회사 선택 카드 템플릿 + 관련 스타일 (`.picker-desc`·`.company-list`·`.company-card`·`.company-name`·`.company-id`·`.company-arrow`) 모두 삭제. 화면은 단일 폼만. |

## 3.5 라이브 e2e (Production)

| # | 시나리오 | 결과 |
| --- | --- | --- |
| 1 | signup → `{user, company, token}` 정상 (company.id=14, user.id=16) | ✅ |
| 2 | 같은 loginid로 두 번째 signup → 409 `conflict` "loginid \"…\" 이미 사용 중" | ✅ |
| 3 | login-by-email 정상 매치 → 200 + 단일 토큰. 응답에 `multipleCompanies` 키 없음 | ✅ |
| 4 | cleanup 후 인덱스 확인 — UNIQUE 인덱스 `uq_user_loginid (loginid)` 단독 | ✅ |

## 3.6 산출물

- **DDL**: `malgn-noti-api/src/db/migrations/0003_user_loginid_global_unique.sql` 신규 + 라이브 적용
- **API**: 3 파일 수정 — schema.ts · auth.ts · openapi.ts. Workers 배포 #11 Version `f7f42855-1d40-4397-9405-df8bfa8124ee`
- **사용자단**: 2 파일 수정 — stores/auth.ts(-25) · login/index.vue(-80). Pages 배포 #53 alias `f150ea0a.malgn-noti.pages.dev`
- **데이터 정리**: 어제~오늘 누적된 검증용 임시 회사 8 + 사용자 12 + verification 미소비분 cleanup

## 3.7 영향 분석 — 다른 코드에 미치는 영향

| 항목 | 영향 |
| --- | --- |
| 기존 `/auth/login` (companyId+loginid) | 그대로 동작 — companyId가 제약을 더 좁히지만 결과는 같음 |
| `/auth/signup` | catch 블록의 "Duplicate entry" 메시지 매핑 그대로 (에러 메시지 자체가 회사·loginid 어느 키든 같은 형태) |
| 멀티계정(주·보조 사용자) | 같은 회사 내에서 서로 다른 loginid를 사용 — 영향 없음 |
| 운영자단 강제 가입 | 미구현 — 정책 정의 시 전역 UNIQUE 전제로 시작 |
| OTP / 비밀번호 재설정 | email/loginid 기반 lookup — 단일 매치 보장으로 단순화 가능 (후속) |

## 3.8 다음 단계

지금 정책이 정리됐으니 다음 P0 항목들이 한층 단순해집니다:

- **5-3C-3 비밀번호 재설정** — `email`로 lookup하면 단일 사용자 → 토큰 발급도 단순. OTP 인프라 재활용 → 2시간 이내 가능.
- **5-3C-2 로그아웃 GNB 실 연결** — 정책 변경과 무관, 30분.

---

# §4. 휴대폰 SMS OTP + 로그인 401 처리 + 가입 완료 ID 노출 제거 + 토스트 가시성 (배포 #12 / #54~#58)

## 한 줄

이메일 OTP 인프라(`(어제) §5`) 후속 — **휴대폰 SMS OTP**를 같은 패턴으로 추가하여 signup.vue Step 4를 실 API로 일관 연결 + 가입 도중 발견된 4개 UX 이슈(401 자동 리다이렉트, 가입 완료 화면의 고객사 ID 노출, 토스트 위치, 토스트 크기) 정리. Workers 배포 #12(Version `84056c86...`), Pages 배포 #54~#58. 자체 SMS OTP는 단순 휴대폰 보유 검증으로 유지 — 본인 확인(이름·CI 등)은 §5 NICE로 분리.

## 4.1 휴대폰 OTP 라우트 — 이메일과 동일 패턴

`POST /auth/phone-code/send` + `POST /auth/phone-code/verify`:
- `TB_VERIFICATION`에 `target_type='phone'` 적재 (이메일은 `'email'`)
- SHA-256(target|purpose|code) 해시 — 평문 코드 저장 금지
- TTL 10분 · 재발송 시 직전 코드 만료 · 5회 시도 제한 · 소비 후 재사용 차단
- `purpose` enum 확장: `signup` / `reset_password` / `change_phone`
- 휴대폰 번호 정규화: 입력값에서 숫자만 추출(`010-1234-5678` → `01012345678`) — 같은 사용자의 다른 표기를 같은 코드 한 건으로 매핑
- SMS 발송은 NHN SMS 어댑터 (mock/real). `NHN_MOCK=1` 또는 자격증명 미설정 시 mock fallback. mock 모드면 응답에 `mockCode` 노출(개발 편의)
- `OtpPurpose` 타입 확장 + `purposeLabel()` 4개 분기
- `EMAIL_FROM` 외 `SMS_FROM` env var 추가 (기본 `01000000000`)

OpenAPI 4지점 추가(2 paths + 2 schemas `PhoneCodeSendRequest`·`PhoneCodeSendResponse`·`PhoneCodeVerifyRequest`).

라이브 e2e 5+1 시나리오 통과: 발송 mockCode 노출 / 잘못된 코드 401 / 올바른 코드 200 / 소비 후 재시도 401 / 하이픈 포함 입력 정규화 / 이메일 OTP도 같이 회복.

## 4.2 프런트 signup.vue Step 4 — 실 API 연동 (NICE 도입 전 중간 단계)

기존 화면 더미(`codeSent.value=true` 토스트만) → 실 호출:
- `sendCode()` → `POST /auth/phone-code/send` async + `sendingPhone` 로딩 + `mockCode` 응답 시 토스트 노출 + 버튼 라벨 3-상태(`발송 중…` / `재발송` / `인증번호 받기`)
- `confirmCode()` → `POST /auth/phone-code/verify` async + `verifyingPhone` 로딩 + 백엔드 한국어 에러 메시지 그대로 토스트
- `fullPhoneE164` computed — 하이픈 제거(`01012345678`)

이 작업은 §5 NICE 도입 시점에 **다시 통째로 교체됨**(NICE가 휴대폰 인증을 대신 수행). 백엔드 휴대폰 OTP 라우트는 비밀번호 재설정·휴대폰 번호 변경 등 후속 흐름에서 그대로 재활용.

## 4.3 useApi.ts 401 처리 분리 — `/auth/*`는 호출자가 처리

가입 중 이메일 OTP 잘못 입력 → 401 → useApi 핸들러가 `/login`으로 리다이렉트 → 사용자가 코드 재입력 못 함 → 가입 흐름 차단.

수정 [app/composables/useApi.ts](../../app/composables/useApi.ts) `onResponseError`:
```ts
const url = typeof request === 'string' ? request : (request as { url?: string }).url ?? ''

// /auth/* 라우트의 401은 정상적인 "잘못된 자격증명·OTP" → 호출자가 처리해야 함
if (url.includes('/auth/')) return

// 인증되지 않은 상태에서 보호 라우트 호출 → 의미 있는 리다이렉트 아님
if (!useAuthToken().value) return

// 인증된 상태 + 보호 라우트 401 → 토큰 만료 → /login
```

## 4.4 회원가입 완료 화면 — 고객사 ID 노출 제거

§2~§3 이후 로그인 시 companyId 외울 필요 없음 → 가입 완료 화면 `발급된 고객사 ID: {id}` 라인 제거. 시안 정책상 내부 식별자는 외부 노출하지 않음.

## 4.5 토스트 가시성 강화

- **위치**: 좌하단 → 오른쪽 위 (`app.vue`의 `<UApp :toaster="{position:'top-right', expand:true, duration:5000}">` props로 직접 지정)
- **크기**: 폭 380→440px, 본문 폰트 15→17px, 패딩 16/18→20/24px, 최소 높이 56→68px, 모서리 12px, 그림자 강화, 타이틀 17px/700, 아이콘 26px
- Sonner 표준 셀렉터(`[data-sonner-toast]`) + Nuxt UI 내부 클래스 보강 셀렉터(`> div`·`p`·`span`)
- `app.config.ts`의 `ui.toaster` 설정은 타입(슬롯/variant)이 달라 제거, UApp props로 단일화

## 4.6 배포 + 검증

- Workers #12 Version `84056c86-09ff-4d2f-a9cc-4c63365fc630`
- Pages #54(`bf71cd8e`) · #55(`bfd64bcc` 401 처리) · #56(`eecef0a0` ID 제거) · #57(`4800d506` 토스트 1차) · #58(`683c5976` UApp props) — 누적 5번

## 4.7 NHN_MOCK secret 임시 적용

라이브 검증 + 실 사용자(`dotype@malgnsoft.com`) 가입을 위해 production에 NHN_MOCK secret을 일시 적용. mockCode가 응답에 노출되어 사용자가 메일 없이도 6자리 코드를 토스트로 확인 가능. 자격증명 등록 시 secret 영구 제거 예정.

---

# §5. NICE 통합인증(휴대폰 본인확인) 인프라 (배포 #13 / #60)

## 한 줄

§4에서 자체 SMS OTP로 가입 흐름을 통과시켰지만, 이는 "휴대폰 보유"만 검증하지 "본인 확인"이 아님. 사용자 요청으로 **NICE 통합인증(M=휴대폰 본인확인)** 인프라를 통째로 구축. 정본 문서 [doc/NICE_AUTH.md](../NICE_AUTH.md) 신규 작성 → 라이브 DDL 0004 적용(TB_NICE_AUTH + TB_USER에 ci/birthdate/gender/national_info/mobile_co + UNIQUE ci) → NICE 어댑터(mock/real, AES-256-GCM + PBKDF2 + HMAC) → 3 라우트(init/callback/status) → /auth/signup 확장(niceSession 검증·CI 중복 차단·NICE 결과로 이름·휴대폰·생년월일 덮어쓰기) → signup.vue Step 4 통째로 NICE 흐름으로 교체("본인 인증하기" 버튼 + 폴링 + 결과 표시) → NICE_MOCK secret 적용으로 자격증명 발급 전 mock 통과. Workers 배포 #13(Version `2ab47c1f...`), Pages 배포 #60 (alias `c9577894`). 라이브 e2e 6 시나리오 통과.

## 5.1 결정 사항

- **NICE 통합인증 휴대폰(M)** 만 1차 — 금융·공동·아이핀(F/U/I)은 후속 확장.
- **자체 SMS OTP는 유지** — 비밀번호 재설정·이메일 변경 등 단순 검증 영역. 본인 확인은 NICE.
- **mock 모드 우선** — NICE 자격증명 발급 전이라 외부 호출 없이 동작. 가짜 결과: `모의 사용자` / `19900101` / `01099998888` / CI는 `MOCK_CI_<requestNo>`로 결정적 생성(같은 세션 = 같은 CI → 중복 가입 차단 테스트 가능).
- **CI 중복 가입 차단** — `TB_USER.ci UNIQUE` + signup 시 명시적 검사. "이미 가입된 사용자입니다" 안내 + 비밀번호 재설정 유도.
- **NICE 결과 우선** — niceSession이 있으면 signup body의 `name`·`phone` 대신 NICE 검증값(`name`·`mobile_no`) 사용 + `birthdate`·`gender`·`national_info`·`ci`·`mobile_co` 적재.

## 5.2 DDL 0004 (라이브 적용 완료)

[src/db/migrations/0004_nice_auth.sql](../../../malgn-noti-api/src/db/migrations/0004_nice_auth.sql):

§A `TB_NICE_AUTH` 신설 (17 컬럼):
- 세션 키: `id` PK + `request_no` UNIQUE + `transaction_id` + `ticket` + `iterators` (복호화에 필요)
- 상태: `state` (pending/completed/failed/expired/consumed)
- 결과: `name`/`birthdate`/`gender`/`national_info`/`ci`/`di`/`mobile_co`/`mobile_no`
- 시간: `expires_at`/`created_at`/`completed_at`
- 인덱스: `(state, created_at)` · `(ci)`

§B `TB_USER` 5 컬럼 추가:
- `birthdate VARCHAR(8)` · `gender CHAR(1)` · `national_info CHAR(1)` · `ci VARCHAR(255)` · `mobile_co VARCHAR(10)`
- `UNIQUE KEY uq_user_ci (ci)` — 중복 가입 차단

라이브 적용 검증: `SHOW CREATE TABLE TB_NICE_AUTH` 정상, `TB_USER.ci`에 `uq_user_ci` 인덱스 단독.

## 5.3 NICE 어댑터 — `src/adapters/nice/auth.ts`

- `requestToken(creds, requestNo)` → POST `/auth/token` (Basic auth + `client_credentials`)
- `requestAuthUrl(creds, accessToken, requestNo)` → POST `/auth/url` (`svc_types: ['M']` + `return_url` + `close_url`)
- `requestResult(accessToken, webTxId, txId, requestNo)` → POST `/auth/result` (암호화된 `enc_data` + `integrity_value` 수신)
- `deriveKeys(ticket, txId, iters)` — **PBKDF2-HMAC-SHA256** 64 bytes 유도 → 대칭키 32 bytes + HMAC키 32 bytes (offset 48)
- `decryptResult(raw, ticket, txId, iters)` — Web Crypto `crypto.subtle.deriveBits` + `decrypt({name:'AES-GCM', iv, tagLength:128})` + HMAC-SHA256 무결성 검증
- `mockNiceResult(requestNo)` — 결정적 가짜 결과 (`name='모의 사용자'`, `ci='MOCK_CI_<requestNo>'`, …)
- Workers 표준 Web Crypto만 사용 — 외부 라이브러리 0

## 5.4 라우트 — `src/routes/nice.ts`

| 라우트 | 동작 |
| --- | --- |
| `POST /auth/nice/init` | mock: 즉시 `completed` 상태로 가짜 결과 적재 → `{sessionId, authUrl:null, mockMode:true}`. real: token + url 호출 후 `pending` 적재 → `{sessionId, authUrl, mockMode:false}` |
| `POST /auth/nice/callback` | NICE의 form/json `web_transaction_id` 수신 → 가장 최근 `pending` 세션 → result 호출 + 복호화 + DB 업데이트 → HTML 응답(팝업 자동 닫기) |
| `GET /auth/nice/status?session=…` | 프런트 폴링 — state 조회. `completed`면 name/birthdate/gender/national_info/mobile_co/mobile_no 노출 (ci는 서버에서만 보유) |

## 5.5 `/auth/signup` 확장

`signupB`에 `niceSession?: string` 추가. 있으면:
1. `TB_NICE_AUTH`에서 `requestNo = niceSession` 단건 조회
2. `state === 'completed'` 검증 (consumed/failed/expired면 401)
3. `expires_at > now` 검증
4. `ci` 중복 검사 — 있으면 409 "이미 가입된 사용자"
5. signup 시 NICE 결과(`name`·`mobile_no`)로 입력값 덮어쓰기 + birthdate/gender/national_info/ci/mobile_co 적재
6. signup 성공 후 `niceAuth.state = 'consumed'` 처리 → 재사용 차단
7. catch 블록의 Duplicate entry 감지 — `uq_user_ci` 매치 시 별도 안내

OpenAPI 4지점(2 paths + 4 schemas) + SignupRequest에 niceSession 필드.

## 5.6 프런트 signup.vue Step 4 통째로 교체

기존: 통신사 select + 이름 + 주민번호 + 내외국인 + 휴대폰 3분할 + 인증번호 입력 → 6개 필드
신규: **"본인 인증하기" 큰 버튼 1개** + 상태 표시

`startNiceAuth()`:
1. `POST /auth/nice/init` → `{sessionId, authUrl, mockMode}`
2. mockMode면 즉시 `pollNiceStatus()` 1회 호출 → `state='completed'` + 결과 표시
3. real이면 `window.open(authUrl, ...)` + 5초마다 status 폴링 (최대 5분)
4. 결과 표시: `<이름>님 본인 인증이 완료되었습니다. <휴대폰> · <통신사>` + `verified=true`

`submitSignup()` 확장: `niceSession`을 signup body에 전달. NICE 결과의 name·휴대폰을 우선 사용. 409 응답 + `이미 가입된 사용자` 메시지 분기.

`stores/auth.ts` `SignupPayload` 타입에 `niceSession?: string` 추가.

기존 입력 필드(통신사·이름·주민번호·휴대폰)와 관련 ref/function들은 다른 곳에서 의존성 없어 UI에서 자연 제거됨(스크립트 ref는 leftover로 남아 있으나 미사용).

## 5.7 라이브 e2e 검증 (6 시나리오)

| # | 시나리오 | 결과 |
| --- | --- | --- |
| 1 | `/auth/nice/init` → mock 응답 `{sessionId, authUrl:null, mockMode:true}` | ✅ |
| 2 | `/auth/nice/status?session=…` → `{state:'completed', name:'모의 사용자', mobile_no:'01099998888', …}` | ✅ |
| 3 | `/auth/signup` with niceSession → 201 + DB에 `name='모의 사용자'`·`birthdate='19900101'`·`gender='1'`·`ci='MOCK_CI_…'`·`mobile_co='SKT'` 정확 매핑 | ✅ |
| 4 | 같은 niceSession 재사용 → 401 `NICE 본인 인증이 완료되지 않았습니다` (consumed) | ✅ |
| 5 | 새 niceSession (다른 mock CI) → 정상 가입 | ✅ |
| 6 | DB: `TB_NICE_AUTH.state='consumed'`, `TB_USER.ci` UNIQUE 정상 동작 | ✅ |

검증 데이터 cleanup 완료 (TB_USER · TB_COMPANY · TB_NICE_AUTH 0건 잔존).

## 5.8 정본 문서 — `doc/NICE_AUTH.md`

12 섹션 / ~14KB:
1. 자체 SMS OTP vs NICE 비교
2. 인증 수단 종류 (M/F/U/I — 우리는 M 우선)
3. 전체 시퀀스 5단계 (ASCII 도식)
4. 엔드포인트 3종
5. 단계별 명세 + JSON 예시
6. AES-256-GCM + PBKDF2 (Workers Web Crypto)
7. 응답 데이터 (name·birthdate·gender·CI·DI·mobile_co·mobile_no)
8. 우리 적용 계획
9. **인프라 고려사항** — Workers 동적 IP vs NICE 화이트리스트 요구 (협상 또는 자체 프록시 EC2 필요)
10. NICE 계약 절차 7단계 (1~4 사용자, 5~7 김도형)
11. 알려진 한계 (외국인·법인 대표자·PASS·CI 중복 검사 등)
12. 다음 단계

## 5.9 산출물

- API: `malgn-noti-api: b4d8f4b` — 7 files +922 -11. 신규: `nice/auth.ts`·`routes/nice.ts`·`0004_nice_auth.sql`. 수정: `schema.ts`·`auth.ts`·`openapi.ts`·`index.ts`
- 사용자단: 5 파일 수정(`signup.vue`·`stores/auth.ts`·`useApi.ts`·`app.vue`·`app.config.ts`·`main.css`) + 1 신규(`doc/NICE_AUTH.md`)
- Workers 배포 #13 Version `2ab47c1f-1d68-42d3-815c-117cab3fd71a`
- Pages 배포 #60 alias `c9577894.malgn-noti.pages.dev`
- WBS 5-3C-* 신규 항목: NICE 본인확인 인프라 ✅

## 5.10 알려진 한계 / 다음 단계

- **NICE 자격증명 미발급** — 사용자 영업 작업 선행. 발급 후 `wrangler secret put NICE_CLIENT_ID/SECRET/RETURN_URL` + `wrangler secret delete NICE_MOCK`로 real 모드 전환 가능.
- **Workers 동적 outbound IP vs NICE 화이트리스트** — [NICE_AUTH.md §9](../NICE_AUTH.md) 참조. Cloudflare 대역 등록 협상 또는 자체 프록시 EC2 필요. NICE 계약 시점에 결정.
- **콜백 시 세션 매칭** — 1차 구현은 "가장 최근 pending 세션" 휴리스틱. 동시 다중 가입은 드물지만 운영 단계에서 `state` 파라미터로 명시화 검토.
- **모바일웹 popup 차단** — `window.open`이 모바일 Safari에서 차단될 수 있음. `redirect` 모드 옵션 검토.
- **외국인 가입** — `national_info='1'` 분기 UI 후속.
- **법인 대표자 본인 인증** — 정책 결정 후 적용.

---

# §6. /account/settings 실 API 연동 — `PATCH /me` + `PATCH /me/company` (배포 #14 / #61)

## 한 줄

WBS 5-3C-7 (PATCH /me + /account/settings) 작업. 기존 백엔드 `/me`는 GET만 있었고 응답도 최소(8 필드)였는데, **GET /me 응답을 TB_USER 13 + TB_COMPANY 14 컬럼 풀로 확장** + **PATCH /me**(사용자 본인 — name·phone) + **PATCH /me/company**(회사 — companyPhone·billingEmail·adReceive, owner/admin 권한) 신설. 프런트 [AppMemberInfoPanel.vue](../../app/components/AppMemberInfoPanel.vue)는 전체 목업 데이터(`account.email='service@malgnsoft.com'` 등)를 제거하고 `useAuthStore()` 기반으로 모두 실 데이터로 교체 — 가입 정보 행은 회사 정보 자동 매핑, 광고성 메일 수신 토글은 즉시 PATCH(컨펌 모달 후), 저장하기는 변경된 필드만 한 번에 PATCH. 라이브 e2e 5건 통과. Workers 배포 #14(Version `22368d14...`), Pages 배포 #61 (alias `ea35651d.malgn-noti.pages.dev`).

## 6.1 백엔드 변경

[src/routes/me.ts](../../../malgn-noti-api/src/routes/me.ts) — `readContext()` 헬퍼로 GET·PATCH 공통 JOIN 쿼리 추출:

```ts
me.use('*', requireAuth())
me.get('/', ...)                          // 기존 + 풀 컬럼
me.patch('/', zValidator(json, patchMeB), ...)        // name·phone
me.patch('/company', zValidator(json, patchCompanyB), ...)  // companyPhone·billingEmail·adReceive
```

- 빈 PATCH(`{}`) → 400 `validation_failed` (변경할 필드가 없습니다)
- `/company` PATCH는 `role !== 'owner' && role !== 'admin'` → 403 forbidden
- 응답은 모두 동일 형식(`{data: {user, company, ctxRole}}`)으로 통일 → 프런트가 변경 후 store 그대로 hydrate 가능

OpenAPI: `Me` schema 확장 + `PatchMeRequest`·`PatchCompanyRequest` 신규. paths 2 추가.

## 6.2 stores/auth.ts 확장

```ts
interface AuthUser {  // +birthdate, gender, nationalInfo, mobileCo, memberType
  ...
}
interface AuthCompany {  // +bizNo, bizType, ceoName, upTae, upJong, address, companyPhone, billingEmail, adReceive
  ...
}

actions: {
  async updateMe(patch: {name?, phone?}) { ... }
  async updateCompany(patch: {companyPhone?, billingEmail?, adReceive?}) { ... }
}
```

## 6.3 AppMemberInfoPanel.vue 전면 교체

| 영역 | 기존 (목업) | 신규 (실 데이터) |
| --- | --- | --- |
| 데이터 로드 | 하드코딩 `account = {email: 'service@malgnsoft.com', ...}` | `onMounted(auth.fetchMe)` + `computed u/c` |
| 가입 정보 8행 | `INFO_ROWS` 고정 | `c.value`의 bizNo/bizType/ceoName/upTae/upJong/address 자동 매핑, `BIZ_TYPE_LABEL`로 한국어 표시 |
| 사업자등록증 변경 버튼 | 항상 노출 | `c.bizType !== 'personal'` 일 때만 (개인 유형은 노출 X) |
| 광고성 메일 수신 토글 | 로컬 ref 토글 + 토스트만 | 컨펌 모달 → `auth.updateCompany({adReceive})` 즉시 호출 + 토스트 |
| 서비스 담당자 이름 | 하드코딩 `'홍길동'` | `u.value.name` (NICE 검증 결과) |
| 회사 전화번호 입력 | 로컬 ref | `companyPhoneInput` ref, watchEffect로 store에서 초기화 |
| 휴대전화번호 3분할 | 로컬 ref | `watchEffect`가 `u.value.phone`에서 010/3~4자리/4자리로 자동 split |
| 결제 이메일 변경 | 로컬 ref 변경 + 토스트 | 다이얼로그 → `auth.updateCompany({billingEmail})` |
| 서비스 담당자 이메일 변경 | 로컬 ref 변경 | "곧 지원됩니다" 안내 — OTP 검증 흐름은 후속 |
| 휴대폰 본인 인증 | NICE 미연결 더미 | 그대로 더미 — NICE Step 4와 별개로 후속 |
| 회원 탈퇴 | 로컬 토스트 | "곧 지원됩니다" 안내 — 후속 라우트 필요 |
| **저장하기** | 토스트만 | `companyPhone`·`fullPhone` 변경 감지 → `updateMe`·`updateCompany` 병렬 호출 |

저장 로직:
```ts
const tasks = []
if (fullPhone !== u.phone) tasks.push(updateMe({phone: fullPhone}))
if (companyPhoneInput !== c.companyPhone) tasks.push(updateCompany({companyPhone: companyPhoneInput}))
if (tasks.length === 0) toast(변경 없음)
else await Promise.all(tasks) → 성공 토스트
```

`.seg` 스타일도 추가 (광고성 메일 수신 라디오 토글 — 기존 누락).

## 6.4 라이브 e2e (Production)

| # | 호출 | 결과 |
| --- | --- | --- |
| 1 | `GET /me` (Bearer) | 200 + 풀 컨텍스트 (TB_USER 13 + TB_COMPANY 14 컬럼) |
| 2 | `PATCH /me {name:'김도형', phone:'010-1111-2222'}` | 200 + 갱신된 user 응답 |
| 3 | `PATCH /me/company {companyPhone, billingEmail, adReceive:'reject'}` | 200 + 갱신된 company 응답 |
| 4 | `GET /me` 재호출 | name/phone/companyPhone/billingEmail/adReceive 모두 정확 반영 |
| 5 | 빈 PATCH `{}` | 400 `validation_failed`: 변경할 필드가 없습니다 |

테스트 사용자(`mep-test-…`) cleanup 완료.

## 6.5 산출물

- API: `malgn-noti-api: c8c…` — `src/routes/me.ts` 전면 개편(+150) · `src/openapi.ts` 갱신. Workers 배포 #14 Version `22368d14-f0c8-4788-8b52-5cb4f6442cf3`
- 사용자단: `app/stores/auth.ts` 타입 확장 + 2 액션 / `app/components/AppMemberInfoPanel.vue` 전면 교체. Pages 배포 #61 alias `ea35651d.malgn-noti.pages.dev`
- WBS 5-3C-7 ⚪ → 🟢 (회원 정보 변경 — 저장하기·광고수신 즉시 변경·결제이메일 변경은 실 API, 서비스 담당자 이메일·휴대폰 본인 인증 변경은 후속)

## 6.6 알려진 한계 / 후속 작업

- **서비스 담당자 이메일 변경** — OTP 검증 흐름 필요. 백엔드 `POST /me/email-change/{request,confirm}` 신설 후 다이얼로그 연결.
- **휴대폰 본인 인증 변경** — NICE 재인증 흐름 또는 SMS OTP. signup의 NICE Step 4와 유사한 패턴 재사용 가능.
- **회원 탈퇴** — `DELETE /me` 또는 `POST /me/withdraw` 신설 + soft-delete (`TB_USER.status = -1`) + 관련 데이터 정책 결정.
- **`canEditCompany` 권한 UX** — 현재는 PATCH 호출 후 403 에러로 안내. 사전에 role 기반으로 UI 비활성화 검토.

---

# §7. 사업자등록증 심사 승인 게이트 — 정책 정합화 (배포 #15 / #64)

## 한 줄

새 정책: **법인 사업자(corp) / 개인 사업자(sole)는 가입 후 사업자등록증 심사 승인을 받아야 서비스 이용 및 가입 정보 수정 가능**, **개인(personal)은 즉시 사용 가능**. 그동안은 모든 가입자가 `joinState='joined'` 즉시 통과였는데, `TB_COMPANY.approval_state` 컬럼 + signup 자동 분기 + `PATCH /me`·`PATCH /me/company` 차단 + 프런트 배너·입력 disabled + 가입 완료 화면 분기로 인프라화. 0005 라이브 적용, 기존 5개 회사는 'approved' 기본값으로 호환성 유지. Workers 배포 #15(Version `6e47d50b...`), Pages 배포 #64 (alias `56e94e5b.malgn-noti.pages.dev`). 라이브 e2e 8 시나리오 통과(법인 가입 pending / 수정 시도 403 / 개인 가입 approved / 개인 수정 통과 / 운영자 승인 후 수정 통과 / 반려 시뮬레이션 → 사유 노출 403 …).

## 7.1 정책 (사용자 결정)

| 회사 유형 | 가입 직후 상태 | 서비스 이용 | 정보 수정 |
| --- | --- | --- | --- |
| `corp` 법인사업자 | `approval_state='pending'` | ❌ | ❌ |
| `sole` 개인사업자 | `approval_state='pending'` | ❌ | ❌ |
| `personal` 개인 | `approval_state='approved'` | ✅ | ✅ |

운영자가 BackOffice에서 사업자등록증을 심사 → **승인(`approved`)** 또는 **반려(`rejected` + 사유)** 처리. 1차에서는 운영자 화면 미구현이라 라이브 DB 직접 UPDATE로 검증(후속에서 운영자단 화면 신설 예정).

## 7.2 DDL 0005 (라이브 적용 완료)

[src/db/migrations/0005_company_approval.sql](../../../malgn-noti-api/src/db/migrations/0005_company_approval.sql):

```sql
ALTER TABLE TB_COMPANY
  ADD COLUMN company_type    VARCHAR(20) NULL  COMMENT 'corp/sole/personal' AFTER name,
  ADD COLUMN approval_state  VARCHAR(20) NOT NULL DEFAULT 'approved'        AFTER company_type,
  ADD COLUMN rejected_reason VARCHAR(255) NULL                              AFTER approval_state,
  ADD KEY idx_company_approval (approval_state, created_at);
```

기존 5행 모두 자동으로 `approved` — 운영 데이터 호환성 유지.

## 7.3 백엔드 변경

### signup 확장
- `signupB`에 `companyType: enum(corp/sole/personal).optional()` 추가
- 사업자(corp/sole) → `approvalState='pending'`, 그 외 → `'approved'` 자동 분기
- 회사 row INSERT 시 `companyType`·`approvalState` 함께 적재

### /me 응답에 승인 정보 노출
- GET / PATCH 응답의 `company` 객체에 `companyType` · `approvalState` · `rejectedReason` 추가 (3 군데 응답 빌더 모두)

### PATCH 차단
- `PATCH /me`·`PATCH /me/company` 둘 다 핸들러 시작부에서 `readContext()` 호출 → `approvalState !== 'approved'`면 403 + 상황별 메시지:
  - `pending` → "사업자등록증 심사 승인 후 정보를 수정할 수 있습니다."
  - `rejected` → "심사가 반려되어 정보를 수정할 수 없습니다. 사유: …"
- 발송·이력 등 다른 도메인 라우트 차단은 후속 (별도 미들웨어 `requireApproved()`로 일관화 검토)

## 7.4 사용자단 변경

### stores/auth.ts
- `AuthCompany`에 `companyType?` · `approvalState?` · `rejectedReason?` 추가
- `SignupPayload`에 `companyType?` 추가

### signup.vue
- `auth.signup({...})` 호출 시 `companyType: userType.value || undefined` 전달
- Step 5(가입 완료) 화면 분기:
  - 사업자: "사업자등록증 심사가 진행됩니다. 승인 완료 전에는 서비스 이용 및 정보 수정이 제한되며, 결과는 등록하신 휴대폰·이메일로 안내됩니다."
  - 개인: "지금부터 바로 서비스를 이용하실 수 있습니다."

### AppMemberInfoPanel.vue
- 상단 **승인 상태 배너** (pending=warning, rejected=danger). pending이면 "사업자등록증 심사 중입니다 — 승인 완료 전까지 서비스 이용 및 회원 정보 수정이 제한됩니다." rejected면 반려 사유 + "사업자등록증을 다시 제출해 주세요."
- `isLocked` computed (`approvalState !== 'approved'`)
- 광고성 메일 수신 토글 2개 · 회사 전화번호 입력 · 휴대전화 select+input 2개 · 이메일 변경 버튼 2개(서비스 담당자·결제) · 휴대폰 인증 버튼 · 저장하기 버튼 — **모두 `:disabled="isLocked"`**
- `c.bizType !== 'personal'` → `c.companyType !== 'personal'`로 조건 수정 (이전엔 bizType 사용)
- 배너 스타일: 좌측 24px 아이콘 + 우측 굵은 헤더 + 본문, warning/danger 색상 변형

## 7.5 라이브 e2e 검증 (8 시나리오)

| # | 시나리오 | 결과 |
| --- | --- | --- |
| 1 | 법인 가입 → `/me` → `companyType='corp', approvalState='pending'` | ✅ |
| 2 | `PATCH /me {name}` → 403 + "사업자등록증 심사 승인 후 …" | ✅ |
| 3 | `PATCH /me/company {adReceive}` → 403 + 동일 메시지 | ✅ |
| 4 | 개인 가입 → `/me` → `companyType='personal', approvalState='approved'` | ✅ |
| 5 | 개인 `PATCH /me {name}` → 200 + 변경 반영 | ✅ |
| 6 | 운영자 DB 직접 UPDATE → `approval_state='approved'` (BackOffice 승인 시뮬레이션) | ✅ |
| 7 | 승인 후 법인 `PATCH /me` 재시도 → 200 + 변경 반영 | ✅ |
| 8 | 반려 시뮬레이션 (`approval_state='rejected', rejected_reason='…'`) → PATCH 시도 → 403 + 사유 메시지 포함 | ✅ |

검증 데이터(법인-…·개인-… 4건) cleanup 완료.

## 7.6 산출물

- API: `malgn-noti-api: 7…` — `0005_company_approval.sql` 신규 · `schema.ts` company 확장 · `auth.ts` signup 분기 · `me.ts` 응답+차단. Workers 배포 #15 Version `6e47d50b-0225-41d9-8bc8-598045659df8`
- 사용자단: `stores/auth.ts` 타입 · `signup.vue` companyType 전달 + Step 5 분기 · `AppMemberInfoPanel.vue` 배너 + isLocked + 모든 입력 disabled. Pages 배포 #64 alias `56e94e5b.malgn-noti.pages.dev`
- WBS 갱신: 5-3C-6(`companyType` 전달·저장 + 개인 유형 화면 분기) ⚪→🟢 + 새 항목 5-3C-17(승인 게이트) ✅

## 7.7 알려진 한계 / 후속 작업

- **운영자단 승인 화면 미구현** — 현재 라이브 DB 직접 UPDATE로만 승인/반려 가능. 운영자단(`/admin/member/company/[id]`)에 승인·반려(사유 입력) UI 신설 필요. WBS 5-4-3.
- **발송·이력 등 다른 도메인 라우트 차단** — 현재는 `/me` PATCH만 차단. 발송(`POST /send/*`), 캠페인, 발신정보 변경 등도 미승인 차단 필요. `requireApproved()` 미들웨어로 일관화 후 적용 권장. 후속.
- **사용자단 다른 화면 disabled** — `/account/cards`, `/charge`, `/send/*` 등도 isLocked일 때 차단/안내 필요. 화면별 점검 후속.
- **GNB·홈 글로벌 안내** — 현재는 `/account/settings`에만 배너. 모든 화면 상단(GNB)에 글로벌 안내 띠 검토.
- **`requireApproved()` 미들웨어 추출** — 현재는 핸들러 내부 인라인. 도메인 라우트 전부 적용 시점에 별도 헬퍼로 분리.
- **이메일·SMS 자동 안내** — 승인/반려 처리 시 사용자에게 자동 발송. NHN 자격증명 등록 후 trigger.
