import { apiClient } from '@/api/client'

export interface AuditQuery {
    page?: number
    pageSize?: number
    player?: string
    type?: string
    startTime?: number
}

/** Fetch audit records with filters. */
export async function getAuditRecords(params: AuditQuery) {
    const query = new URLSearchParams()
    if (params.page) query.set('page', String(params.page))
    if (params.pageSize) query.set('pageSize', String(params.pageSize))
    if (params.player) query.set('player', params.player)
    if (params.type) query.set('type', params.type)
    if (params.startTime) query.set('startTime', String(params.startTime))
    const res = await apiClient.get(`/api/audit/search?${query}`)
    return res.data
}

/** Export audit records as CSV string. */
export function exportAuditCSV(records: any[]): string {
    const headers = ['Time', 'Player', 'Type', 'Amount', 'Balance After', 'Source', 'Server']
    const rows = records.map(r => [
        new Date(r.timestamp).toISOString(),
        r.playerName || r.playerUuid,
        r.type, r.amount, r.balanceAfter, r.source, r.serverName || ''
    ])
    return [headers, ...rows]
        .map(row => row.map((c: string) => `"${c}"`).join(','))
        .join('\n')
}
