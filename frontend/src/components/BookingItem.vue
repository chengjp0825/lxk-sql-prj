<template>
  <div class="glass rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all duration-200 shadow-[0_0_30px_rgba(99,102,241,0.03)]">
    <div class="flex justify-between items-start">
      <div class="flex items-start gap-3">
        <span class="text-2xl">&#x1F3E2;</span>
        <div>
          <h4 class="font-bold text-white">{{ booking.room?.name || '未知会议室' }}</h4>
          <p class="text-sm text-slate-500">{{ booking.room?.floor }}</p>
        </div>
      </div>
      <span :class="statusClass">{{ statusText }}</span>
    </div>
    <p class="text-sm text-slate-400 mt-3 pl-10">&#x1F552; {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}</p>
    <div v-if="canCancel" class="mt-3 pl-10">
      <button @click="handleCancel" class="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors">取消预约</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import api from '../api'

const props = defineProps({ booking: { type: Object, required: true } })
const emit = defineEmits(['cancel'])

const statusClass = computed(() => {
  switch (props.booking.status) {
    case 'pending': return 'text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20'
    case 'approved': return 'text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20'
    case 'rejected': return 'text-xs font-bold bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/20'
    case 'cancelled': return 'text-xs font-bold bg-slate-500/10 text-slate-500 px-2.5 py-1 rounded-full border border-white/5'
    default: return 'text-xs font-bold bg-slate-500/10 text-slate-500 px-2.5 py-1 rounded-full border border-white/5'
  }
})

const statusText = computed(() => {
  switch (props.booking.status) {
    case 'pending': return '待审批'; case 'approved': return '已通过'
    case 'rejected': return '已驳回'; case 'cancelled': return '已取消'
    default: return props.booking.status
  }
})

const canCancel = computed(() => {
  if (props.booking.status !== 'pending' && props.booking.status !== 'approved') return false
  return new Date(props.booking.start_time) > new Date()
})

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const handleCancel = async () => {
  try { await api.delete(`/bookings/${props.booking.id}`); emit('cancel') } catch (e) { alert(e.response?.data?.error || '取消失败') }
}
</script>
