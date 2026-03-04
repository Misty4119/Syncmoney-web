<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="inputId" class="text-sm text-surface-400">
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-2.5 bg-surface-800 border rounded-xl text-surface-100 placeholder-surface-500 text-sm',
        'focus:outline-none focus:ring-1 transition-all',
        error
          ? 'border-error focus:border-error focus:ring-error/30'
          : 'border-surface-700 focus:border-cyan-500/50 focus:ring-cyan-500/20',
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="error" class="text-xs text-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  disabled?: boolean
  error?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)
</script>
