<template>
  <AuthCard :title="cardTitle" :sub="cardSub">
    <div v-if="loading" class="flex justify-center py-8"><Loader2 :size="28" class="animate-spin text-slate-300" /></div>

    <template v-else>
      <div class="-mt-2">
        <span
          class="h-14 w-14 rounded-2xl flex items-center justify-center"
          :style="success ? 'background: hsl(152 60% 95%); color: hsl(155 60% 32%)' : 'background: hsl(0 72% 95%); color: hsl(0 65% 45%)'"
        >
          <Check v-if="success" :size="26" />
          <X v-else :size="26" />
        </span>
        <div v-if="errorMsg && !success" class="mt-4 text-[12.5px] text-rose-700">{{ errorMsg }}</div>
        <div class="mt-6"><AuthButton @click="router.push('/organization/find-organization')">Đến trang đăng nhập</AuthButton></div>
      </div>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
import { Check, X, Loader2 } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Xác nhận tổ chức — Micro ERP' })

const route    = useRoute()
const router   = useRouter()
const { post } = useApi()
const loading  = ref(true)
const success  = ref(false)
const errorMsg = ref('')

const cardTitle = computed(() => (loading.value ? 'Xác nhận tổ chức' : success.value ? 'Tổ chức đã được kích hoạt' : 'Xác nhận thất bại'))
const cardSub = computed(() => (loading.value ? 'Đang xác minh email để kích hoạt tổ chức của bạn.' : success.value ? 'Bạn có thể đăng nhập ngay.' : undefined))

onMounted(async () => {
  try {
    await post('/organization/verify-organization', { code: route.params.code })
    success.value = true
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Mã xác nhận không hợp lệ hoặc đã hết hạn.'
  } finally {
    loading.value = false
  }
})
</script>
