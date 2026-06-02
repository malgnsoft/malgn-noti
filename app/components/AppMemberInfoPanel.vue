<script setup lang="ts">
const toast = useToast()
const auth = useAuthStore()

/* ── 데이터 로드 ─────────────────────────────────────── */
const loading = ref(true)
onMounted(async () => {
  // 미들웨어/플러그인이 이미 hydrate 했다면 한 번 더 갱신만
  await auth.fetchMe()
  loading.value = false
})

const u = computed(() => auth.user)
const c = computed(() => auth.tenant)

/* 사업자등록증 심사 미승인이면 정보 수정 차단 */
const approvalState = computed(() => c.value?.approvalState ?? 'approved')
const isLocked = computed(() => approvalState.value !== 'approved')
const rejectedReason = computed(() => c.value?.rejectedReason ?? '')

/* ── 가입 정보 표시 (회사 정보 — 읽기 전용) ───────────── */
const BIZ_TYPE_LABEL: Record<string, string> = {
  corp: '법인 사업자',
  sole: '개인 사업자',
  personal: '개인',
}
const infoRows = computed(() => [
  { label: '아이디(이메일)', value: u.value?.loginid ?? u.value?.email ?? '-' },
  { label: '회사명', value: c.value?.name ?? '-' },
  { label: '사업자등록번호', value: c.value?.bizNo ?? '-' },
  { label: '대표자명', value: c.value?.ceoName ?? '-' },
  { label: '사업자 종류', value: c.value?.bizType ? (BIZ_TYPE_LABEL[c.value.bizType] ?? c.value.bizType) : '-' },
  { label: '업태', value: c.value?.upTae ?? '-' },
  { label: '업종', value: c.value?.upJong ?? '-' },
  { label: '회사 주소', value: c.value?.address ?? '-' },
])

/* ── 광고성 메일 수신 — 즉시 변경 (확인 모달 후) ──────── */
const adReceive = computed(() => c.value?.adReceive ?? 'reject')
const adConfirmOpen = ref(false)
const pendingAd = ref<'agree' | 'reject'>('agree')
const adConfirmMeta = computed(() => pendingAd.value === 'reject'
  ? { title: '광고성 메일 수신 거부', message: '광고성 메일 수신을 거부하시겠습니까? 거부하셔도 중요 공지 및 서비스 필수 안내는 계속 발송됩니다.', confirmLabel: '수신거부' }
  : { title: '광고성 메일 수신 동의', message: '광고성 메일 수신에 동의하시겠습니까? 할인·이벤트 등 마케팅 정보를 받아보실 수 있습니다.', confirmLabel: '수신동의' })

