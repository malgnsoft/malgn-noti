<script setup lang="ts">
withDefaults(defineProps<{
  senderName?: string
  message?: string
  time?: string
}>(), { senderName: '1588-1234', message: '', time: '9:41' })
</script>

<template>
  <div class="phone">
    <div class="phone-status">
      <span>{{ time }}</span>
      <span class="right">
        <span>•••</span>
        <span>5G</span>
        <span>100%</span>
      </span>
    </div>
    <div class="imsg">
      <div class="imsg-header">
        <div class="avatar">{{ (senderName || '?').slice(0, 1) }}</div>
        <div class="name">
          {{ senderName }}
        </div>
        <div class="sub">
          문자 메시지
        </div>
      </div>
      <div class="imsg-body">
        <div class="imsg-time">
          오늘 오후 2:30
        </div>
        <div v-if="message" class="imsg-bubble">
          {{ message }}
        </div>
        <div
          v-else
          class="imsg-bubble"
          style="background: transparent; color: var(--ink-400); border: 1px dashed var(--ink-200)"
        >
          본문이 여기에 표시됩니다
        </div>
      </div>
    </div>
  </div>
</template>
