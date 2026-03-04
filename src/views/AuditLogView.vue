<template>
  <div class="space-y-6">
    <!-- Filter bar -->
    <Card variant="glass" padding="sm">
      <div class="flex flex-wrap items-center gap-3 p-2">
        <div class="relative flex-1 min-w-[200px] group">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50 group-focus-within:text-primary transition-colors duration-300" />
          <input
            v-model="playerSearch"
            type="text"
            class="w-full pl-10 pr-4 py-2 bg-surface-50/50 dark:bg-surface-950/50 backdrop-blur-md border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all duration-300"
            :placeholder="t('audit.filters.player')"
            @keydown.enter="handleSearch"
          />
        </div>

        <select
          v-model="typeFilter"
          class="px-3 py-2 bg-surface-50/50 dark:bg-surface-950/50 backdrop-blur-md border border-surface-200 dark:border-surface-700 rounded-lg text-sm text-surface-900 dark:text-surface-200 focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all duration-300 appearance-none cursor-pointer"
        >
          <option value="" class="bg-surface-50 dark:bg-surface-900">{{ t('audit.typeOptions.all') }}</option>
          <option value="DEPOSIT" class="bg-surface-50 dark:bg-surface-900">{{ t('audit.typeOptions.deposit') }}</option>
          <option value="WITHDRAW" class="bg-surface-50 dark:bg-surface-900">{{ t('audit.typeOptions.withdraw') }}</option>
          <option value="TRANSFER" class="bg-surface-50 dark:bg-surface-900">{{ t('audit.typeOptions.transfer') }}</option>
        </select>

        <div class="relative flex-1 min-w-[280px] z-[100]">
          <VueDatePicker
            v-model="dateRange"
            range
            :dark="settingsStore.theme === 'dark'"
            :teleport="true"
            placeholder="Select Date Range"
            :format="'yyyy-MM-dd HH:mm'"
            auto-apply
            @update:model-value="handleDateRangeChange"
            input-class-name="!bg-surface-50/50 dark:!bg-surface-950/50 !backdrop-blur-md !border-surface-200 dark:!border-surface-700 !rounded-lg !text-sm !text-surface-900 dark:!text-surface-200 focus:!outline-none focus:!border-primary focus:!shadow-glow-sm !transition-all !duration-300"
          />
        </div>

        <Button variant="primary" size="sm" :icon="Search" @click="handleSearch">
          {{ t('common.search') }}
        </Button>

        <Button variant="outline" size="sm" :icon="Download" @click="exportCSV">CSV</Button>
        <Button variant="outline" size="sm" :icon="Download" @click="exportJSON">JSON</Button>
      </div>
    </Card>

    <!-- Table -->
    <Card variant="glass" padding="none">
      <Table
        :columns="columns"
        :data="auditRecords"
        :loading="loading"
        row-key="id"
      >
        <template #cell-type="{ value }">
          <Badge :variant="typeBadgeVariant(String(value))">
            {{ t(`audit.typeOptions.${String(value).toLowerCase()}`) }}
          </Badge>
        </template>

        <template #cell-amount="{ value }">
          <span class="font-mono font-bold" :class="parseFloat(String(value)) >= 0 ? 'text-success drop-shadow-[0_0_5px_rgba(34,197,94,0.3)]' : 'text-error drop-shadow-[0_0_5px_rgba(239,68,68,0.3)]'">
            {{ parseFloat(String(value)) >= 0 ? '+' : '' }}{{ value }}
          </span>
        </template>

        <template #cell-timestamp="{ value }">
          <span class="text-surface-600 dark:text-surface-400 text-xs tracking-wider font-mono">{{ formatDate(Number(value)) }}</span>
        </template>
      </Table>

      <div v-if="auditRecords.length === 0 && !loading" class="p-8">
        <EmptyState :icon="FileText" :title="t('common.noData')" />
      </div>

      <div class="p-4 border-t border-surface-700/50">
        <Pagination
          v-model="currentPage"
          :page-size="pageSize"
          :total-items="totalItems"
          @update:model-value="handlePageChange"
        />
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiClient, type AuditRecord } from '@/api/client'
import { useWebSocket } from '@/composables/useWebSocket'
import { useNotificationStore } from '@/stores/notification'
import { useSettingsStore } from '@/stores/settings'
import { formatInTimeZone } from 'date-fns-tz'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { Search, Download, FileText } from 'lucide-vue-next'
import Card from '@/components/common/Card.vue'
import Table from '@/components/common/Table.vue'
import Pagination from '@/components/common/Pagination.vue'
import Button from '@/components/common/Button.vue'
import Badge from '@/components/common/Badge.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const { t } = useI18n()
const ws = useWebSocket()
const notificationStore = useNotificationStore()
const settingsStore = useSettingsStore()

