<script setup lang="ts">
interface PreviewFile {
  name: string
  at: string
  url?: string
}

const props = defineProps<{
  open: boolean
  docLabel?: string
  file?: PreviewFile | null
}>()

const emit = defineEmits<{ close: [] }>()

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
    <div v-if="open && file" class="modal-backdrop" @click="emit('close')">
      <div class="fp-modal" @click.stop>
        <!-- 헤더 -->
        <header class="fp-head">
          <div class="fp-head-main">
            <h2>{{ docLabel || '첨부 서류' }}</h2>
            <p>{{ file.name }} · {{ file.at }}</p>
          </div>
          <button type="button" class="fp-x" aria-label="닫기" @click="emit('close')">
            <UIcon name="i-lucide-x" />
          </button>
        </header>

        <!-- 본문 -->
        <div class="fp-body">
          <iframe
            v-if="file.url"
            :src="file.url"
            class="fp-frame"
            title="PDF 미리보기"
          />
          <div v-else class="fp-viewer">
            <UIcon name="i-lucide-file-text" class="fp-file-icon" />
            <span class="fp-file-name">{{ file.name }}</span>
            <span class="fp-file-note">
              미리보기를 사용할 수 없는 파일입니다. 파일을 직접 업로드하면 PDF 원본이 표시됩니다.
            </span>
          </div>
        </div>

        <!-- 푸터 -->
        <footer class="fp-foot">
          <button type="button" class="btn btn-outline-dark" @click="emit('close')">
            닫기
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.fp-modal {
  width: 900px;
  max-width: calc(100vw - 32px);
  height: 880px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--r-lg);
  overflow: hidden;
}

/* 헤더 */
.fp-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 22px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.fp-head-main h2 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 3px;
}
.fp-head-main p {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0;
}
.fp-x {
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-400);
  font-size: var(--fz-lg);
  flex-shrink: 0;
}
.fp-x:hover { background: var(--ink-50); color: var(--ink-900); }

/* 본문 */
.fp-body {
  flex: 1;
  min-height: 0;
  padding: 22px;
  background: var(--paper, var(--ink-50));
}
.fp-frame {
  width: 100%;
  height: 100%;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  display: block;
}
.fp-viewer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 40px 24px;
  text-align: center;
}
.fp-file-icon {
  font-size: 64px;
  color: var(--danger);
}
.fp-file-name {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-top: 6px;
}
.fp-file-note {
  font-size: var(--fz-xs);
  color: var(--ink-400);
}

/* 푸터 */
.fp-foot {
  display: flex;
  justify-content: flex-end;
  padding: 14px 22px;
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
</style>
