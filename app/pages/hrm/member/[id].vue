<script setup lang="ts">
import { computed } from 'vue'
import MemberDetailPanel from '~/components/member/MemberDetailPanel.vue'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const route = useRoute()
const userId = computed(() => Number(route.params.id))
</script>

<template>
  <MemberDetailPanel :user-id="userId" />
</template>
