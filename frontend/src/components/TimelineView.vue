<template>
  <div class="timeline-scroller rounded-xl border" style="background: #0c1018; border-color: rgba(255,255,255,0.06);">
    <!-- Date picker bar -->
    <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color: rgba(255,255,255,0.04);">
      <div class="flex items-center gap-3">
        <span class="text-sm font-bold text-slate-300 uppercase tracking-wider">{{ rooms[0]?.floor || 'Floor' }}</span>
        <span class="text-[11px] text-slate-500">{{ rooms.length }} rooms</span>
      </div>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-slate-500">&#x1F4C5;</span>
        <input type="date" v-model="selectedDate" :min="minDate"
          class="text-sm rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium w-40"
          style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color-scheme: dark;" />
      </div>
    </div>
    <div class="overflow-x-auto w-full">
      <div :style="{ minWidth: `${28 * 56 + 144}px`, width: '100%' }">
        <!-- Column headers -->
        <div class="sticky top-0 z-10 flex" style="background: #0f141e;">
          <div class="flex-shrink-0 w-36 px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-r" style="border-color: rgba(255,255,255,0.04);">
            Time
          </div>
          <div class="flex border-b" style="border-color: rgba(255,255,255,0.06);">
            <div v-for="slot in timeHeaders" :key="slot.label"
              class="flex-shrink-0 text-center text-[11px] font-semibold py-3.5 border-r"
              :style="{ width: '56px', color: slot.hour ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)', borderColor: slot.hour ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)' }">
              {{ slot.label }}
            </div>
          </div>
        </div>

        <!-- Room rows -->
        <div v-for="room in rooms" :key="room.id" class="flex group">
          <div @click="selectRoom(room)"
            class="flex-shrink-0 w-36 px-4 py-3.5 flex flex-col justify-center border-r border-b cursor-pointer transition-colors"
            :style="{ borderColor: 'rgba(255,255,255,0.04)', background: room.current_status === 'available' ? 'transparent' : 'rgba(255,255,255,0.005)' }"
            :class="room.current_status === 'available' ? 'hover:bg-white/[0.03]' : ''">
            <p class="text-sm font-bold truncate" :style="{ color: room.current_status === 'available' ? '#e2e8f0' : '#64748b' }">
              {{ room.name }}
            </p>
            <p class="text-[11px] mt-1 opacity-70" :style="{ color: room.current_status === 'available' ? '#34d399' : '#f87171' }">
              {{ room.capacity }}p
            </p>
          </div>
          <div class="flex">
            <div v-for="(slot, si) in (roomSlots[room.id] || [])" :key="si"
              @click="slot.status === 'available' ? bookSlot(room, si) : undefined"
              class="flex-shrink-0 border-r border-b flex items-center justify-center"
              :class="slot.status === 'available' ? 'cursor-pointer hover:brightness-150' : ''"
              :style="slotCellStyle(slot, si)"
              :title="slot.title">
              <span v-if="slot.status !== 'available'" class="text-[9px] font-bold opacity-70">{{ slot.status === 'occupied' ? 'BUSY' : 'PEND' }}</span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex items-center gap-6 px-4 py-3 border-t text-[11px] font-medium" style="border-color: rgba(255,255,255,0.04);">
          <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.35);"></span><span class="text-slate-400">Free</span></span>
          <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: rgba(239,68,68,0.25); border: 1px solid rgba(239,68,68,0.35);"></span><span class="text-slate-400">Occupied</span></span>
          <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: rgba(245,158,11,0.18); border: 1px solid rgba(245,158,11,0.3);"></span><span class="text-slate-400">Pending</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api'

const props = defineProps({ rooms: { type: Array, required: true } })
const emit = defineEmits(['select-room', 'book-slot'])

const now = new Date()
const selectedDate = ref(now.toISOString().split('T')[0])
const minDate = now.toISOString().split('T')[0]
const roomSlots = ref({})

const timeHeaders = computed(() => {
  const headers = []
  for (let h = 8; h < 22; h++) {
    headers.push({ label: `${String(h).padStart(2, '0')}:00`, hour: true })
    headers.push({ label: `${String(h).padStart(2, '0')}:30`, hour: false })
  }
  return headers
})

const loadAllTimelines = async () => {
  const map = {}
  await Promise.all(props.rooms.map(async (room) => {
    try {
      const res = await api.get(`/rooms/${room.id}/timeline?date=${selectedDate.value}`)
      map[room.id] = (res.data.slots || []).map(s => ({
        ...s,
        title: `${room.name} ${s.start}–${s.end} (${s.status})`
      }))
    } catch {
      // Generate empty slots as fallback
      const slots = []
      for (let h = 8; h < 22; h++) {
        for (let m = 0; m < 60; m += 30) {
          const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
          const eh = m === 30 ? h + 1 : h
          const em = m === 30 ? 0 : 30
          const end = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`
          slots.push({ status: 'available', start, end, title: `${room.name} ${start}–${end}` })
        }
      }
      map[room.id] = slots
    }
  }))
  roomSlots.value = map
}

const slotCellStyle = (slot, index) => {
  const base = { width: '56px', height: '52px', borderColor: 'rgba(255,255,255,0.02)' }
  if (slot.status === 'occupied') return { ...base, background: 'rgba(239,68,68,0.18)', borderLeft: '1px solid rgba(239,68,68,0.12)', color: '#fca5a5' }
  if (slot.status === 'pending') return { ...base, background: 'rgba(245,158,11,0.12)', borderLeft: '1px solid rgba(245,158,11,0.1)', color: '#fcd34d' }
  const even = index % 2 === 0
  return {
    ...base,
    background: even ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.005)',
    borderLeft: even ? '1px solid rgba(255,255,255,0.03)' : '1px solid transparent'
  }
}

const selectRoom = (room) => {
  emit('select-room', room)
}

const bookSlot = (room, slotIndex) => {
  const slot = (roomSlots.value[room.id] || [])[slotIndex]
  if (!slot || slot.status !== 'available') return
  emit('book-slot', { room, start: slot.start, date: props.date })
}

onMounted(() => loadAllTimelines())
watch([() => props.rooms, selectedDate], () => loadAllTimelines())
</script>
