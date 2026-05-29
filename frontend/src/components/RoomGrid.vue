<template>
  <div>
    <div v-if="rooms.length === 0" class="text-center text-slate-400 py-16">
      <span class="text-4xl opacity-50">&#x1F3E2;</span>
      <p class="mt-2">该楼层暂无会议室</p>
    </div>
    <template v-else>
      <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3 items-end pb-2">
        <RoomCard
          v-for="room in topRooms"
          :key="room.id"
          :room="room"
          @select-room="$emit('select-room', room)"
        />
      </div>
      <div class="relative flex items-center my-5">
        <div class="flex-1 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div class="mx-4 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-semibold text-slate-400 tracking-widest uppercase shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          走廊 Corridor
        </div>
        <div class="flex-1 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
      </div>
      <div class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-3 items-start pt-2">
        <RoomCard
          v-for="room in bottomRooms"
          :key="room.id"
          :room="room"
          @select-room="$emit('select-room', room)"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RoomCard from './RoomCard.vue'

const props = defineProps({ rooms: { type: Array, required: true } })
defineEmits(['select-room'])

const topRooms = computed(() => {
  const mid = Math.ceil(props.rooms.length / 2)
  return props.rooms.slice(0, mid)
})

const bottomRooms = computed(() => {
  const mid = Math.ceil(props.rooms.length / 2)
  return props.rooms.slice(mid)
})
</script>
