<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
    <span class="text-xs text-surface-500">
      {{ t('audit.pagination.showing') }} {{ startItem }} {{ t('audit.pagination.to') }} {{ endItem }}
      {{ t('audit.pagination.of') }} {{ totalItems }} {{ t('audit.pagination.items') }}
    </span>
    <div class="flex gap-2">
      <button
        class="px-3 py-1.5 rounded-lg border border-surface-700 text-surface-400 text-sm transition-colors hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-surface-700 disabled:hover:text-surface-400"
        :disabled="currentPage === 1"
        @click="$emit('update:modelValue', currentPage - 1)"
      >
        {{ t('common.previous') }}
      </button>
      <button
        class="px-3 py-1.5 rounded-lg border border-surface-700 text-surface-400 text-sm transition-colors hover:border-cyan-500/50 hover:text-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-surface-700 disabled:hover:text-surface-400"
        :disabled="currentPage === totalPages"
        @click="$emit('update:modelValue', currentPage + 1)"
      >
        {{ t('common.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  modelValue?: number
  pageSize?: number
  totalItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  pageSize: 20,
  totalItems: 0
})

defineEmits<{
  'update:modelValue': [page: number]
}>()

const currentPage = computed(() => props.modelValue)
const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))
const startItem = computed(() => (props.modelValue - 1) * props.pageSize + 1)
const endItem = computed(() => Math.min(props.modelValue * props.pageSize, props.totalItems))
</script>
