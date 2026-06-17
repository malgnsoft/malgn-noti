<script setup lang="ts">
definePageMeta({ layout: 'blank', auth: false })
useHead({ title: '페이지를 찾을 수 없습니다' })

const router = useRouter()
</script>

<template>
  <AppSystemMessage
    code="404"
    eyebrow="ERROR 404"
    title="페이지를 찾을 수 없습니다"
    description="요청하신 페이지가 존재하지 않거나 이동되었습니다. 주소를 다시 확인해 주세요."
  >
    <template #actions>
      <button type="button" class="btn btn-neutral" @click="router.back()">
        <UIcon name="i-lucide-arrow-left" />
        이전으로
      </button>
      <NuxtLink to="/home" class="btn btn-primary">
        <UIcon name="i-lucide-home" />
        홈으로
      </NuxtLink>
    </template>
  </AppSystemMessage>
</template>
