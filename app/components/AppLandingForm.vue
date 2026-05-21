<script setup lang="ts">
export interface LandingDraft {
  id?: string
  type: 'basic' | 'extended'
  public: boolean
  name: string
  desc: string
}

const props = withDefaults(defineProps<{
  type: 'basic' | 'extended'
  edit?: { id: string, name: string, published: boolean } | null
}>(), { edit: null })
const emit = defineEmits<{ back: [], save: [LandingDraft] }>()
const toast = useToast()

const isExt = computed(() => props.type === 'extended')
const isEdit = computed(() => !!props.edit)
const headlineMax = computed(() => (isExt.value ? 60 : 200))

const form = reactive({
  public: props.edit ? props.edit.published : true,
  name: props.edit ? props.edit.name : '',
  desc: '',
  headImage: '' as string,
  headline: '',
  subtitle: '',
  textAlign: 'left' as 'left' | 'center',
  visualImage: '' as string,
  content: '',
  ctaText: '',
  ctaLinkType: 'custom' as 'main' | 'custom',
  ctaUrl: '',
  ctaBgColor: '#00A3FF',
  ctaTextColor: '#FFFFFF',
})

// 랜딩페이지 URL — 생성 시 1회 발급(목업)
const url = `https://lp.malgn.so/p/${Math.random().toString(36).slice(2, 10)}`

const headImgInput = ref<HTMLInputElement | null>(null)
const visualImgInput = ref<HTMLInputElement | null>(null)
function onPickFile(e: Event, target: 'head' | 'visual') {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (target === 'head') form.headImage = f.name
  else form.visualImage = f.name
}

const openUrl = ref(false)
async function onCopyUrl() {
  try {
    await navigator.clipboard.writeText(url)
  }
  catch {
    // 클립보드 권한이 없으면 모달에서 다시 복사할 수 있음
  }
  openUrl.value = true
}

