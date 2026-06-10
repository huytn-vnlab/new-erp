<template>
  <div>
    <AppTabs
      :tabs="tabs"
      :model-value="route.path"
      class="mb-6"
      @update:model-value="router.push($event)"
    />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import AppTabs from '~/components/ui/AppTabs.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'module-role'],
  meta: { module: 'leave' },
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const tabs = computed(() => [
  { value: '/hrm/leave/history-user-leave',   label: t('hrm.leave.nav.history') },
  { value: '/hrm/leave/create-leave-request', label: t('hrm.leave.nav.request') },
  { value: '/hrm/leave/manage-day-leave',     label: t('hrm.leave.nav.dayInfo') },
  { value: '/hrm/leave/bonus-leave-history',  label: t('hrm.leave.nav.bonusHistory') },
])
</script>
