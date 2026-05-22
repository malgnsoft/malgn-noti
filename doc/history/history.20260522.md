# 2026-05-22 — 나의 페이지 화면 신규 구성 (비밀번호·보안로그인·멀티 계정·계약 관리·크레딧·문의)

## 한 줄 요약

나의 페이지 좌측 메뉴 중 placeholder 상태였던 4개 라우트를 신규 구성 — **비밀번호 변경**(8자+특수문자 검증·표시 토글), **보안로그인 설정**(사용 토글 + 이메일/휴대전화 인증 방식), **멀티 계정 추가**(본인 인증 안내 표·인증 내역·휴대폰 본인 인증 모달 연동), **계약 관리**(상태별 계약 카드 4종·가입서류 첨부 3종) — 하고, 계약 관리에는 **계약서 확인 모달**·**3스텝 계약 체결 위저드**(약관 열람 + 캔버스 전자서명)·**업로드 안내 모달**·**첨부 서류 미리보기 모달**(업로드 PDF iframe 렌더링)을 추가, 갱신 계약 체결 시 기존 계약 만료 처리까지 구현하여 Cloudflare Pages에 배포 (#47). 이어서 **크레딧 관리**(보유 크레딧 카드·A형 검색 필터·내역 테이블·기간 프리셋 자동 날짜·페이지바·영수증 모달)와 **나의 문의**(상태 집계·목록·더보기·⋮ 삭제 메뉴·문의 상세 댓글 스레드)를 신규 구성하고, 문의하기 페이지에 나의 페이지 LNB를 추가하여 재배포 (#48).

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

## 7. 크레딧 관리 페이지 (§7, 배포 #48)

- **account/credit.vue**: placeholder → `AppMyPageShell` + `AppCreditPanel`.
- **AppCreditPanel**(신규):
  - **보유 크레딧** — 회색 카드(아바타·보유 크레딧·크레딧 충전 버튼) + 통계 3종(총 충전·보너스·이번 달 사용). 크레딧 단위 코인(`C`) 마크.
  - **A 테이블 스타일** — 전역 `.filter-bar`(기간 프리셋·날짜 범위·구분 select·내용 검색·초기화/검색하기) + `.list-card`(`.list-toolbar` 총 N건·새로고침 / 페이지 크기) + `data-table-style="a"` 테이블.
  - **기간 프리셋**(오늘/1주일/이번 달/3개월) 클릭 시 시작·마감일 자동 설정.
  - **페이지바**(`.list-pager`) + 충전/차감 +/- 표시·영수증 배지.
- **AppReceiptDialog**(신규): 크레딧 충전 영수증 모달 — 거래 정보·결제 금액(공급가액·부가세 역산)·공급자 정보.

## 8. 나의 문의 — 목록·상세 (§8, 배포 #48)

- **account/inquiries/index.vue**: placeholder → `AppMyPageShell` + `AppInquiryListPanel`.
- **AppInquiryListPanel**(신규): 상태 집계 카드 3종(답변대기·답변중·답변완료, 연한 톤 칩), 제목·내용 검색, 문의 카드 목록(상태 배지·채널·본문 2줄 말줄임·메타), 더보기, 헤더 우측 `문의하기` 버튼. `⋮` 드롭다운 — `삭제`(`AppConfirmDialog` 확인 후 제거).
- **account/inquiries/detail.vue**: placeholder → `AppMyPageShell` + `AppInquiryDetailPanel`.
- **AppInquiryDetailPanel**(신규): 문의 헤더(상태·채널·제목·메타), 문의 내용 박스, 첨부파일, 댓글/대댓글 스레드(`@멘션` 강조).
- **account/inquiry/index.vue**(문의하기): `AppMyPageShell`로 감싸 LNB 추가, `active-path="/account/inquiries"`로 `나의 문의` 활성.
- **AppMyPageShell**: `activePath` prop 추가 — 라우트와 메뉴 경로가 다른 페이지에서 활성 메뉴 지정.

## 9. 배포·커밋 (#48)

- `pnpm build` → `npx wrangler@4 pages deploy dist ... --commit-message "My Page: credit management + inquiry list/detail"` — 배포 #48.
- 프로덕션 검증: `/account/credit`·`/account/inquiries`·`/account/inquiries/detail`·`/account/inquiry` 모두 200, alias `https://ca4dd0f4.malgn-noti.pages.dev`.
- 커밋: `867e1a3 나의 페이지 — 크레딧 관리·나의 문의 화면 신규 구성` (9 files, +1704 −31).

## 산출물

- 신규 컴포넌트: `AppPasswordChangePanel`·`AppSecurityLoginPanel`·`AppMultiAccountPanel`·`AppContractPanel`·`AppContractViewDialog`·`AppContractSignDialog`·`AppUploadGuideDialog`·`AppFilePreviewDialog`·`AppCreditPanel`·`AppReceiptDialog`·`AppInquiryListPanel`·`AppInquiryDetailPanel` (12종).
- 수정: `account/{password,security,multi,contract,credit}.vue`·`account/inquiries/{index,detail}.vue`·`account/inquiry/index.vue`(placeholder → 패널 연결 / LNB 추가), `AppCardListPanel`, `AppMyPageShell`(activePath).
- 배포 #47 alias `https://688484ab.malgn-noti.pages.dev`, 배포 #48 alias `https://ca4dd0f4.malgn-noti.pages.dev`.

## 다음 단계 / 알려진 한계

- 나의 페이지 남은 placeholder: `/account/billing`(결제 내역) — 화면 미구성.
- 계약서 본문·인증 안내 문구·크레딧 내역·문의 데이터 등은 목업 — 백엔드(`malgn-noti-api`) 연동 시 교체.
- 전자서명 캔버스는 클라이언트 드로잉만 — 서명 이미지 저장/전송 미구현.
