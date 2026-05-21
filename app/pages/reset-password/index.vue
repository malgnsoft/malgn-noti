<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '비밀번호 재설정' })

const email = ref('')
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-1">비밀번호 재설정</h2>
    <p class="text-sm text-neutral-500 mb-6">
      가입 시 등록한 이메일로 재설정 링크를 보내드립니다.
    </p>

    <form class="space-y-4" @submit.prevent>
      <UFormField label="이메일" required>
        <UInput v-model="email" type="email" placeholder="name@malgn.example" class="w-full" />
      </UFormField>
      <UButton type="submit" block class="!mt-6">
        재설정 메일 발송
      </UButton>
    </form>

    <div class="text-center mt-4 text-xs">
      <NuxtLink to="/login" class="text-neutral-500 hover:text-primary-500">
        로그인으로 돌아가기
      </NuxtLink>
    </div>
  </div>
</template>
