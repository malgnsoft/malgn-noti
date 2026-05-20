# 2026-05-20 — 발송 페이지 UX 폴리시 2차 + PUSH 부가항목·플로우 관리 완성

## 한 줄 요약

§17(5/19) 이후 발송 6채널 전반의 UX를 다듬고, PUSH 메시지 설정의 부가 항목(버튼·미디어·Android 미디어·iOS 미디어·Android 큰 아이콘·그룹)을 모두 실 동작 다이얼로그로 구현하고, 복합 플로우의 등록·수정·삭제·이름 클릭 편집까지 한 다이얼로그로 통합. 공용 컴포넌트(이메일 미리보기·다중 키 컬럼 수신자 위젯·중첩 모달 스크롤 잠금)도 다듬어 Cloudflare Pages에 배포 (#15).

## 1. 수신자 입력 다이얼로그 일괄 강화

- **AppRecipientFormDialog**
  - `keyColumn` 단일 → `keyColumns?: ('phone'|'email'|'token')[]` 다중 지원. 단일 모드는 기존 검증 유지, 다중 모드는 "최소 한 항목 + 입력된 항목 형식 검사" 정책.
  - 휴대폰은 하이픈 자동 포맷팅을 다시 제거하고 **국내 11자리 숫자만 입력** 으로 단순화(국가코드 칸도 폐기). 안내문 동일 갱신.
  - 이메일 행에 정규식 형식 검증(`^[^\s@]+@[^\s@]+\.[^\s@]+$`).
  - "(이름 없음)" 폴백 등 UX 보정.
- **AppRecipientCard**
  - `keyColumns?:` prop 추가 → 표 헤더·셀이 N개 컬럼으로 확장 (`headOf` / `valOf` 도우미).
  - **별칭 클릭 → 수정 다이얼로그** 오픈(`<button class="rcp-name-btn">`, accent-ink + bold + hover underline). `수신자 정보 수정` 버튼은 6채널 모두에서 제거.
- **AppAddressBookDialog**
  - `keyColumns?:` 동일 지원, valOf에 `token` 분기 추가.
  - 개별 샘플 8명에 FCM/APNS 형태 `token` 필드 부여 + 그룹 합성 수신자에도 토큰 포함 → PUSH 페이지 토큰 열 의미화.
  - 행 클릭 시 체크박스 더블 토글로 체크가 누락되던 버그 수정: `<label class="checkbox">` → `<span class="checkbox">`(라벨 포워딩 제거), input은 `pointer-events: none` + `tabindex="-1"` 표시 전용으로 분리.

## 2. SMS 발송 페이지

- **AppSmsTemplateDialog**: 단순 리스트 → "샘플 템플릿 선택" 카드 그리드(검색 + 단문/장문/포토 탭 + 우측 미리보기). SMS 8종(봄 인사) + LMS 2종 + MMS 3종 시드. `Tpl`에 `images?` 추가.
- **MMS 템플릿 선택 시 자동 첨부 + 수정 불가**: `attachLocked` computed로 칩 회색 처리 + 자물쇠 아이콘 + "(수정 불가)" 안내, 삭제 ×·이미지 선택 버튼 숨김.
- **AppPhonePreview**: `images?` prop 추가 → 발송 페이지 미리보기에도 첨부 이미지가 그대로 표시(아이콘+파일명+KB 카드).
- **이미지 첨부 실제 파일 픽커**: 숨김 `<input type="file" accept=".jpg,.jpeg,image/jpeg" multiple>` + `onPickImages()` 검증(JPG/JPEG · 3장 · 1장 ≤300KB · 합산 ≤800KB).
- **템플릿 사용유무 토글 시 페이지 내용 초기화**: `resetContent()` 추출 + watcher(`flush: 'sync'` + `suppressTplReset` 가드) → 전체 초기화 다이얼로그도 같은 함수를 재사용.
- **광고용 자동 (광고) 접두 강제**: purpose / subject 두 개 watcher가 idempotent하게 부착·해제.

## 3. 이메일 발송 페이지

- **공용 컴포넌트 추출**: 다이얼로그 미리보기와 발송 페이지 미리보기가 구조적으로 달랐던 문제를 `AppEmailPreview`(제목·보낸사람·첨부·헤딩·본문 카드·버튼·HTML/텍스트 토글)로 통합. `EmailTpl`을 `app/types/template.ts`로 이동, 다이얼로그/페이지 모두 같은 컴포넌트 사용.
- `EmailTpl`에 `heading` / `buttonLabel` 까지 전달되어 페이지 미리보기에 즉시 반영.
- 미리보기 컬럼 너비 `320px` → **`460px`** 확대.
- 광고용 자동 (광고) 접두 강제 동일 적용.

## 4. 알림톡 발송 페이지

- 수신자 카드 잠금 게이팅(`:locked`) 제거 → 다른 채널과 동일 동작.
- 메시지 설정 카드도 `:locked` 제거 + `v-if="template"` 게이팅 해제 → 템플릿 미선택 시에도 각 항목 표시 + 값 공란, 내용 textarea placeholder 안내.

## 5. RCS 발송 페이지

- 발송 유형 셀렉트 옵션 캡처 반영
  - 2번째: `스탠드얼론 / 템플릿` → **`스탠드얼론 / 대화형`**
  - 3번째: `SMS / LMS / 대체 없음` → **`SMS / 통합 SMS`**
- 수신 대기 만료 기한: `1시간/6시간/24시간/3일` → **`40초/3분/1시간/24시간`** (기본 `24h`).
- `RcsTpl` 공용 타입 + 9개 비디오팩 템플릿에 발송 목적·유형 3종·내용·이미지·버튼·만료 기한 시드 → 템플릿 선택 시 **메시지 설정 자동 채움**.
- 템플릿 사용유무 토글 → SMS와 동일한 `resetContent()` / `handleReset()` / suppress watcher 패턴.

## 6. PUSH 발송 페이지 — 부가 항목 완성

- **AppPushPreview**: `platform: 'android'|'ios'` prop 추가 → 두 디바이스를 별도 잠금화면 레이아웃으로 렌더(상태바/시계/날짜/알림 카드/하단 버튼). 콘텐츠(`title`/`body`)는 항상 동일 바인딩.
- **AppPushRecipientDialog**(수신자 직접 입력): 타이틀 "수신자 직접 입력" / "수신자 수정", **별칭** 단일 입력 + 토큰 다중 추가(푸시 유형 7종 셀렉트). 수정 모드에서는 `+ 추가`·푸시 유형 뱃지·× 삭제 모두 숨김. 데이터: `name`=별칭, `token`=토큰, `vars.pushType`=유형.
- 메시지 설정 부가 항목 전용 다이얼로그 6종(공용 `AppPushMediaDialog`를 prop으로 분기):
  - **AppPushButtonDialog**: 유형 4종(응답/앱 열기/URL 열기/닫기). 칩 = `유형 ✏ ×`(연필 클릭 시 수정 다이얼로그 재오픈)
  - **AppPushMediaDialog** (재사용): `title` / `showType` / `showExpand` / `types` prop으로 다음 4행을 한 컴포넌트로 처리
    - **미디어**: URL · 유형 4종 · 펼치기 (사용/사용 안함). 칩 `유형 · URL ×`
    - **Android 미디어**: URL · 유형(이미지만) · 펼치기 → 단일 옵션 자동 선택
    - **iOS 미디어**: URL · 유형 4종 (펼치기 없음)
    - **Android 큰 아이콘**: URL만 (유형/펼치기 없음), 타이틀 "Android 큰 아이콘"
  - **AppPushGroupDialog**: 키 + 설명. 칩 `key ✏ ×`
- 광고용 자동 (광고) 접두 강제(pushType + title)
- 주소록 다이얼로그를 `key-column="token"`으로 전환 → 토큰 컬럼 노출

## 7. 복합 플로우 페이지 — 등록/수정/관리 통합

- 초기 로드 시 **플로우 미선택** 상태로 시작. select에 placeholder `<option value="">플로우를 선택하세요</option>` 추가, 메시지 설정 각 항목은 표시·값 공란, 발신/제목/내용 disabled, 발송 버튼 `!selectedFlow` 시 비활성.
- 수신자 설정도 다른 채널과 동일하게 빈 상태 시작 — `varKeys` computed로 노드 본문에서 `#{...}` 동적 수집, `:show-vars`·`:show-substitution`을 `varKeys.length > 0`으로 게이팅. 플로우 전환 시 recipients/selectedRcpt/commonVars/substitutionMode 초기화.
- **수신자 휴대폰 + 이메일 동시 입력 + 표 동시 표시** — `:key-columns="['phone', 'email']"`(card/dialog/address book 모두).
- **AppFlowCreateDialog**: 등록·수정 겸용 (`edit?: FlowDraft | null` prop / `isEdit` computed로 타이틀·확인 버튼 라벨 분기). 폼 카드 2개("플로우 발송 정보" + "플로우 설정"), 채널 옵션 4종(SMS/알림톡/이메일/PUSH) + 채널 변경 시 템플릿 자동 비움 + HTML5 드래그 앤 드롭 순서 변경 + 첫 행 채널 미선택은 placeholder.
- **AppFlowTemplatePickerDialog**(신규): "선택" 버튼 → 채널별 템플릿 라디오 선택(검색 + 커스텀 라디오). 채널별 목업 템플릿(SMS 3·알림톡 3·이메일 1·PUSH 1).
- **AppFlowManageDialog** 리팩토링: `Flow` 인터페이스를 raw(`purpose`·`mode`·`channels: { id, ch, template }[]`)로 정규화, 표시는 `purposeLabel`·`channelsLabel` 도우미. `openCreate` 단일 상태 → `openFlowDialog` + `editingFlow: FlowDraft | null` 공용. **플로우 이름 클릭 → 수정 다이얼로그**, 별도 "플로우 수정" 버튼은 제거. "플로우 생성" → **"플로우 등록"**, "플로우 생성 관리" → **"플로우 관리"** 라벨/타이틀 통일.

## 8. AppModal — 스크롤 잠금 견고화

- 모달 열 때 본 페이지가 맨 위로 튀던 문제, 그리고 살짝 위로 어긋나던 잔여 문제까지 해결.
- **scrollLock 공용 유틸** `app/utils/scrollLock.ts` 신설: 모듈 수준 카운터 + `savedY`로 **중첩 모달**에서도 최초 잠금만 body 변경, 마지막 해제 시에만 복원. `html { zoom: var(--ui-scale) }` 보정 — `body.top`을 `savedY / zoom`으로 나눠 실제 시각 오프셋이 정확히 `savedY`가 되도록 함.
- AppModal은 인스턴스별 `locked` 가드로 중복 lock/unlock을 방지하고, `onBeforeUnmount`에서도 안전 해제.

## 9. 배포·커밋·이력

- `pnpm build` → `npx -y wrangler@4 pages deploy dist --project-name=malgn-noti --branch=main --commit-dirty=true --commit-message "send-page UX polish 2nd batch + PUSH extension dialogs + flow mgmt"` 1회 (배포 #15)
- 프로덕션 검증: `https://malgn-noti.pages.dev/send/push` 200, `/send/flow` 200, alias `https://c4b53baf.malgn-noti.pages.dev/send/push` 200
- 커밋: `bd7e07e 발송 페이지 UX 폴리시 2차 + PUSH 부가항목·플로우 관리 완성` (25 files changed, 2355+/447-) → `origin/main` 푸시
- Cloudflare Pages 자동 배포가 추가로 트리거되었을 수 있음(working tree 기준 wrangler 직접 배포본이 라이브)

## 산출물

### 신규 (7)
- [app/components/AppFlowCreateDialog.vue](../../app/components/AppFlowCreateDialog.vue)
- [app/components/AppFlowTemplatePickerDialog.vue](../../app/components/AppFlowTemplatePickerDialog.vue)
- [app/components/AppPushButtonDialog.vue](../../app/components/AppPushButtonDialog.vue)
- [app/components/AppPushGroupDialog.vue](../../app/components/AppPushGroupDialog.vue)
- [app/components/AppPushMediaDialog.vue](../../app/components/AppPushMediaDialog.vue)
- [app/components/AppPushRecipientDialog.vue](../../app/components/AppPushRecipientDialog.vue)
- [app/utils/scrollLock.ts](../../app/utils/scrollLock.ts)

### 수정 (18)
- 6개 발송 페이지(`app/pages/send/{sms,kakao,rcs,email,push,flow}.vue`)
- `app/components/AppAddressBookDialog.vue`, `AppEmailPreview.vue`, `AppEmailTemplateDialog.vue`, `AppFlowManageDialog.vue`, `AppModal.vue`, `AppPhonePreview.vue`, `AppPushPreview.vue`, `AppRcsTemplateDialog.vue`, `AppRecipientCard.vue`, `AppRecipientFormDialog.vue`, `AppSmsTemplateDialog.vue`
- `app/types/template.ts`(EmailTpl·RcsTpl 추가)

### 배포 (#15)
- 프로덕션: https://malgn-noti.pages.dev
- Alias: https://c4b53baf.malgn-noti.pages.dev

### 커밋
- `bd7e07e` 발송 페이지 UX 폴리시 2차 + PUSH 부가항목·플로우 관리 완성

## 다음 단계 / 한계

- **발신정보·메시지 관리·캠페인·계정/문의·시스템 페이지** — 디자인 핸드오프 미반영 영역. IA만 있고 핸드오프 기반 디자인 미적용.
- **수정 모드에서 푸시 유형 재선택 UI** — 현재 수정 다이얼로그에는 토큰 행 안에서 유형 셀렉트가 노출되지 않음(추가가 막혀 있어 그 안에서 유형만 갈아끼우려면 삭제→재추가 흐름이 필요). 한 칸짜리 인라인 유형 셀렉트로 보강 여지 있음.
- **백엔드 연동 부재** — 모든 다이얼로그 시드 데이터는 목업. NHN API 연동 전이라 저장 후 새로고침하면 휘발됨.
- **드래그 핸들 키보드 접근성** — AppFlowCreateDialog의 행 순서 변경은 마우스 드래그만 지원. ↑/↓ 화살표 키보드 보조가 필요할 수 있음.
- **AppFlowCreateDialog의 placeholder 채널** — 새 행 추가 시 ch=""로 시작하지만 선택 버튼 클릭 시 토스트로 가드만 함. 필드 자체에 빨간 외곽선 등 시각 검증을 더할 수 있음.
