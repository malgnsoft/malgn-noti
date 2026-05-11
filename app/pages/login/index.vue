<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '로그인' })

const email = ref('')
const password = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  try {
    await navigateTo('/login/security')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-1">로그인</h2>
    <p class="text-sm text-neutral-500 mb-6">맑은 메시징 계정으로 로그인하세요.</p>

    <form class="space-y-4" @submit.prevent="onSubmit">
      <UFormField label="이메일" required>
        <UInput v-model="email" type="email" placeholder="name@malgn.example" autocomplete="email" />
      </UFormField>
      <UFormField label="비밀번호" required>
        <UInput v-model="password" type="password" autocomplete="current-password" />
      </UFormField>
      <UButton type="submit" block :loading="loading" class="!mt-6">
        로그인
      </UButton>
    </form>

    <div class="flex items-center justify-between mt-4 text-xs">
      <NuxtLink to="/reset-password" class="text-neutral-500 hover:text-primary-500">
        비밀번호 찾기
      </NuxtLink>
      <NuxtLink to="/signup" class="text-neutral-500 hover:text-primary-500">
        회원가입
      </NuxtLink>
    </div>
  </div>
</template>
