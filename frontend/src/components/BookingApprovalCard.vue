<template>
  <div class="glass rounded-xl border p-5 transition-all" style="border-color: var(--border-subtle);">
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-start gap-3"><span class="text-xl">&#x1F3E2;</span>
        <div><h4 class="font-bold" style="color: var(--text-primary);">{{ booking.room?.name || '???' }}</h4>
          <p class="text-sm" style="color: var(--text-secondary);">{{ booking.room?.floor }}</p></div>
      </div>
      <span class="text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">待审批</span>
    </div>
    <div class="space-y-1 mb-3 text-sm pl-10" style="color: var(--text-secondary);">
      <p>&#x1F464; {{ booking.user?.username || '???' }}</p>
      <p>&#x1F552; {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}</p>
      <p v-if="booking.reason" class="text-xs" style="color: var(--text-muted);">&#x1F4DD; {{ booking.reason }}</p>
    </div>
    <!-- Admin reason input -->
    <div class="mb-3">
      <input v-model="adminReason" placeholder="审批理由（必填）"
        class="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-indigo-400/40 transition-all"
        style="background: var(--bg-input); border-color: var(--border-strong); color: var(--text-primary);" />
    </div>
    <div class="flex gap-2">
      <button @click="handleApprove" :disabled="loading || !adminReason.trim()"
        class="flex-1 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 0 16px rgba(16,185,129,0.2);">{{ loading ? '...' : '通过' }}</button>
      <button @click="handleReject" :disabled="loading || !adminReason.trim()"
        class="flex-1 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        style="background:linear-gradient(135deg,#f43f5e,#e11d48);box-shadow:0 0 16px rgba(244,63,94,0.2);">驳回</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'
const props = defineProps({ booking: { type: Object, required: true } })
const emit = defineEmits(['action']); const loading = ref(false); const adminReason = ref('')
const formatTime = (s) => { if (!s) return ''; return new Date(s).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
const handleApprove = async () => {
  if (!adminReason.value.trim()) return
  loading.value = true
  try { await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'approved', admin_reason: adminReason.value }); emit('action') } catch (e) { alert(e.response?.data?.error || 'Error') } finally { loading.value = false }
}
const handleReject = async () => {
  if (!adminReason.value.trim()) return
  loading.value = true
  try { await api.patch(`/admin/bookings/${props.booking.id}/status`, { status: 'rejected', admin_reason: adminReason.value }); emit('action') } catch (e) { alert(e.response?.data?.error || 'Error') } finally { loading.value = false }
}
</script>
