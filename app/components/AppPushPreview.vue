<script setup lang="ts">
withDefaults(defineProps<{
  appName?: string
  title?: string
  body?: string
  platform?: 'android' | 'ios'
}>(), { appName: '맑은 메시징', title: '', body: '', platform: 'android' })
</script>

<template>
  <!-- Android -->
  <div v-if="platform === 'android'" class="pp pp-android">
    <div class="pp-status">
      <span>9:41</span>
      <span class="pp-ic">
        <UIcon name="i-lucide-signal" />
        <UIcon name="i-lucide-wifi" />
        <UIcon name="i-lucide-battery-full" />
      </span>
    </div>
    <div class="and-clock">
      9:41
    </div>
    <div class="and-date">
      6월 6일 월요일
    </div>
    <div class="and-notif">
      <div class="pp-ttl">
        <template v-if="title">
          {{ title }}
        </template>
        <span v-else class="pp-ph">제목</span>
      </div>
      <div class="pp-msg">
        <template v-if="body">
          {{ body }}
        </template>
        <span v-else class="pp-ph">본문이 여기에 표시됩니다</span>
      </div>
      <div class="and-chip">
        <span class="and-dot" />
        <span>{{ appName }} · 지금</span>
        <UIcon name="i-lucide-chevron-down" style="margin-left: auto" />
      </div>
    </div>
    <div class="and-foot">
      <UIcon name="i-lucide-phone" />
      <span>밀어서 잠금 해제</span>
      <UIcon name="i-lucide-camera" />
    </div>
  </div>

  <!-- iOS -->
  <div v-else class="pp pp-ios">
    <div class="pp-status">
      <span>9:41</span>
      <span class="pp-ic">
        <UIcon name="i-lucide-signal" />
        <UIcon name="i-lucide-wifi" />
        <UIcon name="i-lucide-battery-full" />
      </span>
    </div>
    <div class="ios-date">
      6월 6일 월요일
    </div>
    <div class="ios-clock">
      9:41
    </div>
    <div class="ios-spacer" />
    <div class="ios-card">
      <div class="ios-card-head">
        <span class="ios-appicon">M</span>
        <span class="ios-appname">{{ appName }}</span>
        <span class="ios-x"><UIcon name="i-lucide-x" /></span>
      </div>
      <div class="pp-ttl">
        <template v-if="title">
          {{ title }}
        </template>
        <span v-else class="pp-ph">제목</span>
      </div>
      <div class="pp-msg">
        <template v-if="body">
          {{ body }}
        </template>
        <span v-else class="pp-ph">본문이 여기에 표시됩니다</span>
      </div>
    </div>
    <div class="ios-foot">
      <span class="ios-circle"><UIcon name="i-lucide-flashlight" /></span>
      <span class="ios-circle"><UIcon name="i-lucide-camera" /></span>
    </div>
  </div>
</template>

<style scoped>
.pp {
  width: 280px;
  min-height: 460px;
  background: var(--ink-900);
  border: 1px solid var(--ink-800);
  border-radius: 28px;
  padding: 16px 14px 18px;
  color: var(--white);
  display: flex;
  flex-direction: column;
}
.pp-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fz-xs);
  font-weight: 600;
}
.pp-ic {
  display: flex;
  gap: 4px;
  font-size: var(--fz-sm);
  opacity: 0.85;
}
.pp-ttl {
  font-size: var(--fz-sm);
  font-weight: 700;
}
.pp-msg {
  font-size: var(--fz-xs);
  opacity: 0.9;
  margin-top: 2px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.pp-ph {
  opacity: 0.55;
}

/* Android */
.and-clock {
  margin-top: 18px;
  font-size: calc(56px * var(--fz-scale));
  font-weight: 300;
  letter-spacing: -0.03em;
  line-height: 1;
}
.and-date {
  font-size: var(--fz-sm);
  opacity: 0.7;
  margin-top: 4px;
}
.and-notif {
  margin-top: 20px;
}
.and-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 9px 11px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
  font-size: var(--fz-2xs);
  font-family: var(--font-mono);
  opacity: 0.85;
}
.and-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--r-sm);
  background: var(--accent);
}
.and-foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--fz-xs);
  opacity: 0.55;
  padding-top: 24px;
}

/* iOS */
.ios-date {
  text-align: center;
  font-size: var(--fz-md);
  font-weight: 600;
  opacity: 0.85;
  margin-top: 16px;
}
.ios-clock {
  text-align: center;
  font-size: calc(64px * var(--fz-scale));
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1;
  margin-top: 2px;
}
.ios-spacer {
  flex: 1;
  min-height: 60px;
}
.ios-card {
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 12px 14px;
}
.ios-card-head {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--fz-xs);
  margin-bottom: 5px;
}
.ios-appicon {
  width: 16px;
  height: 16px;
  border-radius: var(--r-sm);
  background: var(--accent);
  color: var(--ink-900);
  display: grid;
  place-items: center;
  font-size: calc(9px * var(--fz-scale));
  font-weight: 700;
}
.ios-appname {
  opacity: 0.85;
  font-weight: 600;
}
.ios-x {
  margin-left: auto;
  opacity: 0.5;
  font-size: var(--fz-sm);
}
.ios-foot {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
}
.ios-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
  display: grid;
  place-items: center;
  font-size: var(--fz-lg);
}
</style>
