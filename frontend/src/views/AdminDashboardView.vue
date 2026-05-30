<template>
  <div class="min-h-screen" style="background: var(--bg-primary);">
    <header class="sticky top-0 z-40" style="background: var(--header-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-default);">
      <div class="max-w-7xl mx-auto px-8 py-3.5 flex justify-between items-center">
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style="background: linear-gradient(135deg, #f43f5e, #e11d48); box-shadow: 0 4px 0 0 rgba(225,29,72,0.2), 0 0 20px rgba(244,63,94,0.2);">&#x1F6E0;</div>
            <div>
              <h1 class="text-base font-extrabold tracking-tight leading-none" style="color: var(--text-primary);">Admin Panel</h1>
              <p class="text-[10px] text-rose-400/60 font-medium tracking-wide mt-0.5">MANAGEMENT CONSOLE</p>
            </div>
          </div>
          <div class="flex items-center gap-1 rounded-lg p-0.5" style="background: var(--bg-card); border: 1px solid var(--border-subtle);">
            <span class="px-4 py-1.5 rounded-md text-xs font-bold text-white" style="background: rgba(244,63,94,0.15);">Admin</span>
            <router-link to="/dashboard" class="px-4 py-1.5 rounded-md text-xs font-bold transition-all" style="color: var(--text-secondary);">User View</router-link>
          </div>
        </div>

        <div class="flex items-center gap-5">
          <button @click="toggleTheme" class="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all hover:scale-110"
            style="background: var(--bg-input); border: 1px solid var(--border-subtle);" :title="isDark() ? 'Switch to light' : 'Switch to dark'">
            {{ isDark() ? '☀️' : '\u{1F319}' }}
          </button>

          <div class="flex items-center gap-3 pl-2 border-l" style="border-color: var(--border-default);">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold text-white"
              style="background: linear-gradient(135deg, #f43f5e, #e11d48);">
              {{ (username || 'A')[0].toUpperCase() }}
            </div>
            <p class="text-sm font-semibold" style="color: var(--text-primary);">{{ username }}</p>
            <button @click="handleLogout" class="ml-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style="color: var(--text-muted); border: 1px solid var(--border-default);">Logout</button>
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-8 py-10">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div class="rounded-xl p-6 border" style="background: var(--bg-card); border-color: var(--border-subtle);">
          <p class="text-xs font-bold uppercase tracking-wider mb-2" style="color: var(--text-muted);">Total Rooms</p>
          <p class="text-4xl font-extrabold" style="color: var(--text-primary);">{{ rooms.length }}</p>
        </div>
        <div class="rounded-xl p-6 border" style="background: var(--color-available-bg); border-color: rgba(16,185,129,0.15);">
          <p class="text-xs font-bold text-emerald-500/70 uppercase tracking-wider mb-2">Active</p>
          <p class="text-4xl font-extrabold text-emerald-400">{{ activeCount }}</p>
        </div>
        <div class="rounded-xl p-6 border" style="background: var(--bg-card); border-color: var(--border-subtle);">
          <p class="text-xs font-bold uppercase tracking-wider mb-2" style="color: var(--text-muted);">Disabled</p>
          <p class="text-4xl font-extrabold" style="color: var(--text-secondary);">{{ disabledCount }}</p>
        </div>
        <div class="rounded-xl p-6 border" :style="pendingCount > 0 ? 'background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2);' : 'background: var(--bg-card); border-color: var(--border-subtle);'">
          <p class="text-xs font-bold uppercase tracking-wider mb-2" :style="pendingCount > 0 ? 'color: rgba(239,68,68,0.7);' : 'color: var(--text-muted);'">Pending</p>
          <p class="text-4xl font-extrabold" :style="pendingCount > 0 ? 'color: #f87171;' : 'color: var(--text-secondary);'">{{ pendingCount }}</p>
        </div>
      </div>

      <div class="rounded-2xl border p-8 mb-10" style="background: var(--bg-card); border-color: var(--border-subtle);">
        <div class="flex items-center justify-between mb-8">
          <div><h2 class="text-xl font-bold" style="color: var(--text-primary);">Meeting Rooms</h2><p class="text-sm mt-1" style="color: var(--text-secondary);">Add, edit, or toggle room availability</p></div>
          <button @click="startAdd" v-if="!adding" class="px-5 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95 flex items-center gap-2"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6); box-shadow: 0 0 16px rgba(99,102,241,0.2);"><span class="text-lg">+</span> Add Room</button>
        </div>

        <div v-if="adding" class="mb-6 p-5 rounded-xl border flex items-end gap-4"
          style="background: rgba(99,102,241,0.05); border-color: rgba(99,102,241,0.15);">
          <div><label class="block text-xs font-bold uppercase tracking-wider mb-1.5" style="color: var(--text-muted);">Name</label><input v-model="newRoom.name" placeholder="e.g. 401研讨室" class="w-40 px-4 py-3 border rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/40 transition-all" style="background: var(--bg-input); border-color: var(--border-strong);" /></div>
          <div><label class="block text-xs font-bold uppercase tracking-wider mb-1.5" style="color: var(--text-muted);">Floor</label><input v-model="newRoom.floor" placeholder="e.g. 4F" class="w-24 px-4 py-3 border rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/40 transition-all" style="background: var(--bg-input); border-color: var(--border-strong);" /></div>
          <div><label class="block text-xs font-bold uppercase tracking-wider mb-1.5" style="color: var(--text-muted);">Capacity</label><input v-model.number="newRoom.capacity" placeholder="0" type="number" class="w-24 px-4 py-3 border rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/40 transition-all" style="background: var(--bg-input); border-color: var(--border-strong);" /></div>
          <button @click="createRoom" class="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-95" style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 0 12px rgba(16,185,129,0.2);">Create</button>
          <button @click="cancelAdd" class="px-6 py-3 rounded-xl text-sm font-bold transition-all border" style="color: var(--text-secondary); border-color: var(--border-strong);">Cancel</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead><tr class="border-b" style="border-color: var(--border-subtle);">
              <th class="text-left py-3.5 px-4 text-xs font-bold uppercase tracking-wider w-48" style="color: var(--text-muted);">Name</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Floor</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Capacity</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Now</th>
              <th class="text-left py-3.5 px-4 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Status</th>
              <th class="text-right py-3.5 px-4 text-xs font-bold uppercase tracking-wider w-48" style="color: var(--text-muted);">Actions</th>
            </tr></thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.id" class="border-b transition-colors" style="border-color: var(--border-subtle);" :style="{ background: editingId === room.id ? 'var(--bg-hover)' : 'transparent' }">
                <td class="py-4 px-4">
                  <input v-if="editingId === room.id" v-model="editForm.name" class="w-full px-3 py-2 bg-white/5 border border-indigo-400/30 rounded-lg text-base font-bold text-white focus:outline-none" />
                  <span v-else class="text-base font-bold" style="color: var(--text-primary);">{{ room.name }}</span>
                </td>
                <td class="py-4 px-4">
                  <input v-if="editingId === room.id" v-model="editForm.floor" class="w-20 px-3 py-2 bg-white/5 border border-indigo-400/30 rounded-lg text-sm text-white focus:outline-none" />
                  <span v-else class="text-sm font-medium" style="color: var(--text-secondary);">{{ room.floor }}</span>
                </td>
                <td class="py-4 px-4">
                  <input v-if="editingId === room.id" v-model.number="editForm.capacity" type="number" class="w-20 px-3 py-2 bg-white/5 border border-indigo-400/30 rounded-lg text-sm text-white focus:outline-none" />
                  <span v-else class="text-sm font-medium" style="color: var(--text-secondary);">{{ room.capacity }}p</span>
                </td>
                <td class="py-4 px-4"><span class="text-xs font-bold px-3 py-1 rounded-full border" :style="currentStyle(room)">{{ currentLabel(room) }}</span></td>
                <td class="py-4 px-4"><span :class="room.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'" class="text-xs font-bold px-3 py-1 rounded-full border">{{ room.status === 'active' ? 'Active' : 'Off' }}</span></td>
                <td class="py-4 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <template v-if="editingId === room.id">
                      <button @click="saveEdit(room)" class="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all active:scale-95" style="background: linear-gradient(135deg, #10b981, #059669);">Save</button>
                      <button @click="cancelEdit" class="px-4 py-2 rounded-lg text-xs font-bold transition-all border" style="color: var(--text-secondary); border-color: var(--border-strong);">Cancel</button>
                    </template>
                    <template v-else>
                      <button @click="startEdit(room)" class="px-3 py-2 rounded-lg text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-all">Edit</button>
                      <button @click="toggleRoomStatus(room)" class="px-3 py-2 rounded-lg text-xs font-bold transition-all" :style="room.status === 'active' ? 'color: #f87171;' : 'color: #34d399;'">{{ room.status === 'active' ? 'Disable' : 'Enable' }}</button>
                    </template>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border p-8" style="background: var(--bg-card); border-color: var(--border-subtle);">
        <div class="flex items-center justify-between mb-8">
          <div><h2 class="text-xl font-bold" style="color: var(--text-primary);">Pending Approvals</h2><p class="text-sm mt-1" style="color: var(--text-secondary);">Review and manage booking requests</p></div>
          <span v-if="pendingCount > 0" class="text-sm font-bold px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">{{ pendingCount }} pending</span>
        </div>
        <div v-if="pendingBookings.length === 0" class="text-center py-16"><span class="text-6xl opacity-15 block mb-4">✅</span><p class="text-base" style="color: var(--text-secondary);">All caught up — no pending approvals</p></div>
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><BookingApprovalCard v-for="booking in pendingBookings" :key="booking.id" :booking="booking" @action="handleBookingAction" /></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import BookingApprovalCard from '../components/BookingApprovalCard.vue'
import { useTheme } from '../composables/useTheme.js'

