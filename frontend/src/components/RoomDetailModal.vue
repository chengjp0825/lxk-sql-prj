<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">{{ room.name }}</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <p class="text-gray-600 text-sm mb-4">{{ room.floor }} · {{ room.capacity }}人</p>

      <TimelineSlider
        v-if="room.id"
        :room-id="room.id"
        @select="handleSelect"
      />

      <div class="mt-6 flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          @click="handleSubmit"
          :disabled="!selectedTime || loading"
          class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {{ loading ? '提交中...' : '提交预约' }}
        </button>
      </div>

      <div v-if="error" class="mt-3 text-red-500 text-sm">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'
import TimelineSlider from './TimelineSlider.vue'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'booking-created'])

const selectedTime = ref(null)
const loading = ref(false)
const error = ref('')

const handleSelect = (time) => {
  selectedTime.value = time
  error.value = ''
}

const handleSubmit = async () => {
  if (!selectedTime.value) return

  loading.value = true
  error.value = ''

  try {
    const today = new Date()
    const startDate = new Date(today.toDateString())
    const [startHour, startMin] = selectedTime.value.start.split(':')
    const [endHour, endMin] = selectedTime.value.end.split(':')

    const startTime = new Date(startDate)
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0, 0)
    const endTime = new Date(startDate)
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0, 0)

    await api.post('/bookings', {
      room_id: props.room.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    })

    emit('booking-created')
    emit('close')
  } catch (e) {
    error.value = e.response?.data?.error || '预约失败'
  } finally {
    loading.value = false
  }
}
</script>
