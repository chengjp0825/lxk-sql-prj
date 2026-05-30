<template>
  <div class="min-h-screen" style="background: #0a0d14;">
    <!-- Header -->
    <header class="sticky top-0 z-40" style="background: linear-gradient(180deg, rgba(15,18,25,0.98), rgba(10,13,20,0.95)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
      <div class="max-w-7xl mx-auto px-8 py-3.5 flex justify-between items-center">
        <!-- Left: Logo + nav -->
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style="background: linear-gradient(135deg, #6366f1, #8b5cf6); box-shadow: 0 4px 0 0 rgba(79,70,229,0.2), 0 0 20px rgba(99,102,241,0.2);">&#x1F3E2;</div>
            <div>
              <h1 class="text-base font-extrabold text-white tracking-tight leading-none">Building 9</h1>
              <p class="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">MEETING ROOM SYSTEM</p>
            </div>
          </div>
          <!-- Nav pills -->
          <div class="flex items-center gap-1 rounded-lg p-0.5" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04);">
            <span class="px-4 py-1.5 rounded-md text-xs font-bold text-white transition-all"
              style="background: rgba(255,255,255,0.06);">Dashboard</span>
            <router-link v-if="isAdmin" to="/admin" class="px-4 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-white transition-all">Admin Panel</router-link>
          </div>
        </div>

        <!-- Right: actions -->
        <div class="flex items-center gap-5">
          <!-- My Bookings button -->
          <router-link to="/my-bookings"
            class="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style="background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.12); color: #a5b4fc;">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            My Bookings
            <span v-if="badge" class="absolute -top-2 -right-2 min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-extrabold text-white animate-pulse"
              :style="{ background: badge.color, boxShadow: `0 0 10px ${badge.color}` }">
              {{ badge.count > 9 ? '9+' : badge.count }}
            </span>
          </router-link>

          <!-- User avatar -->
          <div class="flex items-center gap-3 pl-2 border-l" style="border-color: rgba(255,255,255,0.06);">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
              style="background: linear-gradient(135deg, #f43f5e, #e11d48);">
              {{ (username || 'U')[0].toUpperCase() }}
            </div>
            <div class="text-left">
              <p class="text-sm font-semibold text-slate-200 leading-none">{{ username }}</p>
              <p class="text-[10px] text-slate-500 mt-1">{{ isAdmin ? 'Administrator' : 'User' }}</p>
            </div>
            <button @click="handleLogout"
              class="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-white/70"
              style="color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.06);">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-8 py-10">
      <div class="flex gap-12">
        <!-- Sidebar -->
        <aside class="w-60 flex-shrink-0">
          <p class="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-5 px-1">Floors</p>
          <nav class="space-y-2">
            <button v-for="floor in floors" :key="floor" @click="selectedFloor = floor"
              class="w-full text-left rounded-xl transition-all duration-300 relative overflow-hidden group"
              :class="selectedFloor === floor ? 'translate-x-1' : ''"
              :style="selectedFloor === floor
                ? 'background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08)); border: 1px solid rgba(99,102,241,0.25); box-shadow: 0 0 20px rgba(99,102,241,0.08);'
                : 'border: 1px solid rgba(255,255,255,0.03);'">
              <!-- Left accent bar (selected only) -->
              <div v-if="selectedFloor === floor" class="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                style="background: linear-gradient(180deg, #818cf8, #a78bfa); box-shadow: 0 0 8px rgba(129,140,248,0.6);"></div>

              <div class="px-5 py-4">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-bold text-base" :class="selectedFloor === floor ? 'text-white' : 'text-slate-300'">
                    {{ floor }}
                  </span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded-full"
                    :style="selectedFloor === floor
                      ? 'background: rgba(99,102,241,0.2); color: #a5b4fc;'
                      : 'background: rgba(255,255,255,0.04); color: #475569;'">
                    {{ floorStats[floor]?.total || 0 }}
                  </span>
                </div>
                <!-- Status dots row -->
                <div class="flex items-center gap-2 mt-2">
                  <span class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"
                      :style="selectedFloor === floor ? 'box-shadow: 0 0 5px rgba(16,185,129,0.5);' : ''"></span>
                    <span class="text-[11px] font-medium" :class="selectedFloor === floor ? 'text-emerald-400' : 'text-slate-600'">
                      {{ floorStats[floor]?.available || 0 }}
                    </span>
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-rose-400"
                      :style="selectedFloor === floor ? 'box-shadow: 0 0 5px rgba(244,63,94,0.5);' : ''"></span>
                    <span class="text-[11px] font-medium" :class="selectedFloor === floor ? 'text-rose-400' : 'text-slate-600'">
                      {{ floorStats[floor]?.occupied || 0 }}
                    </span>
                  </span>
                </div>
              </div>
            </button>
          </nav>

          <!-- Legend - cleaner -->
          <div class="mt-8 p-5 rounded-xl border" style="background: rgba(255,255,255,0.015); border-color: rgba(255,255,255,0.04);">
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-4">Legend</p>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm">
                <span class="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)] flex-shrink-0"></span>
                <span class="text-slate-300 font-medium">Available</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <span class="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.4)] flex-shrink-0"></span>
                <span class="text-slate-300 font-medium">Occupied</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <span class="w-3 h-3 rounded-full bg-slate-600 flex-shrink-0"></span>
                <span class="text-slate-300 font-medium">Closed</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main -->
        <main class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-white">{{ selectedFloor }}</h2>
              <p class="text-sm text-slate-500 mt-1.5">{{ filteredRooms.length }} rooms &middot; click an available room to book</p>
            </div>
            <div class="flex rounded-lg border p-0.5" style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.06);">
              <button @click="viewMode = 'card'"
                :class="['px-5 py-2 rounded-md text-sm font-semibold transition-all', viewMode === 'card' ? 'text-white' : 'text-slate-500 hover:text-slate-300']"
                :style="viewMode === 'card' ? { background: 'rgba(255,255,255,0.08)' } : {}">Cards</button>
              <button @click="viewMode = 'timeline'"
                :class="['px-5 py-2 rounded-md text-sm font-semibold transition-all', viewMode === 'timeline' ? 'text-white' : 'text-slate-500 hover:text-slate-300']"
                :style="viewMode === 'timeline' ? { background: 'rgba(255,255,255,0.08)' } : {}">Timeline</button>
              <button @click="viewMode = 'floorplan'"
                :class="['px-5 py-2 rounded-md text-sm font-semibold transition-all', viewMode === 'floorplan' ? 'text-white' : 'text-slate-500 hover:text-slate-300']"
                :style="viewMode === 'floorplan' ? { background: 'rgba(255,255,255,0.08)' } : {}">Floor Plan</button>
            </div>
          </div>
          <template v-if="viewMode === 'floorplan'">
            <FloorPlanView :rooms="filteredRooms" :editable="isAdmin" @select-room="openRoomDetail" />
          </template>
          <template v-else-if="viewMode === 'timeline'">
            <TimelineView :rooms="filteredRooms" @select-room="openRoomDetail" />
          </template>
          <template v-else>
            <RoomGrid :rooms="filteredRooms" @select-room="openRoomDetail" />
          </template>
        </main>
      </div>
    </div>

    <RoomDetailModal v-if="selectedRoom" :room="selectedRoom" @close="selectedRoom = null" @booking-created="onBookingCreated" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import RoomGrid from '../components/RoomGrid.vue'
