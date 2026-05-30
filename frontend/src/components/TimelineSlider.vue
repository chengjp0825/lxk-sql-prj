<template>
  <div class="mt-2">
    <!-- Date + Title row -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Time</p>
        <p class="text-[10px] text-slate-600 mt-0.5">08:00 – 22:00 &middot; max 4h</p>
      </div>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none text-slate-500">&#x1F4C5;</span>
        <input type="date" v-model="selectedDate" :min="minDate"
          class="text-xs rounded-lg pl-8 pr-3 py-2 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium w-36"
          style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color-scheme: dark;" />
      </div>
    </div>

    <!-- Selection state hint -->
    <div class="mb-3 text-xs text-slate-500 flex items-center gap-2">
      <template v-if="selectionStep === 'IDLE' && endIndex === null">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
        Click a slot to set start time
      </template>
      <template v-else-if="selectionStep === 'SELECTING_END'">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
        Now click to set end time
      </template>
      <template v-else>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        Time selected &mdash; click anywhere to re-select
      </template>
    </div>

    <!-- Timeline grid -->
    <div class="p-4 rounded-xl" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);" @mouseleave="onMouseLeave">
      <div class="grid gap-[2px]" :style="{ gridTemplateColumns: `repeat(${slots.length}, 1fr)` }">
        <div v-for="(slot, index) in slots" :key="index"
          @click="onClick(index)"
          @mouseenter="onMouseEnter(index)"
          class="h-10 rounded-sm flex items-center justify-center text-[11px] font-semibold transition-all duration-100 select-none"
          :class="['cursor-pointer']"
          :style="slotStyle(slot, index)"
          :title="`${slot.start} – ${slot.end}`">
          <span v-if="shouldShowLabel(index)">{{ slot.start }}</span>
        </div>
      </div>

      <!-- Time axis labels -->
      <div class="flex justify-between mt-2.5 text-[10px] text-slate-600 font-medium">
        <span v-for="h in hours" :key="h">{{ h }}</span>
      </div>
    </div>

    <!-- Selected time display -->
    <div v-if="selectedRange" class="mt-4 flex items-center gap-3">
      <div class="flex items-center gap-2 flex-1 rounded-lg px-4 py-3" style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.15);">
        <span class="text-indigo-400 text-sm">&#x1F552;</span>
        <div>
          <p class="text-sm font-bold" style="color: #a5b4fc;">{{ selectedRange.start }} – {{ selectedRange.end }}</p>
          <p class="text-[10px] text-indigo-400/50 mt-0.5">{{ duration }} min &middot; {{ Math.floor(duration / 60) }}h{{ duration % 60 ? ` ${duration % 60}m` : '' }}</p>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="mt-3 text-xs text-rose-400 rounded-lg px-4 py-2.5 flex items-center gap-2" style="background: rgba(244,63,94,0.06); border: 1px solid rgba(244,63,94,0.1);">
      <span>&#x26A0;</span>{{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api'

const props = defineProps({ roomId: { type: Number, required: true } })
const emit = defineEmits(['select'])

const today = new Date()
const selectedDate = ref(today.toISOString().split('T')[0])
const minDate = today.toISOString().split('T')[0]
const slots = ref([])
const selectionStep = ref('IDLE')
const startIndex = ref(null)
const endIndex = ref(null)
const hoverIndex = ref(null)
const error = ref('')

const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

const shouldShowLabel = (index) => index % 2 === 0

const generateSlots = () => {
  const result = []
  let current = 8 * 60
  const endMinutes = 22 * 60
  while (current < endMinutes) {
    const h = Math.floor(current / 60); const m = current % 60
    const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    const nh = Math.floor((current + 30) / 60); const nm = (current + 30) % 60
    result.push({ start, end: `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`, status: 'available' })
    current += 30
  }
  return result
}

onMounted(() => loadTimeline())

const loadTimeline = async () => {
  try {
    const res = await api.get(`/rooms/${props.roomId}/timeline?date=${selectedDate.value}`)
    slots.value = res.data.slots
  } catch (e) { slots.value = generateSlots() }
}

watch(selectedDate, () => {
  startIndex.value = null; endIndex.value = null; hoverIndex.value = null
  selectionStep.value = 'IDLE'; emit('select', null); loadTimeline()
})

const findObstacle = (lo, hi) => {
  for (let i = lo; i <= hi; i++) { if (slots.value[i].status !== 'available') return i }
  return -1
}

