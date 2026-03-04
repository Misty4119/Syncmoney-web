import axios, { type AxiosInstance } from 'axios'
import type { ApiResponse, AuditRecord, DashboardStats, SystemStatus, Settings } from './types'

const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth header
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('apiKey')
    if (apiKey) {
      config.headers.Authorization = `Bearer ${apiKey}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('apiKey')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export { apiClient }
export type { ApiResponse, AuditRecord, DashboardStats, SystemStatus, Settings }
