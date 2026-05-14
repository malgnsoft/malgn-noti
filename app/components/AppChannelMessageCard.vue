<script setup lang="ts">
import type { ChannelMeta } from '~/types/channel'

defineProps<{
  meta: ChannelMeta
  title?: string
  mode?: 'edit' | 'readonly'                                       // Flow에서 readonly로 임베드
}>()
</script>

<template>
  <AppSendFormCard :title="title ?? '메시지 설정'">
    <div class="channel-message-grid">
      <div class="message-fields-col">
        <slot name="body" :mode="mode ?? 'edit'" />
      </div>
      <div class="preview-col">
        <slot name="preview" />
      </div>
    </div>
  </AppSendFormCard>
</template>

<style scoped>
.channel-message-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}
.message-fields-col {
  min-width: 0;                                                    /* grid overflow 방지 */
}
.preview-col {
  display: flex;
  justify-content: center;
  position: sticky;
  top: 16px;
}

@media (max-width: 1024px) {
  .channel-message-grid {
    grid-template-columns: 1fr;
  }
  .preview-col {
    order: -1;
    position: static;
  }
}
</style>
