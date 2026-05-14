<script setup lang="ts">
export interface SenderOption {
  value: string
  label: string
}

withDefaults(defineProps<{
  items: SenderOption[]
  placeholder?: string
  disabled?: boolean
  searchPlaceholder?: string
}>(), {
  placeholder: '선택해 주세요',
  searchPlaceholder: '검색',
})

const value = defineModel<string>('value', { default: '' })
</script>

<template>
  <USelectMenu
    v-model="value"
    :items="items"
    :placeholder="placeholder"
    :disabled="disabled"
    :search-input="{ placeholder: searchPlaceholder, icon: 'i-lucide-search' }"
    value-key="value"
    label-key="label"
    class="w-full"
  />
</template>
