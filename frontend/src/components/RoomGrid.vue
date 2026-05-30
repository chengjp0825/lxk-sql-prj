<template>
  <div>
    <div v-if="rooms.length === 0" class="text-center py-20">
      <span class="text-6xl opacity-10 block mb-4">&#x1F3E2;</span>
      <p class="text-sm" style="color: var(--text-muted);">该楼层暂无会议室</p>
    </div>
    <div v-else>
      <div class="flex items-center gap-3 mb-5">
        <div class="h-px flex-1" style="background: linear-gradient(90deg, transparent, var(--border-default));"></div>
        <span class="text-[10px] font-bold uppercase tracking-[0.3em]" style="color: var(--text-muted);">Rooms</span>
        <div class="h-px flex-1" style="background: linear-gradient(90deg, var(--border-default), transparent);"></div>
      </div>
      <div class="grid grid-cols-6 gap-5"><RoomCard v-for="room in rooms" :key="room.id" :room="room" @select-room="$emit('select-room', room)" /></div>
    </div>
  </div>
</template>

<script setup>
import RoomCard from './RoomCard.vue'
defineProps({ rooms: { type: Array, required: true } })
defineEmits(['select-room'])
</script>
