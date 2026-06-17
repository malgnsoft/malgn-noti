<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '정기 점검 안내' })

// v1 정적 템플릿 — 백엔드 점검 모드 연동 시 실제 값으로 치환할 placeholder 필드.
const startAt = '{{startAt}}' // 점검 시작 일시
const endAt = '{{endAt}}' // 점검 종료 일시
const reason = '{{reason}}' // 점검 내용
</script>

<template>
  <AppSystemMessage
    tone="warning"
    icon="i-lucide-calendar-clock"
    eyebrow="MAINTENANCE"
    badge="정기 점검"
    title="정기 점검 중입니다"
    description="더 나은 서비스를 위해 예정된 정기 점검을 진행하고 있습니다. 점검 시간 동안 서비스 이용이 제한됩니다."
  >
    <template #detail>
      <dl class="sys-fields">
        <div class="sys-field">
          <dt>점검 일시</dt>
          <dd class="mono">{{ startAt }} ~ {{ endAt }}</dd>
        </div>
        <div class="sys-field">
          <dt>점검 내용</dt>
          <dd>{{ reason }}</dd>
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
