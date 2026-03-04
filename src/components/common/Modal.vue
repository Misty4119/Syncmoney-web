<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="maskClosable && close()"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        <Transition name="modal-content" appear>
          <div :class="modalClasses" class="relative z-10">
            <div v-if="title || closable" class="flex items-center justify-between px-6 py-4 border-b border-surface-700/50">
              <h3 v-if="title" class="text-lg font-semibold text-surface-100">{{ title }}</h3>
              <button
                v-if="closable"
                class="p-1.5 rounded-lg text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-colors"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            <div class="p-6">
              <slot />
            </div>
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-surface-700/50">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
  maskClosable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  maskClosable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

const modalClasses = computed(() => {
  const sizeMap: Record<string, string> = {
    sm: 'max-w-sm w-full',
    md: 'max-w-lg w-full',
    lg: 'max-w-2xl w-full',
  }
  return ['glass-card', sizeMap[props.size]]
})
</script>
