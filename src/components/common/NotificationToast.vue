<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[60] flex flex-col gap-3 max-w-sm">
      <TransitionGroup name="notification">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="glass-card flex items-start gap-3 p-4 shadow-lg"
          :class="borderClass(notification.type)"
        >
          <div class="flex-shrink-0 mt-0.5">
            <CheckCircle v-if="notification.type === 'success'" class="w-5 h-5 text-success" />
            <XCircle v-else-if="notification.type === 'error'" class="w-5 h-5 text-error" />
            <AlertTriangle v-else-if="notification.type === 'warning'" class="w-5 h-5 text-warning" />
            <Info v-else class="w-5 h-5 text-info" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-surface-100">{{ notification.title }}</p>
            <p class="text-xs text-surface-400 mt-0.5">{{ notification.message }}</p>
          </div>
          <button
            class="p-1 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-700 transition-colors"
            @click="removeNotification(notification.id)"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

const notificationStore = useNotificationStore()
const notifications = computed(() => notificationStore.notifications)
const removeNotification = notificationStore.removeNotification

function borderClass(type: string) {
  const map: Record<string, string> = {
    success: 'border-l-2 border-l-success',
    error:   'border-l-2 border-l-error',
    warning: 'border-l-2 border-l-warning',
    info:    'border-l-2 border-l-info',
  }
  return map[type] || ''
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
