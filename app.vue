<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Apply i18n SEO head tags (lang, dir attributes) on every page.
const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale },
})

onMounted(() => {
  useTheme().init()
})
</script>
