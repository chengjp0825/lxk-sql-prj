<template>
  <div @click="canClick && $emit('select-room', room)"
    :class="['group relative rounded-2xl border transition-all duration-300 overflow-hidden', sizeClass, canClick ? 'cursor-pointer hover:border-white/15 hover:-translate-y-1' : 'cursor-not-allowed opacity-60']"
    :style="cardStyle">
    <div class="absolute left-0 top-4 bottom-4 w-1 rounded-full" :style="accentStyle"></div>
    <div class="px-6 py-6 pl-7">
      <div class="flex items-start justify-between mb-4">
        <span class="text-3xl">{{ roomIcon }}</span>
        <span class="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border" :style="statusBadgeStyle">{{ statusText }}</span>
      </div>
      <h3 class="font-bold text-lg mb-1.5" :style="{ color: canClick ? 'var(--text-primary)' : 'var(--text-muted)' }">{{ room.name }}</h3>
      <div class="flex items-center gap-4 text-sm mt-4" :style="{ color: canClick ? 'var(--text-secondary)' : 'var(--text-muted)' }">
        <span class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>{{ room.floor }}</span>
        <span class="flex items-center gap-1.5"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>{{ room.capacity }}人</span>
      </div>
    </div>
    <div v-if="canClick" class="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" :style="hoverGlowStyle"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ room: { type: Object, required: true } })
defineEmits(['select-room'])
const canClick = computed(() => props.room.current_status === 'available')
const statusColor = computed(() => {
  switch (props.room.current_status) {
    case 'available': return { bg: [16,185,129], border: [16,185,129], text: [110,231,183] }
    case 'occupied': return { bg: [244,63,94], border: [244,63,94], text: [253,164,175] }
    default: return { bg: [100,116,139], border: [100,116,139], text: [148,163,184] }
  }
})
const statusText = computed(() => ({ available:'可预约', occupied:'使用中' }[props.room.current_status] || '已停用'))
const roomIcon = computed(() => props.room.capacity <= 6 ? '\u{1F4AC}' : props.room.capacity <= 15 ? '\u{1F4CA}' : '\u{1F3A4}')
const c = computed(() => statusColor.value)
const cardStyle = computed(() => ({
  background: canClick.value ? 'var(--bg-card)' : 'var(--bg-card)',
  borderColor: canClick.value ? `rgba(${c.value.border.join(',')},0.15)` : 'var(--border-subtle)',
  boxShadow: canClick.value ? `0 0 20px rgba(${c.value.bg.join(',')},0.06)` : 'none'
}))
const accentStyle = computed(() => ({
  background: `linear-gradient(180deg, rgba(${c.value.bg.join(',')},0.8), rgba(${c.value.bg.join(',')},0.3))`,
  boxShadow: canClick.value ? `0 0 8px rgba(${c.value.bg.join(',')},0.4)` : 'none'
}))
const statusBadgeStyle = computed(() => ({
  background: `rgba(${c.value.bg.join(',')},0.1)`,
  borderColor: `rgba(${c.value.border.join(',')},0.15)`,
  color: `rgb(${c.value.text.join(',')})`
}))
const hoverGlowStyle = computed(() => ({
  background: `radial-gradient(ellipse at center, rgba(${c.value.bg.join(',')},0.08) 0%, transparent 70%)`
}))
const sizeClass = computed(() => {
  const cap = props.room.capacity
  if (cap <= 6) return 'col-span-6 sm:col-span-3 lg:col-span-2'
  if (cap <= 15) return 'col-span-6 sm:col-span-4 lg:col-span-3'
  return 'col-span-6 sm:col-span-6 lg:col-span-4'
})
</script>
