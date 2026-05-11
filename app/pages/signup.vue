<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '회원가입' })
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-1">회원가입</h2>
    <p class="text-sm text-neutral-500 mb-6">
      이메일과 약관 동의 후 가입을 진행합니다.
    </p>

    <div class="py-10 text-center text-neutral-500 text-sm">
      회원가입 폼 (OTP/휴대폰 인증/약관 동의) 자리입니다.
    </div>
  </div>
</template>
