<template>
  <div class="glass rounded-xl border p-5 transition-all" :style="{ borderColor: booking.status === 'cancelled' ? 'var(--status-cancelled-bg)' : 'var(--border-subtle)', opacity: booking.status === 'cancelled' ? '0.7' : '1' }">
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-start gap-3"><span class="text-xl">{{ booking.status === 'cancelled' ? '&#x274C;' : '&#x1F3E2;' }}</span>
        <div>
          <h4 class="font-bold" style="color: var(--text-primary);">{{ booking.room?.name || '???' }}</h4>
          <p class="text-sm" style="color: var(--text-secondary);">{{ booking.room?.floor }}</p>
        </div>
      </div>
      <!-- Status badge -->
      <span v-if="booking.status === 'cancelled'" class="text-xs font-bold px-2.5 py-1 rounded-full border" style="background: var(--status-cancelled-bg); color: var(--status-cancelled); border-color: var(--border-subtle);">已取消</span>
      <span v-else class="text-xs font-bold px-2.5 py-1 rounded-full border" style="background: var(--status-pending-bg); color: var(--status-pending); border-color: var(--status-pending-border);">待审批</span>
    </div>
    <div class="space-y-1 mb-3 text-sm pl-10" style="color: var(--text-secondary);">
      <p>&#x1F464; {{ booking.user?.username || '???' }}</p>
      <p>&#x1F552; {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}</p>
      <p v-if="booking.reason" class="text-xs" style="color: var(--text-muted);">&#x1F4DD; {{ booking.reason }}</p>
      <!-- Cancelled: show cancel reason and time -->
      <template v-if="booking.status === 'cancelled'">
        <p v-if="booking.cancel_reason" class="text-xs" style="color: var(--status-cancelled);">&#x1F6AB; 取消理由：{{ booking.cancel_reason }}</p>
        <p v-if="booking.cancelled_at" class="text-xs" style="color: var(--text-muted);">&#x23F0; 取消时间：{{ formatTime(booking.cancelled_at) }}</p>
      </template>
    </div>

    <!-- Pending: show approve/reject -->
    <template v-if="booking.status === 'pending'">
      <div class="mb-3">
        <input v-model="adminReason" placeholder="审批理由（必填）"
          class="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none focus:border-indigo-400/40 transition-all"
          style="background: var(--bg-input); border-color: var(--border-strong); color: var(--text-primary);" />
      </div>
      <div class="flex gap-2">
        <button @click="handleApprove" :disabled="loading || !adminReason.trim()"
          class="flex-1 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 0 16px rgba(16,185,129,0.2);">{{ loading ? '...' : '通过' }}</button>
        <button @click="handleReject" :disabled="loading || !adminReason.trim()"
          class="flex-1 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style="background:linear-gradient(135deg,#f43f5e,#e11d48);box-shadow:0 0 16px rgba(244,63,94,0.2);">驳回</button>
      </div>
    </template>
    <!-- Cancelled: info-only -->
    <div v-else class="text-xs italic" style="color: var(--text-muted);">此预约已被用户取消，无需审批</div>
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
