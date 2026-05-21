<script setup lang="ts">
const props = defineProps<{ open: boolean, url: string }>()
const emit = defineEmits<{ close: [] }>()
const toast = useToast()

async function copy() {
  try {
    await navigator.clipboard.writeText(props.url)
    toast.add({ title: 'URL을 복사했습니다.', color: 'success', icon: 'i-lucide-link' })
  }
  catch {
    toast.add({ title: 'URL 복사에 실패했습니다.', color: 'error', icon: 'i-lucide-octagon-alert' })
  }
}
</script>

<template>
  <AppModal :open="open" title="" :width="420" @close="emit('close')">
    <div class="lu">
      <div class="lu-check">
        <UIcon name="i-lucide-check" />
      </div>
      <div class="lu-msg">
        랜딩페이지 URL이 복사되었습니다.
      </div>
      <div class="lu-divider" />
      <div class="lu-label">
        복사된 숏 URL
      </div>
      <div class="lu-row">
        <input class="input" :value="url" readonly>
        <button type="button" class="btn btn-outline btn-sm lu-copy" @click="copy">
          <UIcon name="i-lucide-copy" class="text-[length:var(--fz-sm)]" /> 복사
        </button>
      </div>
    </div>
    <template #footer>
      <button type="button" class="btn btn-sky lu-confirm" @click="emit('close')">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.lu {
  text-align: center;
}
.lu-check {
  width: 44px;
  height: 44px;
  margin: 4px auto 12px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 2px solid var(--accent);
  color: var(--accent-ink);
  font-size: 20px;
}
.lu-msg {
  font-size: var(--fz-md);
  color: var(--ink-800);
}
.lu-divider {
  margin: 16px 0;
  border-top: 1px solid var(--line);
}
.lu-label {
  text-align: left;
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 6px;
}
.lu-row {
  display: flex;
  gap: 6px;
}
.lu-row .input {
  flex: 1;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: var(--fz-sm);
}
.lu-copy {
  flex-shrink: 0;
}
.lu-confirm {
  width: 100%;
}
</style>
