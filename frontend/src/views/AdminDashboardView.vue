<template>
  <div class="min-h-screen" style="background: #0a0d14;">
    <header class="sticky top-0 z-40" style="background: linear-gradient(180deg, rgba(15,18,25,0.98), rgba(10,13,20,0.95)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05);">
      <div class="max-w-7xl mx-auto px-8 py-3.5 flex justify-between items-center">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style="background: linear-gradient(135deg, #f43f5e, #e11d48); box-shadow: 0 4px 0 0 rgba(225,29,72,0.2), 0 0 20px rgba(244,63,94,0.2);">&#x1F6E0;</div>
            <div>
              <h1 class="text-base font-extrabold text-white tracking-tight leading-none">Admin Panel</h1>
              <p class="text-[10px] text-rose-400/60 font-medium tracking-wide mt-0.5">MANAGEMENT CONSOLE</p>
            </div>
          </div>
          <div class="flex items-center gap-1 rounded-lg p-0.5" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.04);">
            <span class="px-4 py-1.5 rounded-md text-xs font-bold text-white transition-all"
              style="background: rgba(244,63,94,0.15);">Admin</span>
            <router-link to="/dashboard" class="px-4 py-1.5 rounded-md text-xs font-bold text-slate-400 hover:text-white transition-all">User View</router-link>
          </div>
        </div>

        <div class="flex items-center gap-5">
          <div class="flex items-center gap-3 pl-2 border-l" style="border-color: rgba(255,255,255,0.06);">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
              style="background: linear-gradient(135deg, #f43f5e, #e11d48);">
              {{ (username || 'A')[0].toUpperCase() }}
            </div>
            <p class="text-sm font-semibold text-slate-200">{{ username }}</p>
            <button @click="handleLogout"
              class="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:text-white/70"
              style="color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.06);">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-8 py-10">
      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div class="rounded-xl p-5 border" style="background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05);">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Rooms</p>
          <p class="text-3xl font-bold text-white">{{ rooms.length }}</p>
        </div>
        <div class="rounded-xl p-5 border" style="background: rgba(16,185,129,0.04); border-color: rgba(16,185,129,0.1);">
          <p class="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider mb-2">Active</p>
          <p class="text-3xl font-bold text-emerald-400">{{ activeCount }}</p>
        </div>
        <div class="rounded-xl p-5 border" style="background: rgba(100,116,139,0.04); border-color: rgba(100,116,139,0.1);">
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Disabled</p>
          <p class="text-3xl font-bold text-slate-400">{{ disabledCount }}</p>
        </div>
        <div class="rounded-xl p-5 border" :style="pendingCount > 0 ? 'background: rgba(239,68,68,0.04); border-color: rgba(239,68,68,0.15);' : 'background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05);'">
          <p class="text-[10px] font-bold uppercase tracking-wider mb-2" :style="pendingCount > 0 ? 'color: rgba(239,68,68,0.7);' : 'color: #64748b;'">Pending</p>
          <p class="text-3xl font-bold" :style="pendingCount > 0 ? 'color: #f87171;' : 'color: #64748b;'">{{ pendingCount }}</p>
        </div>
      </div>

      <!-- Room Management -->
      <div class="rounded-2xl border p-6 mb-10 shadow-[0_0_60px_rgba(99,102,241,0.03)]"
        style="background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.05);">
        <div class="flex items-end justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold text-white">Rooms</h2>
            <p class="text-xs text-slate-500 mt-1">Manage meeting rooms across all floors</p>
          </div>
          <div class="flex gap-2">
            <input v-model="newRoom.name" placeholder="Room name" class="w-36 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/40 transition-all" />
            <input v-model="newRoom.floor" placeholder="Floor" class="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/40 transition-all" />
            <input v-model.number="newRoom.capacity" placeholder="Cap" type="number" class="w-16 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/40 transition-all" />
            <button @click="createRoom" class="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all active:scale-95"
              style="background: linear-gradient(135deg, #6366f1, #8b5cf6); box-shadow: 0 0 12px rgba(99,102,241,0.2);">
              + Add Room
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b" style="border-color: rgba(255,255,255,0.04);">
                <th class="text-left py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th class="text-left py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Floor</th>
                <th class="text-left py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                <th class="text-left py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current</th>
                <th class="text-left py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th class="text-right py-2.5 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.id" class="border-b transition-colors hover:bg-white/[0.02]" style="border-color: rgba(255,255,255,0.02);">
                <td class="py-3 px-3 text-sm font-semibold text-slate-200">{{ room.name }}</td>
                <td class="py-3 px-3 text-xs text-slate-500">{{ room.floor }}</td>
                <td class="py-3 px-3 text-xs text-slate-500">{{ room.capacity }}p</td>
                <td class="py-3 px-3">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    :style="currentStyle(room)">
                    {{ currentLabel(room) }}
                  </span>
                </td>
                <td class="py-3 px-3">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    :class="room.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'">
                    {{ room.status === 'active' ? 'Active' : 'Disabled' }}
                  </span>
                </td>
                <td class="py-3 px-3 text-right">
                  <button @click="toggleRoomStatus(room)" class="text-xs font-medium transition-colors"
                    :style="room.status === 'active' ? 'color: #f87171;' : 'color: #34d399;'">
                    {{ room.status === 'active' ? 'Disable' : 'Enable' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Bookings -->
      <div class="rounded-2xl border p-6 shadow-[0_0_60px_rgba(99,102,241,0.03)]"
        style="background: rgba(255,255,255,0.01); border-color: rgba(255,255,255,0.05);">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-bold text-white">Pending Approvals</h2>
            <p class="text-xs text-slate-500 mt-1">Review and manage booking requests</p>
          </div>
          <span v-if="pendingCount > 0" class="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            {{ pendingCount }} pending
          </span>
        </div>
        <div v-if="pendingBookings.length === 0" class="text-center py-16">
          <span class="text-5xl opacity-20 block mb-3">&#x2705;</span>
          <p class="text-slate-500 text-sm">All caught up — no pending approvals</p>
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BookingApprovalCard v-for="booking in pendingBookings" :key="booking.id" :booking="booking" @action="handleBookingAction" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import BookingApprovalCard from '../components/BookingApprovalCard.vue'

const router = useRouter()
const username = localStorage.getItem('username') || 'Admin'
const rooms = ref([])
const pendingBookings = ref([])
const newRoom = ref({ name: '', floor: '', capacity: '' })

const activeCount = computed(() => rooms.value.filter(r => r.status === 'active').length)
const disabledCount = computed(() => rooms.value.filter(r => r.status === 'disabled').length)
const pendingCount = computed(() => pendingBookings.value.length)

const currentLabel = (room) => {
  if (room.status === 'disabled') return 'Closed'
  if (room.current_status === 'occupied') return 'Busy'
  return 'Free'
}

const currentStyle = (room) => {
  if (room.status === 'disabled') return { background: 'rgba(100,116,139,0.08)', borderColor: 'rgba(100,116,139,0.12)', color: '#94a3b8' }
  if (room.current_status === 'occupied') return { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.12)', color: '#fca5a5' }
  return { background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.12)', color: '#6ee7b7' }
}

onMounted(() => { loadData() })

const loadData = async () => {
  try {
    const [roomsRes, bookingsRes] = await Promise.all([api.get('/admin/rooms'), api.get('/admin/bookings')])
    rooms.value = roomsRes.data.rooms; pendingBookings.value = bookingsRes.data.bookings
  } catch (e) { console.error(e) }
}

const createRoom = async () => {
  if (!newRoom.value.name || !newRoom.value.floor || !newRoom.value.capacity) return
  try { await api.post('/admin/rooms', newRoom.value); newRoom.value = { name: '', floor: '', capacity: '' }; await loadData() } catch (e) { console.error(e) }
}

const toggleRoomStatus = async (room) => {
  try { await api.patch(`/admin/rooms/${room.id}/status`, { status: room.status === 'active' ? 'disabled' : 'active' }); await loadData() } catch (e) { console.error(e) }
}

const handleBookingAction = async () => { await loadData() }

const handleLogout = () => {
  localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username')
  router.push('/login')
}
</script>
