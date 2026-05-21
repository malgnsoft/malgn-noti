# 2026-05-21 — 발신 정보 페이지 마무리 (발신 프로필·PUSH 인증·080 수신 거부)

## 한 줄 요약

발신 정보 카테고리의 남은 페이지 3종을 신규 구성 — 카카오 발신 프로필 관리(등록 마법사·그룹 관리 모달), PUSH 인증 관리(FCM·APNs 인증 설정 섹션), 080 수신 거부 번호 관리(번호 신청·이용 해지) — 하고, 그룹 관리 페이지의 그룹 아이디 컬럼을 정리하여 Cloudflare Pages에 배포 (#27).

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

## 산출물

### 신규 (3)
- [app/components/AppProfileRegisterDialog.vue](../../app/components/AppProfileRegisterDialog.vue)
- [app/components/AppProfileGroupDialog.vue](../../app/components/AppProfileGroupDialog.vue)
- [app/components/AppPushCertSection.vue](../../app/components/AppPushCertSection.vue)

### 수정 (4)
- `app/pages/sender/profiles.vue`(발신 프로필 관리 페이지 전면 구성)
- `app/pages/sender/push-cert.vue`(PUSH 인증 관리 페이지 전면 구성)
- `app/pages/sender/optout-080.vue`(080 수신 거부 번호 관리 페이지 전면 구성)
- `app/pages/contacts/groups.vue`(그룹 아이디 컬럼 제거)

### 배포
- #27 — 발신 정보 페이지 (발신 프로필·PUSH 인증·080 수신 거부) / Alias: https://d1c4e2eb.malgn-noti.pages.dev

### 커밋
- `e30da5c` 발신 정보 페이지 신규 구성 — 발신 프로필·PUSH 인증·080 수신 거부 (§5, 배포 #27)

## 다음 단계 / 한계

- 발신 정보 카테고리 6개 페이지(발신 번호·RCS 브랜드·이메일 도메인·PUSH 인증·발신 프로필·080 수신 거부) 모두 구성 완료. 메시지 관리·캠페인·계정/문의·시스템 페이지가 핸드오프 디자인 미반영 영역으로 남음.
- 모든 다이얼로그 시드 데이터는 목업. 백엔드(malgn-noti-api) 연동 전이라 저장 후 새로고침하면 휘발됨.