const openPreview = ref(false)
function onPreview() {
  openPreview.value = true
}
function onSave() {
  if (!form.name.trim()) {
    toast.add({ title: '랜딩페이지명을 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (!form.headline.trim()) {
    toast.add({ title: '메인 헤드라인을 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (!form.content.trim()) {
    toast.add({ title: '본문 내용을 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  if (isExt.value && !form.ctaText.trim()) {
    toast.add({ title: 'CTA 버튼 텍스트를 입력하세요.', color: 'error', icon: 'i-lucide-octagon-alert' })
    return
  }
  emit('save', {
    ...(props.edit ? { id: props.edit.id } : {}),
    type: props.type,
    public: form.public,
    name: form.name.trim(),
    desc: form.desc.trim(),
  })
}
</script>

<template>
  <div class="lf">
    <div class="lf-head">
      <button type="button" class="lf-back" aria-label="목록으로" @click="emit('back')">
        <UIcon name="i-lucide-chevron-left" class="text-lg" />
      </button>
      <h1 class="lf-title">
        랜딩페이지 {{ isEdit ? '수정' : '생성' }} ({{ isExt ? '확장형' : '기본형' }})
      </h1>
    </div>

    <div class="lf-body">
      <!-- 기본 정보 -->
      <div class="lf-card">
        <AppFormRow label="공개 여부">
          <label class="lf-toggle">
            <input v-model="form.public" type="checkbox">
            <span class="lf-toggle-track"><span class="lf-toggle-thumb" /></span>
            <span class="lf-toggle-label">{{ form.public ? '공개' : '비공개' }}</span>
          </label>
        </AppFormRow>
        <AppFormRow label="랜딩페이지명" required>
          <input v-model="form.name" class="input" placeholder="랜딩페이지명을 입력하세요.">
        </AppFormRow>
        <AppFormRow label="설명">
          <div style="position: relative">
            <textarea
              v-model="form.desc"
              class="textarea"
              rows="4"
              maxlength="200"
              style="padding-bottom: 24px"
            />
            <span class="lf-counter">{{ form.desc.length }}자 / 200자</span>
          </div>
        </AppFormRow>
        <AppFormRow label="랜딩페이지 URL 복사">
          <button type="button" class="lf-url" @click="onCopyUrl">
            <span>{{ url }}</span>
            <UIcon name="i-lucide-copy" class="text-sm" />
          </button>
        </AppFormRow>
      </div>

      <!-- 메인 타이틀 -->
      <div class="lf-card">
        <div class="lf-card-title">
          메인 타이틀
        </div>
        <AppFormRow label="헤드 이미지 등록">
          <button type="button" class="lf-upload" @click="headImgInput?.click()">
            <UIcon name="i-lucide-cloud-upload" class="lf-upload-ico" />
            <div v-if="form.headImage" class="lf-upload-file">
              {{ form.headImage }}
            </div>
            <template v-else>
              <div class="lf-upload-main">
                파일을 마우스로 드래그하여 추가해 주세요.
              </div>
              <div class="lf-upload-sub">
                권장사이즈 : 1200 × 400px 이상
              </div>
            </template>
            <input ref="headImgInput" type="file" accept="image/*" style="display: none" @change="onPickFile($event, 'head')">
          </button>
          <div class="lf-hint">
            모바일에서 이미지가 자동으로 리사이즈됩니다.
          </div>
        </AppFormRow>
        <AppFormRow label="메인 헤드라인" required>
          <div style="position: relative">
            <textarea
              v-model="form.headline"
              class="textarea"
              rows="3"
              :maxlength="headlineMax"
              placeholder="메인 헤드라인을 입력하세요."
              style="padding-bottom: 24px"
            />
            <span class="lf-counter">{{ form.headline.length }}자 / {{ headlineMax }}자</span>
          </div>
        </AppFormRow>
        <AppFormRow label="서브 타이틀">
          <input v-model="form.subtitle" class="input" placeholder="서브 타이틀을 입력하세요.">
        </AppFormRow>
        <AppFormRow v-if="isExt" label="텍스트 정렬">
          <AppRadioGroup
            v-model="form.textAlign"
            :options="[
              { value: 'left', label: '좌측 정렬' },
              { value: 'center', label: '중앙 정렬' },
            ]"
          />
        </AppFormRow>
      </div>

      <!-- 비주얼 이미지 (확장형) -->
      <div v-if="isExt" class="lf-card">
        <div class="lf-card-title">
          비주얼 이미지
        </div>
        <AppFormRow label="이미지 등록">
          <button type="button" class="lf-upload" @click="visualImgInput?.click()">
            <UIcon name="i-lucide-cloud-upload" class="lf-upload-ico" />
            <div v-if="form.visualImage" class="lf-upload-file">
              {{ form.visualImage }}
            </div>
            <template v-else>
              <div class="lf-upload-main">
                파일을 마우스로 드래그하여 추가해 주세요.
              </div>
              <div class="lf-upload-sub">
                권장사이즈 : 1200 × 1200px 이상
              </div>
            </template>
            <input ref="visualImgInput" type="file" accept="image/*" style="display: none" @change="onPickFile($event, 'visual')">
          </button>
          <div class="lf-hint">
            모바일에서 이미지가 자동으로 리사이즈됩니다.
          </div>
        </AppFormRow>
      </div>

      <!-- 콘텐츠 영역 -->
      <div class="lf-card">
        <div class="lf-card-title">
          콘텐츠 영역
        </div>
        <AppFormRow label="본문 내용" required>
          <div class="lf-editor">
            <div class="lf-editor-toolbar">
              <select class="lf-tb-select">
                <option>본문</option>
                <option>제목 1</option>
                <option>제목 2</option>
              </select>
              <span class="lf-tb-div" />
              <button v-for="b in ['bold', 'italic', 'underline', 'strikethrough']" :key="b" type="button" class="lf-tb-btn">
                <UIcon :name="`i-lucide-${b}`" class="text-sm" />
              </button>
              <span class="lf-tb-div" />
              <button v-for="b in ['list', 'list-ordered']" :key="b" type="button" class="lf-tb-btn">
                <UIcon :name="`i-lucide-${b}`" class="text-sm" />
              </button>
              <span class="lf-tb-div" />
              <button v-for="b in ['link', 'image']" :key="b" type="button" class="lf-tb-btn">
                <UIcon :name="`i-lucide-${b}`" class="text-sm" />
              </button>
              <span class="lf-tb-div" />
              <button type="button" class="lf-tb-btn lf-tb-tx">
                Tx
              </button>
            </div>
            <textarea
              v-model="form.content"
              class="lf-editor-area"
              rows="10"
              placeholder="본문 내용을 입력하세요. 유튜브 구독자를 위한 상세 소개 글을 작성해보세요."
            />
          </div>
          <div class="lf-hint" style="text-align: right">
            0MB 사용중 / 50MB
          </div>
        </AppFormRow>
      </div>

      <!-- CTA 버튼 (확장형) -->
      <div v-if="isExt" class="lf-card">
        <div class="lf-card-title">
          CTA 버튼
        </div>
        <AppFormRow label="버튼 텍스트" required>
          <input v-model="form.ctaText" class="input" placeholder="버튼명을 입력하세요">
        </AppFormRow>
        <AppFormRow label="버튼 클릭 시 이동 링크" required>
          <AppRadioGroup
            v-model="form.ctaLinkType"
            :options="[
              { value: 'main', label: '메인페이지' },
              { value: 'custom', label: '특정페이지' },
            ]"
          />
          <input
            v-if="form.ctaLinkType === 'custom'"
            v-model="form.ctaUrl"
            class="input"
            placeholder="https://"
            style="margin-top: 8px"
          >
        </AppFormRow>
        <AppFormRow label="버튼 색상">
          <div class="lf-color-grid">
            <span class="lf-color-label">배경색</span>
            <div class="lf-color">
              <input v-model="form.ctaBgColor" type="color" class="lf-color-swatch">
              <input v-model="form.ctaBgColor" class="input lf-color-hex">
            </div>
            <span class="lf-color-label">텍스트 색상</span>
            <div class="lf-color">
              <input v-model="form.ctaTextColor" type="color" class="lf-color-swatch">
              <input v-model="form.ctaTextColor" class="input lf-color-hex">
            </div>
          </div>
        </AppFormRow>
      </div>
    </div>

    <div class="send-actions">
      <button type="button" class="btn btn-neutral" @click="onPreview">
        <UIcon name="i-lucide-eye" class="text-[length:var(--fz-lg)]" />
        미리보기
      </button>
      <button type="button" class="btn btn-primary btn-lg" @click="onSave">
        <UIcon name="i-lucide-check" class="text-[length:var(--fz-lg)]" />
        저장
      </button>
    </div>

    <AppLandingPreviewDialog
      :open="openPreview"
      :type="type"
      @close="openPreview = false"
    />
    <AppLandingUrlDialog
      :open="openUrl"
      :url="url"
      @close="openUrl = false"
    />
  </div>
</template>

<style scoped>
.lf-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--line);
}
.lf-back {
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--r-md);
  border: 0;
  background: none;
  color: var(--ink-600);
  cursor: pointer;
}
.lf-back:hover {
  background: var(--ink-50);
  color: var(--ink-900);
}
.lf-title {
  font-size: var(--fz-xl, 18px);
  font-weight: 700;
  color: var(--ink-900);
}
.lf-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.lf-card {
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--white);
  padding: 8px 20px;
}
.lf-card-title {
  font-size: var(--fz-md);
  font-weight: 700;
  color: var(--ink-900);
  padding: 12px 0;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--line);
}
.lf-counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: var(--fz-2xs);
  color: var(--ink-400);
  font-family: var(--font-mono);
  pointer-events: none;
}
.lf-hint {
  margin-top: 6px;
  font-size: var(--fz-2xs);
  color: var(--ink-400);
}

