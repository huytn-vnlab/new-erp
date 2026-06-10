export const useTheme = () => {
  const isDark = useState<boolean>('theme.isDark', () => false)

  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  function init() {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = saved ? saved === 'dark' : prefersDark
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  return { isDark, toggle, init }
}
