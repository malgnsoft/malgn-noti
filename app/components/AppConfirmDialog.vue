<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success'
  loading?: boolean
}>(), {
  confirmLabel: '확인',
  cancelLabel: '취소',
  confirmColor: 'primary',
  loading: false
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function onCancel() {
  open.value = false
  emit('cancel')
}

function onConfirm() {
  emit('confirm')
}
</script>

<template>
  <UModal v-model:open="open" :title="props.title" :description="props.description">
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="soft" :disabled="loading" @click="onCancel">
          {{ cancelLabel }}
        </UButton>
        <UButton :color="confirmColor" :loading="loading" @click="onConfirm">
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
