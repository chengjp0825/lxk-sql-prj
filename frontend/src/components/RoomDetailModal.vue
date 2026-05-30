<template>
  <div class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50" @click.self="$emit('close')">
    <div class="rounded-2xl w-full max-w-2xl mx-4 overflow-hidden" style="background: var(--bg-secondary); border: 1px solid var(--border-default); box-shadow: 0 0 80px rgba(99,102,241,0.1), 0 24px 64px rgba(0,0,0,0.4);">
      <div class="px-6 pt-6 pb-4 flex items-start justify-between">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style="background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.15);">{{ roomIcon }}</div>
          <div><h3 class="text-base font-bold" style="color: var(--text-primary);">{{ room.name }}</h3><p class="text-xs mt-0.5" style="color: var(--text-secondary);"><span class="inline-flex items-center gap-1 mr-3"><span class="w-1 h-1 rounded-full" style="background: var(--text-muted);"></span>{{ room.floor }}</span><span class="inline-flex items-center gap-1"><span class="w-1 h-1 rounded-full" style="background: var(--text-muted);"></span>{{ room.capacity }} people</span></p></div>
        </div>
        <button @click="$emit('close')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-lg" style="color: var(--text-muted);">&times;</button>
      </div>
      <div class="px-6 pb-2"><TimelineSlider v-if="room.id" :room-id="room.id" @select="handleSelect" /></div>
      <div class="px-6 py-4 flex items-center gap-3 border-t" style="border-color: var(--border-subtle); background: var(--bg-hover);">
        <button @click="$emit('close')" class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all" style="color: var(--text-secondary);">Cancel</button>
        <button @click="handleSubmit" :disabled="!selectedTime || loading" class="flex-1 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
          :style="selectedTime && !loading ? 'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; box-shadow: 0 0 20px rgba(99,102,241,0.25), 0 3px 0 0 rgba(79,70,229,0.25);' : 'background: var(--bg-input); color: var(--text-muted);'">
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          <span v-if="loading">Submitting</span><span v-else-if="success">Booked!</span><span v-else-if="selectedTime">Book {{ selectedTime.start }} – {{ selectedTime.end }}</span><span v-else>Pick a time slot</span>
        </button>
      </div>
      <div v-if="error" class="px-6 pb-4"><div class="text-xs rounded-lg px-4 py-2.5 flex items-center gap-2" style="background: rgba(244,63,94,0.06); border: 1px solid rgba(244,63,94,0.1); color: #fda4af;"><span>⚠</span>{{ error }}</div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api'
import TimelineSlider from './TimelineSlider.vue'
const props = defineProps({ room: { type: Object, required: true } })
const emit = defineEmits(['close', 'booking-created'])
const selectedTime = ref(null); const loading = ref(false); const success = ref(false); const error = ref('')
const roomIcon = props.room.capacity <= 6 ? '\u{1F4AC}' : props.room.capacity <= 15 ? '\u{1F4CA}' : '\u{1F3A4}'
const handleSelect = (time) => { selectedTime.value = time; error.value = '' }
const handleSubmit = async () => {
  if (!selectedTime.value || loading.value) return
  loading.value = true; error.value = ''; success.value = false
  try {
    const dateStr = selectedTime.value.date || new Date().toISOString().split('T')[0]
    const [sh,sm]=selectedTime.value.start.split(':'); const [eh,em]=selectedTime.value.end.split(':')
    await api.post('/bookings', { room_id: props.room.id, start_time: `${dateStr}T${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}:00`, end_time: `${dateStr}T${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}:00` })
    success.value = true; emit('booking-created'); setTimeout(() => emit('close'), 800)
  } catch (e) { error.value = e.response?.data?.error || 'Failed to book' } finally { loading.value = false }
}
</script>
