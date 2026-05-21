<script setup lang="ts">
const toast = useToast()

/* 가입 정보 (목업 — 백엔드 연동 시 교체) */
const account = {
  email: 'service@malgnsoft.com',
  company: '(주)맑은소프트',
  bizNo: '110-86-39050',
  ceo: '하근호',
  bizType: '법인 사업자',
  upTae: '서비스',
  upJong: '소프트웨어자문, 개발및공급',
  address: '087-97) 서울특별시 구로구 디지털로 288, 1701호(구로동, 대륭포스트타워1차)',
}
const INFO_ROWS = [
  { label: '아이디(이메일)', value: account.email },
  { label: '회사명', value: account.company },
  { label: '사업자등록번호', value: account.bizNo },
  { label: '대표자명', value: account.ceo },
  { label: '사업자 종류', value: account.bizType },
  { label: '업태', value: account.upTae },
  { label: '업종', value: account.upJong },
  { label: '회사 주소', value: account.address },
]

const adReceive = ref<'agree' | 'reject'>('agree')

/* 광고성 메일 수신 변경 — 컨펌 후 적용 */
const adConfirmOpen = ref(false)
const pendingAd = ref<'agree' | 'reject'>('agree')
const adConfirmMeta = computed(() => pendingAd.value === 'reject'
  ? {
      title: '광고성 메일 수신 거부',
      message: '광고성 메일 수신을 거부하시겠습니까? 거부하셔도 중요 공지 및 서비스 필수 안내는 계속 발송됩니다.',
      confirmLabel: '수신거부',
    }
  : {
      title: '광고성 메일 수신 동의',
      message: '광고성 메일 수신에 동의하시겠습니까? 할인·이벤트 등 마케팅 정보를 받아보실 수 있습니다.',
      confirmLabel: '수신동의',
    })

function requestAdChange(value: 'agree' | 'reject') {
  if (value === adReceive.value) return
  pendingAd.value = value
  adConfirmOpen.value = true
}
function confirmAdChange() {
  adReceive.value = pendingAd.value
  adConfirmOpen.value = false
  toast.add({
    title: pendingAd.value === 'agree' ? '광고성 메일 수신에 동의했습니다.' : '광고성 메일 수신을 거부했습니다.',
    color: 'success',
    icon: 'i-lucide-circle-check',
  })
}

/* 서비스 담당자 */
const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019']
const managerName = '홍길동'
const companyPhone = ref('')
const managerEmail = ref('service@malgnsoft.com')
const phonePrefix = ref('010')
const phoneMid = ref('0000')
const phoneLast = ref('0000')

/* 결제 이메일 */
const billingEmail = ref('service@malgnsoft.com')

/* 이메일 변경 모달 */
const emailDialogOpen = ref(false)
const emailDialogCtx = ref<'manager' | 'billing'>('billing')
const emailDialogConfig = computed(() => emailDialogCtx.value === 'billing'
  ? {
      title: '결제 이메일 변경',
      desc: '다음 결제 이메일부터 변경된 이메일로 결제 이메일이 발송됩니다.',
      current: billingEmail.value,
      confirm: '결제 이메일 변경하기',
    }
  : {
      title: '이메일 변경',
      desc: '변경할 이메일 인증 후 서비스 담당자 이메일이 변경됩니다.',
      current: managerEmail.value,
      confirm: '이메일 변경하기',
    })

