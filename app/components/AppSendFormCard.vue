<script setup lang="ts">
defineProps<{
  step?: number | string
  title: string
  required?: boolean
  hint?: string
  locked?: boolean
  lockedHint?: string
}>()
</script>

<template>
  <div class="card">
    <div class="card-header">
      <div v-if="step != null" :class="['step', locked ? '' : 'active']">
        {{ String(step).padStart(2, '0') }}
      </div>
      <div class="title">
        {{ title }}<span v-if="required" class="required"> *</span>
      </div>
      <span v-if="hint" class="hint">{{ hint }}</span>
      <div v-if="$slots.headerRight" style="margin-left: auto">
        <slot name="headerRight" />
      </div>
    </div>
    <div v-if="locked" class="card-body">
      <div class="disclosure-hint">
        <span class="icn"><UIcon name="i-lucide-lock" class="text-lg" /></span>
        {{ lockedHint || '이전 단계를 먼저 완료해 주세요.' }}
      </div>
    </div>
    <div v-else class="card-body">
      <slot />
    </div>
  </div>
</template>