/* 토글 */
.lf-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.lf-toggle input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.lf-toggle-track {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--ink-200);
  transition: background 0.15s;
  position: relative;
  flex-shrink: 0;
}
.lf-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--white);
  transition: transform 0.15s;
}
.lf-toggle input:checked + .lf-toggle-track {
  background: #00a3ff;
}
.lf-toggle input:checked + .lf-toggle-track .lf-toggle-thumb {
  transform: translateX(16px);
}
.lf-toggle-label {
  font-size: var(--fz-md);
  color: var(--ink-700);
}

/* URL 복사 */
.lf-url {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 0 12px;
  height: 36px;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--ink-50);
  color: var(--ink-600);
  font-size: var(--fz-md);
  font-family: var(--font-mono);
  cursor: pointer;
}
.lf-url:hover {
  border-color: var(--ink-300);
  color: var(--ink-900);
}

/* 업로드 박스 */
.lf-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 120px;
  padding: 20px;
  border: 1px dashed var(--ink-300);
  border-radius: var(--r-md);
  background: var(--ink-50);
  cursor: pointer;
}
.lf-upload:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.lf-upload-ico {
  font-size: 22px;
  color: var(--ink-400);
  margin-bottom: 4px;
}
.lf-upload-main {
  font-size: var(--fz-sm);
  color: var(--ink-600);
}
.lf-upload-sub {
  font-size: var(--fz-2xs);
  color: var(--ink-400);
}
.lf-upload-file {
  font-size: var(--fz-sm);
  font-weight: 600;
  color: var(--accent-ink);
}

/* 에디터 */
.lf-editor {
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
}
.lf-editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-wrap: wrap;
  padding: 6px 8px;
  background: var(--ink-50);
  border-bottom: 1px solid var(--line);
}
.lf-tb-select {
  height: 26px;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--white);
  font-size: var(--fz-2xs);
  padding: 0 4px;
}
.lf-tb-btn {
  display: inline-grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 0;
  border-radius: var(--r-sm);
  background: none;
  color: var(--ink-600);
  cursor: pointer;
}
.lf-tb-btn:hover {
  background: var(--ink-100);
  color: var(--ink-900);
}
.lf-tb-tx {
  font-size: var(--fz-sm);
  font-weight: 600;
}
.lf-tb-div {
  width: 1px;
  height: 16px;
  background: var(--line);
  margin: 0 4px;
}
.lf-editor-area {
  display: block;
  width: 100%;
  border: 0;
  padding: 12px 14px;
  font-size: var(--fz-md);
  font-family: var(--font-sans);
  color: var(--ink-800);
  resize: vertical;
  outline: none;
  background: var(--white);
}

/* 색상 */
.lf-color-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 12px;
  align-items: center;
  max-width: 320px;
}
.lf-color-label {
  font-size: var(--fz-sm);
  color: var(--ink-600);
}
.lf-color {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lf-color-swatch {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: none;
  cursor: pointer;
}
.lf-color-hex {
  width: 130px;
  font-family: var(--font-mono);
  text-transform: uppercase;
}

</style>