const confirmedRange = computed(() => {
  if (startIndex.value === null || endIndex.value === null) return null
  const lo = Math.min(startIndex.value, endIndex.value)
  const hi = Math.max(startIndex.value, endIndex.value)
  return { lo, hi }
})

const previewRange = computed(() => {
  if (selectionStep.value !== 'SELECTING_END' || hoverIndex.value === null) return null
  let lo = Math.min(startIndex.value, hoverIndex.value)
  let hi = Math.max(startIndex.value, hoverIndex.value)
  const obs = findObstacle(lo, hi)
  if (obs >= 0) hi = obs - 1
  if (lo > hi) return null
  return { lo, hi }
})

const slotStyle = (slot, index) => {
  // Occupied / Pending
  if (slot.status === 'pending') return { background: 'rgba(245,158,11,0.1)', color: '#f59e0b', cursor: 'not-allowed', border: '1px solid transparent', opacity: '0.5' }
  if (slot.status === 'occupied') return { background: 'rgba(148,163,184,0.05)', color: '#475569', cursor: 'not-allowed', border: '1px solid transparent', opacity: '0.4' }

  const cr = confirmedRange.value
  const pr = previewRange.value

  // Confirmed range
  if (cr && index >= cr.lo && index <= cr.hi) {
    if (index === startIndex.value) return { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', borderRadius: '6px 0 0 6px' }
    if (index === endIndex.value) return { background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: '#fff', borderRadius: '0 6px 6px 0' }
    return { background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }
  }

  // Start marker (selecting)
  if (index === startIndex.value && selectionStep.value === 'SELECTING_END')
    return { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', borderRadius: '6px', boxShadow: '0 0 12px rgba(99,102,241,0.4), 0 0 0 2px rgba(99,102,241,0.15)' }

  // Preview range
  if (pr && index >= pr.lo && index <= pr.hi) return { background: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }

  // Default available
  return {
    background: 'rgba(16,185,129,0.08)',
    color: '#34d399',
    border: '1px solid rgba(16,185,129,0.1)'
  }
}

const onClick = (index) => {
  if (slots.value[index].status !== 'available') return

  if (selectionStep.value === 'IDLE') {
    error.value = ''; endIndex.value = null
    startIndex.value = index; selectionStep.value = 'SELECTING_END'; hoverIndex.value = index
    return
  }

  if (selectionStep.value === 'SELECTING_END') {
    if (index === startIndex.value) return
    const lo = Math.min(startIndex.value, index); const hi = Math.max(startIndex.value, index)

    const obstacle = findObstacle(lo, hi)
    if (obstacle >= 0) {
      error.value = 'Selection crosses occupied time slots'
      startIndex.value = null; endIndex.value = null; selectionStep.value = 'IDLE'; hoverIndex.value = null
      emit('select', null); return
    }

    const dur = (hi - lo) * 30
    if (dur > 240) {
      error.value = 'Maximum booking duration is 4 hours'
      startIndex.value = null; endIndex.value = null; selectionStep.value = 'IDLE'; hoverIndex.value = null
      emit('select', null); return
    }

    startIndex.value = lo; endIndex.value = hi
    emit('select', { start: slots.value[lo].start, end: slots.value[hi].start, duration: dur, date: selectedDate.value })
    selectionStep.value = 'IDLE'; hoverIndex.value = null
  }
}

const onMouseEnter = (index) => { if (selectionStep.value === 'SELECTING_END') hoverIndex.value = index }
const onMouseLeave = () => { if (selectionStep.value === 'SELECTING_END') hoverIndex.value = null }

const selectedRange = computed(() => {
  if (startIndex.value === null) return null
  if (endIndex.value !== null) return { start: slots.value[startIndex.value].start, end: slots.value[endIndex.value].start }
  if (selectionStep.value === 'SELECTING_END' && hoverIndex.value !== null) {
    const lo = Math.min(startIndex.value, hoverIndex.value)
    const hi = Math.max(startIndex.value, hoverIndex.value)
    return { start: slots.value[lo].start, end: slots.value[hi].start }
  }
  return null
})

const duration = computed(() => {
  if (startIndex.value === null) return 0
  if (endIndex.value !== null) return Math.abs(endIndex.value - startIndex.value) * 30
  if (hoverIndex.value !== null) return Math.abs(hoverIndex.value - startIndex.value) * 30
  return 0
})
</script>
