# 2026-05-21 — 발신 정보 페이지 마무리 + 테이블 스타일 A/B/C 정의

## 한 줄 요약

발신 정보 카테고리의 남은 페이지 3종을 신규 구성 — 카카오 발신 프로필 관리(등록 마법사·그룹 관리 모달), PUSH 인증 관리(FCM·APNs 인증 설정 섹션), 080 수신 거부 번호 관리(번호 신청·이용 해지) — 하고, 그룹 관리 페이지의 그룹 아이디 컬럼을 정리하여 Cloudflare Pages에 배포 (#27). 이후 **목록 테이블 스타일을 A/B/C로 정의**하고(별도 필터영역/검색없음/인라인검색), 발송 조회 툴바 재배치 + 발신정보·주소록·그룹 관리 목록을 해당 스타일로 일괄 정리하여 재배포 (#28). GNB 캠페인 메뉴 삭제 (#29). **수신 거부 관리 페이지 3종**(휴대폰·이메일·토큰)을 신규 구성 — C 테이블 스타일, 등록/일괄 등록 모달 — 하여 배포 (#30).

## 1. 발신 프로필 관리 페이지

- **sender/profiles.vue**: placeholder → 신규 구성. 발신 번호·RCS 브랜드 관리와 동일한 리스트 구조(헤더 우측 등록 버튼 + 안내 박스 + list-card + 하단 번호형 페이지바).
  - 안내: 카카오톡 채널 생성 CTA, 토큰 인증 절차, 알림톡 일별 최대 발송량 — 중첩 bullet.
  - 툴바: `발신 프로필 삭제` · `발신 프로필 그룹 관리` · 검색(아이디) / `새로고침` · `총 N개`.
  - 표: 체크박스 · 발신 프로필 아이디 · 발신 키 · 등록 일시 · 토큰 인증 상태(배지) · 발신 프로필 상태(배지).
- **AppProfileRegisterDialog**(신규): 발신 프로필 등록 모달. 아이디(0/16) · 관리자 휴대폰(0/11) · 카테고리 3단 select(대/중/소분류 종속, 21개 대분류 + 종속 트리) · `토큰 요청` → 6자리 입력/`토큰 재요청` 흐름. 모든 필드 + 토큰 6자리 충족 시 `저장` 활성.
- **AppProfileGroupDialog**(신규): 발신 프로필 그룹 관리 모달. 그룹 이름 추가, 표(이름·프로필 수·등록 일시·삭제), 빈 상태.

## 2. PUSH 인증 관리 페이지

- **sender/push-cert.vue**: PUSH 인증 관리 페이지 신규 구성 — FCM · APNs 인증 설정 섹션(서비스 계정 키 등록 등).
- **AppPushCertSection**(신규): 인증 설정 섹션 공용 컴포넌트.

## 3. 080 수신 거부 번호 관리 페이지

- **sender/optout-080.vue**: 080 수신 거부 번호 관리 페이지 신규 구성 — 번호 신청, 이용 해지. 정보통신망법 관련 안내 포함.

## 4. 그룹 관리 페이지 정리

- **contacts/groups.vue**: 표에서 그룹 아이디 컬럼 제거(컬럼 정리, colspan 보정).

## 5. 배포·커밋

- `pnpm build` → `npx wrangler@4 pages deploy dist --project-name=malgn-noti --branch=main --commit-dirty=true --commit-message "sender info pages: kakao sender profile management, push cert, 080 opt-out"` — 배포 #27.
- 프로덕션 검증: `https://malgn-noti.pages.dev/sender/profiles`·`/sender/push-cert`·`/sender/optout-080` 200, alias `https://d1c4e2eb.malgn-noti.pages.dev` 200.
- 커밋: `e30da5c 발신 정보 페이지 신규 구성 — 발신 프로필·PUSH 인증·080 수신 거부` (7 files, +1516 −23) → `origin/main` 푸시.

## 6. 테이블 스타일 A/B/C 정의 + 발송 조회 툴바 재배치 (§6, 배포 #28)

- **발송 조회 툴바 정리** ([AppHistoryView.vue](../../app/components/AppHistoryView.vue)·5채널 공용 + [stats.vue](../../app/pages/history/stats.vue)):
  - `조회` → `검색하기`(아이콘 포함), 통계 페이지 검색 버튼도 아이콘 통일.
  - 액션 영역 좌측 = `총 N건 · | · 새로고침`(테두리 없는 텍스트형), 우측 = `목록 다운로드 요청 · 다운로드 요청 목록 · 조회 필드 추가 · 일괄 취소 · 선택 취소`.
  - 필터 바 날짜칸 폭을 통계 페이지와 동일(190)하게 맞춰 시·분 표시. `검색 결과 다운로드 요청`→`목록 다운로드 요청`, `조회 필드 추가 설정`→`조회 필드 추가`.
- **테이블 스타일 A/B/C 정의** ([doc/DESIGN.md](../../doc/DESIGN.md) §6.5 + [/guide §11](../../app/pages/guide.vue)):
  - **A** = 별도 검색(필터) 영역 `.filter-bar` + 액션 영역 — 다중 조건 검색(조회·이력). ref `AppHistoryView`.
  - **B** = 별도 필터 영역 없음, 액션 영역만, 검색란 없음 — 소규모 목록. ref `sender/numbers`.
  - **C** = 별도 필터 영역 없음, 액션 영역 안에 인라인 검색란(260px·아이콘 우측·28px) — 단일 검색어 목록. ref `sender/domains`.
  - 각 테이블에 `data-table-style="a|b|c"` 마커, 가이드 §11에 A·B·C 시각 예시 목업 추가.
- **목록 페이지 일괄 정리**: 발신 번호(B)·RCS 브랜드(B)·이메일 도메인(C)·발신 프로필(C)·080 수신 거부(C)·주소록 관리(C)·그룹 관리(C)의 테이블 상단을 해당 스타일로 재배치.
- **주소록 관리**: 가입일 우측에 `메시지 발송` 컬럼 추가(행별 채널 드롭다운 — 그룹 관리와 동일, 해당 연락처를 `sendRecipients`로 인계), 맨 오른쪽 더보기(`⋮`) 컬럼 제거.
- 배포 #28: `wrangler pages deploy` (`--commit-message "table styles A/B/C + history toolbar restructure"`), 프로덕션 `/guide`·`/history/sms`·`/contacts/groups` 200, alias `https://ec51b8d0.malgn-noti.pages.dev` 200.
- 커밋: `74943e8 테이블 스타일 A/B/C 정의 + 발송 조회 툴바 재배치` (11 files, +746 −172) → `origin/main` 푸시.

## 7. GNB 캠페인 메뉴 삭제 (§7, 배포 #29)

- [AppGnb.vue](../../app/components/AppGnb.vue) 상단 메뉴에서 `캠페인`(`/campaign`) 항목 제거 → 메뉴: 서비스·메시지 발송·발송 조회/통계·주소록·발신 정보·메시지 관리·운영가이드.
- 배포 #29: `wrangler pages deploy` (`--commit-message "remove campaign menu from GNB"`), 프로덕션 `/home` 200, alias `https://e23f4a20.malgn-noti.pages.dev` 200.
- 커밋: `d0802e6 GNB에서 캠페인 메뉴 삭제` → `origin/main` 푸시.

## 8. 수신 거부 관리 페이지 3종 (§8, 배포 #30)

- **페이지 분리**: 수신 거부 관리를 탭 없이 채널별 독립 페이지 3종으로 구성 — [/contacts/optout](../../app/pages/contacts/optout.vue)(휴대폰) · [/contacts/optout-email](../../app/pages/contacts/optout-email.vue) · [/contacts/optout-token](../../app/pages/contacts/optout-token.vue). [AppGnb](../../app/components/AppGnb.vue) 주소록 메뉴에 3개 항목 추가.
- **AppOptoutManager**(신규): `kind`(phone/email/token) prop으로 단일 화면을 렌더링하는 공용 컴포넌트. C 테이블 스타일(`.list-card` + `.list-toolbar` border-bottom + `.list-pager` border-top).
  - 안내(`.notice`) + 페이지 헤더 우측 `일괄 등록`·`등록` 버튼(토큰은 없음).
  - 툴바 좌: `총 N개 · | · 080 번호/도메인 선택 · 인라인 검색(260px)` / 우: `목록 다운로드 요청 · 다운로드 요청 목록 · 해지`(맨 오른쪽).
  - 표: 휴대폰·이메일 = 체크박스·수신 거부 번호/이메일·등록 일시 / 토큰 = 수신 거부 토큰·수신 거부 항목·등록 일시(체크박스 없음).
- **AppOptoutAddDialog**(신규): 수신 거부 번호/이메일 등록 모달 — 080 번호·도메인 select + 직접 입력(최대 10건, 추가/삭제 서브 테이블).
- **AppOptoutBulkDialog**(신규): 일괄 등록 모달 — 080 번호·도메인 select + `양식 다운로드`(흰 버튼) + .xlsx 업로드(최대 1MB).
- **AppExportListDialog**: `jobs` prop 추가(기본값은 기존 목업, 수신 거부 페이지는 빈 목록 전달).
- **AppContactBulkDialog**: `템플릿 다운로드` → `양식 다운로드` 문구 변경.
- 배포 #30: `wrangler pages deploy` (`--commit-message "Add opt-out management pages (phone/email/token)"`), 프로덕션 `/contacts/optout`·`/contacts/optout-email`·`/contacts/optout-token` 200, alias `https://81348384.malgn-noti.pages.dev`.
- 커밋: `5f4cb47 수신 거부 관리 페이지 3종 신규 구성 (휴대폰·이메일·토큰)` (9 files, +931 −15) → `origin/main` 푸시.

## 9. GNB 드롭다운 중복 메뉴명 삭제 (§9, 배포 #31)

- [AppGnb.vue](../../app/components/AppGnb.vue) 하위 메뉴(드롭다운) 상단에 작은 글씨로 한 번 더 표시되던 GNB 메뉴명(`.gnb-dropdown-title` = `item.title`) 제거 → 드롭다운은 하위 항목만 노출.
- 진행 중인 메시지 관리 작업분은 `git stash`로 격리하고 **AppGnb 변경만** 빌드·배포.
- 배포 #31: `wrangler pages deploy` (`--commit-message "GNB dropdown: remove duplicated menu title"`), 프로덕션 `/home` 200, alias `https://b11d8703.malgn-noti.pages.dev` 200.
- 커밋: `0f0d9cc GNB 드롭다운에서 중복 메뉴명 표시 삭제` (1 file, −3) → `origin/main` 푸시.

## 산출물

### 신규 (3)
- [app/components/AppProfileRegisterDialog.vue](../../app/components/AppProfileRegisterDialog.vue)
- [app/components/AppProfileGroupDialog.vue](../../app/components/AppProfileGroupDialog.vue)
- [app/components/AppPushCertSection.vue](../../app/components/AppPushCertSection.vue)

### 신규 (6 — §8 수신 거부 관리)
- [app/components/AppOptoutManager.vue](../../app/components/AppOptoutManager.vue)
- [app/components/AppOptoutAddDialog.vue](../../app/components/AppOptoutAddDialog.vue)
- [app/components/AppOptoutBulkDialog.vue](../../app/components/AppOptoutBulkDialog.vue)
- [app/pages/contacts/optout.vue](../../app/pages/contacts/optout.vue), `optout-email.vue`, `optout-token.vue`

### 수정 (4 — §1~5)
- `app/pages/sender/profiles.vue`(발신 프로필 관리 페이지 전면 구성)
- `app/pages/sender/push-cert.vue`(PUSH 인증 관리 페이지 전면 구성)
- `app/pages/sender/optout-080.vue`(080 수신 거부 번호 관리 페이지 전면 구성)
- `app/pages/contacts/groups.vue`(그룹 아이디 컬럼 제거)

### 수정 (11 — §6 테이블 스타일 A/B/C)
- `app/components/AppHistoryView.vue`, `app/pages/history/stats.vue`(발송 조회 툴바)
- `app/pages/sender/{numbers,brands,domains,profiles,optout-080}.vue`(B·C 스타일 적용)
- `app/pages/contacts/{list,groups}.vue`(C 스타일 + 주소록 메시지 발송 컬럼)
- `app/pages/guide.vue`(§11 A·B·C 예시), `doc/DESIGN.md`(§6.5 A·B·C 정의)

### 배포
- #27 — 발신 정보 페이지 (발신 프로필·PUSH 인증·080 수신 거부) / Alias: https://d1c4e2eb.malgn-noti.pages.dev
- #28 — 테이블 스타일 A/B/C + 발송 조회 툴바 재배치 / Alias: https://ec51b8d0.malgn-noti.pages.dev
- #29 — GNB 캠페인 메뉴 삭제 / Alias: https://e23f4a20.malgn-noti.pages.dev
- #30 — 수신 거부 관리 페이지 3종 (휴대폰·이메일·토큰) / Alias: https://81348384.malgn-noti.pages.dev
- #31 — GNB 드롭다운 중복 메뉴명 삭제 / Alias: https://b11d8703.malgn-noti.pages.dev

### 커밋
- `e30da5c` 발신 정보 페이지 신규 구성 — 발신 프로필·PUSH 인증·080 수신 거부 (§5, 배포 #27)
- `74943e8` 테이블 스타일 A/B/C 정의 + 발송 조회 툴바 재배치 (§6, 배포 #28)
- `d0802e6` GNB에서 캠페인 메뉴 삭제 (§7, 배포 #29)
- `5f4cb47` 수신 거부 관리 페이지 3종 신규 구성 (휴대폰·이메일·토큰) (§8, 배포 #30)
- `0f0d9cc` GNB 드롭다운에서 중복 메뉴명 표시 삭제 (§9, 배포 #31)

## 다음 단계 / 한계

- 발신 정보 카테고리 6개 페이지(발신 번호·RCS 브랜드·이메일 도메인·PUSH 인증·발신 프로필·080 수신 거부) 모두 구성 완료. 메시지 관리·캠페인·계정/문의·시스템 페이지가 핸드오프 디자인 미반영 영역으로 남음.
- 모든 다이얼로그 시드 데이터는 목업. 백엔드(malgn-noti-api) 연동 전이라 저장 후 새로고침하면 휘발됨.
