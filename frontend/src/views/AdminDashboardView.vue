<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">管理员控制台</h1>
        <div class="flex items-center gap-4">
          <router-link to="/dashboard" class="text-blue-500 hover:text-blue-600 text-sm">用户视图</router-link>
          <span class="text-gray-600">欢迎, {{ username }}</span>
          <button @click="handleLogout" class="text-red-500 hover:text-red-600 text-sm">退出登录</button>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 py-6">
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">会议室管理</h2>
        <div class="flex gap-4 mb-4">
          <input
            v-model="newRoom.name"
            placeholder="会议室名称"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model="newRoom.floor"
            placeholder="楼层 (如 1F)"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            v-model.number="newRoom.capacity"
            placeholder="容量"
            type="number"
            class="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button @click="createRoom" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            添加会议室
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b">
                <th class="py-2 px-4">名称</th>
                <th class="py-2 px-4">楼层</th>
                <th class="py-2 px-4">容量</th>
                <th class="py-2 px-4">状态</th>
                <th class="py-2 px-4">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="room in rooms" :key="room.id" class="border-b">
                <td class="py-2 px-4">{{ room.name }}</td>
                <td class="py-2 px-4">{{ room.floor }}</td>
                <td class="py-2 px-4">{{ room.capacity }}</td>
                <td class="py-2 px-4">
                  <span :class="room.status === 'active' ? 'text-green-500' : 'text-red-500'">
                    {{ room.status === 'active' ? '开放' : '停用' }}
                  </span>
                </td>
                <td class="py-2 px-4">
                  <button
                    @click="toggleRoomStatus(room)"
                    class="text-sm text-blue-500 hover:text-blue-600"
                  >
                    {{ room.status === 'active' ? '停用' : '启用' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4">待审批预约</h2>
        <div v-if="pendingBookings.length === 0" class="text-gray-500 text-center py-8">
          暂无待审批的预约
        </div>
        <div v-else class="space-y-4">
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

onMounted(() => {
  loadData()
})

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
  } catch (e) {
    console.error('Failed to create room', e)
  }
}

const toggleRoomStatus = async (room) => {
  try {
    await api.patch(`/admin/rooms/${room.id}/status`, {
      status: room.status === 'active' ? 'disabled' : 'active'
    })
    await loadData()
  } catch (e) {
    console.error('Failed to update room status', e)
  }
}

const handleBookingAction = async () => {
  await loadData()
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
