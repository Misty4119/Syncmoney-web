import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  eventType?: string // Track which event triggered the notification
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const enabled = ref(true)
  const maxNotifications = 10 // Increased limit for better history

  function addNotification(type: Notification['type'], title: string, message: string, eventType?: string) {
    if (!enabled.value) return

    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: Date.now(),
      eventType
    }
    notifications.value.unshift(notification)

    // Keep only the most recent notifications
    if (notifications.value.length > maxNotifications) {
      notifications.value = notifications.value.slice(0, maxNotifications)
    }
  }

  function addTransactionNotification(playerName: string, amount: string, type: string) {
    // Differentiate notification based on transaction type
    const notificationType: Notification['type'] = type === 'WITHDRAW' || type === 'SET_BALANCE' ? 'warning' : 'info'

    addNotification(
      notificationType,
      'New Transaction',
      `${playerName}: ${type === 'DEPOSIT' ? '+' : type === 'WITHDRAW' ? '-' : ''}${amount}`,
      'transaction'
    )
  }

  function addBreakerNotification(state: string) {
    addNotification(
      'warning',
      'Circuit Breaker Alert',
      `State changed to: ${state}`,
      'circuit_break'
    )
  }

  function addSystemAlertNotification(message: string) {
    addNotification(
      'error',
      'System Alert',
      message,
      'system_alert'
    )
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }

  function clearAll() {
    notifications.value = []
  }

  function setEnabled(value: boolean) {
    enabled.value = value
    localStorage.setItem('notificationsEnabled', String(value))
  }

  enabled.value = localStorage.getItem('notificationsEnabled') !== 'false'

  return {
    notifications,
    enabled,
    maxNotifications,
    addNotification,
    addTransactionNotification,
    addBreakerNotification,
    addSystemAlertNotification,
    removeNotification,
    clearAll,
    setEnabled
  }
})
