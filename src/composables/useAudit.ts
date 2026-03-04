import { ref } from 'vue'
import { apiClient } from '@/api/client'
import type { AuditRecord } from '@/api/types'

export function useAudit() {
  const records = ref<AuditRecord[]>([])
  const loading = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const totalItems = ref(0)
  const error = ref<string>('')

  async function search(params: {
    player?: string
    type?: string
    startTime?: number
    endTime?: number
    page?: number
  }) {
    loading.value = true
    error.value = ''

    try {
      let url = `/api/audit/search?page=${params.page || currentPage.value}&pageSize=${pageSize.value}`
      if (params.player) url += `&player=${encodeURIComponent(params.player)}`
      if (params.type) url += `&type=${params.type}`
      if (params.startTime) url += `&startTime=${params.startTime}`
      if (params.endTime) url += `&endTime=${params.endTime}`

      const response: any = await apiClient.get(url)
      if (response.data?.success && response.data?.data) {
        records.value = response.data.data
        if (response.data.pagination) {
          totalItems.value = response.data.pagination.totalItems
        }
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to load audit data'
    } finally {
      loading.value = false
    }
  }

  async function loadPage(page: number) {
    currentPage.value = page
    await search({ page })
  }

  return {
    records,
    loading,
    currentPage,
    pageSize,
    totalItems,
    error,
    search,
    loadPage
  }
}
