import { apiClient } from '@/api/client'

/** Fetch economy dashboard stats. */
export async function getDashboardStats() {
    const res = await apiClient.get('/api/economy/stats')
    return res.data?.data
}
