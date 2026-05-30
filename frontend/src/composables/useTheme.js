import { ref, watchEffect } from 'vue'

const KEY = 'app-theme'
const theme = ref(localStorage.getItem(KEY) || 'dark')

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem(KEY, theme.value)
})

export function useTheme() {
  const isDark = () => theme.value === 'dark'

  const toggle = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggle, isDark }
}
