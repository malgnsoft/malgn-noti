<script setup lang="ts">
useHead({ title: '문의 접수 완료' })

const route = useRoute()
const type = computed(() => String(route.query.type ?? '-'))
const title = computed(() => String(route.query.title ?? '-'))
const content = computed(() => String(route.query.content ?? '-'))
</script>

<template>
  <AppMyPageShell active-path="/account/inquiries">
    <div class="ic-panel">
      <div class="ms-head">
        <h3>문의하기</h3>
      </div>
      <p class="ic-desc">
        궁금하신 사항이나 도움이 필요하신 경우 문의해 주세요. 빠르고 정확하게 답변 드리겠습니다.
      </p>

      <!-- 접수 결과 -->
      <div class="ic-result">
        <span class="ic-icon"><UIcon name="i-lucide-check" /></span>
        <h2>문의가 정상적으로 접수되었습니다</h2>
        <p>빠르게 문의 내용 확인 후 답변드리겠습니다!</p>
      </div>

      <div class="ic-rule" />

      <!-- 문의 내용 요약 -->
      <div class="ic-summary">
        <div class="ic-summary-head">문의 내용</div>
        <div class="ic-row">
          <span class="ic-label">문의유형</span>
          <span class="ic-value">{{ type }}</span>
        </div>
        <div class="ic-row">
          <span class="ic-label">제목</span>
          <span class="ic-value">{{ title }}</span>
        </div>
        <div class="ic-row">
          <span class="ic-label">내용</span>
          <span class="ic-value ic-content">{{ content }}</span>
        </div>
      </div>

      <p class="ic-note">
        답변은 마이페이지(이메일) &gt; 문의내역에서 확인하실 수 있습니다.
      </p>

      <NuxtLink to="/home" class="btn btn-outline-dark btn-lg ic-home-btn">
        <UIcon name="i-lucide-info" class="text-[length:var(--fz-md)]" />
        홈으로 바로가기
      </NuxtLink>
    </div>
  </AppMyPageShell>
</template>

<style scoped>
.ms-head {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--line);
}
.ms-head h3 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0;
}
.ic-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 8px;
}

/* 접수 결과 */
.ic-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 16px 28px;
}
.ic-icon {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-ink);
  font-size: var(--fz-3xl);
  margin-bottom: 20px;
}
.ic-result h2 {
  font-size: var(--fz-2xl);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 8px;
}
.ic-result p {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin: 0;
}

.ic-rule {
  height: 1px;
  background: var(--line);
  margin: 4px 0 24px;
}

/* 문의 내용 요약 */
.ic-summary {
  padding: 20px 22px;
  background: var(--ink-50);
  border-radius: var(--r-md);
}
.ic-summary-head {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  padding-bottom: 12px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--line);
}
.ic-row {
  display: flex;
  gap: 16px;
  padding: 9px 0;
}
.ic-label {
  flex: 0 0 88px;
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-500);
}
.ic-value {
  flex: 1;
  min-width: 0;
  font-size: var(--fz-sm);
  color: var(--ink-800);
}
.ic-content {
  white-space: pre-line;
  line-height: 1.65;
}

.ic-note {
  margin: 20px 0 16px;
  text-align: center;
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-600);
}

.ic-home-btn {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  font-weight: 600;
}
</style>
