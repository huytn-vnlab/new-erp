import { useStorage } from '@vueuse/core'

export type Tweaks = { theme: 'light' | 'dark'; accent: string }

const DEFAULTS: Tweaks = { theme: 'light', accent: 'sky' }

export function useTweaks() {
  const tweaks = useStorage<Tweaks>('erp-tweaks', { ...DEFAULTS })
  function setTweak<K extends keyof Tweaks>(key: K, value: Tweaks[K]) {
    tweaks.value = { ...tweaks.value, [key]: value }
  }
  return { tweaks, setTweak }
}
