<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '새 비밀번호 설정' })

const password = ref('')
const confirm = ref('')
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-1">새 비밀번호 설정</h2>
    <p class="text-sm text-neutral-500 mb-6">
      안전한 새 비밀번호를 입력하세요.
    </p>

    <form class="space-y-4" @submit.prevent>
      <UFormField label="새 비밀번호" required>
        <UInput v-model="password" type="password" />
      </UFormField>
      <UFormField label="새 비밀번호 확인" required>
        <UInput v-model="confirm" type="password" />
      </UFormField>
      <UButton type="submit" block class="!mt-6">
        변경
      </UButton>
    </form>
  </div>
</template>
