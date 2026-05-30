import { ref, onMounted, onUnmounted } from 'vue'
import api from '../api'

const KEY = 'booking_snapshot'
const POLL_INTERVAL = 30000 // 30s

export function useNotifications() {
  const badge = ref(null) // { count, color } or null
  let timer = null

  const getSnapshot = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} }
  }

  const saveSnapshot = (bookings) => {
    const map = {}
    bookings.forEach(b => { map[b.id] = b.status })
    map._init = true
    localStorage.setItem(KEY, JSON.stringify(map))
  }

  const check = async () => {
    try {
      const res = await api.get('/bookings/my')
      const current = res.data.bookings || []
      const snap = getSnapshot()

      if (!snap._init) { saveSnapshot(current); return }

      let created = 0, approved = 0, rejected = 0
      const oldIds = new Set(Object.keys(snap).filter(k => k !== '_init'))

      current.forEach(b => {
        if (!oldIds.has(String(b.id))) created++
        else if (snap[b.id] !== b.status) {
          if (b.status === 'approved') approved++
          else if (b.status === 'rejected') rejected++
        }
      })

      const total = created + approved + rejected
      if (total > 0) {
        let color = '#f43f5e'
        if (approved > 0 && created === 0) color = '#10b981'
        else if (rejected > 0 && created === 0 && approved === 0) color = '#f59e0b'
        badge.value = { count: total, color }
      }
    } catch { /* ignore */ }
  }

  // Immediate notification after booking created — bypasses snapshot comparison
  const poke = async () => {
    try {
      const res = await api.get('/bookings/my')
      const current = res.data.bookings || []
      const snap = getSnapshot()
      const oldIds = new Set(Object.keys(snap).filter(k => k !== '_init'))

      let created = 0
      current.forEach(b => { if (!oldIds.has(String(b.id))) created++ })

      if (created > 0) {
        badge.value = { count: created, color: '#f43f5e' }
      }
      // Don't update snapshot yet — let markSeen do it
    } catch { /* ignore */ }
  }

  const markSeen = () => {
    badge.value = null
    api.get('/bookings/my').then(res => saveSnapshot(res.data.bookings || [])).catch(() => {})
  }

  onMounted(() => {
    check()
    timer = setInterval(check, POLL_INTERVAL)
  })

  onUnmounted(() => { if (timer) clearInterval(timer) })

  return { badge, check, poke, markSeen }
}
