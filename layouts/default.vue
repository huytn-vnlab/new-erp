<template>
  <div class="min-h-screen bg-white dark:bg-gray-950">
    <slot />
  </div>
</template>

<script setup lang="ts">
const { init } = useTheme()
onMounted(init)
</script>
