<script setup lang="ts">
interface Article {
  no: string
  title: string
  body: string[]
}

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
}>(), { title: '최초 이용계약 온라인체결' })

const emit = defineEmits<{ close: [] }>()

/* 계약서 미리보기 (목업 — 백엔드 연동 시 교체) */
const ARTICLES: Article[] = [
  {
    no: '제1조',
    title: '목적',
    body: ['본 계약은 (주)맑은소프트(이하 "회사")가 제공하는 메시징 서비스 "맑은 메시징"의 이용과 관련하여, 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.'],
  },
  {
    no: '제2조',
    title: '서비스의 제공',
    body: ['회사는 SMS, LMS, 알림톡, 친구톡, RCS, 푸시, 이메일 등 메시징 발송 서비스를 제공하며, 본 계약서에 명시된 조건에 따라 이용자에게 서비스를 제공합니다.'],
  },
  {
    no: '제3조',
    title: '이용요금 및 결제',
    body: ['이용요금 및 결제 조건은 본문 제2장에서 정한 바에 따르며, 별도 부속 합의서가 있는 경우 해당 합의서가 우선합니다.'],
  },
]

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
      <div class="cv-modal" @click.stop>
        <!-- 헤더 -->
        <header class="cv-head">
          <div class="cv-head-main">
            <h2>{{ title }}</h2>
            <p>서명자 - · -</p>
          </div>
          <button type="button" class="cv-x" aria-label="닫기" @click="emit('close')">
            <UIcon name="i-lucide-x" />
          </button>
        </header>

        <!-- 본문 -->
        <div class="cv-body">
          <article class="cv-doc">
            <h3 class="cv-doc-title">{{ title }}</h3>
            <p class="cv-doc-sub">버전 신규 · 서명자 - · 체결 -</p>
            <div class="cv-rule" />

            <section v-for="a in ARTICLES" :key="a.no" class="cv-article">
              <h4>{{ a.no }} ({{ a.title }})</h4>
              <p v-for="(line, i) in a.body" :key="i">{{ line }}</p>
            </section>

            <div class="cv-rule" />

            <div class="cv-signs">
              <div class="cv-sign">
                <span class="cv-sign-role">"회사"</span>
                <span class="cv-sign-name">(주)맑은소프트 · 대표 하근호</span>
                <span class="cv-sign-state">(인)</span>
              </div>
              <div class="cv-sign">
                <span class="cv-sign-role">"이용자"</span>
                <span class="cv-sign-name">(주)맑은소프트 · 대표 -</span>
                <span class="cv-sign-state done">(전자서명 완료)</span>
              </div>
            </div>
          </article>
        </div>

        <!-- 푸터 -->
        <footer class="cv-foot">
          <button type="button" class="btn btn-outline-dark" @click="emit('close')">
            닫기
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.cv-modal {
  width: 700px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: var(--white);
  border-radius: var(--r-lg);
  overflow: hidden;
}

/* 헤더 */
.cv-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.cv-head-main h2 {
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 3px;
}
.cv-head-main p {
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0;
}
.cv-x {
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
.cv-x:hover { background: var(--ink-50); color: var(--ink-900); }

/* 본문 */
.cv-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 22px;
  background: var(--paper, var(--ink-50));
}
.cv-doc {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 32px 36px;
}
.cv-doc-title {
  text-align: center;
  font-size: var(--fz-lg);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 6px;
}
.cv-doc-sub {
  text-align: center;
  font-size: var(--fz-xs);
  color: var(--ink-400);
  margin: 0;
}
.cv-rule {
  height: 1px;
  background: var(--line);
  margin: 20px 0;
}

.cv-article + .cv-article { margin-top: 18px; }
.cv-article h4 {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin: 0 0 6px;
}
.cv-article p {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.7;
  margin: 0;
}

/* 서명란 */
.cv-signs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.cv-sign {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 18px 14px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
.cv-sign-role {
  font-size: var(--fz-sm);
  font-weight: 700;
  color: var(--ink-700);
}
.cv-sign-name {
  font-size: var(--fz-xs);
  color: var(--ink-500);
}
.cv-sign-state {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-400);
  margin-top: 2px;
}
.cv-sign-state.done { color: var(--info); }

/* 푸터 */
.cv-foot {
  display: flex;
  justify-content: flex-end;
  padding: 14px 22px;
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
</style>