const columns = [
  { key: 'timestamp', label: 'audit.time' },
  { key: 'playerName', label: 'audit.player' },
  { key: 'type', label: 'audit.type' },
  { key: 'amount', label: 'audit.amount' },
  { key: 'balanceAfter', label: 'audit.balance' },
  { key: 'source', label: 'audit.source' },
]

const auditRecords = ref<AuditRecord[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const totalItems = ref(0)
const playerSearch = ref('')
const typeFilter = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const startTime = ref<number | null>(null)
const endTime = ref<number | null>(null)

function typeBadgeVariant(type: string) {
  const map: Record<string, 'success' | 'warning' | 'info' | 'error' | 'default'> = {
    DEPOSIT: 'success',
    WITHDRAW: 'warning',
    TRANSFER: 'info',
  }
  return map[type] || 'default'
}

function handleDateRangeChange() {
  if (dateRange.value && dateRange.value.length === 2 && dateRange.value[0] && dateRange.value[1]) {
    startTime.value = dateRange.value[0].getTime()
    endTime.value = dateRange.value[1].getTime()
  } else {
    startTime.value = null
    endTime.value = null
  }
  currentPage.value = 1
  loadAuditData()
}

function handleSearch() { currentPage.value = 1; loadAuditData() }
function handlePageChange(page: number) { currentPage.value = page; loadAuditData() }

async function loadAuditData() {
  loading.value = true
  try {
    let url = `/api/audit/search?page=${currentPage.value}&pageSize=${pageSize.value}`
    if (playerSearch.value) url += `&player=${encodeURIComponent(playerSearch.value)}`
    if (typeFilter.value) url += `&type=${typeFilter.value}`
    if (startTime.value) url += `&startTime=${startTime.value}`
    if (endTime.value) url += `&endTime=${endTime.value}`
    const response: any = await apiClient.get(url)
    if (response.data?.success && response.data?.data) {
      auditRecords.value = response.data.data
      if (response.data.pagination) totalItems.value = response.data.pagination.totalItems
    }
  } catch (error) {
    console.error('Failed to load audit data:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(timestamp: number): string {
  try {
    return formatInTimeZone(timestamp, settingsStore.timezone, 'yyyy-MM-dd HH:mm:ssXXX')
  } catch (e) {
    return new Date(timestamp).toLocaleString()
  }
}

function exportCSV() {
  if (!auditRecords.value.length) return
  const headers = ['Time','Player','Type','Amount','Balance After','Source','Server']
  const rows = auditRecords.value.map((r: AuditRecord) => [
    new Date(r.timestamp).toISOString(), r.playerName || r.playerUuid,
    r.type, r.amount, r.balanceAfter, r.source, r.serverName || ''
  ])
  const csv = [headers, ...rows].map((row: string[]) => row.map((c: string) => `"${c}"`).join(',')).join('\n')
  downloadFile(csv, 'audit-log.csv', 'text/csv')
}

function exportJSON() {
  if (!auditRecords.value.length) return
  downloadFile(JSON.stringify(auditRecords.value, null, 2), 'audit-log.json', 'application/json')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

onMounted(() => {
  // Setup initial date range for today
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)
  dateRange.value = [start, end]
  handleDateRangeChange()
  
  ws.connect()
  ws.on('transaction', (data: any) => {
    notificationStore.addNotification('info', t('notification.newTransaction'),
      t('notification.newTransactionDesc', { player: data.playerName || data.player, amount: data.amount }))
    loadAuditData()
  })
})

onUnmounted(() => { ws.disconnect() })
</script>