const router = useRouter()
const { toggle: toggleTheme, isDark } = useTheme()
const username = localStorage.getItem('username') || 'Admin'
const rooms = ref([])
const pendingBookings = ref([])
const newRoom = ref({ name: '', floor: '', capacity: '' })
const adding = ref(false)
const editingId = ref(null)
const editForm = ref({ name: '', floor: '', capacity: 0 })

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

const startAdd = () => { adding.value = true; newRoom.value = { name: '', floor: '', capacity: '' } }
const cancelAdd = () => { adding.value = false }
const createRoom = async () => {
  if (!newRoom.value.name || !newRoom.value.floor || !newRoom.value.capacity) return
  try { await api.post('/admin/rooms', newRoom.value); adding.value = false; await loadData() } catch (e) { console.error(e) }
}
const startEdit = (room) => { editingId.value = room.id; editForm.value = { name: room.name, floor: room.floor, capacity: room.capacity } }
const cancelEdit = () => { editingId.value = null }
const saveEdit = async (room) => {
  try { await api.put(`/admin/rooms/${room.id}`, { name: editForm.value.name, floor: editForm.value.floor, capacity: editForm.value.capacity }); editingId.value = null; await loadData() } catch (e) { console.error(e) }
}
const toggleRoomStatus = async (room) => {
  try { await api.patch(`/admin/rooms/${room.id}/status`, { status: room.status === 'active' ? 'disabled' : 'active' }); await loadData() } catch (e) { console.error(e) }
}
const handleBookingAction = async () => { await loadData() }
const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username'); router.push('/login') }
</script>
