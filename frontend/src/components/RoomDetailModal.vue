<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="rounded-2xl w-full max-w-2xl mx-4 overflow-hidden"
      style="background: linear-gradient(180deg, rgba(20,24,35,0.98), rgba(15,18,25,0.98)); border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 0 80px rgba(99,102,241,0.1), 0 24px 64px rgba(0,0,0,0.4);">

      <!-- Header -->
      <div class="px-6 pt-6 pb-4 flex items-start justify-between">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style="background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.15);">
            {{ roomIcon }}
          </div>
          <div>
            <h3 class="text-base font-bold text-white">{{ room.name }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">
              <span class="inline-flex items-center gap-1 mr-3"><span class="w-1 h-1 rounded-full bg-slate-600"></span>{{ room.floor }}</span>
              <span class="inline-flex items-center gap-1"><span class="w-1 h-1 rounded-full bg-slate-600"></span>{{ room.capacity }} people</span>
            </p>
          </div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors text-lg">&times;</button>
      </div>

      <!-- Timeline -->
      <div class="px-6 pb-2">
        <TimelineSlider v-if="room.id" :room-id="room.id" @select="handleSelect" />
      </div>

      <!-- Footer -->
      <div class="px-6 py-5 flex items-center gap-3 border-t" style="border-color: rgba(255,255,255,0.04); background: rgba(0,0,0,0.15);">
        <button @click="$emit('close')" :disabled="loading"
          class="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30">
          Cancel
        </button>
        <button @click="handleSubmit" :disabled="!selectedTime || loading || success"
          class="flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2"
          :style="buttonStyle">
          <!-- Spinner -->
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <!-- Success check -->
          <span v-else-if="success" class="text-lg">&#x2705;</span>
          <!-- Text -->
          <span v-if="loading">Submitting</span>
          <span v-else-if="success">Booked!</span>
          <span v-else-if="selectedTime">Book {{ selectedTime.start }} – {{ selectedTime.end }}</span>
          <span v-else>Pick a time slot</span>
        </button>
      </div>

      <!-- Error toast -->
      <div v-if="error" class="px-6 pb-4">
        <div class="text-xs rounded-lg px-4 py-2.5 flex items-center gap-2" style="background: rgba(244,63,94,0.06); border: 1px solid rgba(244,63,94,0.1); color: #fda4af;">
          <span>&#x26A0;</span>{{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api'
import TimelineSlider from './TimelineSlider.vue'

const props = defineProps({ room: { type: Object, required: true } })
const emit = defineEmits(['close', 'booking-created'])
const selectedTime = ref(null)
const loading = ref(false)
const success = ref(false)
const error = ref('')

const roomIcon = props.room.capacity <= 6 ? '\u{1F4AC}' : props.room.capacity <= 15 ? '\u{1F4CA}' : '\u{1F3A4}'

const buttonStyle = computed(() => {
  if (success.value) return { background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 0 24px rgba(16,185,129,0.4)' }
  if (loading.value) return { background: 'rgba(99,102,241,0.3)', color: '#c7d2fe' }
  if (selectedTime.value) return { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 0 20px rgba(99,102,241,0.25), 0 3px 0 0 rgba(79,70,229,0.25)' }
  return { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.2)' }
})

const handleSelect = (time) => { selectedTime.value = time; error.value = '' }

const handleSubmit = async () => {
  if (!selectedTime.value || loading.value) return
  loading.value = true; error.value = ''; success.value = false
  try {
    const dateStr = selectedTime.value.date || new Date().toISOString().split('T')[0]
    const [sh, sm] = selectedTime.value.start.split(':')
    const [eh, em] = selectedTime.value.end.split(':')
    const st = `${dateStr}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`
    const et = `${dateStr}T${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}:00`
    await api.post('/bookings', { room_id: props.room.id, start_time: st, end_time: et })
    success.value = true
    emit('booking-created')
    setTimeout(() => { emit('close') }, 800)
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to book'
  } finally { loading.value = false }
}
</script>
