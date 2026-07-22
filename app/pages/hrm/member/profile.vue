<script setup lang="ts">
import { computed } from 'vue'
import MemberDetailPanel from '~/components/member/MemberDetailPanel.vue'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const { t } = useI18n()
const auth = useAuth()
// auth.user may still be loading (e.g. on a hard refresh, the layout fetches
// it after this page mounts) — MemberDetailPanel waits for a non-zero userId.
const userId = computed(() => auth.user.value?.id ?? 0)
</script>

<template>
  <MemberDetailPanel :user-id="userId" :back-label="t('hrm.member.profile.back')" />
</template>
