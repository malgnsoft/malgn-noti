<script setup lang="ts">
useHead({ title: '문의하기' })
const router = useRouter()
const toast = useToast()

const TYPE_OPTIONS = [
  { value: 'product', label: '메시지 상품' },
  { value: 'payment', label: '결제(구매 및 환불)' },
  { value: 'partner', label: '제휴 문의' },
  { value: 'etc', label: '기타' },
]
const PRODUCTS = [
  { value: 'all', label: '상품전반' },
  { value: 'sms', label: '문자메시지' },
  { value: 'rcs', label: 'RCS' },
  { value: 'kakao', label: '카카오톡' },
  { value: 'email', label: '이메일' },
]
const CONTENT_PLACEHOLDER = '우리 서비스의 기능이나 이용 방법에 대해 궁금한 점이 생기셨나요? 사소한 질문이라도 정성껏 답변해 드릴게요!\n\n• 서비스가 있을 경우 URL 주소를 적어주세요.\n• 어떤 메시지 기능이 궁금하신가요?\n• 궁금한 내용을 자유롭게 남겨주세요.\n• 자세히 작성해 주실수록 빠르고 정확한 답변이 가능합니다.'

const inquiryType = ref('product')
const productType = ref('all')
const title = ref('')
const content = ref('')
const files = ref<{ name: string }[]>([])

const fileInput = ref<HTMLInputElement | null>(null)
function onPickFiles(e: Event) {
  const input = e.target as HTMLInputElement
  const picked = Array.from(input.files || [])
  input.value = ''
  for (const f of picked) {
    if (files.value.length >= 5) {
      toast.add({ title: '첨부파일은 최대 5개까지 가능합니다.', color: 'warning', icon: 'i-lucide-triangle-alert' })
      break
    }
    if (f.size > 10_000_000) {
      toast.add({ title: `${f.name}: 파일당 10MB 이하여야 합니다.`, color: 'error', icon: 'i-lucide-octagon-alert' })
      continue
    }
    files.value = [...files.value, { name: f.name }]
  }
}
function removeFile(i: number) {
  files.value = files.value.filter((_, j) => j !== i)
}

