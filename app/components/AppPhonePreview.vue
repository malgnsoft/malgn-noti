<script setup lang="ts">
const props = withDefaults(defineProps<{
  senderName?: string
  message?: string
  time?: string
  images?: { name: string, size: number }[]
}>(), { senderName: '1588-1234', message: '', time: '', images: () => [] })

// 현재 시각 — 서버/클라이언트 hydration 불일치를 피하려 onMounted에서 설정
const liveTime = ref('9:41')
const liveStamp = ref('오늘 오후 2:30')
onMounted(() => {
  const d = new Date()
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const h12 = h % 12 === 0 ? 12 : h % 12
  liveTime.value = `${h12}:${m}`
  liveStamp.value = `오늘 ${h < 12 ? '오전' : '오후'} ${h12}:${m}`
})
const statusTime = computed(() => props.time || liveTime.value)
</script>

<template>
  <div class="phone">
    <div class="phone-status">
      <span>{{ statusTime }}</span>
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
          {{ liveStamp }}
        </div>
        <div
          v-for="(img, i) in images"
          :key="i"
          class="imsg-photo"
        >
          <UIcon name="i-lucide-image" class="imsg-photo-ico" />
          <div class="imsg-photo-meta">
            <div class="imsg-photo-name">
              {{ img.name }}
            </div>
            <div class="imsg-photo-size">
              {{ Math.round(img.size / 1024) }} KB
            </div>
          </div>
        </div>
        <div v-if="message" class="imsg-bubble">
          {{ message }}
        </div>
        <div
          v-else-if="!images.length"
          class="imsg-bubble"
          style="background: transparent; color: var(--ink-400); border: 1px dashed var(--ink-200)"
        >
          본문이 여기에 표시됩니다
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.imsg-photo {
  align-self: flex-start;
  max-width: 86%;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--ink-50);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px 14px;
}
.imsg-photo-ico {
  font-size: var(--fz-4xl);
  color: var(--ink-400);
  flex-shrink: 0;
}
.imsg-photo-meta {
  min-width: 0;
}
.imsg-photo-name {
  font-size: var(--fz-sm);
  color: var(--ink-800);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.imsg-photo-size {
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin-top: 2px;
}
</style>
