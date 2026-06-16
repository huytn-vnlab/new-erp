import { ref } from 'vue'

export type ToastItem = { id: number; message: string; type: 'success' | 'error' | 'info' }

const toasts = ref<ToastItem[]>([])
let seq = 0

export function useToast() {
  function show(message: string, type: ToastItem['type'] = 'success', ms = 3000): number {
    const id = ++seq
    toasts.value = [...toasts.value, { id, message, type }]
    if (ms > 0) setTimeout(() => dismiss(id), ms)
    return id
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }
  function clear() { toasts.value = []; seq = 0 }
  return { toasts, show, dismiss, clear }
}
