<template>
  <div class="min-h-screen bg-slate-100">
    <header class="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div class="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_3px_0_0_rgba(79,70,229,0.2)]">
            <span class="text-white text-sm">&#x1F3E2;</span>
          </div>
          <h1 class="text-lg font-bold text-slate-800 tracking-tight">九号楼会议室管理系统</h1>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/my-bookings" class="text-sm text-indigo-500 hover:text-indigo-600 font-medium transition-colors">我的预约</router-link>
          <span class="text-sm text-slate-500">欢迎，{{ username }}</span>
          <button @click="handleLogout" class="text-sm text-slate-400 hover:text-rose-500 transition-colors font-medium">退出</button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex gap-8">
        <aside class="w-52 flex-shrink-0">
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 px-1">楼层导航</p>
          <nav class="space-y-1.5">
            <button
              v-for="floor in floors"
              :key="floor"
              @click="selectedFloor = floor"
              :class="[
                'w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm',
                selectedFloor === floor
                  ? 'bg-slate-800 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.15),0_8px_24px_-4px_rgba(0,0,0,0.2)] translate-x-1'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-[0_2px_0_0_rgba(0,0,0,0.03)] hover:shadow-[0_3px_0_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5'
              ]"
            >
              <span class="text-xs mr-2 opacity-60">&#x25A0;</span>{{ floor }}
            </button>
          </nav>

          <div class="mt-8 p-4 bg-white rounded-xl border border-slate-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
            <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">状态图例</p>
            <div class="space-y-2.5 text-xs text-slate-500">
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded shadow-[0_2px_0_0_rgba(16,185,129,0.3)] bg-gradient-to-b from-emerald-400 to-emerald-500"></span> 空闲可预约
              </div>
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded shadow-[0_2px_0_0_rgba(244,63,94,0.3)] bg-gradient-to-b from-rose-400 to-rose-500"></span> 使用中
              </div>
              <div class="flex items-center gap-2.5">
                <span class="w-3 h-3 rounded shadow-[0_2px_0_0_rgba(148,163,184,0.3)] bg-gradient-to-b from-slate-300 to-slate-400"></span> 已停用
              </div>
            </div>
          </div>
        </aside>

        <main class="flex-1 min-w-0">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-[0_4px_0_0_rgba(0,0,0,0.03),0_12px_32px_-8px_rgba(0,0,0,0.08)] p-8"
               style="background-image: radial-gradient(circle, #e2e8f0 1px, transparent 1px); background-size: 20px 20px;">
            <h2 class="text-lg font-bold text-slate-800 mb-0.5">{{ selectedFloor }} 楼层平面图</h2>
            <p class="text-sm text-slate-400 mb-6">{{ filteredRooms.length }} 间会议室 &middot; 点击绿色房间即可预约</p>
            <RoomGrid
              :rooms="filteredRooms"
              @select-room="openRoomDetail"
            />
          </div>
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

onMounted(() => { loadRooms() })

const loadRooms = async () => {
  try {
    const res = await api.get('/rooms')
    rooms.value = res.data.rooms
    if (!floors.value.includes(selectedFloor.value) && floors.value.length > 0) {
      selectedFloor.value = floors.value[0]
    }
  } catch (e) {
    console.error('Failed to load rooms', e)
  }
}

const openRoomDetail = (room) => {
  if (room.current_status === 'available') selectedRoom.value = room
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
