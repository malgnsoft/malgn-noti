<script setup lang="ts">
defineProps<{
  canEdit?: boolean
  canDelete?: boolean
}>()

defineEmits<{
  directInput: []
  fromAddressBook: []
  editSelected: []
  deleteSelected: []
}>()
</script>

<template>
  <div class="app-recipient-actions">
    <button type="button" class="btn-dark" @click="$emit('directInput')">
      + 직접입력
    </button>
    <button type="button" class="btn-dark" @click="$emit('fromAddressBook')">
      + 주소록에서 선택
    </button>
    <button
      type="button"
      class="btn-edit"
      :disabled="!canEdit"
      @click="$emit('editSelected')"
    >
      수신자 정보 수정
    </button>
    <button
      type="button"
      class="btn-delete"
      :disabled="!canDelete"
      @click="$emit('deleteSelected')"
    >
      수신자 정보 삭제
    </button>
  </div>
</template>

<style scoped>
.app-recipient-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-dark,
.btn-edit,
.btn-delete {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 0;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}
.btn-dark {
  background: var(--gray-900);
  color: white;
}
.btn-dark:hover {
  background: var(--gray-800);
}
.btn-edit {
  background: #f4d4d4;
  color: var(--gray-500);
}
.btn-edit:not(:disabled) {
  background: var(--color-sky-vivid);
  color: white;
}
.btn-edit:disabled {
  cursor: not-allowed;
}
.btn-delete {
  background: #f9b8b8;
  color: white;
}
.btn-delete:not(:disabled):hover {
  background: #ef4444;
}
.btn-delete:disabled {
  cursor: not-allowed;
}
</style>
