import { ref } from 'vue'
import { apiClient } from '@/api/client'
import type { SystemStatus } from '@/api/types'

export function useSystem() {
  const status = ref<Partial<SystemStatus>>({})
  const loading = ref(false)
  const error = ref<string>('')

  async function loadStatus() {
    loading.value = true
    error.value = ''

    try {
      const response: any = await apiClient.get('/api/system/status')
      if (response.data?.success && response.data?.data) {
        status.value = response.data.data
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to load system status'
    } finally {
      loading.value = false
    }
  }

  async function checkRedis() {
    try {
      const response: any = await apiClient.get('/api/system/redis')
      return response.data?.success ? response.data.data : null
    } catch {
      return null
    }
  }

  async function checkBreaker() {
    try {
      const response: any = await apiClient.get('/api/system/breaker')
      return response.data?.success ? response.data.data : null
    } catch {
      return null
    }
  }

  return {
    status,
    loading,
    error,
    loadStatus,
    checkRedis,
    checkBreaker
  }
}
