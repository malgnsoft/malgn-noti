# 2026-06-02 — 사용자단 WBS 3 트랙 분리 + 로그인 UX 개선(고객사 ID 제거) + TB_USER.loginid 전역 UNIQUE 정합화

## 한 줄 요약

이번주 회원·인증 트랙의 첫 날 작업 3건을 한 흐름으로 처리. **(§1)** WBS 구조 개편 — "화면 UI만 됐는데 ✅로 표시돼 진척이 과대평가되는" 문제를 해소하기 위해 사용자단을 **5-3A 화면 UI 구성**(목업 데이터로 페이지만 그리기) + **5-3M 매트릭스**(도메인별 UI/API/연동 한눈에) + **5-3C 화면 ↔ API 연동**(실 데이터 흐름) 3 트랙으로 분리. 5-3-15 단일 항목을 16개 도메인별 5-3C-1~16으로 펼침. Step 5 진척률 55%→40%, 전체 가중평균 45%→38%. **(§2)** 로그인 UX 개선 — `POST /auth/login-by-email` 신설(이메일·아이디 + 비번만으로 회사 자동 찾기) + 프런트 로그인 화면에서 "고객사 ID" 필드 완전 제거. 같은 이메일로 여러 회사 가입 케이스는 회사 선택 카드 UI로 처리(첫 구현). **(§3)** 사용자 정책 결정으로 `TB_USER.loginid`를 전역 UNIQUE로 정합화 — `0003_user_loginid_global_unique.sql` 라이브 적용, login-by-email의 복수 매치 경로 + 회사 선택 UI ~80줄 제거. "한 이메일 = 한 회사 = 한 로그인". Workers 배포 #10·#11 / Pages 배포 #51·#52·#53.

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
