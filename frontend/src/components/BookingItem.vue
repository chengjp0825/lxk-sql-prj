<template>
  <div class="glass rounded-xl border p-5 hover:border-white/10 transition-all duration-200" style="border-color: var(--border-subtle);">
    <div class="flex justify-between items-start">
      <div class="flex items-start gap-3"><span class="text-2xl">&#x1F3E2;</span><div><h4 class="font-bold" style="color: var(--text-primary);">{{ booking.room?.name || '???' }}</h4><p class="text-sm" style="color: var(--text-secondary);">{{ booking.room?.floor }}</p></div></div>
      <span :class="statusClass">{{ statusText }}</span>
    </div>
    <p class="text-sm mt-3 pl-10" style="color: var(--text-secondary);">&#x1F552; {{ formatTime(booking.start_time) }} - {{ formatTime(booking.end_time) }}</p>
    <div v-if="canCancel" class="mt-3 pl-10"><button @click="handleCancel" class="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors">取消预约</button></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import api from '../api'
const props = defineProps({ booking:{type:Object,required:true} })
const emit = defineEmits(['cancel'])
const statusClass = computed(() => {
  switch(props.booking.status){
    case 'pending': return 'text-xs font-bold bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20'
    case 'approved': return 'text-xs font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20'
    case 'rejected': return 'text-xs font-bold bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-full border border-rose-500/20'
    case 'cancelled': return 'text-xs font-bold bg-slate-500/10 text-slate-400 px-2.5 py-1 rounded-full border border-white/5'
    default: return 'text-xs font-bold bg-slate-500/10 text-slate-400 px-2.5 py-1 rounded-full border border-white/5'
  }
})
const statusText = computed(()=>({pending:'待审批',approved:'已通过',rejected:'已驳回',cancelled:'已取消'}[props.booking.status]||props.booking.status))
const canCancel = computed(()=>(props.booking.status==='pending'||props.booking.status==='approved')&&new Date(props.booking.start_time)>new Date())
const formatTime=(s)=>{if(!s)return'';return new Date(s).toLocaleString('zh-CN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
const handleCancel=async()=>{try{await api.delete(`/bookings/${props.booking.id}`);emit('cancel')}catch(e){alert(e.response?.data?.error||'取消失败')}}
</script>
