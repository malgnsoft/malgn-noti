<script setup lang="ts">
withDefaults(defineProps<{
  brandName?: string
  verified?: boolean
  body?: string
  image?: boolean
  buttons?: { type: string, label: string }[]
}>(), { brandName: '맑은소프트', verified: true, body: '', image: false, buttons: () => [] })

const { time } = usePreviewClock()

function btnIcon(type: string) {
  return type === 'web' ? 'i-lucide-external-link' : type === 'phone' ? 'i-lucide-phone' : 'i-lucide-message-square'
}
</script>

<template>
  <div class="phone">
    <div class="phone-status">
      <span>{{ time }}</span>
      <span class="right"><span>•••</span><span>5G</span><span>100%</span></span>
    </div>
    <div class="rcs">
      <div class="rcs-header">
        <div class="verified-icon">
          {{ verified ? '✓' : 'M' }}
        </div>
        <div>
          <div class="name">
            {{ brandName }}
          </div>
          <div class="verified">
            {{ verified ? '인증된 발신자' : 'RCS' }}
          </div>
        </div>
      </div>
      <div class="rcs-body">
        <div class="rcs-bubble">
          <div v-if="image" class="img-placeholder">
            대표 이미지
          </div>
          <div class="body-text">
            <template v-if="body">
              {{ body }}
            </template>
            <span v-else style="color: var(--ink-400)">본문이 여기에 표시됩니다</span>
          </div>
          <div v-if="buttons.length > 0" class="button-list">
            <div v-for="(b, i) in buttons" :key="i" class="btn-row">
              <UIcon :name="btnIcon(b.type)" class="text-[length:var(--fz-sm)]" />
              {{ b.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
