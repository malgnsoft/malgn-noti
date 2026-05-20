<script setup lang="ts">
export interface KakaoButton {
  label: string
  type?: 'web' | 'app' | 'phone' | 'message'
}

defineProps<{
  channelName?: string                        // '맑은소프트'
  badge?: string                              // '알림톡 도착' / '친구톡' 등
  body: string
  extra?: string
  buttons?: KakaoButton[]
}>()
</script>

<template>
  <div class="kakao-row">
    <div class="kakao-avatar">
      <UIcon name="i-bi-chat-dots-fill" class="size-3.5 text-white" />
    </div>
    <div class="kakao-content">
      <div v-if="channelName" class="kakao-channel">{{ channelName }}</div>
      <div class="kakao-bubble">
        <div v-if="badge" class="kakao-badge">{{ badge ?? '알림톡 도착' }}</div>
        <div class="kakao-body">{{ body }}</div>
        <div v-if="extra" class="kakao-extra">{{ extra }}</div>
        <div v-if="buttons?.length" class="kakao-buttons">
          <button
            v-for="(b, i) in buttons"
            :key="i"
            type="button"
            class="kakao-btn"
          >
            {{ b.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kakao-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}
.kakao-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #6b7e8a;
  flex-shrink: 0;
  margin-top: 14px;
}
.kakao-content {
  flex: 1;
  min-width: 0;
}
.kakao-channel {
  font-size: var(--fz-xs);
  color: var(--gray-800);
  margin-bottom: 2px;
  font-weight: 500;
}
.kakao-bubble {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.kakao-badge {
  background: #ffe14a;
  color: var(--gray-900);
  padding: 6px 12px;
  font-weight: 700;
  font-size: var(--fz-md);
}
.kakao-body {
  padding: 10px 12px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--gray-800);
  white-space: pre-wrap;
  word-break: break-word;
}
.kakao-extra {
  padding: 0 12px 10px;
  font-size: var(--fz-sm);
  color: var(--gray-700);
  white-space: pre-wrap;
  word-break: break-word;
}
.kakao-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 8px 8px;
}
.kakao-btn {
  width: 100%;
  background: #f3f4f6;
  color: var(--gray-800);
  border: 0;
  border-radius: 6px;
  padding: 8px;
  font-size: var(--fz-sm);
  font-weight: 500;
  cursor: pointer;
}
.kakao-btn:hover {
  background: var(--gray-200);
}
</style>
