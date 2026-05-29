<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4"
         style="box-shadow: 0 8px 0 0 rgba(0,0,0,0.04), 0 24px 64px -16px rgba(0,0,0,0.15);">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h3 class="text-lg font-bold text-slate-800">{{ room.name }}</h3>
          <p class="text-sm text-slate-400">{{ room.floor }} · {{ room.capacity }}人</p>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">&times;</button>
      </div>

      <TimelineSlider
        v-if="room.id"
        :room-id="room.id"
        @select="handleSelect"
      />

      <div class="mt-6 flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium"
        >
          取消
        </button>
        <button
          @click="handleSubmit"
          :disabled="!selectedTime || loading"
          class="flex-1 px-4 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-semibold shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
        >
          {{ loading ? '提交中...' : '提交预约' }}
        </button>
      </div>

      <div v-if="error" class="mt-3 text-sm text-rose-500 bg-rose-50 rounded-lg px-3 py-2">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'
import TimelineSlider from './TimelineSlider.vue'

const props = defineProps({ room: { type: Object, required: true } })
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
    const dateStr = selectedTime.value.date || new Date().toISOString().split('T')[0]
    const [startHour, startMin] = selectedTime.value.start.split(':')
    const [endHour, endMin] = selectedTime.value.end.split(':')
    const startTime = new Date(`${dateStr}T${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}:00`)
    const endTime = new Date(`${dateStr}T${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}:00`)
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
