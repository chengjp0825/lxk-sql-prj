<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex justify-between items-start">
      <div>
        <h4 class="font-medium">{{ booking.room?.name || '未知会议室' }}</h4>
        <p class="text-sm text-gray-500">{{ booking.room?.floor }}</p>
      </div>
      <span :class="statusClass">{{ statusText }}</span>
    </div>
    <p class="text-sm text-gray-600 mt-2">
      时间: {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}
    </p>
    <div v-if="canCancel" class="mt-3">
      <button
        @click="handleCancel"
        class="text-sm text-red-500 hover:text-red-600"
      >
        取消预约
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import api from '../api'

const props = defineProps({
  booking: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['cancel'])

const statusClass = computed(() => {
  switch (props.booking.status) {
    case 'pending': return 'text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'
    case 'approved': return 'text-xs bg-green-100 text-green-800 px-2 py-1 rounded'
    case 'rejected': return 'text-xs bg-red-100 text-red-800 px-2 py-1 rounded'
    case 'cancelled': return 'text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded'
    default: return 'text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded'
  }
})

const statusText = computed(() => {
  switch (props.booking.status) {
    case 'pending': return '待审批'
    case 'approved': return '已通过'
    case 'rejected': return '已驳回'
    case 'cancelled': return '已取消'
    default: return props.booking.status
  }
})

const canCancel = computed(() => {
  if (props.booking.status !== 'pending' && props.booking.status !== 'approved') return false
  const now = new Date()
  const start = new Date(props.booking.start_time)
  return start > now
})

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const handleCancel = async () => {
  try {
    await api.delete(`/bookings/${props.booking.id}`)
    emit('cancel')
  } catch (e) {
    console.error('Failed to cancel booking', e)
    alert(e.response?.data?.error || '取消失败')
  }
}
</script>
