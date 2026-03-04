import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { apiClient, type ApiResponse } from '@/api/client'

export type Theme = 'dark' | 'light'
export type Locale = 'zh-TW' | 'en-US'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'dark')
  const locale = ref<Locale>((localStorage.getItem('locale') as Locale) || 'zh-TW')
  const timezone = ref<string>(localStorage.getItem('timezone') || 'UTC')
  const isLoading = ref<boolean>(false)

  // Apply theme to document
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)

    // Toggle dark mode class on html element for Tailwind's class strategy
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, { immediate: true })

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    saveToServer()
  }

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
    saveToServer()
  }

  function setTimezone(newTz: string) {
    timezone.value = newTz
    localStorage.setItem('timezone', newTz)
    // timezone is local-only — no server sync
  }

  async function saveToServer() {
    if (!localStorage.getItem('apiKey')) return

    try {
      await Promise.all([
        apiClient.post('/api/settings/theme', { theme: theme.value }),
        apiClient.post('/api/settings/language', { language: locale.value })
        // timezone is stored locally only — no backend endpoint exists
      ])
    } catch (e) {
      console.warn('Failed to save settings to server:', e)
    }
  }

  async function loadFromServer() {
    if (!localStorage.getItem('apiKey')) return

    isLoading.value = true
    try {
      const response = await apiClient.get<ApiResponse<any>>('/api/settings')
      if (response.data?.success && response.data?.data) {
        if (response.data.data.theme) {
          theme.value = response.data.data.theme
        }
        if (response.data.data.language) {
          locale.value = response.data.data.language
        }
        if (response.data.data.timezone) {
          timezone.value = response.data.data.timezone
        }
      }
    } catch (e) {
      console.warn('Failed to load settings from server:', e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    theme,
    locale,
    timezone,
    isLoading,
    setTheme,
    setLocale,
    setTimezone,
    saveToServer,
    loadFromServer
  }
})
