<template>
  <div class="overflow-x-auto">
    <table class="w-full text-left">
      <thead>
        <tr class="border-b border-surface-200 dark:border-surface-700/50">
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[column.class, 'px-4 py-3 text-xs font-medium text-surface-600 dark:text-surface-400 uppercase tracking-wider']"
          >
            {{ t(column.label) }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="text-center py-8 text-surface-600 dark:text-surface-500">
            {{ t('common.loading') }}
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length" class="text-center py-8 text-surface-600 dark:text-surface-500">
            {{ t('common.noData') }}
          </td>
        </tr>
        <tr
          v-else
          v-for="(row, index) in data"
          :key="rowKeyValue ? (row[rowKeyValue as keyof typeof row] as string) : index"
          class="border-b border-surface-200 dark:border-surface-800 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[column.class, 'px-4 py-3 text-sm text-surface-800 dark:text-surface-300']"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  class?: string
}

interface TableRow {
  [key: string]: string | number | boolean | undefined
}

interface Props {
  columns: Column[]
  data?: TableRow[]
  loading?: boolean
  rowKey?: string
}

const props = defineProps<Props>()
const rowKeyValue = props.rowKey || 'id'
</script>
