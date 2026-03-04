import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/notification'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('notification store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should add notification', () => {
    const store = useNotificationStore()
    store.clearAll()
    
    store.addNotification('info', 'Test Title', 'Test Message')
    
    expect(store.notifications.length).toBe(1)
    expect(store.notifications[0].title).toBe('Test Title')
    expect(store.notifications[0].message).toBe('Test Message')
    expect(store.notifications[0].type).toBe('info')
  })

  it('should limit notifications to 5', () => {
    const store = useNotificationStore()
    store.clearAll()
    
    for (let i = 0; i < 7; i++) {
      store.addNotification('info', `Title ${i}`, `Message ${i}`)
    }
    
    expect(store.notifications.length).toBe(5)
  })

  it('should remove notification by id', () => {
    const store = useNotificationStore()
    store.clearAll()
    
    store.addNotification('info', 'Test', 'Message')
    const id = store.notifications[0].id
    
    store.removeNotification(id)
    
    expect(store.notifications.length).toBe(0)
  })

  it('should clear all notifications', () => {
    const store = useNotificationStore()
    
    store.addNotification('info', 'Test 1', 'Message 1')
    store.addNotification('success', 'Test 2', 'Message 2')
    
    store.clearAll()
    
    expect(store.notifications.length).toBe(0)
  })
})
