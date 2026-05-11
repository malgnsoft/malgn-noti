<script setup lang="ts">
useHead({ title: '홈' })
</script>

<template>
  <div class="p-6 lg:p-8">
    <div class="mb-6">
      <h1 class="text-2xl font-bold tracking-tight">홈</h1>
      <p class="text-sm text-neutral-500 mt-1">맑은 메시징에 오신 것을 환영합니다.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UCard v-for="item in summary" :key="item.label">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs text-neutral-500">
              {{ item.label }}
            </div>
            <div class="text-xl font-bold mt-1">
              {{ item.value }}
            </div>
          </div>
          <UIcon :name="item.icon" class="text-2xl text-primary-500" />
        </div>
      </UCard>
    </div>

    <UCard>
      <div class="py-10 text-center text-neutral-500 text-sm">
        대시보드 차트가 들어갈 자리입니다.
      </div>
    </UCard>
  </div>
</template>

<script lang="ts">
const summary = [
  { label: '오늘 발송', value: '—', icon: 'i-lucide-send' },
  { label: '예약 대기', value: '—', icon: 'i-lucide-clock' },
  { label: '실패', value: '—', icon: 'i-lucide-alert-triangle' },
  { label: '잔여 크레딧', value: '—', icon: 'i-lucide-coins' }
]
</script>
