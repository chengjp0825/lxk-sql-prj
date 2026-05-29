<template>
  <div
    @click="$emit('select-room', room)"
    :class="[
      'p-4 rounded-lg cursor-pointer transition-all hover:scale-105',
      statusClass,
      room.current_status === 'available' ? 'hover:shadow-lg' : 'cursor-not-allowed'
    ]"
  >
    <h3 class="font-semibold text-white">{{ room.name }}</h3>
    <p class="text-white text-opacity-80 text-sm mt-1">{{ room.floor }} · {{ room.capacity }}人</p>
    <p class="text-white text-xs mt-2">{{ statusText }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  room: {
    type: Object,
    required: true
  }
})

defineEmits(['select-room'])

const statusClass = computed(() => {
  switch (props.room.current_status) {
    case 'available': return 'bg-green-500'
    case 'occupied': return 'bg-red-500'
    case 'disabled': return 'bg-gray-400'
    default: return 'bg-gray-400'
  }
})

const statusText = computed(() => {
  switch (props.room.current_status) {
    case 'available': return '空闲'
    case 'occupied': return '使用中'
    case 'disabled': return '停用'
    default: return '未知'
  }
})
</script>
