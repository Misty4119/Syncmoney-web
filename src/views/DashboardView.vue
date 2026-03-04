<template>
  <div class="space-y-6">
    <!-- Stats grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        v-for="(stat, i) in statCards"
        :key="stat.label"
        v-bind="stat"
        :loading="loading"
        :style="{ animationDelay: `${i * 100}ms` }"
        class="animate-fade-slide-up opacity-0"
      />
    </div>

    <!-- System health card -->
    <Card variant="glass" glow class="border-primary/30">
      <template #header>
        <div class="flex items-center gap-3 px-2">
          <div class="p-2 bg-primary/10 rounded-xl shadow-glow-sm">
            <Shield class="w-5 h-5 text-primary" />
          </div>
          <span class="text-base font-bold gradient-text uppercase tracking-wide">
            {{ t('dashboard.systemHealth') || 'System Health' }}
          </span>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Circuit Breaker -->
        <div class="flex items-center gap-3">
          <StatusDot :status="circuitBreakerStatus" />
          <div>
            <p class="text-xs text-surface-600 dark:text-surface-400">{{ t('dashboard.circuitBreaker') }}</p>
            <p class="text-sm font-medium" :class="circuitBreakerClass">
              {{ stats.circuitBreaker }}
            </p>
          </div>
        </div>
        <!-- Redis -->
        <div class="flex items-center gap-3">
          <StatusDot :status="ws.connected ? 'connected' : 'disconnected'" />
          <div>
            <p class="text-xs text-surface-600 dark:text-surface-400">{{ t('dashboard.connected') || 'Connection' }}</p>
            <p class="text-sm font-medium" :class="ws.connected ? 'text-success' : 'text-error'">
              {{ ws.connected ? 'Connected' : 'Disconnected' }}
            </p>
          </div>
        </div>
        <!-- Online -->
        <div class="flex items-center gap-3">
          <Users class="w-5 h-5 text-secondary" />
          <div>
            <p class="text-xs text-surface-600 dark:text-surface-400">{{ t('dashboard.onlinePlayers') }}</p>
            <p class="text-sm font-medium text-surface-900 dark:text-surface-100">{{ stats.onlinePlayers }}</p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Last updated -->
    <p class="text-xs text-surface-600 dark:text-surface-400 text-right">
      {{ t('dashboard.lastUpdated') }}: {{ lastUpdated }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiClient, type DashboardStats } from '@/api/client'
import { useWebSocket } from '@/composables/useWebSocket'
import { useNotificationStore } from '@/stores/notification'
import { Wallet, Users, ArrowUpDown, TrendingUp, Shield } from 'lucide-vue-next'
import Card from '@/components/common/Card.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusDot from '@/components/common/StatusDot.vue'

const { t, locale } = useI18n()
const ws = useWebSocket()
const notificationStore = useNotificationStore()

const loading = ref(true)
const stats = ref<DashboardStats>({
  totalSupply: '0',
  totalPlayers: 0,
  todayTransactions: 0,
  onlinePlayers: 0,
  circuitBreaker: 'NORMAL',
})
const lastUpdated = ref<string>('')

const statCards = computed(() => [
  {
    label: t('dashboard.totalSupply'),
    value: stats.value.totalSupply,
    icon: Wallet,
    color: 'primary' as const,
  },
  {
    label: t('dashboard.totalPlayers'),
    value: stats.value.totalPlayers,
    icon: Users,
    color: 'secondary' as const,
  },
  {
    label: t('dashboard.todayTransactions'),
    value: stats.value.todayTransactions,
    icon: ArrowUpDown,
    color: 'green' as const,
  },
  {
    label: t('dashboard.onlinePlayers'),
    value: stats.value.onlinePlayers,
    icon: TrendingUp,
    color: 'amber' as const,
  },
])

const circuitBreakerClass = computed(() => {
  switch (stats.value.circuitBreaker) {
    case 'NORMAL':  return 'text-success'
    case 'WARNING': return 'text-warning'
    case 'LOCKED':  return 'text-error'
    default:        return 'text-surface-300'
  }
})

const circuitBreakerStatus = computed(() => {
  switch (stats.value.circuitBreaker) {
    case 'NORMAL':  return 'connected' as const
    case 'WARNING': return 'warning' as const
    default:        return 'disconnected' as const
  }
})

let refreshInterval: ReturnType<typeof setInterval>

async function loadDashboardData() {
  try {
    const statusResponse = await apiClient.get('/api/system/status')
    if (statusResponse.data?.success && statusResponse.data?.data) {
      const data = statusResponse.data.data
      stats.value.onlinePlayers = data.onlinePlayers || 0
      if (data.circuitBreaker) {
        stats.value.circuitBreaker = data.circuitBreaker.state || 'NORMAL'
      }
    }

    try {
      const economyResponse = await apiClient.get('/api/economy/stats')
      if (economyResponse.data?.success && economyResponse.data?.data) {
        const econData = economyResponse.data.data
        stats.value.totalSupply = econData.totalSupply != null ? formatCurrency(econData.totalSupply) : 'N/A'
        stats.value.totalPlayers = econData.totalPlayers || 0
        stats.value.todayTransactions = econData.todayTransactions || 0
      }
    } catch {
      stats.value.totalSupply = 'N/A'
    }

    lastUpdated.value = new Date().toLocaleTimeString(locale.value)
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

function formatCurrency(value: number | string): string {
  if (typeof value === 'string') value = parseFloat(value)
  if (isNaN(value)) return 'N/A'
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 2 }).format(value)
}

onMounted(() => {
  loadDashboardData()
  refreshInterval = setInterval(loadDashboardData, 30000)
  ws.connect()
  ws.on('transaction', (data: any) => {
    notificationStore.addTransactionNotification(data.playerName || data.player, data.amount, data.type)
    loadDashboardData()
  })
  ws.on('circuit_break', () => {
    notificationStore.addBreakerNotification('WARNING')
    loadDashboardData()
  })
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
  ws.disconnect()
})
</script>
