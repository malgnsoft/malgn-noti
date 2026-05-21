<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '새 비밀번호 설정' })

const password = ref('')
const confirm = ref('')

const pwError = computed(() => {
  if (!password.value) return undefined
  if (password.value.length < 8) return '비밀번호는 8자 이상이어야 합니다.'
  return undefined
})
const confirmError = computed(() => {
  if (!confirm.value) return undefined
  if (confirm.value !== password.value) return '비밀번호가 일치하지 않습니다.'
  return undefined
})
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-1">새 비밀번호 설정</h2>
    <p class="text-sm text-neutral-500 mb-6">
      안전한 새 비밀번호를 입력하세요.
    </p>

    <form class="space-y-4" @submit.prevent>
      <UFormField
        label="새 비밀번호"
        required
        :error="pwError"
        help="영문·숫자·특수문자 조합 8자 이상"
      >
        <UInput
          v-model="password"
          type="password"
          placeholder="새 비밀번호를 입력해 주세요."
          class="w-full"
        />
      </UFormField>
      <UFormField
        label="새 비밀번호 확인"
        required
        :error="confirmError"
      >
        <UInput
          v-model="confirm"
          type="password"
          placeholder="비밀번호를 다시 입력해 주세요."
          class="w-full"
        />
      </UFormField>
      <UButton type="submit" block class="!mt-6">
        변경
      </UButton>
    </form>
  </div>
</template>
