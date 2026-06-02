<script setup lang="ts">
const auth = useAuthStore()
const state = computed(() => auth.tenant?.approvalState ?? 'approved')
const visible = computed(() => state.value !== 'approved')
const reason = computed(() => auth.tenant?.rejectedReason ?? '')

function goToContract() {
  navigateTo('/account/contract')
}
</script>

<template>
  <div v-if="visible" class="approval-banner" :class="state">
    <div class="banner-inner app-container">
      <UIcon :name="state === 'rejected' ? 'i-lucide-circle-x' : 'i-lucide-clock'" class="banner-icon" />
      <div class="banner-text">
        <template v-if="state === 'pending'">
          <strong>사업자등록증을 등록해 주세요</strong> — 등록 후 심사 승인이 완료되면 서비스를 이용하실 수 있습니다. 등록 전까지 발송·주소록·발신정보 등록 등 서비스 이용과 회원 정보 수정이 제한됩니다.
        </template>
        <template v-else-if="state === 'reviewing'">
          <strong>사업자등록증 심사 중입니다</strong> — 영업일 기준 1~2일 내에 심사 결과를 안내드립니다. 심사 완료 전까지 서비스 이용과 회원 정보 수정이 제한됩니다.
        </template>
        <template v-else>
          <strong>사업자등록증 심사 반려</strong> — 사유: <em>{{ reason || '관리자에게 문의해 주세요.' }}</em>. 사업자등록증을 다시 제출해 주세요.
        </template>
      </div>
      <button type="button" class="btn-action" @click="goToContract">
        {{ state === 'rejected' ? '다시 제출하기' : state === 'reviewing' ? '진행 상태 보기' : '사업자등록증 등록' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.approval-banner {
  background: #fff8e6;
  border-bottom: 1px solid var(--warning);
  color: var(--ink-900);
}
.approval-banner.rejected {
  background: #fef2f2;
  border-bottom-color: var(--danger);
}
.banner-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  /* .app-container의 좌우 패딩(var(--container-pad))을 유지하고 상하만 추가 */
  padding-block: 10px;
  font-size: var(--fz-sm);
  line-height: 1.5;
}
.banner-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: var(--warning-ink);
}
.approval-banner.rejected .banner-icon {
  color: var(--danger-ink);
}
.banner-text {
  flex: 1;
  min-width: 0;
}
.banner-text strong { font-weight: 700; }
.banner-text em {
  font-style: normal;
  font-weight: 600;
  color: var(--danger-ink);
}
.btn-action {
  flex-shrink: 0;
  padding: 6px 14px;
  background: var(--ink-900);
  color: var(--white);
  border: 0;
  border-radius: var(--r-sm);
  font-size: var(--fz-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
}
.btn-action:hover {
  background: #000;
}

@media (max-width: 720px) {
  .banner-inner {
    flex-wrap: wrap;
  }
  .banner-text { font-size: var(--fz-xs); }
}
</style>
