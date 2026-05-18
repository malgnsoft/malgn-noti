<script setup lang="ts">
withDefaults(defineProps<{
  appName?: string
  title?: string
  body?: string
}>(), { appName: '맑은 메시징', title: '', body: '' })
</script>

<template>
  <div class="push-lock">
    <div class="time">
      2:30
    </div>
    <div class="date">
      2026년 5월 18일 월요일
    </div>
    <div class="notif">
      <div class="head">
        <div class="ico">
          M
        </div>
        <span>{{ appName }}</span>
        <span style="margin-left: auto">지금</span>
      </div>
      <div class="ttl">
        <template v-if="title">
          {{ title }}
        </template>
        <span v-else style="opacity: 0.6">제목</span>
      </div>
      <div class="msg">
        <template v-if="body">
          {{ body }}
        </template>
        <span v-else style="opacity: 0.6">본문이 여기에 표시됩니다</span>
      </div>
    </div>
  </div>
</template>
