<template>
  <div class="glass rounded-xl border transition-all duration-200" style="border-color: var(--border-subtle);">
    <div class="p-5">
      <div class="flex justify-between items-start">
        <div class="flex items-start gap-3"><span class="text-2xl">&#x1F3E2;</span>
          <div>
            <h4 class="font-bold" style="color: var(--text-primary);">{{ booking.room?.name || '???' }}</h4>
            <p class="text-sm" style="color: var(--text-secondary);">{{ booking.room?.floor }}</p>
          </div>
        </div>
        <span :style="statusStyle" class="text-xs font-bold px-2.5 py-1 rounded-full border">{{ statusText }}</span>
      </div>
      <p class="text-sm mt-3 pl-10" style="color: var(--text-secondary);">
        &#x1F552; {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}
      </p>

      <!-- Lifecycle timeline -->
      <div class="mt-4 pl-10">
        <div class="relative">
          <!-- Vertical line -->
          <div class="absolute left-[5px] top-2 bottom-2 w-px" style="background: var(--border-strong);"></div>

          <!-- Step 1: Created -->
          <div class="flex items-start gap-3 mb-2.5 relative">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10" style="background: var(--accent); box-shadow: 0 0 6px var(--accent-glow);"></div>
            <div class="flex-1 min-w-0">
              <p class="text-xs" style="color: var(--text-secondary);">
                <span class="font-bold" style="color: var(--text-primary);">提交预约</span>
                <span class="ml-2" style="color: var(--text-muted);">{{ formatTime(booking.created_at) }}</span>
              </p>
            </div>
          </div>

          <!-- Step 2: Reason (if any) -->
          <div v-if="booking.reason" class="flex items-start gap-3 mb-2.5 relative">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10" style="background: var(--text-muted);"></div>
            <div class="flex-1 min-w-0">
              <p class="text-xs" style="color: var(--text-secondary);">
                <span class="font-bold" style="color: var(--text-primary);">申请理由</span>
              </p>
              <p class="text-xs mt-0.5" :class="reasonExpanded ? '' : 'line-clamp-2'" style="color: var(--text-muted); word-break: break-word;">{{ booking.reason }}</p>
              <button v-if="booking.reason.length > 60 && !reasonExpanded" @click="reasonExpanded = true" class="text-[10px] text-indigo-400 hover:text-indigo-300 mt-0.5 transition-colors">查看详情</button>
              <button v-else-if="reasonExpanded" @click="reasonExpanded = false" class="text-[10px] text-indigo-400 hover:text-indigo-300 mt-0.5 transition-colors">收起</button>
            </div>
          </div>

          <!-- Step 3: Admin review -->
          <div class="flex items-start gap-3 mb-2.5 relative">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10" :style="reviewDotStyle"></div>
            <div class="flex-1 min-w-0">
              <p class="text-xs" style="color: var(--text-secondary);">
                <span class="font-bold" :style="{ color: reviewColor }">{{ reviewLabel }}</span>
                <span v-if="booking.reviewed_at" class="ml-2" style="color: var(--text-muted);">{{ formatTime(booking.reviewed_at) }}</span>
              </p>
              <p v-if="booking.admin_reason" class="text-xs mt-0.5" style="color: var(--text-muted);">{{ booking.admin_reason }}</p>
            </div>
          </div>

          <!-- Step 4: Expiry / Past -->
          <div class="flex items-start gap-3 relative">
            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 z-10" :style="expiryDotStyle"></div>
            <div class="flex-1 min-w-0">
              <p class="text-xs" :style="{ color: booking.is_past ? 'var(--status-expired)' : 'var(--text-secondary)' }">
                <span class="font-bold">{{ booking.is_past ? '已过时' : '预约时间' }}</span>
                <span class="ml-2" style="color: var(--text-muted);">{{ formatTime(booking.end_time) }}{{ booking.is_past ? '' : ' 到期' }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-3 pl-10 flex items-center gap-4">
        <button v-if="canCancel" @click="handleCancel" class="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors">取消预约</button>
        <button @click="toggleTimeline" class="text-sm font-medium transition-colors flex items-center gap-1" :style="{ color: expanded ? '#a5b4fc' : 'var(--text-muted)' }">
          <span>{{ expanded ? '收起时间轴' : '查看时间轴' }}</span>
          <span class="text-[10px] transition-transform" :class="expanded ? 'rotate-180' : ''">&#x25BC;</span>
        </button>
      </div>
    </div>

    <!-- Collapsible mini timeline -->
    <div v-if="expanded" class="px-5 pb-5 border-t" style="border-color: var(--border-subtle);">
      <div v-if="timelineLoading" class="flex items-center justify-center py-4">
        <span class="inline-block w-4 h-4 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></span>
      </div>
      <div v-else class="mt-4">
        <p class="text-[11px] font-semibold uppercase tracking-wider mb-2" style="color: var(--text-secondary);">{{ timelineDate }} · {{ booking.room?.name }}</p>
        <div class="flex gap-[1px] mb-1.5">
          <div v-for="(slot, si) in timelineSlots" :key="si"
            class="flex-1 h-8 rounded-sm transition-colors"
            :style="miniSlotStyle(slot, si)"
            :title="`${slot.start}–${slot.end} ${slot.status}`">
          </div>
        </div>
        <div class="flex justify-between text-[9px] font-medium" style="color: var(--text-muted);">
          <span>08</span><span>10</span><span>12</span><span>14</span><span>16</span><span>18</span><span>20</span><span>22</span>
        </div>
        <div class="flex items-center gap-4 mt-3 text-[10px] font-medium">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background: var(--status-available-bg); border:1px solid var(--status-available-border);"></span><span style="color: var(--text-secondary);">Free</span></span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background: var(--status-occupied-bg); border:1px solid var(--status-occupied-border);"></span><span style="color: var(--text-secondary);">Busy</span></span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background: var(--status-pending-bg); border:1px solid var(--status-pending-border);"></span><span style="color: var(--text-secondary);">Pend</span></span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-sm" style="background: var(--status-own-bg); border:1px solid var(--status-own-border);"></span><span style="color: var(--text-secondary);">Yours</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import api from '../api'
const props = defineProps({ booking: { type: Object, required: true } })
const emit = defineEmits(['cancel'])

const expanded = ref(false)
const reasonExpanded = ref(false)
const timelineLoading = ref(false)
const timelineSlots = ref([])
const timelineDate = ref('')

const bookingDate = computed(() => {
  if (!props.booking.start_time) return ''
  try { return new Date(props.booking.start_time).toISOString().split('T')[0] }
  catch { return '' }
})

const toggleTimeline = async () => {
  expanded.value = !expanded.value
  if (expanded.value && timelineSlots.value.length === 0 && props.booking.room?.id && bookingDate.value) {
    timelineLoading.value = true
    try {
      const res = await api.get(`/rooms/${props.booking.room.id}/timeline?date=${bookingDate.value}`)
      timelineSlots.value = res.data.slots || []
      timelineDate.value = res.data.date || bookingDate.value
    } catch { /* ignore */ }
    finally { timelineLoading.value = false }
  }
}

const miniSlotStyle = (slot, index) => {
  const bs = props.booking.start_time
  const be = props.booking.end_time
  if (bs && be && slot.end > formatTimeOnly(bs) && slot.start < formatTimeOnly(be)) {
    return { background: 'var(--status-own-bg)', border: '1px solid var(--status-own-border)' }
  }
  if (slot.status === 'occupied') return { background: 'var(--status-occupied-bg)', border: '1px solid var(--status-occupied-border)' }
  if (slot.status === 'pending') return { background: 'var(--status-pending-bg)', border: '1px solid var(--status-pending-border)' }
  return { background: 'var(--status-available-bg)', border: '1px solid var(--status-available-border)' }
}

const formatTimeOnly = (s) => {
  if (!s) return ''
  const d = new Date(s)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// ---- Review step (Step 3) computed ----
const reviewLabel = computed(() => {
  switch (props.booking.status) {
    case 'pending': return '等待审批中...'
    case 'approved': return '已通过'
    case 'rejected': return '已驳回'
    case 'cancelled': return '已取消'
    case 'expired': return '已过期未审批'
    default: return props.booking.status
  }
})
const reviewColor = computed(() => {
  switch (props.booking.status) {
    case 'pending': return 'var(--status-pending)'
    case 'approved': return 'var(--status-approved)'
    case 'rejected': return 'var(--status-rejected)'
    default: return 'var(--text-muted)'
  }
})
const reviewDotStyle = computed(() => {
  switch (props.booking.status) {
    case 'pending': return { background: 'var(--status-pending)', boxShadow: '0 0 6px var(--status-pending)' }
    case 'approved': return { background: 'var(--status-approved)', boxShadow: '0 0 6px var(--status-approved)' }
    case 'rejected': return { background: 'var(--status-rejected)', boxShadow: '0 0 6px var(--status-rejected)' }
    default: return { background: 'var(--text-muted)' }
  }
})
const expiryDotStyle = computed(() => {
  if (props.booking.is_past) return { background: 'var(--status-expired)' }
  return { background: 'var(--text-muted)' }
})

const statusStyle = computed(() => {
  switch (props.booking.status) {
    case 'pending': return 'background:var(--status-pending-bg);color:var(--status-pending);border-color:var(--status-pending-border)'
    case 'approved': return 'background:var(--status-approved-bg);color:var(--status-approved);border-color:var(--status-available-border)'
    case 'rejected': return 'background:var(--status-rejected-bg);color:var(--status-rejected);border-color:var(--status-occupied-border)'
    case 'cancelled': return 'background:var(--status-cancelled-bg);color:var(--status-cancelled);border-color:var(--border-subtle)'
    case 'expired': return 'background:var(--status-expired-bg);color:var(--status-expired);border-color:var(--border-subtle)'
    default: return 'background:var(--status-disabled-bg);color:var(--status-disabled);border-color:var(--border-subtle)'
  }
})
const statusText = computed(() => {
  const map = { pending: '待审批', approved: '已通过', rejected: '已驳回', cancelled: '已取消', expired: '已过时' }
  return map[props.booking.status] || props.booking.status
})
const canCancel = computed(() => {
  if (props.booking.status !== 'pending' && props.booking.status !== 'approved') return false
  return new Date(props.booking.start_time) > new Date()
})
const formatTime = (s) => { if (!s) return ''; return new Date(s).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
const handleCancel = async () => { try { await api.delete(`/bookings/${props.booking.id}`); emit('cancel') } catch (e) { alert(e.response?.data?.error || '取消失败') } }
</script>
