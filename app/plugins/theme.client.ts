export default defineNuxtPlugin(() => {
  const { tweaks } = useTweaks()
  const app = useAppConfig()
  const root = document.documentElement

  watchEffect(() => {
    root.classList.toggle('dark', tweaks.value.theme === 'dark')
    const a = app.accents[tweaks.value.accent] ?? app.accents.sky!
    root.style.setProperty('--primary-h', String(a.h))
    root.style.setProperty('--primary-s', `${a.s}%`)
  })
})
