<script setup lang="ts">
useHead({ title: '문자메시지 발송 조회' })
</script>

<template>
  <AppHistoryView
    default-channel="SMS"
    crumb="발송 관리 · 발송 조회 · SMS"
    title="문자메시지 발송 조회"
  />
</template>
