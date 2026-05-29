<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">九号楼会议室管理系统</h1>
        <div class="flex items-center gap-4">
          <span class="text-gray-600">欢迎, {{ username }}</span>
          <button
            @click="handleLogout"
            class="text-red-500 hover:text-red-600 text-sm font-medium"
          >
            退出登录
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex gap-6">
        <aside class="w-48 flex-shrink-0">
          <nav class="space-y-2">
            <button
              v-for="floor in floors"
              :key="floor"
              @click="selectedFloor = floor"
              :class="[
                'w-full text-left px-4 py-2 rounded-lg transition-colors',
                selectedFloor === floor
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ floor }}
            </button>
          </nav>
        </aside>

        <main class="flex-1">
          <RoomGrid
            :rooms="filteredRooms"
            @select-room="openRoomDetail"
          />
        </main>
      </div>
    </div>

    <RoomDetailModal
      v-if="selectedRoom"
      :room="selectedRoom"
      @close="selectedRoom = null"
      @booking-created="loadRooms"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import RoomGrid from '../components/RoomGrid.vue'
import RoomDetailModal from '../components/RoomDetailModal.vue'

const router = useRouter()
const username = localStorage.getItem('username') || '用户'
const rooms = ref([])
const selectedFloor = ref('1F')
const selectedRoom = ref(null)
const floors = computed(() => [...new Set(rooms.value.map(r => r.floor))].sort())
const filteredRooms = computed(() => rooms.value.filter(r => r.floor === selectedFloor.value))

onMounted(() => {
  loadRooms()
})

const loadRooms = async () => {
  try {
    const res = await api.get('/rooms')
    rooms.value = res.data.rooms
  } catch (e) {
    console.error('Failed to load rooms', e)
  }
}

const openRoomDetail = (room) => {
  if (room.current_status === 'available') {
    selectedRoom.value = room
  }
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
