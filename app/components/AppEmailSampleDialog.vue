<script setup lang="ts">
export interface EmailSample {
  id: string
  name: string
  subject: string
  body: string
  purpose: 'info' | 'auth' | 'ad'
}

withDefaults(defineProps<{ open: boolean, title?: string }>(), { title: '샘플 템플릿 선택' })
const emit = defineEmits<{ close: [], pick: [tpl: EmailSample] }>()

const FROM = 'no-reply@wecandeo.com'
const PURPOSE_LABEL = { info: '일반용', auth: '인증용', ad: '광고용' } as const

const SAMPLES: EmailSample[] = [
  { id: 'e1', name: '회원가입 환영 메일', subject: '[위캔디오] 가입을 환영합니다.', body: '#{name}님, 가입을 환영합니다.\n쏠쏠과 함께 즐거운 활동을 시작해 보세요.', purpose: 'info' },
  { id: 'e2', name: '결제 완료 안내 메일', subject: '[결제 완료] 결제 영수증 안내', body: '#{name}님, 결제가 정상적으로 완료되었습니다.\n주문번호: #{orderNo}', purpose: 'info' },
  { id: 'e3', name: '비밀번호 인증 메일', subject: '[인증] 본인 인증 메일', body: '아래 인증 코드를 입력해 주세요.\n인증 코드: #{code}\n유효 시간: 3분', purpose: 'auth' },
  { id: 'e4', name: '이벤트 안내 메일', subject: '[이벤트] 신규 이벤트 안내', body: '#{name}님, 새로운 이벤트를 안내드립니다.\n지금 바로 확인해 보세요!', purpose: 'ad' },
]

const search = ref('')
const picked = ref<EmailSample | null>(null)
const filtered = computed(() => SAMPLES.filter(s => !search.value || s.name.includes(search.value)))

function confirm() {
  if (picked.value) {
    emit('pick', picked.value)
    emit('close')
  }
}
</script>

<template>
  <AppModal :open="open" :title="title" :width="820" @close="emit('close')">
    <div class="es-grid">
      <div>
        <div class="es-search">
          <input v-model="search" class="input" placeholder="샘플 템플릿명을 입력하세요.">
          <UIcon name="i-lucide-search" class="text-sm es-search-icon" />
        </div>
        <div class="es-cards">
          <button
            v-for="s in filtered"
            :key="s.id"
            type="button"
            class="es-card"
            :class="{ on: picked?.id === s.id }"
            @click="picked = s"
          >
            <div class="es-card-name">
              {{ s.name }}
            </div>
            <div class="es-card-subject">
              {{ s.subject }}
            </div>
            <div class="es-card-tag">
              {{ PURPOSE_LABEL[s.purpose] }}
            </div>
          </button>
          <div v-if="!filtered.length" class="es-empty">
            검색 결과가 없습니다.
          </div>
        </div>
      </div>

      <div class="es-preview">
        <AppEmailPreview
          v-if="picked"
          :subject="picked.subject"
          :from="FROM"
          :heading="picked.subject"
          :body="picked.body"
        />
        <div v-else class="es-preview-empty">
          템플릿을 선택하면 미리보기가 표시됩니다.
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" :disabled="!picked" @click="confirm">
        선택
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.es-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
}
@media (max-width: 720px) {
  .es-grid { grid-template-columns: 1fr; }
}

.es-search {
  position: relative;
  margin-bottom: 12px;
}
.es-search .input {
  width: 100%;
  padding-right: 34px;
}
.es-search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-400);
  pointer-events: none;
}

.es-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-height: 360px;
  overflow: auto;
}
@media (max-width: 560px) {
  .es-cards { grid-template-columns: 1fr; }
}
.es-card {
  position: relative;
  text-align: left;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  padding: 13px 14px 28px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.es-card:hover {
  border-color: var(--ink-200);
}
.es-card.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.es-card-name {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 6px;
}
.es-card-subject {
  font-size: var(--fz-sm);
  color: var(--ink-600);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.es-card-tag {
  position: absolute;
  right: 12px;
  bottom: 9px;
  font-size: var(--fz-xs);
  font-weight: 600;
  color: var(--accent-ink);
}
.es-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 36px 0;
  font-size: var(--fz-sm);
  color: var(--ink-500);
}

.es-preview-empty {
  display: grid;
  place-items: center;
  min-height: 420px;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  font-size: var(--fz-sm);
  color: var(--ink-400);
  text-align: center;
  padding: 0 16px;
}
</style>
