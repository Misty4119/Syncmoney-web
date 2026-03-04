import { apiClient } from '@/api/client'

/** Fetch current configuration. */
export async function getConfig() {
    const res = await apiClient.get('/api/config')
    return res.data?.data
}

/** Reload configuration on server. */
export async function reloadConfig() {
    const res = await apiClient.post('/api/config/reload')
    return res.data
}
