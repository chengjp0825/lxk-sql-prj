<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <RoomCard
      v-for="room in rooms"
      :key="room.id"
      :room="room"
      @select-room="$emit('select-room', room)"
    />
  </div>
</template>

<script setup>
import RoomCard from './RoomCard.vue'

defineProps({
  rooms: {
    type: Array,
    required: true
  }
})

defineEmits(['select-room'])
</script>
