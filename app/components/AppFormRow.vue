<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  required?: boolean
  help?: string
  align?: string
}>(), { align: 'start' })
</script>

<template>
  <div class="form-row" :style="{ alignItems: align }">
    <label>
      {{ label }}<span v-if="required" class="required"> *</span>
    </label>
    <div class="field">
      <slot />
      <div v-if="help" class="help">
        {{ help }}
      </div>
    </div>
  </div>
</template>
