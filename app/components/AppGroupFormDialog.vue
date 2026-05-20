<script setup lang="ts">
interface GroupEditData { name?: string }
const props = defineProps<{ open: boolean, edit?: GroupEditData | null }>()
const emit = defineEmits<{ close: [], submit: [string] }>()

const toast = useToast()
const isEdit = computed(() => !!props.edit)
const name = ref('')

function onConfirm() {
  const v = name.value.trim()
  if (!v) {
    toast.add({ title: '그룹 이름을 입력하세요.', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('submit', v)
  toast.add({
    title: isEdit.value ? '그룹 수정' : '그룹 등록',
    description: isEdit.value ? `'${v}' 그룹으로 수정했습니다.` : `'${v}' 그룹을 등록했습니다.`,
    icon: 'i-lucide-circle-check',
  })
  emit('close')
}

watch(() => props.open, (v) => {
  if (v) name.value = props.edit?.name ?? ''
})
</script>

<template>
  <AppModal :open="open" :title="isEdit ? '그룹 수정' : '그룹 등록'" :width="420" @close="emit('close')">
    <p class="gf-sub">
      {{ isEdit ? '그룹 정보를 수정합니다.' : '새 연락처 그룹을 만듭니다.' }}
    </p>
    <div class="gf-divider" />
    <div class="gf-row">
      <label class="gf-label">그룹 이름 <span class="gf-req">*</span></label>
      <div class="gf-input-wrap">
        <input
          v-model="name"
          class="input"
          maxlength="40"
          placeholder="그룹 이름"
          @keyup.enter="onConfirm"
        >
        <span class="gf-count">{{ name.length }}/40</span>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn btn-outline-dark" @click="emit('close')">
        취소
      </button>
      <button type="button" class="btn btn-primary" @click="onConfirm">
        확인
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.gf-sub {
  font-size: var(--fz-sm);
  color: var(--ink-500);
  margin-bottom: 14px;
}
.gf-divider {
  height: 1px;
  background: var(--line);
  margin: 0 0 18px;
}
.gf-row {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  align-items: center;
}
.gf-label {
  font-size: var(--fz-md);
  font-weight: 500;
  color: var(--ink-600);
}
.gf-req {
  color: var(--danger);
}
.gf-input-wrap {
  position: relative;
}
.gf-input-wrap .input {
  width: 100%;
  padding-right: 48px;
}
.gf-count {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: var(--fz-xs);
  color: var(--ink-400);
}
</style>
