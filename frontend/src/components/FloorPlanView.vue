<template>
  <div class="relative rounded-xl border overflow-hidden" style="background: #0a0f18; border-color: rgba(56,189,248,0.12); min-height: 400px;">

    <!-- CAD Grid -->
    <div class="absolute inset-0 opacity-30" style="background-image: linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px); background-size: 20px 20px;"></div>

    <!-- Building outline - thick walls -->
    <div class="absolute" style="top: 24px; left: 24px; right: 24px; bottom: 24px; border: 3px solid rgba(56,189,248,0.2); border-radius: 4px; box-shadow: inset 0 0 60px rgba(56,189,248,0.03);"></div>

    <!-- Corridor - central void -->
    <div class="absolute left-8 right-8 flex items-center border-y border-dashed" style="top: 42%; height: 40px; border-color: rgba(56,189,248,0.1);">
      <div class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full" style="background: rgba(56,189,248,0.3); box-shadow: 0 0 8px rgba(56,189,248,0.3);"></div>
    </div>

    <!-- Legend -->
    <div class="absolute top-5 right-5 flex gap-5 z-10 font-mono text-xs">
      <span class="flex items-center gap-2"><span class="w-3 h-3 border" style="background: rgba(16,185,129,0.25); border-color: #10b981;"></span><span style="color: #10b981;">Available</span></span>
      <span class="flex items-center gap-2"><span class="w-3 h-3 border" style="background: rgba(239,68,68,0.2); border-color: #ef4444;"></span><span style="color: #ef4444;">Occupied</span></span>
      <span class="flex items-center gap-2"><span class="w-3 h-3 border" style="background: rgba(100,116,139,0.08); border-color: #475569;"></span><span style="color: #475569;">Closed</span></span>
    </div>

    <!-- North arrow -->
    <div class="absolute top-5 left-5 text-center font-mono" style="color: rgba(56,189,248,0.4);">
      <div class="text-xs font-bold">N</div>
      <div class="w-0.5 h-3 mx-auto mt-0.5" style="background: rgba(56,189,248,0.3);"></div>
      <div class="w-0 h-0 mx-auto border-4 border-transparent border-t-4" style="border-top-color: rgba(56,189,248,0.3);"></div>
    </div>

    <!-- Scale bar -->
    <div class="absolute bottom-5 right-5 font-mono text-[9px] flex items-center gap-1" style="color: rgba(56,189,248,0.3);">
      <div class="w-8 h-0.5" style="background: rgba(56,189,248,0.3);"></div>5m
    </div>

    <!-- Rooms -->
    <div class="relative" style="height: 440px; margin: 32px;">
      <div v-for="room in rooms" :key="room.id"
        @mousedown="editable ? startDrag($event, room) : undefined"
        @click="!dragging && selectRoom(room)"
        class="absolute border transition-all duration-200 flex flex-col items-center justify-center text-center overflow-hidden"
        :class="[
          editable ? 'cursor-grab active:cursor-grabbing' : '',
          room.current_status === 'available' ? 'cursor-pointer hover:z-10' : 'cursor-default'
        ]"
        :style="getRoomStyle(room)">
        <!-- Room number plaque -->
        <span class="font-mono font-bold text-xs tracking-tight leading-none mb-1" :style="{ color: roomTextClr(room) }">
          {{ room.name.replace(/[^0-9]/g, '') }}
        </span>
        <span class="text-[10px] font-mono opacity-50 leading-tight" :style="{ color: roomTextClr(room) }">
          {{ room.capacity }}p
        </span>
        <!-- Drag handle -->
        <div v-if="editable" class="absolute bottom-0 right-0 w-3 h-3"
          style="background: linear-gradient(135deg, transparent 50%, rgba(56,189,248,0.15) 50%);"></div>
      </div>
    </div>

    <!-- Admin tooltip -->
    <div v-if="editable" class="absolute bottom-3 left-5 font-mono text-[9px]" style="color: rgba(56,189,248,0.25);">
      Drag to position &middot; corner to resize
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const props = defineProps({
  rooms: { type: Array, required: true },
  editable: { type: Boolean, default: false }
})
const emit = defineEmits(['select-room', 'positions-updated'])
const dragging = ref(false)

let dragRoom, dragStartX, dragStartY, dragOrigX, dragOrigY
let resizeRoom, resizeStartW, resizeStartH, resizeStartX, resizeStartY

const roomColors = (room) => {
  switch (room.current_status) {
    case 'available': return { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', text: '#34d399' }
    case 'occupied': return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.18)', text: '#f87171' }
    default: return { bg: 'rgba(100,116,139,0.04)', border: 'rgba(100,116,139,0.08)', text: '#64748b' }
  }
}

const getRoomStyle = (room) => {
  const c = roomColors(room)
  return {
    left: `${room.pos_x || 0}%`,
    top: `${room.pos_y || 0}%`,
    width: `${room.width_pct || 15}%`,
    height: `${room.height_pct || 15}%`,
    background: c.bg,
    borderColor: c.border,
    borderRadius: '2px'
  }
}

const roomTextClr = (room) => roomColors(room).text

const selectRoom = (room) => {
  if (room.current_status === 'available') emit('select-room', room)
}

const startDrag = (e, room) => {
  if (!props.editable) return; e.preventDefault()
  dragging.value = true
  dragRoom = room; dragStartX = e.clientX; dragStartY = e.clientY
  dragOrigX = room.pos_x; dragOrigY = room.pos_y
  document.addEventListener('mousemove', onDrag); document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (!dragRoom) return
  const el = document.querySelector('.floorplan-stage') || e.target.closest('.relative')
  if (!el) return
  const r = el.getBoundingClientRect()
  dragRoom.pos_x = Math.max(0, Math.min(88, dragOrigX + ((e.clientX - dragStartX) / r.width) * 100))
  dragRoom.pos_y = Math.max(0, Math.min(85, dragOrigY + ((e.clientY - dragStartY) / r.height) * 100))
}

const stopDrag = async () => {
  document.removeEventListener('mousemove', onDrag); document.removeEventListener('mouseup', stopDrag)
  if (dragRoom) { await save(dragRoom); dragRoom = null }
  setTimeout(() => { dragging.value = false }, 100)
}

const startResize = (e, room) => {
  if (!props.editable) return; e.stopPropagation(); e.preventDefault()
  resizeRoom = room; resizeStartX = e.clientX; resizeStartY = e.clientY
  resizeStartW = room.width_pct; resizeStartH = room.height_pct
  document.addEventListener('mousemove', onResize); document.addEventListener('mouseup', stopResize)
}

const onResize = (e) => {
  if (!resizeRoom) return
  const el = e.target.closest('.relative')
  if (!el) return
  const r = el.getBoundingClientRect()
  resizeRoom.width_pct = Math.max(6, resizeStartW + ((e.clientX - resizeStartX) / r.width) * 100)
  resizeRoom.height_pct = Math.max(6, resizeStartH + ((e.clientY - resizeStartY) / r.height) * 100)
}

const stopResize = async () => {
  document.removeEventListener('mousemove', onResize); document.removeEventListener('mouseup', stopResize)
  if (resizeRoom) { await save(resizeRoom); resizeRoom = null }
}

const save = async (room) => {
  try {
    await api.patch(`/admin/rooms/${room.id}/position`, {
      pos_x: room.pos_x, pos_y: room.pos_y, width_pct: room.width_pct, height_pct: room.height_pct
    })
  } catch (e) { console.error(e) }
}
</script>
