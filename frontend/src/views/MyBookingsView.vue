<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">我的预约</h1>
        <div class="flex items-center gap-4">
          <router-link to="/dashboard" class="text-blue-500 hover:text-blue-600 text-sm">返回首页</router-link>
          <span class="text-gray-600">欢迎, {{ username }}</span>
          <button @click="handleLogout" class="text-red-500 hover:text-red-600 text-sm">退出登录</button>
        </div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <div v-if="bookings.length === 0" class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        暂无预约记录
      </div>
      <div v-else class="space-y-4">
        <BookingItem
          v-for="booking in bookings"
          :key="booking.id"
          :booking="booking"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import BookingItem from '../components/BookingItem.vue'

const router = useRouter()
const username = localStorage.getItem('username') || '用户'
const bookings = ref([])

onMounted(() => {
  loadBookings()
})

const loadBookings = async () => {
  try {
    const res = await api.get('/bookings/my')
    bookings.value = res.data.bookings
  } catch (e) {
    console.error('Failed to load bookings', e)
  }
}

const handleCancel = async () => {
  await loadBookings()
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
