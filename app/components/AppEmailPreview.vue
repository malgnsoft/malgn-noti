<script setup lang="ts">
withDefaults(defineProps<{
  from?: string
  subject?: string
  body?: string
}>(), { from: 'no-reply@malgn.com', subject: '', body: '' })
</script>

<template>
  <div class="email-preview" style="max-width: 360px">
    <div class="head">
      <div class="subject">
        <template v-if="subject">
          {{ subject }}
        </template>
        <span v-else style="color: var(--ink-400)">제목이 여기에 표시됩니다</span>
      </div>
      <div class="meta">
        보낸사람: {{ from }} · 오늘 14:30
      </div>
    </div>
    <div class="body">
      <template v-if="body">
        {{ body }}
      </template>
      <span v-else style="color: var(--ink-400)">본문이 여기에 표시됩니다</span>
    </div>
  </div>
</template>
