<template>
  <div
    @click="canClick && $emit('select-room', room)"
    :class="[
      'relative rounded-lg transition-all duration-200 select-none',
      sizeClass,
      canClick
        ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_0_0_rgba(0,0,0,0.06),0_16px_32px_-8px_rgba(0,0,0,0.15)] active:translate-y-0 active:shadow-[0_2px_0_0_rgba(0,0,0,0.04)]'
        : 'cursor-not-allowed opacity-80'
    ]"
    :style="roomStyle"
    :title="room.name"
  >
    <div :class="['h-2 rounded-t-md', statusBarClass]"></div>
    <div class="px-3 py-3 text-center relative z-10">
      <p class="font-bold text-slate-700 text-sm truncate leading-tight">{{ room.name }}</p>
      <p class="text-slate-400 text-xs mt-1">
        <span class="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" :class="statusDotClass"></span>
        {{ room.capacity }}人
      </p>
    </div>
    <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-slate-100 border border-slate-300 border-b-0 rounded-t"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ room: { type: Object, required: true } })
defineEmits(['select-room'])

const canClick = computed(() => props.room.current_status === 'available')

const statusBarClass = computed(() => {
  switch (props.room.current_status) {
    case 'available': return 'bg-gradient-to-r from-emerald-400 to-emerald-500'
    case 'occupied': return 'bg-gradient-to-r from-rose-400 to-rose-500'
    case 'disabled': return 'bg-gradient-to-r from-slate-300 to-slate-400'
    default: return 'bg-gradient-to-r from-slate-300 to-slate-400'
  }
})

const statusDotClass = computed(() => {
  switch (props.room.current_status) {
    case 'available': return 'bg-emerald-400'
    case 'occupied': return 'bg-rose-400'
    default: return 'bg-slate-400'
  }
})

const roomStyle = computed(() => {
  const base = 'border-2 border-slate-200 bg-gradient-to-b from-white to-slate-50 '
  if (!canClick.value) return base + 'shadow-[0_3px_0_0_rgba(0,0,0,0.03)]'
  return base + 'shadow-[0_5px_0_0_rgba(0,0,0,0.05),0_10px_20px_-6px_rgba(0,0,0,0.08)]'
})

const sizeClass = computed(() => {
  const cap = props.room.capacity
  if (cap <= 6) return 'col-span-4 sm:col-span-2 lg:col-span-1'
  if (cap <= 15) return 'col-span-4 sm:col-span-3 lg:col-span-2'
  return 'col-span-4 sm:col-span-4 lg:col-span-3'
})
</script>
