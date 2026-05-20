<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [], confirm: [string] }>()

const num = ref('0808081234')
const formatted = computed(() => num.value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'))
</script>

<template>
  <AppModal :open="open" title="광고 메시지 설정" :width="520" @close="emit('close')">
    <p style="font-size: var(--fz-md); color: var(--ink-700); margin-top: 0; line-height: 1.7">
      영리 목적의 광고성 메시지는 정보통신망법에 따라 <strong>(광고)</strong> 표시와
      <strong>080 무료 수신거부 번호</strong>를 포함해야 합니다.
    </p>
    <AppFormRow label="080 번호 선택" required>
      <select v-model="num" class="select">
        <option value="0808081234">
          080-808-1234 (수신거부 처리: 자동)
        </option>
        <option value="0807771111">
          080-777-1111 (수신거부 처리: 자동)
        </option>
        <option value="custom">
          직접 추가…
        </option>
      </select>
    </AppFormRow>
    <div class="ad-note">
      본문 앞에 자동으로 <code>(광고)</code> 가 추가되며,<br>
      본문 끝에 <code>무료수신거부 {{ formatted }}</code> 가 자동 추가됩니다.
    </div>
    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="emit('confirm', num)">
        적용
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.ad-note {
  margin-top: 14px;
  padding: 12px;
  background: var(--ink-50);
  border-radius: var(--r-md);
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
}
.ad-note code {
  background: var(--white);
  padding: 1px 4px;
  border-radius: var(--r-sm);
  font-family: var(--font-mono);
}
</style>