function requestAdChange(value: 'agree' | 'reject') {
  if (value === adReceive.value) return
  pendingAd.value = value
  adConfirmOpen.value = true
}
async function confirmAdChange() {
  adConfirmOpen.value = false
  try {
    await auth.updateCompany({ adReceive: pendingAd.value })
    toast.add({
      title: pendingAd.value === 'agree' ? '광고성 메일 수신에 동의했습니다.' : '광고성 메일 수신을 거부했습니다.',
      color: 'success', icon: 'i-lucide-circle-check',
    })
  }
  catch {
    toast.add({ title: '수신 설정 변경에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

/* ── 서비스 담당자 — 이름/회사전화/이메일/휴대전화 ──── */
const PHONE_PREFIXES = ['010', '011', '016', '017', '018', '019']
const companyPhoneInput = ref('')
const phonePrefix = ref('010')
const phoneMid = ref('')
const phoneLast = ref('')

watchEffect(() => {
  // store가 갱신될 때 입력 필드도 초기화
  if (c.value) companyPhoneInput.value = c.value.companyPhone ?? ''
  if (u.value?.phone) {
    const parts = u.value.phone.replace(/\D/g, '').match(/^(010|011|016|017|018|019)(\d{3,4})(\d{4})$/)
    if (parts) {
      phonePrefix.value = parts[1]!
      phoneMid.value = parts[2]!
      phoneLast.value = parts[3]!
    }
  }
})

const fullPhone = computed(() =>
  phoneMid.value && phoneLast.value
    ? `${phonePrefix.value}-${phoneMid.value}-${phoneLast.value}`
    : '',
)

/* ── 결제 이메일 — 변경 다이얼로그 (OTP 미연결, 1차는 입력값 그대로 PATCH) ── */
const billingEmailInput = computed(() => c.value?.billingEmail ?? '')
const emailDialogOpen = ref(false)
const emailDialogCtx = ref<'manager' | 'billing'>('billing')
const emailDialogConfig = computed(() => emailDialogCtx.value === 'billing'
  ? {
      title: '결제 이메일 변경',
      desc: '다음 결제 이메일부터 변경된 이메일로 결제 이메일이 발송됩니다.',
      current: c.value?.billingEmail ?? '',
      confirm: '결제 이메일 변경하기',
    }
  : {
      title: '이메일 변경',
      desc: '변경할 이메일 인증 후 서비스 담당자 이메일이 변경됩니다.',
      current: u.value?.email ?? '',
      confirm: '이메일 변경하기',
    })

function openEmailDialog(ctx: 'manager' | 'billing') {
  emailDialogCtx.value = ctx
  emailDialogOpen.value = true
}
async function onEmailChanged(newEmail: string) {
  try {
    if (emailDialogCtx.value === 'billing') {
      await auth.updateCompany({ billingEmail: newEmail })
      toast.add({ title: '결제 이메일이 변경되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
    }
    else {
      // 서비스 담당자 이메일은 OTP 흐름 미구현 — 후속에서 PATCH /me 이메일 변경 라우트 추가 예정
      toast.add({ title: '서비스 담당자 이메일 변경은 곧 지원됩니다.', color: 'info', icon: 'i-lucide-info' })
    }
    emailDialogOpen.value = false
  }
  catch {
    toast.add({ title: '이메일 변경에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
}

/* ── 회원 탈퇴 (미구현 — 후속) ────────────────────────── */
const deleteOpen = ref(false)
function confirmDelete() {
  deleteOpen.value = false
  toast.add({ title: '회원 탈퇴 기능은 곧 지원됩니다.', color: 'info', icon: 'i-lucide-info' })
}

/* ── 휴대폰 본인 인증 (NICE 미연결 — 후속) ───────────── */
const phoneVerifyOpen = ref(false)
function onPhoneVerified(p: { prefix: string, mid: string, last: string }) {
  phonePrefix.value = p.prefix
  phoneMid.value = p.mid
  phoneLast.value = p.last
  phoneVerifyOpen.value = false
  toast.add({ title: '휴대폰 인증이 완료되었습니다. 저장하기를 눌러 반영해 주세요.', color: 'success', icon: 'i-lucide-circle-check' })
}

/* ── 저장하기 — 변경된 필드만 한 번에 PATCH ──────────── */
const saving = ref(false)
async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const tasks: Promise<unknown>[] = []

    // 사용자(name은 NICE 적용 후엔 자동, 본 화면에선 미수정. 휴대전화만)
    if (fullPhone.value && fullPhone.value !== u.value?.phone) {
      tasks.push(auth.updateMe({ phone: fullPhone.value }))
    }
    // 회사 정보 — 회사 전화번호만(결제 이메일은 별도 다이얼로그, 광고수신도 별도 즉시 변경)
    if (companyPhoneInput.value !== (c.value?.companyPhone ?? '')) {
      tasks.push(auth.updateCompany({ companyPhone: companyPhoneInput.value }))
    }

    if (tasks.length === 0) {
      toast.add({ title: '변경된 내용이 없습니다.', color: 'info', icon: 'i-lucide-info' })
      return
    }

    await Promise.all(tasks)
    toast.add({ title: '회원 정보가 저장되었습니다.', color: 'success', icon: 'i-lucide-circle-check' })
  }
  catch (e: unknown) {
    const data = (e as { data?: { message?: string } })?.data
    toast.add({ title: data?.message ?? '저장에 실패했습니다.', color: 'error', icon: 'i-lucide-circle-alert' })
  }
  finally {
    saving.value = false
  }
}

function changeBizDoc() {
  navigateTo('/account/contract')
}
</script>

<template>
  <div class="member-info">
    <div v-if="loading" class="loading">정보를 불러오는 중…</div>

    <template v-else>
      <!-- 사업자등록증 심사 상태 배너 -->
      <div v-if="isLocked" class="approval-banner" :class="{ rejected: approvalState === 'rejected' }">
        <UIcon :name="approvalState === 'rejected' ? 'i-lucide-circle-x' : 'i-lucide-clock'" class="banner-icon" />
        <div class="banner-text">
          <strong v-if="approvalState === 'pending'">사업자등록증을 등록해 주세요</strong>
          <strong v-else>사업자등록증 심사가 반려되었습니다</strong>
          <p v-if="approvalState === 'pending'">
            계약 관리에서 사업자등록증을 등록해 주세요. 심사 승인이 완료될 때까지 서비스 이용 및 회원 정보 수정이 제한됩니다.
            결과는 등록하신 휴대폰·이메일로 안내됩니다.
          </p>
          <p v-else>
            반려 사유: <em>{{ rejectedReason || '관리자에게 문의해 주세요.' }}</em><br>
            사업자등록증을 다시 제출해 주세요.
          </p>
        </div>
      </div>

      <!-- 가입 정보 -->
      <section class="ms-sec">
        <div class="ms-head">
          <h3>가입 정보</h3>
          <button v-if="c?.companyType !== 'personal'" type="button" class="btn btn-primary btn-sm" @click="changeBizDoc">
            사업자등록증 변경
          </button>
        </div>
        <div class="ms-rows">
          <div v-for="r in infoRows" :key="r.label" class="ms-row">
            <span class="ms-label">{{ r.label }}</span>
            <span class="ms-value">{{ r.value }}</span>
          </div>
          <div class="ms-row">
            <span class="ms-label">광고성 메일 수신</span>
            <div class="ms-value ad-value">
              <div class="seg">
                <button type="button" :class="{ active: adReceive === 'reject' }" :disabled="isLocked" @click="requestAdChange('reject')">
                  수신거부
                </button>
                <button type="button" :class="{ active: adReceive === 'agree' }" :disabled="isLocked" @click="requestAdChange('agree')">
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
            <span class="ms-value">{{ u?.name ?? '-' }}</span>
          </div>
          <div class="ms-row">
            <span class="ms-label">회사 전화번호</span>
            <div class="ms-value">
              <input v-model="companyPhoneInput" class="input field-md" placeholder="회사 전화번호를 입력해 주세요" :disabled="isLocked">
            </div>
          </div>
          <div class="ms-row">
            <span class="ms-label">이메일 <span class="rq">*</span></span>
            <div class="ms-value value-inline">
              <span>{{ u?.email ?? '-' }}</span>
              <button type="button" class="btn btn-primary btn-sm" :disabled="isLocked" @click="openEmailDialog('manager')">
                이메일 변경
              </button>
            </div>
          </div>
          <div class="ms-row">
            <span class="ms-label">휴대전화번호 <span class="rq">*</span></span>
            <div class="ms-value value-inline">
              <div class="phone-group">
                <select v-model="phonePrefix" class="select phone-prefix" :disabled="isLocked">
                  <option v-for="p in PHONE_PREFIXES" :key="p" :value="p">{{ p }}</option>
                </select>
                <input v-model="phoneMid" class="input phone-part" inputmode="numeric" maxlength="4" :disabled="isLocked">
                <input v-model="phoneLast" class="input phone-part" inputmode="numeric" maxlength="4" :disabled="isLocked">
              </div>
              <button type="button" class="btn btn-primary btn-sm" :disabled="isLocked" @click="phoneVerifyOpen = true">
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
              <span>{{ billingEmailInput || '-' }}</span>
              <button type="button" class="btn btn-primary btn-sm" :disabled="isLocked" @click="openEmailDialog('billing')">
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
        <button type="button" class="btn btn-primary btn-lg save-btn" :disabled="saving || isLocked" @click="save">
          {{ saving ? '저장 중…' : '저장하기' }}
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
    </template>
  </div>
</template>

<style scoped>
.loading {
  padding: 80px 20px;
  text-align: center;
  font-size: var(--fz-md);
  color: var(--ink-400);
}

/* 사업자등록증 심사 상태 배너 */
.approval-banner {
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  margin-bottom: 28px;
  border: 1px solid var(--warning);
  background: var(--warning-soft, #fff8e6);
  border-radius: var(--r-md);
}
.approval-banner.rejected {
  border-color: var(--danger);
  background: var(--danger-soft, #fef2f2);
}
.banner-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  color: var(--warning-ink);
  margin-top: 2px;
}
.approval-banner.rejected .banner-icon {
  color: var(--danger-ink);
}
.banner-text { flex: 1; }
.banner-text strong {
  display: block;
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 4px;
}
.banner-text p {
  margin: 0;
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.55;
}
.banner-text em {
  font-style: normal;
  font-weight: 600;
  color: var(--danger-ink);
}

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

.field-md { max-width: 320px; }
.phone-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.phone-prefix { width: 84px; }
.phone-part { width: 92px; text-align: center; }

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

/* .seg는 main.css의 글로벌 스타일 사용 (회색 컨테이너 + 흰색 active + soft-shadow) */

@media (max-width: 720px) {
  .ms-row { grid-template-columns: 1fr; gap: 6px; }
}
</style>
