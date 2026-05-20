<script setup lang="ts">
withDefaults(defineProps<{
  subject?: string
  from?: string
  attachments?: string[]
  heading?: string
  body?: string
  buttonLabel?: string
}>(), { subject: '', from: '', attachments: () => [], heading: '', body: '', buttonLabel: '' })

const viewMode = ref<'text' | 'html'>('html')
</script>

<template>
  <div class="email-preview">
    <div class="ep-subject">
      {{ subject || '(제목 없음)' }}
    </div>
    <div class="ep-meta">
      <div><span>보낸사람</span>{{ from || '—' }}</div>
      <div><span>첨부파일</span>{{ attachments.length ? attachments.join(', ') : '—' }}</div>
    </div>
    <div class="ep-body">
      <div class="ep-card">
        <div v-if="heading" class="ep-heading">
          {{ heading }}
        </div>
        <div v-if="body" class="ep-text">
          {{ body }}
        </div>
        <div v-else class="ep-text" style="color: var(--ink-400)">
          본문이 여기에 표시됩니다
        </div>
        <button v-if="buttonLabel" type="button" class="btn btn-primary btn-sm" style="margin-top: 14px">
          {{ buttonLabel }}
        </button>
      </div>
    </div>
    <div class="ep-foot">
      <AppSegmented
        v-model="viewMode"
        :options="[{ value: 'text', label: '텍스트' }, { value: 'html', label: 'HTML' }]"
      />
    </div>
  </div>
</template>

<style scoped>
.email-preview {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  display: flex;
  flex-direction: column;
  min-height: 420px;
}
.ep-subject {
  padding: 16px 18px 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-900);
}
.ep-meta {
  padding: 0 18px 14px;
  font-size: 12px;
  color: var(--ink-700);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid var(--line);
}
.ep-meta span {
  display: inline-block;
  width: 64px;
  color: var(--ink-400);
}
.ep-body {
  flex: 1;
  padding: 18px;
  background: var(--paper);
}
.ep-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 24px;
}
.ep-heading {
  font-size: 17px;
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 10px;
}
.ep-text {
  font-size: 13px;
  color: var(--ink-600);
  line-height: 1.7;
  white-space: pre-wrap;
}
.ep-foot {
  padding: 10px 16px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: flex-end;
}
</style>
