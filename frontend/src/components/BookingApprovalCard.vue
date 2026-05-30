<template>
  <div class="glass rounded-xl border border-white/5 p-5 hover:border-white/10 transition-all">
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-start gap-3">
        <span class="text-xl">&#x1F3E2;</span>
        <div>
          <h4 class="font-bold text-white">{{ booking.room?.name || '未知会议室' }}</h4>
          <p class="text-sm text-slate-500">{{ booking.room?.floor }}</p>
        </div>
      </div>
      <span class="text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">待审批</span>
    </div>
    <div class="space-y-1.5 mb-4 text-sm text-slate-400 pl-10">
      <p>&#x1F464; 申请人：{{ booking.user?.username || '未知' }}</p>
      <p>&#x1F552; {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}</p>
    </div>
    <div class="flex gap-2">
      <button @click="handleApprove" :disabled="loading"
        class="flex-1 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-30"
        style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 16px rgba(16,185,129,0.2);">
        {{ loading ? '...' : '通过' }}
      </button>
      <button @click="handleReject" :disabled="loading"
        class="flex-1 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-30"
        style="background: linear-gradient(135deg, #f43f5e, #e11d48); box-shadow: 0 0 16px rgba(244,63,94,0.2);">
        驳回
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const props = defineProps({ booking: { type: Object, required: true } })
const emit = defineEmits(['action'])
const loading = ref(false)

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const handleApprove = async () => {
  loading.value = true
  try { await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'approved' }); emit('action') } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleReject = async () => {
  loading.value = true
  try { await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'rejected' }); emit('action') } catch (e) { console.error(e) }
  finally { loading.value = false }
}
</script>