function onSubmit() {
  if (!title.value.trim()) {
    toast.add({ title: '문의 제목을 입력해 주세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (!content.value.trim()) {
    toast.add({ title: '문의 내용을 입력해 주세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  router.push('/account/inquiry/complete')
}
</script>

<template>
  <AppMyPageShell active-path="/account/inquiries">
    <div class="iq-panel">
      <div class="ms-head">
        <h3>문의하기</h3>
      </div>
      <p class="iq-desc">
        궁금하신 사항이나 도움이 필요하신 경우 문의해 주세요. 빠르고 정확하게 답변 드리겠습니다.
      </p>

      <!-- 문의 유형 -->
      <section class="iq-sec">
        <div class="iq-label">
          문의 유형 <span class="iq-req">*</span>
        </div>
        <AppRadioGroup v-model="inquiryType" :options="TYPE_OPTIONS" />
        <div v-if="inquiryType === 'product'" class="iq-subpanel">
          <div class="iq-sub-label">
            상품 유형을 선택해 주세요
          </div>
          <div class="iq-prod-row">
            <button
              v-for="p in PRODUCTS"
              :key="p.value"
              type="button"
              class="iq-prod-btn"
              :class="{ on: productType === p.value }"
              @click="productType = p.value"
            >
              {{ p.label }}
            </button>
          </div>
        </div>
      </section>

      <hr class="iq-div">

      <!-- 제목 -->
      <section class="iq-sec">
        <div class="iq-label">
          제목 <span class="iq-req">*</span>
        </div>
        <input v-model="title" class="input" placeholder="문의 제목을 입력해 주세요">
      </section>

      <hr class="iq-div">

      <!-- 내용 -->
      <section class="iq-sec">
        <div class="iq-label">
          내용 <span class="iq-req">*</span>
        </div>
        <div class="iq-editor">
          <div class="iq-editor-toolbar">
            <button v-for="b in ['bold', 'italic', 'underline']" :key="b" type="button" class="iq-tb-btn">
              <UIcon :name="`i-lucide-${b}`" class="text-sm" />
            </button>
            <span class="iq-tb-div" />
            <button v-for="b in ['align-left', 'align-center', 'align-right', 'list']" :key="b" type="button" class="iq-tb-btn">
              <UIcon :name="`i-lucide-${b}`" class="text-sm" />
            </button>
            <span class="iq-tb-div" />
            <button v-for="b in ['link', 'image', 'video', 'plus']" :key="b" type="button" class="iq-tb-btn">
              <UIcon :name="`i-lucide-${b}`" class="text-sm" />
            </button>
          </div>
          <textarea
            v-model="content"
            class="iq-editor-area"
            rows="12"
            :placeholder="CONTENT_PLACEHOLDER"
          />
        </div>
      </section>

      <hr class="iq-div">

      <!-- 첨부파일 -->
      <section class="iq-sec">
        <div class="iq-label">
          첨부파일 <span class="iq-optional">(선택)</span>
        </div>
        <div class="iq-file-row">
          <input ref="fileInput" type="file" multiple style="display: none" @change="onPickFiles">
          <button type="button" class="btn btn-soft btn-sm" @click="fileInput?.click()">
            파일선택
          </button>
          <span class="iq-file-hint">최대 5개, 파일당 10MB 이하 (이미지, PDF, 문서, 압축파일)</span>
        </div>
        <div v-if="files.length" class="iq-file-list">
          <div v-for="(f, i) in files" :key="i" class="file-chip">
            <UIcon name="i-lucide-paperclip" class="text-[length:var(--fz-xs)]" />
            {{ f.name }}
            <span class="remove" @click="removeFile(i)">
              <UIcon name="i-lucide-x" class="text-[length:var(--fz-xs)]" />
            </span>
          </div>
        </div>
      </section>

      <div class="ms-actions">
        <button type="button" class="btn btn-neutral" @click="router.push('/account/inquiries')">
          취소
        </button>
        <button type="button" class="btn btn-primary btn-lg" @click="onSubmit">
          <UIcon name="i-lucide-message-circle" class="text-[length:var(--fz-lg)]" />
          문의하기
        </button>
      </div>
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
.iq-desc {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  line-height: 1.6;
  margin: 0 0 4px;
}
.iq-sec {
  padding: 16px 0;
}
.ms-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}
.iq-label {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  margin-bottom: 12px;
}
.iq-req {
  color: var(--danger-ink, #be123c);
}
.iq-optional {
  font-size: var(--fz-sm);
  font-weight: 400;
  color: var(--ink-400);
}
.iq-div {
  border: 0;
  border-top: 1px solid var(--line);
  margin: 0;
}
.iq-subpanel {
  margin-top: 14px;
  padding: 14px 16px;
  background: var(--ink-50);
  border-radius: var(--r-md);
}
.iq-sub-label {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 10px;
}
.iq-prod-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.iq-prod-btn {
  height: 32px;
  padding: 0 16px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--white);
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--ink-600);
  cursor: pointer;
}
.iq-prod-btn:hover {
  border-color: var(--ink-300);
}
.iq-prod-btn.on {
  background: var(--ink-900);
  border-color: var(--ink-900);
  color: var(--white);
}

/* 에디터 */
.iq-editor {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
}
.iq-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  padding: 6px 8px;
  background: var(--ink-50);
  border-bottom: 1px solid var(--line);
}
.iq-tb-btn {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: var(--r-sm);
  background: none;
  color: var(--ink-600);
  cursor: pointer;
}
.iq-tb-btn:hover {
  background: var(--ink-100);
  color: var(--ink-900);
}
.iq-tb-div {
  width: 1px;
  height: 16px;
  background: var(--line);
  margin: 0 4px;
}
.iq-editor-area {
  display: block;
  width: 100%;
  border: 0;
  padding: 14px 16px;
  font-size: var(--fz-md);
  font-family: var(--font-sans);
  color: var(--ink-800);
  line-height: 1.7;
  resize: vertical;
  outline: none;
  background: var(--white);
}

/* 첨부파일 */
.iq-file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.iq-file-hint {
  font-size: var(--fz-sm);
  color: var(--ink-400);
}
.iq-file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
</style>
