<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'sms' | 'rcs' | 'kakao'
  headerName?: string
  headerTag?: string                // RCS의 'Web 메시지(2)' 같은 보조 라벨
}>(), {
  variant: 'sms',
})
</script>

<template>
  <div class="phone" :class="`phone-${variant}`">
    <div class="phone-header">
      <UIcon name="i-bi-chevron-left" class="size-4" />
      <UIcon name="i-bi-person-circle" class="size-5" :class="variant === 'kakao' ? 'text-yellow-400' : 'text-sky-500'" />
      <span class="phone-name">{{ headerName ?? '' }}</span>
      <UIcon name="i-bi-three-dots-vertical" class="size-4 ml-auto" />
    </div>
    <div v-if="headerTag" class="phone-tag-row">
      <span class="phone-tag">{{ headerTag }}</span>
    </div>
    <div class="phone-body">
      <slot>
        <div class="phone-empty" />
      </slot>
    </div>
    <div class="phone-footer">
      <UIcon name="i-bi-plus" class="size-4" />
      <span class="phone-input-mock">메시지 입력</span>
      <UIcon name="i-bi-send-fill" class="size-4 text-sky-500" />
    </div>
  </div>
</template>

<style scoped>
.phone {
  width: 280px;
  height: 480px;
  background: white;
  border: 1px solid var(--gray-300);
  border-radius: 32px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.phone-kakao {
  background: #abc1d1;
}
.phone-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--gray-100);
  color: var(--gray-500);
  background: white;
}
.phone-kakao .phone-header {
  background: #abc1d1;
  color: var(--gray-700);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}
.phone-name {
  flex: 1;
  font-size: 14px;
  color: var(--gray-900);
}
.phone-tag-row {
  display: flex;
  justify-content: flex-end;
  padding: 4px 16px;
  background: var(--gray-50);
}
.phone-tag {
  font-size: 11px;
  color: var(--gray-500);
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  padding: 2px 6px;
}
.phone-body {
  flex: 1;
  padding: 16px;
  background: var(--gray-50);
  overflow-y: auto;
}
.phone-kakao .phone-body {
  background: #abc1d1;
  padding: 12px;
}
.phone-empty {
  height: 100%;
}
.phone-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-top: 1px solid var(--gray-100);
  color: var(--gray-500);
  background: white;
}
.phone-kakao .phone-footer {
  background: white;
}
.phone-input-mock {
  flex: 1;
  font-size: 13px;
  color: var(--gray-400);
}
</style>
