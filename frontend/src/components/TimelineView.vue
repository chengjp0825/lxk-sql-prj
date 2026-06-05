<template>
  <div class="timeline-scroller rounded-xl border" style="background: var(--bg-secondary); border-color: var(--border-default);">
    <div class="flex items-center justify-between px-4 py-3 border-b" style="border-color: var(--border-subtle);">
      <div class="flex items-center gap-3">
        <span class="text-sm font-bold uppercase tracking-wider" style="color: var(--text-secondary);">{{ rooms[0]?.floor || 'Floor' }}</span>
        <span class="text-[11px]" style="color: var(--text-muted);">{{ rooms.length }} rooms</span>
      </div>
      <div class="relative">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" style="color: var(--text-muted);">&#x1F4C5;</span>
        <input type="date" v-model="selectedDate" :min="minDate" class="text-sm rounded-lg pl-9 pr-3 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all w-40" style="background: var(--bg-input); border: 1px solid var(--border-strong); color: var(--text-primary)" />
      </div>
    </div>
    <div class="overflow-x-auto w-full">
      <div :style="{ minWidth: `${28*56+144}px`, width:'100%' }">
        <div class="sticky top-0 z-10 flex" style="background: var(--bg-tertiary);">
          <div class="flex-shrink-0 w-36 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider border-r" style="color: var(--text-muted); border-color: var(--border-subtle);">Time</div>
          <div class="flex border-b" style="border-color: var(--border-default);">
            <div v-for="slot in timeHeaders" :key="slot.label" class="flex-shrink-0 text-center text-[11px] font-semibold py-3.5 border-r" :style="{ width:'56px', color: slot.hour ? 'var(--text-secondary)' : 'var(--text-muted)', borderColor: slot.hour ? 'var(--border-default)' : 'var(--border-subtle)' }">{{ slot.label }}</div>
          </div>
        </div>
        <div v-for="room in rooms" :key="room.id" class="flex group">
          <div @click="selectRoom(room)" class="flex-shrink-0 w-36 px-4 py-3.5 flex flex-col justify-center border-r border-b cursor-pointer transition-colors" :class="room.current_status==='available'?'hover:bg-white/[0.02]':''" style="border-color: var(--border-subtle);">
            <p class="text-sm font-bold truncate" :style="{ color: room.current_status==='available'?'var(--text-primary)':'var(--text-muted)' }">{{ room.name }}</p>
            <p class="text-[11px] mt-1 opacity-70" :style="{ color: room.current_status==='available'?'#34d399':'#f87171' }">{{ room.capacity }}p</p>
          </div>
          <div class="flex">
            <div v-for="(slot,si) in (roomSlots[room.id]||[])" :key="si" @click="slot.status==='available'?bookSlot(room,si):undefined" class="flex-shrink-0 border-r border-b flex items-center justify-center" :class="slot.status==='available'?'cursor-pointer hover:brightness-150':''" :style="slotCellStyle(slot,si)" :title="slot.title">
              <span v-if="slot.status!=='available'" class="text-[9px] font-bold opacity-70">{{ slot.status==='occupied'?'BUSY':'PEND' }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-6 px-4 py-3 border-t text-[11px] font-medium" style="border-color: var(--border-subtle);">
          <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: rgba(16,185,129,0.2); border:1px solid rgba(16,185,129,0.35);"></span><span style="color: var(--text-secondary);">Free</span></span>
          <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: rgba(239,68,68,0.25); border:1px solid rgba(239,68,68,0.35);"></span><span style="color: var(--text-secondary);">Occupied</span></span>
          <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: rgba(245,158,11,0.18); border:1px solid rgba(245,158,11,0.3);"></span><span style="color: var(--text-secondary);">Pending</span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api'
const props = defineProps({ rooms:{type:Array,required:true} })
const emit = defineEmits(['select-room','book-slot'])
const now=new Date(); const selectedDate=ref(now.toISOString().split('T')[0]); const minDate=now.toISOString().split('T')[0]
const roomSlots=ref({})
const timeHeaders=computed(()=>{const h=[];for(let i=8;i<22;i++){h.push({label:`${String(i).padStart(2,'0')}:00`,hour:true});h.push({label:`${String(i).padStart(2,'0')}:30`,hour:false})};return h})
const loadAllTimelines=async()=>{const map={};await Promise.all(props.rooms.map(async r=>{try{const res=await api.get(`/rooms/${r.id}/timeline?date=${selectedDate.value}`);map[r.id]=(res.data.slots||[]).map(s=>({...s,title:`${r.name} ${s.start}–${s.end} (${s.status})`}))}catch{const s=[];for(let h=8;h<22;h++)for(let m=0;m<60;m+=30){const a=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`,eh=m===30?h+1:h,em=m===30?0:30,b=`${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`;s.push({status:'available',start:a,end:b,title:`${r.name} ${a}–${b}`})};map[r.id]=s}}));roomSlots.value=map}
const todayStr2=new Date().toISOString().split('T')[0];const nowMin2=new Date().getHours()*60+new Date().getMinutes();const nowIdx2=selectedDate.value!==todayStr2?-1:Math.floor((nowMin2-8*60)/30)
const slotCellStyle=(slot,index)=>{const b={width:'56px',height:'52px',borderColor:'var(--border-subtle)'};if(nowIdx2>=0&&index<=nowIdx2)return{...b,background:'rgba(148,163,184,0.04)',color:'#334155',cursor:'not-allowed',opacity:'0.3'};if(slot.status==='occupied')return{...b,background:'rgba(239,68,68,0.18)',borderLeft:'1px solid rgba(239,68,68,0.12)',color:'#fca5a5'};if(slot.status==='pending')return{...b,background:'rgba(245,158,11,0.12)',borderLeft:'1px solid rgba(245,158,11,0.1)',color:'#fcd34d'};const even=index%2===0;return{...b,background:even?'var(--bg-hover)':'transparent',borderLeft:even?'1px solid var(--border-subtle)':'1px solid transparent'}}
const selectRoom=(room)=>{emit('select-room',room)}
const bookSlot=(room,si)=>{const slot=(roomSlots.value[room.id]||[])[si];if(!slot||slot.status!=='available')return;emit('book-slot',{room,start:slot.start,date:selectedDate.value})}
onMounted(()=>loadAllTimelines())
watch([()=>props.rooms,selectedDate],()=>loadAllTimelines())
</script>
