<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-start gap-3">
        <span class="text-xl">&#x1F3E2;</span>
        <div>
          <h4 class="font-semibold text-slate-800">{{ booking.room?.name || '未知会议室' }}</h4>
          <p class="text-sm text-slate-400">{{ booking.room?.floor }}</p>
        </div>
      </div>
      <span class="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">待审批</span>
    </div>
    <div class="space-y-1.5 mb-4 text-sm text-slate-500 pl-10">
      <p>&#x1F464; 申请人：{{ booking.user?.username || '未知' }}</p>
      <p>&#x1F552; {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}</p>
    </div>
    <div class="flex gap-2">
      <button
        @click="handleApprove"
        :disabled="loading"
        class="flex-1 px-4 py-2 bg-emerald-500 text-white text-sm rounded-xl hover:bg-emerald-600 disabled:bg-slate-300 transition-colors font-semibold shadow-sm active:scale-[0.98]"
      >
        {{ loading ? '处理中...' : '通过' }}
      </button>
      <button
        @click="handleReject"
        :disabled="loading"
        class="flex-1 px-4 py-2 bg-rose-500 text-white text-sm rounded-xl hover:bg-rose-600 disabled:bg-slate-300 transition-colors font-semibold shadow-sm active:scale-[0.98]"
      >
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
  try {
    await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'approved' })
    emit('action')
  } catch (e) { console.error('Failed to approve', e) }
  finally { loading.value = false }
}

const handleReject = async () => {
  loading.value = true
  try {
    await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'rejected' })
    emit('action')
  } catch (e) { console.error('Failed to reject', e) }
  finally { loading.value = false }
}
</script>
