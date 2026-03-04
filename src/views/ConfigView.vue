<template>
  <div class="space-y-6">
    <!-- Config sections -->
    <div
      v-for="(section, index) in configSections"
      :key="section.key"
      class="animate-fade-slide-up opacity-0"
      :style="{ animationDelay: `${index * 80}ms` }"
    >
      <Card variant="glass" hoverable class="group hover:border-cyan-500/40 hover:shadow-glow-cyan transition-all duration-300">
        <template #header>
          <button class="flex items-center justify-between w-full px-2 py-1 outline-none" @click="toggleSection(section.key)">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                <component :is="section.icon" class="w-5 h-5 text-cyan-400" />
              </div>
              <span class="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-lavender-400 uppercase tracking-wide">{{ t(section.title) }}</span>
            </div>
            <div class="flex items-center gap-4">
              <Badge v-if="section.status" :variant="section.status === 'enabled' ? 'success' : 'error'" size="sm" class="shadow-sm">
                {{ t(`config.${section.status}`) }}
              </Badge>
              <ChevronDown
                class="w-5 h-5 text-surface-500 group-hover:text-cyan-400 transition-all duration-300"
                :class="{ 'rotate-180': expanded[section.key] }"
              />
            </div>
          </button>
        </template>

        <Transition name="collapse">
          <div v-if="expanded[section.key]">
            <div class="space-y-2">
              <div
                v-for="item in section.items"
                :key="item.label"
                class="flex justify-between items-center py-1.5 text-sm"
              >
                <span class="text-surface-400">{{ item.label }}</span>
                <span class="font-mono text-surface-200">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </Card>
    </div>

    <!-- Reload -->
    <div class="flex justify-end pt-4">
      <Button variant="outline" :icon="RefreshCw" :loading="reloading" class="hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-300 shadow-glow-sm" @click="reloadConfig">
        {{ t('config.reload') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiClient } from '@/api/client'
import { useNotificationStore } from '@/stores/notification'
import { Database, Server, Shield, FileText, Coins, ChevronDown, RefreshCw } from 'lucide-vue-next'
import Card from '@/components/common/Card.vue'
import Badge from '@/components/common/Badge.vue'
import Button from '@/components/common/Button.vue'

const { t } = useI18n()
const notificationStore = useNotificationStore()

const config = ref<any>({})
const reloading = ref(false)
const expanded = ref<Record<string, boolean>>({ redis: true, database: true, circuitBreaker: true, audit: false, economy: false })

function toggleSection(key: string) {
  expanded.value[key] = !expanded.value[key]
}

const configSections = computed(() => [
  {
    key: 'redis', icon: Server, title: 'config.redis',
    status: config.value.redis?.enabled ? 'enabled' : 'disabled',
    items: [
      { label: 'Host', value: config.value.redis?.host || '-' },
      { label: 'Port', value: config.value.redis?.port || '-' },
      { label: 'Database', value: config.value.redis?.database ?? '-' },
    ],
  },
  {
    key: 'database', icon: Database, title: 'config.database',
    status: undefined,
    items: [
      { label: 'Type', value: config.value.database?.type || '-' },
      { label: 'Host', value: `${config.value.database?.host || '-'}:${config.value.database?.port || '-'}` },
      { label: 'Database', value: config.value.database?.database || '-' },
    ],
  },
  {
    key: 'circuitBreaker', icon: Shield, title: 'config.circuitBreaker',
    status: config.value.circuitBreaker?.enabled ? 'enabled' : 'disabled',
    items: [
      { label: 'Threshold', value: config.value.circuitBreaker?.threshold || '-' },
      { label: 'Timeout', value: config.value.circuitBreaker?.timeout ? `${config.value.circuitBreaker.timeout}ms` : '-' },
    ],
  },
  {
    key: 'audit', icon: FileText, title: 'config.audit',
    status: config.value.audit?.enabled ? 'enabled' : 'disabled',
    items: [
      { label: 'Batch Size', value: config.value.audit?.batchSize || '-' },
      { label: 'Flush Interval', value: config.value.audit?.flushInterval ? `${config.value.audit.flushInterval}ms` : '-' },
    ],
  },
  {
    key: 'economy', icon: Coins, title: 'config.economy',
    status: undefined,
    items: [
      { label: 'Currency', value: config.value.economy?.currencyName || '-' },
      { label: 'Symbol', value: config.value.economy?.currencySymbol || '-' },
      { label: 'Decimals', value: config.value.economy?.decimalPlaces ?? '-' },
    ],
  },
])

async function loadConfig() {
  try {
    const response = await apiClient.get('/api/config')
    if (response.data?.success && response.data?.data) config.value = response.data.data
  } catch (error) {
    console.error('Failed to load config:', error)
    notificationStore.addNotification('error', t('config.loadError'), t('config.loadErrorDesc'))
  }
}

async function reloadConfig() {
  reloading.value = true
  try {
    const response = await apiClient.post('/api/config/reload')
    if (response.data?.success) {
      notificationStore.addNotification('success', t('config.reloadSuccess'), t('config.reloadSuccessDesc'))
      await loadConfig()
    } else {
      notificationStore.addNotification('error', t('config.reloadError'), response.data?.error?.message || '')
    }
  } catch {
    notificationStore.addNotification('error', t('config.reloadError'), t('config.reloadErrorDesc'))
  } finally {
    reloading.value = false
  }
}

onMounted(() => { loadConfig() })
</script>

<style scoped>
.collapse-enter-active,
.collapse-leave-active { transition: all 0.2s ease; overflow: hidden; }
.collapse-enter-from,
.collapse-leave-to { opacity: 0; max-height: 0; }
.collapse-enter-to,
.collapse-leave-from { opacity: 1; max-height: 300px; }
</style>
