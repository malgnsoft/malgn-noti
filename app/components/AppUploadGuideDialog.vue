<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  docLabel?: string
}>(), { docLabel: '사업자등록증' })

const emit = defineEmits<{ close: [], confirm: [] }>()

let locked = false
function lock() {
  if (locked || !import.meta.client) return
  lockScroll()
  locked = true
}
function unlock() {
  if (!locked || !import.meta.client) return
  unlockScroll()
  locked = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
watch(() => props.open, (v) => {
  if (!import.meta.client) return
  if (v) {
    lock()
    window.addEventListener('keydown', onKey)
  }
  else {
    unlock()
    window.removeEventListener('keydown', onKey)
  }
})
onBeforeUnmount(() => {
  unlock()
  if (import.meta.client) window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click="emit('close')">
      <div class="ug-modal" @click.stop>
        <span class="ug-icon">
          <UIcon name="i-lucide-file-text" />
        </span>
        <h3 class="ug-title">{{ docLabel }} 업로드 안내</h3>
        <p class="ug-desc">
          PDF 형식의 파일만 첨부할 수 있으며, 최대 10MB까지 업로드할 수 있습니다.
          [확인] 버튼을 클릭하시면 파일 선택 창이 열립니다.
        </p>
        <button type="button" class="btn btn-primary btn-lg ug-btn" @click="emit('confirm')">
          확인
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ug-modal {
  width: 340px;
  max-width: calc(100vw - 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 28px 24px 22px;
  background: var(--white);
  border-radius: var(--r-lg);
}
.ug-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--r-md);
  background: var(--info-soft);
  color: var(--info);
  font-size: var(--fz-2xl);
  margin-bottom: 14px;
}
.ug-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 8px;
}
.ug-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 20px;
}
.ug-btn {
  width: 100%;
  font-weight: 600;
}
</style>
