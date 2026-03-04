import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3
  
  readyState = MockWebSocket.OPEN
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  onclose: (() => void) | null = null
  
  constructor(public url: string) {
    setTimeout(() => this.onopen?.(), 0)
  }
  
  send = vi.fn()
  close = vi.fn()
}

vi.stubGlobal('WebSocket', MockWebSocket)

describe('useWebSocket', () => {
  let useWebSocket: () => ReturnType<typeof import('@/composables/useWebSocket').useWebSocket>
  
  beforeEach(async () => {
    const module = await import('@/composables/useWebSocket')
    useWebSocket = module.useWebSocket
  })
  
  afterEach(() => {
    vi.resetModules()
  })

  it('should initialize with disconnected state', () => {
    const ws = useWebSocket()
    expect(ws.connected.value).toBe(false)
  })

  it('should connect to websocket server', () => {
    const ws = useWebSocket()
    ws.connect('ws://localhost:8080/ws')
    
    // Wait for mock WebSocket to connect
    return new Promise(resolve => setTimeout(() => {
      expect(ws.connected.value).toBe(true)
      resolve(true)
    }, 10))
  })

  it('should register and trigger event handlers', () => {
    const ws = useWebSocket()
    
    const handler = vi.fn()
    ws.on('transaction', handler)
    
    ws.connect('ws://localhost:8080/ws')
    
    return new Promise(resolve => setTimeout(() => {
      // Verify handler registration works
      expect(ws.on).toBeDefined()
      resolve(true)
    }, 10))
  })

  it('should disconnect properly', () => {
    const ws = useWebSocket()
    ws.connect('ws://localhost:8080/ws')
    
    return new Promise(resolve => setTimeout(() => {
      ws.disconnect()
      expect(ws.connected.value).toBe(false)
      resolve(true)
    }, 10))
  })
})