import FloorPlanView from '../components/FloorPlanView.vue'
import TimelineView from '../components/TimelineView.vue'
import RoomDetailModal from '../components/RoomDetailModal.vue'
import { useNotifications } from '../composables/useNotifications.js'

const router = useRouter()
const { badge, poke } = useNotifications()
const viewMode = ref('card')
const isAdmin = localStorage.getItem('role') === 'admin'
const username = localStorage.getItem('username') || 'Guest'
const rooms = ref([])
const selectedFloor = ref('1F')
const selectedRoom = ref(null)
const floors = computed(() => [...new Set(rooms.value.map(r => r.floor))].sort())
const filteredRooms = computed(() => rooms.value.filter(r => r.floor === selectedFloor.value))
const floorStats = computed(() => {
  const map = {}
  rooms.value.forEach(r => {
    if (!map[r.floor]) map[r.floor] = { total: 0, available: 0, occupied: 0, disabled: 0 }
    map[r.floor].total++
    if (r.current_status === 'available') map[r.floor].available++
    else if (r.current_status === 'occupied') map[r.floor].occupied++
    else map[r.floor].disabled++
  })
  return map
})

onMounted(() => { loadRooms() })

const loadRooms = async () => {
  try {
    const res = await api.get('/rooms')
    rooms.value = res.data.rooms
    if (!floors.value.includes(selectedFloor.value) && floors.value.length > 0) selectedFloor.value = floors.value[0]
  } catch (e) { console.error(e) }
}

const openRoomDetail = (room) => {
  if (room.current_status === 'available') selectedRoom.value = room
}

const onBookingCreated = () => {
  loadRooms()
  poke()
}

const handleLogout = () => {
  localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username')
  router.push('/login')
}
</script>
