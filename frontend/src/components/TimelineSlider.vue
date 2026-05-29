<template>
  <div class="mt-4">
    <div class="flex items-center gap-3 mb-3">
      <h4 class="text-sm font-semibold text-slate-700">选择时间段 (最多4小时)</h4>
      <input
        type="date"
        v-model="selectedDate"
        :min="minDate"
        class="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
      />
    </div>
    <div class="flex flex-wrap gap-1 p-3 bg-slate-100 rounded-xl" @mouseleave="onMouseLeave">
      <div
        v-for="(slot, index) in slots"
        :key="index"
        @click="onClick(index)"
        @mouseenter="onMouseEnter(index)"
        :class="[
          'w-8 h-8 rounded-md text-[10px] font-medium flex items-center justify-center cursor-pointer transition-all duration-150',
          getSlotClass(slot, index)
        ]"
      >
        {{ slot.start }}
      </div>
    </div>
    <div class="mt-2 flex justify-between text-xs text-gray-500">
      <span>08:00</span>
      <span>22:00</span>
    </div>
    <div v-if="selectedRange" class="mt-3 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
      已选择：{{ selectedRange.start }} - {{ selectedRange.end }}
      <span class="text-indigo-400">（{{ duration }}分钟）</span>
    </div>
    <div v-if="error" class="mt-2 text-sm text-rose-500 bg-rose-50 rounded-lg px-3 py-2">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api'

const props = defineProps({
  roomId: {
    type: Number,
    required: true
  }
})

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

const generateSlots = () => {
  const result = []
  let current = 8 * 60
  const end = 22 * 60
  while (current < end) {
    const hours = Math.floor(current / 60)
    const minutes = current % 60
    const start = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    const endTime = current + 30
    const endHours = Math.floor(endTime / 60)
    const endMinutes = endTime % 60
    const endStr = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
    result.push({ start, end: endStr, status: 'available' })
    current = endTime
  }
  return result
}

onMounted(() => {
  loadTimeline()
})

const loadTimeline = async () => {
  try {
    const res = await api.get(`/rooms/${props.roomId}/timeline?date=${selectedDate.value}`)
    slots.value = res.data.slots
  } catch (e) {
    slots.value = generateSlots()
  }
}

watch(selectedDate, () => {
  startIndex.value = null
  endIndex.value = null
  hoverIndex.value = null
  selectionStep.value = 'IDLE'
  emit('select', null)
  loadTimeline()
})

const findObstacle = (lo, hi) => {
  for (let i = lo; i <= hi; i++) {
    if (slots.value[i].status !== 'available') return i
  }
  return -1
}

const getSlotClass = (slot, index) => {
  if (slot.status === 'pending') return 'bg-amber-100 text-amber-600 cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'
  if (slot.status === 'occupied') return 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)]'

  let previewLo = null
  let previewHi = null
  if (selectionStep.value === 'SELECTING_END' && hoverIndex.value !== null) {
    previewLo = Math.min(startIndex.value, hoverIndex.value)
    previewHi = Math.max(startIndex.value, hoverIndex.value)
    const obs = findObstacle(previewLo, previewHi)
    if (obs >= 0) previewHi = obs - 1
  }
  const inPreview = previewLo !== null && index >= previewLo && index <= previewHi

  if (endIndex.value !== null) {
    const lo = Math.min(startIndex.value, endIndex.value)
    const hi = Math.max(startIndex.value, endIndex.value)
    if (index === startIndex.value) return 'bg-indigo-600 text-white shadow-[0_3px_0_0_rgba(67,56,202,0.4)]'
    if (index >= lo && index <= hi) return 'bg-indigo-400 text-white shadow-[0_2px_0_0_rgba(99,102,241,0.3)]'
  }

  if (index === startIndex.value) return 'bg-indigo-500 text-white ring-2 ring-indigo-200 ring-offset-1 shadow-[0_3px_0_0_rgba(99,102,241,0.3)]'
  if (inPreview) return 'bg-indigo-200 text-indigo-700 shadow-[0_2px_0_0_rgba(165,180,252,0.4)]'
  return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-[0_2px_0_0_rgba(16,185,129,0.2)] hover:shadow-[0_3px_0_0_rgba(16,185,129,0.3)] hover:-translate-y-0.5'
}

const onClick = (index) => {
  if (slots.value[index].status !== 'available') return

  if (selectionStep.value === 'IDLE') {
    error.value = ''
    endIndex.value = null
    startIndex.value = index
    selectionStep.value = 'SELECTING_END'
    hoverIndex.value = index
    return
  }

  if (selectionStep.value === 'SELECTING_END') {
    if (index === startIndex.value) return
    const lo = Math.min(startIndex.value, index)
    const hi = Math.max(startIndex.value, index)

    const obstacle = findObstacle(lo, hi)
    if (obstacle >= 0) {
      error.value = '选择的时间段包含已占用时间'
      startIndex.value = null
      endIndex.value = null
      selectionStep.value = 'IDLE'
      hoverIndex.value = null
      emit('select', null)
      return
    }

    const dur = (hi - lo) * 30
    if (dur > 240) {
      error.value = '单次预约最长4小时'
      startIndex.value = null
      endIndex.value = null
      selectionStep.value = 'IDLE'
      hoverIndex.value = null
      emit('select', null)
      return
    }

    startIndex.value = lo
    endIndex.value = hi
    emit('select', {
      start: slots.value[lo].start,
      end: slots.value[hi].start,
      duration: dur,
      date: selectedDate.value
    })
    selectionStep.value = 'IDLE'
    hoverIndex.value = null
  }
}

const onMouseEnter = (index) => {
  if (selectionStep.value === 'SELECTING_END') {
    hoverIndex.value = index
  }
}

const onMouseLeave = () => {
  if (selectionStep.value === 'SELECTING_END') {
    hoverIndex.value = null
  }
}

const selectedRange = computed(() => {
  if (startIndex.value === null) return null
  if (endIndex.value !== null) {
    return { start: slots.value[startIndex.value].start, end: slots.value[endIndex.value].start }
  }
  if (selectionStep.value === 'SELECTING_END' && hoverIndex.value !== null) {
    const lo = Math.min(startIndex.value, hoverIndex.value)
    const hi = Math.max(startIndex.value, hoverIndex.value)
    return { start: slots.value[lo].start, end: slots.value[hi].start }
  }
  return null
})

const duration = computed(() => {
  if (startIndex.value === null) return 0
  if (endIndex.value !== null) {
    return Math.abs(endIndex.value - startIndex.value) * 30
  }
  if (hoverIndex.value !== null) {
    return Math.abs(hoverIndex.value - startIndex.value) * 30
  }
  return 0
})
</script>
