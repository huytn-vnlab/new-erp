<script setup lang="ts">
const props = defineProps<{ error: { statusCode: number; message: string } }>()
</script>
<template>
  <div class="app-canvas min-h-svh flex items-center justify-center p-10">
    <div class="card-surface p-8 text-center max-w-md">
      <p class="text-[64px] font-bold font-heading text-primary">{{ props.error.statusCode }}</p>
      <p class="text-muted-foreground mt-2">{{ props.error.message }}</p>
      <button class="mt-4 h-9 px-4 rounded-md text-white" :style="{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }" @click="clearError({ redirect: '/home-admin' })">Về trang chủ</button>
    </div>
  </div>
</template>
