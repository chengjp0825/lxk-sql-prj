<template>
  <div class="mt-4">
    <h4 class="text-sm font-medium text-gray-700 mb-2">选择时间段 (最多4小时)</h4>
    <div class="flex flex-wrap gap-1 p-2 bg-gray-100 rounded-lg">
      <div
        v-for="(slot, index) in slots"
        :key="index"
        @click="toggleSlot(index)"
        :class="[
          'w-8 h-8 rounded text-xs flex items-center justify-center cursor-pointer transition-colors',
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
    <div v-if="selectedRange" class="mt-2 text-sm text-gray-600">
      已选择: {{ selectedRange.start }} - {{ selectedRange.end }}
      <span class="text-gray-400">({{ duration }}分钟)</span>
    </div>
    <div v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</div>
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

const slots = ref([])
const selectedIndices = ref([])
const error = ref('')
const today = new Date().toISOString().split('T')[0]

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
    const date = new Date().toISOString().split('T')[0]
    const res = await api.get(`/rooms/${props.roomId}/timeline?date=${date}`)
    slots.value = res.data.slots
  } catch (e) {
    slots.value = generateSlots()
  }
}

const getSlotClass = (slot, index) => {
  if (slot.status === 'occupied') return 'bg-gray-400 text-white cursor-not-allowed'
  if (selectedIndices.value.includes(index)) return 'bg-blue-500 text-white'
  return 'bg-green-500 text-white hover:bg-green-600'
}

const toggleSlot = (index) => {
  const slot = slots.value[index]
  if (slot.status === 'occupied') return

  error.value = ''
  if (selectedIndices.value.includes(index)) {
    selectedIndices.value = selectedIndices.value.filter(i => i !== index)
  } else {
    if (selectedIndices.value.length === 0) {
      selectedIndices.value = [index]
    } else {
      const minIndex = Math.min(...selectedIndices.value)
      const maxIndex = Math.max(...selectedIndices.value)

      if (index >= minIndex && index <= maxIndex) {
        const occupiedInRange = slots.value.slice(minIndex, maxIndex + 1).some(s => s.status === 'occupied')
        if (occupiedInRange) {
          selectedIndices.value = [index]
        } else {
          selectedIndices.value = Array.from({ length: maxIndex - minIndex + 2 }, (_, i) => minIndex + i)
        }
      } else if (index < minIndex) {
        const rangeEnd = index + (maxIndex - minIndex) + 1
        const range = Array.from({ length: minIndex - index }, (_, i) => index + i)
        const hasOccupied = slots.value.slice(index, minIndex).some(s => s.status === 'occupied')
        if (!hasOccupied) {
          selectedIndices.value = [...range, ...selectedIndices.value].sort((a, b) => a - b)
        } else {
          selectedIndices.value = [index]
        }
      } else {
        const hasOccupied = slots.value.slice(maxIndex + 1, index + 1).some(s => s.status === 'occupied')
        if (!hasOccupied) {
          selectedIndices.value = [...selectedIndices.value, ...Array.from({ length: index - maxIndex }, (_, i) => maxIndex + 1 + i)]
        } else {
          selectedIndices.value = [index]
        }
      }
    }
  }

  validateSelection()
}

const validateSelection = () => {
  if (selectedIndices.value.length === 0) {
    emit('select', null)
    return
  }

  const minIdx = Math.min(...selectedIndices.value)
  const maxIdx = Math.max(...selectedIndices.value)
  const selectedSlots = slots.value.slice(minIdx, maxIdx + 1)

  const occupied = selectedSlots.some(s => s.status === 'occupied')
  if (occupied) {
    error.value = '选择的时间段包含已占用时间'
    emit('select', null)
    return
  }

  const duration = (maxIdx - minIdx + 1) * 30
  if (duration > 240) {
    error.value = '单次预约最长4小时'
    emit('select', null)
    return
  }

  const firstSlot = slots.value[minIdx]
  const lastSlot = slots.value[maxIdx]

  emit('select', {
    start: firstSlot.start,
    end: lastSlot.end,
    duration
  })
}

const selectedRange = computed(() => {
  if (selectedIndices.value.length === 0) return null
  const minIdx = Math.min(...selectedIndices.value)
  const maxIdx = Math.max(...selectedIndices.value)
  return {
    start: slots.value[minIdx].start,
    end: slots.value[maxIdx].end
  }
})

const duration = computed(() => {
  if (selectedIndices.value.length === 0) return 0
  return selectedIndices.value.length * 30
})
</script>
