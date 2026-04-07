import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ViewType, ThemeMode, FontSize } from '../types'

export const useAppStore = defineStore('app', () => {
  const currentView = ref<ViewType>('analysis')
  const theme = ref<ThemeMode>('system')
  const fontSize = ref<FontSize>('medium')
  const isPythonRunning = ref(false)

  function setCurrentView(view: ViewType) {
    currentView.value = view
  }

  function setTheme(newTheme: ThemeMode) {
    theme.value = newTheme
    applyTheme(newTheme)
  }

  function setFontSize(size: FontSize) {
    fontSize.value = size
  }

  function setPythonRunning(running: boolean) {
    isPythonRunning.value = running
  }

  function applyTheme(mode: ThemeMode) {
    const root = document.documentElement
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', isDark)
    } else {
      root.classList.toggle('dark', mode === 'dark')
    }
  }

  // 初始化主题监听
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme('system')
      }
    })
  }

  return {
    currentView,
    theme,
    fontSize,
    isPythonRunning,
    setCurrentView,
    setTheme,
    setFontSize,
    setPythonRunning,
    applyTheme
  }
})
