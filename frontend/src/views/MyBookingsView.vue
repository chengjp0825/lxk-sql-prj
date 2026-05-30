<template>
  <div class="min-h-screen" style="background: #0b0f1a;">
    <header class="glass sticky top-0 z-40 border-b border-white/5">
      <div class="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); box-shadow: 0 0 20px rgba(99,102,241,0.3);">
            <span class="text-white text-sm">&#x1F4C5;</span>
          </div>
          <h1 class="text-lg font-bold text-white tracking-tight">我的预约</h1>
        </div>
        <div class="flex items-center gap-5">
          <router-link to="/dashboard" class="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors">返回首页</router-link>
          <span class="text-sm text-slate-500">欢迎，{{ username }}</span>
          <button @click="handleLogout" class="text-sm text-slate-500 hover:text-rose-400 transition-colors font-medium">退出</button>
        </div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-6 py-8">
      <div v-if="bookings.length === 0" class="glass rounded-2xl border border-white/5 p-12 text-center">
        <span class="text-5xl opacity-30">&#x1F4AD;</span>
        <p class="text-slate-500 mt-4 text-lg">暂无预约记录</p>
        <router-link to="/dashboard" class="inline-block mt-4 text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors">去预约会议室 &rarr;</router-link>
      </div>
      <div v-else class="space-y-4">
        <BookingItem v-for="booking in bookings" :key="booking.id" :booking="booking" @cancel="handleCancel" />
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
  // Mark all notifications as seen
  const KEY = 'booking_snapshot'
  api.get('/bookings/my').then(res => {
    const map = {}; (res.data.bookings || []).forEach(b => { map[b.id] = b.status })
    map._init = true; localStorage.setItem(KEY, JSON.stringify(map))
  }).catch(() => {})
  loadBookings()
})

const loadBookings = async () => {
  try { const res = await api.get('/bookings/my'); bookings.value = res.data.bookings } catch (e) { console.error(e) }
}

const handleCancel = async () => { await loadBookings() }

const handleLogout = () => {
  localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('username')
  router.push('/login')
}
</script>