function openEmailDialog(ctx: 'manager' | 'billing') {
  emailDialogCtx.value = ctx
  emailDialogOpen.value = true
}
function onEmailChanged(newEmail: string) {
  if (emailDialogCtx.value === 'billing') billingEmail.value = newEmail
  else managerEmail.value = newEmail
  emailDialogOpen.value = false
  toast.add({ title: '이메일이 변경되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}

/* 회원 탈퇴 */
const deleteOpen = ref(false)
function confirmDelete() {
  deleteOpen.value = false
  toast.add({ title: '회원 탈퇴가 요청되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}

/* 휴대폰 본인 인증 모달 */
const phoneVerifyOpen = ref(false)
function onPhoneVerified(p: { prefix: string, mid: string, last: string }) {
  phonePrefix.value = p.prefix
  phoneMid.value = p.mid
  phoneLast.value = p.last
  phoneVerifyOpen.value = false
  toast.add({ title: '휴대폰 본인 인증이 완료되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}

function changeBizDoc() {
  navigateTo('/account/contract')
}
function save() {
  toast.add({ title: '회원 정보가 저장되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
}
</script>

<template>
  <div class="member-info">
    <!-- 가입 정보 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>가입 정보</h3>
        <button type="button" class="btn btn-primary btn-sm" @click="changeBizDoc">
          사업자등록증 변경
        </button>
      </div>
      <div class="ms-rows">
        <div v-for="r in INFO_ROWS" :key="r.label" class="ms-row">
          <span class="ms-label">{{ r.label }}</span>
          <span class="ms-value">{{ r.value }}</span>
        </div>
        <div class="ms-row">
          <span class="ms-label">광고성 메일 수신</span>
          <div class="ms-value ad-value">
            <div class="seg">
              <button type="button" :class="{ active: adReceive === 'reject' }" @click="requestAdChange('reject')">
                수신거부
              </button>
              <button type="button" :class="{ active: adReceive === 'agree' }" @click="requestAdChange('agree')">
                수신동의
              </button>
            </div>
            <span class="ad-note">
              중요 공지 및 서비스와 관련한 필수 안내 등은 수신 설정과 관계없이 발송될 수 있습니다.
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- 서비스 담당자 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>서비스 담당자 <span class="ms-sub">(필수)</span></h3>
      </div>
      <div class="ms-rows">
        <div class="ms-row">
          <span class="ms-label">이름 <span class="rq">*</span></span>
          <span class="ms-value">{{ managerName }}</span>
        </div>
        <div class="ms-row">
          <span class="ms-label">회사 전화번호</span>
          <div class="ms-value">
            <input v-model="companyPhone" class="input field-md" placeholder="회사 전화번호를 입력해 주세요">
          </div>
        </div>
        <div class="ms-row">
          <span class="ms-label">이메일 <span class="rq">*</span></span>
          <div class="ms-value value-inline">
            <span>{{ managerEmail }}</span>
            <button type="button" class="btn btn-primary btn-sm" @click="openEmailDialog('manager')">
              이메일 변경
            </button>
          </div>
        </div>
        <div class="ms-row">
          <span class="ms-label">휴대전화번호 <span class="rq">*</span></span>
          <div class="ms-value value-inline">
            <div class="phone-group">
              <select v-model="phonePrefix" class="select phone-prefix">
                <option v-for="p in PHONE_PREFIXES" :key="p" :value="p">{{ p }}</option>
              </select>
              <input v-model="phoneMid" class="input phone-part" inputmode="numeric" maxlength="4">
              <input v-model="phoneLast" class="input phone-part" inputmode="numeric" maxlength="4">
            </div>
            <button type="button" class="btn btn-primary btn-sm" @click="phoneVerifyOpen = true">
              휴대폰 인증
            </button>
            <span class="ms-note">서비스 담당자를 수정하려면 휴대폰 인증이 필요합니다.</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 결제 이메일 정보 -->
    <section class="ms-sec">
      <div class="ms-head">
        <h3>결제 이메일 정보 <span class="ms-sub">(선택)</span></h3>
      </div>
      <div class="ms-rows">
        <div class="ms-row">
          <span class="ms-label">결제 이메일 <span class="rq">*</span></span>
          <div class="ms-value value-inline">
            <span>{{ billingEmail }}</span>
            <button type="button" class="btn btn-primary btn-sm" @click="openEmailDialog('billing')">
              이메일 변경
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 액션 -->
    <div class="ms-actions">
      <button type="button" class="delete-link" @click="deleteOpen = true">
        회원 탈퇴
      </button>
      <button type="button" class="btn btn-primary btn-lg save-btn" @click="save">
        저장하기
      </button>
    </div>

    <AppEmailChangeDialog
      :open="emailDialogOpen"
      :title="emailDialogConfig.title"
      :desc="emailDialogConfig.desc"
      :current-email="emailDialogConfig.current"
      :confirm-label="emailDialogConfig.confirm"
      @close="emailDialogOpen = false"
      @confirm="onEmailChanged"
    />

    <AppPhoneVerifyDialog
      :open="phoneVerifyOpen"
      @close="phoneVerifyOpen = false"
      @verified="onPhoneVerified"
    />

    <AppConfirmDialog
      :open="adConfirmOpen"
      :title="adConfirmMeta.title"
      :message="adConfirmMeta.message"
      :confirm-label="adConfirmMeta.confirmLabel"
      @close="adConfirmOpen = false"
      @confirm="confirmAdChange"
    />

    <AppConfirmDialog
      :open="deleteOpen"
      title="회원 탈퇴"
      message="회원 탈퇴 시 모든 발송 이력·주소록·설정이 영구 삭제되며 복구할 수 없습니다. 정말 탈퇴하시겠습니까?"
      confirm-label="회원 탈퇴"
      danger
      @close="deleteOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.ms-sec + .ms-sec { margin-top: 40px; }

.ms-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.ms-head .ms-sub {
  font-size: var(--fz-sm);
  font-weight: 400;
  color: var(--ink-400);
}
.ms-head .btn { margin-left: auto; }

.ms-rows {
  display: flex;
  flex-direction: column;
}
.ms-row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  padding: 11px 0;
}
.ms-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
}
.rq { color: var(--danger); margin-left: 2px; }
.ms-value {
  font-size: var(--fz-md);
  color: var(--ink-800);
  min-width: 0;
}

/* 인라인 값 + 버튼/노트 */
.value-inline {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.ms-note {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

/* 광고성 메일 수신 */
.ad-value {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.ad-note {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  line-height: 1.5;
}

/* 입력 필드 */
.field-md { max-width: 320px; }
.phone-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.phone-prefix { width: 84px; }
.phone-part { width: 92px; text-align: center; }

/* 액션 */
.ms-actions {
  margin-top: 36px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}
.save-btn {
  min-width: 160px;
  font-weight: 600;
}
.delete-link {
  background: transparent;
  border: 0;
  font-size: var(--fz-sm);
  color: var(--ink-400);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.delete-link:hover { color: var(--danger-ink); }

@media (max-width: 720px) {
  .ms-row { grid-template-columns: 1fr; gap: 6px; }
}
</style>
