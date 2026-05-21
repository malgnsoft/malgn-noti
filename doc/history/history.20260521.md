# 2026-05-21 — 발신 정보 페이지 마무리 + 테이블 스타일 A/B/C 정의

## 한 줄 요약

발신 정보 카테고리의 남은 페이지 3종을 신규 구성 — 카카오 발신 프로필 관리(등록 마법사·그룹 관리 모달), PUSH 인증 관리(FCM·APNs 인증 설정 섹션), 080 수신 거부 번호 관리(번호 신청·이용 해지) — 하고, 그룹 관리 페이지의 그룹 아이디 컬럼을 정리하여 Cloudflare Pages에 배포 (#27). 이후 **목록 테이블 스타일을 A/B/C로 정의**하고(별도 필터영역/검색없음/인라인검색), 발송 조회 툴바 재배치 + 발신정보·주소록·그룹 관리 목록을 해당 스타일로 일괄 정리하여 재배포 (#28).

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

## 산출물

### 신규 (3)
- [app/components/AppProfileRegisterDialog.vue](../../app/components/AppProfileRegisterDialog.vue)
- [app/components/AppProfileGroupDialog.vue](../../app/components/AppProfileGroupDialog.vue)
- [app/components/AppPushCertSection.vue](../../app/components/AppPushCertSection.vue)

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

### 커밋
- `e30da5c` 발신 정보 페이지 신규 구성 — 발신 프로필·PUSH 인증·080 수신 거부 (§5, 배포 #27)
- `74943e8` 테이블 스타일 A/B/C 정의 + 발송 조회 툴바 재배치 (§6, 배포 #28)

## 다음 단계 / 한계

- 발신 정보 카테고리 6개 페이지(발신 번호·RCS 브랜드·이메일 도메인·PUSH 인증·발신 프로필·080 수신 거부) 모두 구성 완료. 메시지 관리·캠페인·계정/문의·시스템 페이지가 핸드오프 디자인 미반영 영역으로 남음.
- 모든 다이얼로그 시드 데이터는 목업. 백엔드(malgn-noti-api) 연동 전이라 저장 후 새로고침하면 휘발됨.
