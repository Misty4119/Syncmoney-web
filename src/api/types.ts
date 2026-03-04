// API Types for Syncmoney Web Admin

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    timestamp: number
    version: string
  }
}

export interface Pagination {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type AuditType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'SET_BALANCE'

export interface AuditRecord {
  id: number
  playerUuid: string
  playerName: string
  type: AuditType
  amount: string
  balanceBefore: string
  balanceAfter: string
  source: string
  targetName?: string
  reason?: string
  timestamp: number
  serverName: string
}

export interface SystemStatus {
  plugin: {
    name: string
    version: string
    mode: string
    uptime: number
  }
  economy: {
    mode: string
    currencyName: string
  }
  redis: {
    connected: boolean
    enabled?: boolean
  }
  database: {
    type: string
    connected: boolean
    enabled?: boolean
  }
  circuitBreaker: {
    state: 'NORMAL' | 'WARNING' | 'LOCKED'
    lastTrigger?: number
    enabled?: boolean
  }
  serverName?: string
  onlinePlayers?: number
  maxPlayers?: number
}

export interface DashboardStats {
  totalSupply: string
  totalPlayers: number
  todayTransactions: number
  onlinePlayers: number
  circuitBreaker: 'NORMAL' | 'WARNING' | 'LOCKED'
}

export interface Settings {
  theme: 'dark' | 'light'
  language: 'zh-TW' | 'en-US'
  serverName?: string
  currencyName?: string
}

export interface AuthVerifyResponse {
  valid: boolean
  permissions?: string[]
}
