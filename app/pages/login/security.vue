<script setup lang="ts">
definePageMeta({ layout: 'auth', auth: false })
useHead({ title: '보안 인증' })

const code = ref('')
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-1">보안 인증</h2>
    <p class="text-sm text-neutral-500 mb-6">
      등록된 이메일/휴대전화로 발송된 인증코드를 입력하세요.
    </p>

    <form class="space-y-4" @submit.prevent>
      <UFormField label="인증코드" required>
        <UInput v-model="code" placeholder="6자리 코드" maxlength="6" class="w-full" />
      </UFormField>
      <UButton type="submit" block class="!mt-6">
        확인
      </UButton>
    </form>

    <div class="text-center mt-4 text-xs text-neutral-500">
      코드를 받지 못하셨나요? <UButton variant="link" size="xs" label="재발송" />
    </div>
  </div>
</template>
