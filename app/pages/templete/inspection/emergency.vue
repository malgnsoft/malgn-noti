<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '긴급 점검 안내' })

// v1 정적 템플릿 — 백엔드 점검 모드 연동 시 실제 값으로 치환할 placeholder 필드.
const reason = '{{reason}}' // 점검 사유
const estimatedEnd = '{{estimatedEnd}}' // 예상 종료 시각
</script>

<template>
  <AppSystemMessage
    tone="warning"
    icon="i-lucide-alert-octagon"
    eyebrow="MAINTENANCE"
    badge="긴급 점검"
    title="긴급 점검 중입니다"
    description="안정적인 서비스 제공을 위해 긴급 점검을 진행하고 있습니다. 이용에 불편을 드려 죄송합니다."
  >
    <template #detail>
      <dl class="sys-fields">
        <div class="sys-field">
          <dt>점검 사유</dt>
          <dd>{{ reason }}</dd>
        </div>
        <div class="sys-field">
          <dt>예상 종료 시각</dt>
          <dd class="mono">{{ estimatedEnd }}</dd>
        </div>
      </dl>
    </template>
  </AppSystemMessage>
</template>

<style scoped>
.sys-fields {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  overflow: hidden;
}
.sys-field {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 16px;
  font-size: var(--fz-md);
}
.sys-field + .sys-field {
  border-top: 1px solid var(--line);
}
.sys-field dt {
  color: var(--ink-500);
}
.sys-field dd {
  color: var(--ink-800);
  font-weight: 500;
}
.sys-field dd.mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1024px) {
  .sys-field {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}
</style>
