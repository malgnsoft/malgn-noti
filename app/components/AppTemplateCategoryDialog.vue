<script setup lang="ts">
const props = defineProps<{
  open: boolean
  mode: 'add' | 'edit'
  parentName?: string
  currentName?: string
}>()
const emit = defineEmits<{ close: [], submit: [name: string] }>()
const toast = useToast()

const name = ref('')
watch(() => props.open, (v) => {
  if (v) name.value = props.mode === 'edit' ? (props.currentName ?? '') : ''
})

const title = computed(() => props.mode === 'add' ? '카테고리 등록' : '카테고리 수정')

function onSubmit() {
  const n = name.value.trim()
  if (!n) {
    toast.add({ title: '카테고리 이름을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('submit', n)
  emit('close')
}
</script>

<template>
  <AppModal :open="open" :title="title" :width="440" @close="emit('close')">
    <div v-if="mode === 'add'" class="cat-row">
      <span class="cat-label">상위 카테고리</span>
      <span class="cat-value">{{ parentName || 'Root Category' }}</span>
    </div>
    <div class="cat-row">
      <span class="cat-label">카테고리 이름</span>
      <div class="cat-input">
        <input
          v-model="name"
          class="input"
          maxlength="50"
          placeholder="카테고리 이름을 입력하세요."
          @keyup.enter="onSubmit"
        >
        <span class="cat-count">{{ name.length }}/50</span>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onSubmit">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.cat-row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 12px;
  align-items: center;
}
.cat-row + .cat-row {
  margin-top: 14px;
}
.cat-label {
  font-size: var(--fz-sm);
  font-weight: 500;
  color: var(--ink-600);
}
.cat-value {
  font-size: var(--fz-md);
  color: var(--ink-900);
}
.cat-input {
  position: relative;
}
.cat-input .input {
  width: 100%;
  padding-right: 52px;
}
.cat-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
</style>
