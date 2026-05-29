<template>
  <div class="min-h-screen bg-slate-100">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <span class="text-xl">&#x1F6E0;&#xFE0F;</span>
          <h1 class="text-lg font-bold text-slate-800">管理员控制台</h1>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/dashboard" class="text-sm text-indigo-500 hover:text-indigo-600 font-medium">用户视图</router-link>
          <span class="text-sm text-slate-500">欢迎，{{ username }}</span>
          <button @click="handleLogout" class="text-sm text-slate-400 hover:text-rose-500 transition-colors font-medium">退出</button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-1">会议室管理</h2>
        <p class="text-sm text-slate-400 mb-6">添加、编辑或切换会议室状态</p>
        <div class="flex flex-wrap gap-3 mb-6">
          <input v-model="newRoom.name" placeholder="会议室名称" class="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent" />
          <input v-model="newRoom.floor" placeholder="楼层 (如 1F)" class="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-28" />
          <input v-model.number="newRoom.capacity" placeholder="容量" type="number" class="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-24" />
          <button @click="createRoom" class="px-6 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-semibold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98]">
            添加会议室
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">名称</th>
                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">楼层</th>
                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">容量</th>
                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">状态</th>
                <th class="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.id" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 font-medium text-slate-700">{{ room.name }}</td>
                <td class="py-3 px-4 text-slate-500 text-sm">{{ room.floor }}</td>
                <td class="py-3 px-4 text-slate-500 text-sm">{{ room.capacity }}人</td>
                <td class="py-3 px-4">
                  <span :class="room.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'" class="text-xs font-medium px-2.5 py-1 rounded-full">
                    {{ room.status === 'active' ? '开放' : '停用' }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button @click="toggleRoomStatus(room)" :class="room.status === 'active' ? 'text-rose-500 hover:text-rose-600' : 'text-emerald-500 hover:text-emerald-600'" class="text-sm font-medium transition-colors">
                    {{ room.status === 'active' ? '停用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 class="text-lg font-bold text-slate-800 mb-1">待审批预约</h2>
        <p class="text-sm text-slate-400 mb-6">审核用户的会议室预约申请</p>
        <div v-if="pendingBookings.length === 0" class="text-center py-12">
          <span class="text-3xl">&#x2705;</span>
          <p class="text-slate-400 mt-2">暂无待审批的预约</p>
        </div>
        <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <BookingApprovalCard
            v-for="booking in pendingBookings"
            :key="booking.id"
            :booking="booking"
            @action="handleBookingAction"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import BookingApprovalCard from '../components/BookingApprovalCard.vue'

const router = useRouter()
const username = localStorage.getItem('username') || '管理员'
const rooms = ref([])
const pendingBookings = ref([])
const newRoom = ref({ name: '', floor: '', capacity: '' })

onMounted(() => { loadData() })

const loadData = async () => {
  try {
    const [roomsRes, bookingsRes] = await Promise.all([
      api.get('/admin/rooms'),
      api.get('/admin/bookings')
    ])
    rooms.value = roomsRes.data.rooms
    pendingBookings.value = bookingsRes.data.bookings
  } catch (e) {
    console.error('Failed to load data', e)
  }
}

const createRoom = async () => {
  if (!newRoom.value.name || !newRoom.value.floor || !newRoom.value.capacity) return
  try {
    await api.post('/admin/rooms', newRoom.value)
    newRoom.value = { name: '', floor: '', capacity: '' }
    await loadData()
  } catch (e) { console.error('Failed to create room', e) }
}

const toggleRoomStatus = async (room) => {
  try {
    await api.patch(`/admin/rooms/${room.id}/status`, {
      status: room.status === 'active' ? 'disabled' : 'active'
    })
    await loadData()
  } catch (e) { console.error('Failed to update room status', e) }
}

const handleBookingAction = async () => { await loadData() }

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
