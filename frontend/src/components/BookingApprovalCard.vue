<template>
  <div class="border border-gray-200 rounded-lg p-4">
    <div class="flex justify-between items-start mb-2">
      <div>
        <h4 class="font-medium">{{ booking.room?.name || '未知会议室' }}</h4>
        <p class="text-sm text-gray-500">{{ booking.room?.floor }}</p>
      </div>
      <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">待审批</span>
    </div>
    <p class="text-sm text-gray-600 mb-2">
      申请人: {{ booking.user?.username || '未知' }}
    </p>
    <p class="text-sm text-gray-600 mb-4">
      时间: {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}
    </p>
    <div class="flex gap-2">
      <button
        @click="handleApprove"
        :disabled="loading"
        class="flex-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300"
      >
        {{ loading ? '处理中...' : '通过' }}
      </button>
      <button
        @click="handleReject"
        :disabled="loading"
        class="flex-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-300"
      >
        驳回
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['action'])
const loading = ref(false)

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const handleApprove = async () => {
  loading.value = true
  try {
    await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'approved' })
    emit('action')
  } catch (e) {
    console.error('Failed to approve', e)
  } finally {
    loading.value = false
  }
}

const handleReject = async () => {
  loading.value = true
  try {
    await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'rejected' })
    emit('action')
  } catch (e) {
    console.error('Failed to reject', e)
  } finally {
    loading.value = false
  }
}
</script>
