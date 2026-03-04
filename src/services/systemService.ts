import { apiClient } from '@/api/client'

/** Fetch system status. */
export async function getSystemStatus() {
    const res = await apiClient.get('/api/system/status')
    return res.data?.data
}

/** Fetch system metrics. */
export async function getSystemMetrics() {
    const res = await apiClient.get('/api/system/metrics')
    return res.data?.data
}
