<template>
  <div class="min-h-full grid place-items-center bg-neutral-50 dark:bg-neutral-950 py-12 px-4">
    <div class="w-full max-w-md">
      <NuxtLink to="/home" class="flex items-center justify-center gap-2 mb-8">
        <UIcon name="i-lucide-message-square-text" class="text-2xl text-primary-500" />
        <span class="font-bold text-lg">맑은 메시징</span>
      </NuxtLink>
      <UCard>
        <slot />
      </UCard>
      <p class="text-center text-xs text-neutral-500 mt-6">
        © (주)맑은소프트
      </p>
    </div>
  </div>
</template>
