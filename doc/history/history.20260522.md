# 2026-05-22 — 나의 페이지 4개 화면 신규 구성 (비밀번호·보안로그인·멀티 계정·계약 관리)

## 한 줄 요약

나의 페이지 좌측 메뉴 중 placeholder 상태였던 4개 라우트를 신규 구성 — **비밀번호 변경**(8자+특수문자 검증·표시 토글), **보안로그인 설정**(사용 토글 + 이메일/휴대전화 인증 방식), **멀티 계정 추가**(본인 인증 안내 표·인증 내역·휴대폰 본인 인증 모달 연동), **계약 관리**(상태별 계약 카드 4종·가입서류 첨부 3종) — 하고, 계약 관리에는 **계약서 확인 모달**·**3스텝 계약 체결 위저드**(약관 열람 + 캔버스 전자서명)·**업로드 안내 모달**·**첨부 서류 미리보기 모달**(업로드 PDF iframe 렌더링)을 추가, 갱신 계약 체결 시 기존 계약 만료 처리까지 구현하여 Cloudflare Pages에 배포 (#47).

## 1. 비밀번호 변경 페이지

- **account/password.vue**: placeholder → `AppMyPageShell` + `AppPasswordChangePanel`.
- **AppPasswordChangePanel**(신규): 회원 정보 변경 페이지와 동일한 한 줄 폼(`.ms-row` 그리드, 라벨 150px).
  - 현재 비밀번호(라벨 아래 `비밀번호 재설정` 링크) · 새 비밀번호 · 새 비밀번호 확인 — 모두 표시/숨김 토글.
  - 검증: 8자 이상 + 특수문자 포함, 현재 비밀번호와 동일 금지, 확인 불일치 시 "비밀번호가 일치하지 않습니다.".
  - 검증 통과 시에만 `저장하기` 활성.

## 2. 보안로그인 설정 페이지

- **account/security.vue**: placeholder → `AppMyPageShell` + `AppSecurityLoginPanel`.
- **AppSecurityLoginPanel**(신규): 보안로그인 사용 여부 `.seg` 토글(사용안함/사용), 사용 시 인증 방식 카드 선택(이메일 인증 / 휴대전화 인증). 변경 사항이 있을 때만 `저장하기` 활성.

## 3. 멀티 계정 추가 페이지

- **account/multi.vue**: placeholder → `AppMyPageShell` + `AppMultiAccountPanel`.
- **AppMultiAccountPanel**(신규): 본인 인증 안내 섹션(안내 불릿 + 인증 방법 표 — "사업자 회원" rowspan 병합) + 본인 인증 내역 표(상태 배지). "본인 인증 안내" 헤더 우측에 `휴대폰 본인 인증(필요 서류 첨부)` 버튼 — `AppPhoneVerifyDialog` 연동, 인증 완료 시 내역에 "승인 대기" 행 추가.

## 4. 계약 관리 페이지

- **account/contract.vue**: placeholder → `AppMyPageShell` + `AppContractPanel`.
- **AppContractPanel**(신규):
  - **이용계약 체결**: 상태별 계약 카드 — 최초계약(`info`)·체결완료(`success`)·계약갱신(`warning`)·만료(`expired`, 회색). 카드 배경을 시맨틱 토큰으로 구분. 계약서 확인 / 계약체결하기 버튼.
  - **가입서류 첨부**: 사업자등록증(필수) · 대부업등록증 · 지급이행보증보험증권(해당업체 체크박스로 인터페이스 활성). 업로드 버튼은 헤더 행에 배치, `<input type="file">` PDF·10MB 검증.
  - **갱신 계약 체결 시 기존 계약 일괄 만료 처리**.
- **AppContractViewDialog**(신규): 계약서 확인 모달 — 회색 배경 위 흰색 계약서 카드, 제1~3조 미리보기 + 회사/이용자 서명란.
- **AppContractSignDialog**(신규): 계약 체결 위저드 — 3스텝 인디케이터, STEP 1·2 약관 전문 열람(끝까지 스크롤해야 "확인하였음" 활성), STEP 3 전자 서명/공인인증서 탭 + `<canvas>` 서명 패드, 진행률 바, 서명 완료 화면.
- **AppUploadGuideDialog**(신규): 업로드 안내 모달 — 확인 시 숨겨진 파일 입력을 프로그래밍 클릭.
- **AppFilePreviewDialog**(신규): 첨부 서류 미리보기 모달 — 업로드한 PDF는 `<iframe>` blob URL로 원본 렌더링, 모달 폭 900px·고정 높이 880px.

## 5. 기타

- **AppCardListPanel**: 결제 카드 관리 패널 상단에 다른 패널과 동일한 섹션 헤더("결제 카드 관리" + hairline) 추가.

## 6. 배포·커밋

- `pnpm build` → `npx wrangler@4 pages deploy dist --project-name=malgn-noti --branch=main --commit-dirty=true --commit-message "My Page: password, security, multi-account, contract management"` — 배포 #47.
- 프로덕션 검증: `https://malgn-noti.pages.dev/account/password`·`/account/security`·`/account/multi`·`/account/contract` 모두 200, alias `https://688484ab.malgn-noti.pages.dev`.
- 커밋: `33e0804 나의 페이지 4개 화면 구현 — 비밀번호 변경·보안로그인·멀티 계정·계약 관리` (13 files, +2738 −4).

## 산출물

- 신규 컴포넌트: `AppPasswordChangePanel`·`AppSecurityLoginPanel`·`AppMultiAccountPanel`·`AppContractPanel`·`AppContractViewDialog`·`AppContractSignDialog`·`AppUploadGuideDialog`·`AppFilePreviewDialog` (8종).
- 수정: `account/{password,security,multi,contract}.vue`(placeholder → 패널 연결), `AppCardListPanel`.
- 배포 #47, alias `https://688484ab.malgn-noti.pages.dev`.

## 다음 단계 / 알려진 한계

- 나의 페이지 남은 placeholder: `/account/credit`·`/account/billing`·`/account/inquiries` — 화면 미구성.
- 계약서 본문·인증 안내 문구 등은 목업 — 백엔드(`malgn-noti-api`) 연동 시 교체.
- 전자서명 캔버스는 클라이언트 드로잉만 — 서명 이미지 저장/전송 미구현.
