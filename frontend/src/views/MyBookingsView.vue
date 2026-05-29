<template>
  <div class="min-h-screen bg-slate-100">
    <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div class="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <span class="text-xl">&#x1F4C5;</span>
          <h1 class="text-lg font-bold text-slate-800">我的预约</h1>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/dashboard" class="text-sm text-indigo-500 hover:text-indigo-600 font-medium">返回首页</router-link>
          <span class="text-sm text-slate-500">欢迎，{{ username }}</span>
          <button @click="handleLogout" class="text-sm text-slate-400 hover:text-rose-500 transition-colors font-medium">退出</button>
        </div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-6 py-8">
      <div v-if="bookings.length === 0" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <span class="text-4xl">&#x1F4AD;</span>
        <p class="text-slate-400 mt-3 text-lg">暂无预约记录</p>
        <router-link to="/dashboard" class="inline-block mt-4 text-indigo-500 hover:text-indigo-600 font-medium text-sm">去预约会议室 &rarr;</router-link>
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

onMounted(() => { loadBookings() })

const loadBookings = async () => {
  try {
    const res = await api.get('/bookings/my')
    bookings.value = res.data.bookings
  } catch (e) {
    console.error('Failed to load bookings', e)
  }
}

const handleCancel = async () => { await loadBookings() }

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('username')
  router.push('/login')
}
</script>
