<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  width?: number
  hideClose?: boolean
}>(), { width: 520 })

const emit = defineEmits<{ close: [] }>()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

// 본 페이지 스크롤은 공용 잠금 유틸(scrollLock)에서 카운터로 관리 → 중첩 모달도 안전
let locked = false
function lock() {
  if (locked) return
  lockScroll()
  locked = true
}
function unlock() {
  if (!locked) return
  unlockScroll()
  locked = false
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
  if (!import.meta.client) return
  unlock()
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" @click="emit('close')">
      <div class="modal" :style="{ width: width + 'px' }" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            {{ title }}
          </div>
          <button
            v-if="!hideClose"
            type="button"
            class="btn btn-ghost btn-icon"
            aria-label="닫기"
            @click="emit('close')"
          >
            <UIcon name="i-lucide-x" class="text-lg" />
          </button>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
