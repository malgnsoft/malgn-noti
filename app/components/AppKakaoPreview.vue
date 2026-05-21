<script setup lang="ts">
withDefaults(defineProps<{
  profileName?: string
  body?: string
  extra?: string
  buttons?: { type: string, label: string }[]
}>(), { profileName: '(주)맑은소프트', body: '', extra: '', buttons: () => [] })

const { time } = usePreviewClock()

function parts(text: string) {
  return (text || '').split(/(#\{[^}]+\}|\{\{%[^%]+%\}\})/g).map((p, i) => ({
    i, p, isVar: /^(#\{|\{\{%)/.test(p)
  }))
}
</script>

<template>
  <div class="phone phone--auto" style="background: #abc1d1">
    <div class="phone-status">
      <span>{{ time }}</span>
      <span class="right"><span>•••</span><span>5G</span><span>100%</span></span>
    </div>
    <div class="kakao">
      <div class="kakao-header">
        <span>← {{ profileName }}</span>
        <span>≡</span>
      </div>
      <div class="kakao-body">
        <div class="kakao-name">
          {{ profileName }}
        </div>
        <div class="kakao-row">
          <div class="kakao-avatar">
            🟡
          </div>
          <div class="kakao-bubble">
            <div class="ribbon">
              알림톡 도착
            </div>
            <div class="body-text">
              <template v-if="body">
                <template v-for="part in parts(body)" :key="part.i">
                  <span v-if="part.isVar" class="var-pill">{{ part.p }}</span>
                  <span v-else>{{ part.p }}</span>
                </template>
              </template>
              <span v-else style="color: var(--ink-400)">본문이 여기에 표시됩니다</span>
            </div>
            <div v-if="extra" class="extras">
              <template v-for="part in parts(extra)" :key="part.i">
                <span v-if="part.isVar" class="var-pill">{{ part.p }}</span>
                <span v-else>{{ part.p }}</span>
              </template>
            </div>
            <div v-if="buttons.length > 0" class="buttons">
              <div v-for="(b, i) in buttons" :key="i" class="btn-row">
                {{ b.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 미리보기는 메시지 전체(본문·부가정보·버튼)가 잘리지 않도록 내용에 맞춰 늘어난다 */
.phone--auto {
  height: auto;
  min-height: 520px;
}
.phone--auto :deep(.kakao),
.phone--auto :deep(.kakao-body) {
  overflow: visible;
}
</style>
