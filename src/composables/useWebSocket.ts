import { ref, onUnmounted } from 'vue'

export type WebSocketEventType = 'transaction' | 'circuit_break' | 'system_alert' | 'connected'

export interface WebSocketMessage {
  type: WebSocketEventType
  data: any
  timestamp: number
}

export function useWebSocket() {
  const connected = ref(false)
  const lastMessage = ref<WebSocketMessage | null>(null)
  const error = ref<string>('')

  let eventSource: EventSource | null = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

  const messageHandlers = new Map<WebSocketEventType, ((data: any) => void)[]>()

  function connect(url: string = `http://${window.location.host}/sse`) {
    // Close existing connection if any
    disconnect()

    // Get API key from localStorage and append to URL
    const apiKey = localStorage.getItem('apiKey')
    const fullUrl = apiKey ? `${url}?apiKey=${encodeURIComponent(apiKey)}` : url

    try {
      eventSource = new EventSource(fullUrl)

      eventSource.onopen = () => {
        connected.value = true
        error.value = ''
        reconnectAttempts = 0
        console.log('SSE connection established')
      }

      eventSource.onmessage = (event) => {
        try {
          // Parse SSE message format: "data: {...}"
          const messageText = event.data
          if (!messageText) return

          const message: WebSocketMessage = JSON.parse(messageText)
          lastMessage.value = message

          const handlers = messageHandlers.get(message.type as WebSocketEventType)
          if (handlers) {
            handlers.forEach(handler => handler(message.data))
          }
        } catch (e) {
          console.error('Failed to parse SSE message:', e)
        }
      }

      eventSource.addEventListener('connected', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          console.log('SSE connected:', data)
          const handlers = messageHandlers.get('connected')
          if (handlers) {
            handlers.forEach(handler => handler(data))
          }
        } catch (e) {
          console.error('Failed to parse connected event:', e)
        }
      })

      eventSource.addEventListener('transaction', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          const handlers = messageHandlers.get('transaction')
          if (handlers) {
            handlers.forEach(handler => handler(data))
          }
        } catch (e) {
          console.error('Failed to parse transaction event:', e)
        }
      })

      eventSource.addEventListener('circuit_break', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          const handlers = messageHandlers.get('circuit_break')
          if (handlers) {
            handlers.forEach(handler => handler(data))
          }
        } catch (e) {
          console.error('Failed to parse circuit_break event:', e)
        }
      })

      eventSource.addEventListener('system_alert', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data)
          const handlers = messageHandlers.get('system_alert')
          if (handlers) {
            handlers.forEach(handler => handler(data))
          }
        } catch (e) {
          console.error('Failed to parse system_alert event:', e)
        }
      })

      eventSource.onerror = (e) => {
        error.value = 'SSE connection error'
        console.error('SSE error:', e)
        connected.value = false

        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          console.log(`SSE reconnecting... Attempt ${reconnectAttempts}/${maxReconnectAttempts}`)
          reconnectTimeout = setTimeout(() => {
            connect(url)
          }, reconnectDelay)
        } else {
          error.value = 'SSE connection failed after maximum retry attempts'
          console.error('SSE max reconnect attempts reached')
        }
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to connect'
      console.error('SSE connection error:', e)
    }
  }

  function disconnect() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    connected.value = false
  }

  function on(type: WebSocketEventType, handler: (data: any) => void) {
    const handlers = messageHandlers.get(type) || []
    handlers.push(handler)
    messageHandlers.set(type, handlers)
  }

  function off(type: WebSocketEventType, handler: (data: any) => void) {
    const handlers = messageHandlers.get(type)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connected,
    lastMessage,
    error,
    connect,
    disconnect,
    on,
    off
  }
}
