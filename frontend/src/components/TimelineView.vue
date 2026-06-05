<template>
  <div class="timeline-scroller rounded-xl border" style="background: var(--bg-secondary); border-color: var(--border-default);">
    <!-- Header: floor info + granularity toggle + date nav -->
    <div class="flex items-center justify-between px-4 py-3 border-b flex-wrap gap-2" style="border-color: var(--border-subtle);">
      <div class="flex items-center gap-3">
        <span class="text-sm font-bold uppercase tracking-wider" style="color: var(--text-secondary);">{{ rooms[0]?.floor || 'Floor' }}</span>
        <span class="text-[11px]" style="color: var(--text-muted);">{{ rooms.length }} rooms</span>
        <span v-if="isToday" class="text-[10px] font-bold flex items-center gap-1" style="color: var(--status-occupied);"><span class="w-1 h-1 rounded-full animate-pulse" style="background: var(--status-occupied);"></span>{{ granularity === 'day' ? `从 ${visibleStartLabel} 开始` : `Now ${nowTimeLabel}` }}</span>
      </div>
      <div class="flex items-center gap-2">
        <!-- Granularity toggle -->
        <div class="flex rounded-lg border p-0.5" style="border-color: var(--border-strong); background: var(--bg-input);">
          <button v-for="g in granularities" :key="g.key" @click="setGranularity(g.key)"
            class="px-3 py-1.5 text-[11px] font-bold rounded-md transition-all"
            :style="granularity === g.key ? 'background: var(--accent); color: #fff;' : 'color: var(--text-muted);'">{{ g.label }}</button>
        </div>
        <!-- Date navigation -->
        <div class="flex items-center gap-1">
          <button @click="navigate(-1)" class="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold hover:bg-white/5 transition-colors" style="color: var(--text-secondary);">&larr;</button>
          <!-- Day: date picker -->
          <input v-if="granularity === 'day'" type="date" v-model="selectedDate" :min="minDate"
            class="text-[11px] rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all w-34"
            style="background: var(--bg-input); border: 1px solid var(--border-strong); color: var(--text-primary)" />
          <!-- Week/Month: label -->
          <span v-else class="text-[11px] font-bold px-2 min-w-[120px] text-center" style="color: var(--text-primary);">{{ rangeLabel }}</span>
          <button @click="navigate(1)" class="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold hover:bg-white/5 transition-colors" style="color: var(--text-secondary);">&rarr;</button>
        </div>
      </div>
    </div>

    <!-- ==================== DAY VIEW ==================== -->
    <div v-if="granularity === 'day'" class="overflow-x-auto w-full">
      <div :style="{ minWidth: `${visibleSlotCount * 56 + 144}px`, width: '100%' }" style="position: relative;">
        <div class="sticky top-0 z-10 flex" style="background: var(--bg-tertiary);">
          <div class="flex-shrink-0 w-36 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider border-r" style="color: var(--text-muted); border-color: var(--border-subtle);">Time</div>
          <div class="flex border-b" style="border-color: var(--border-default);">
            <div v-for="slot in visibleTimeHeaders" :key="slot.label" class="flex-shrink-0 text-center text-[11px] font-semibold py-3.5 border-r" :style="{ width:'56px', color: slot.hour ? 'var(--text-secondary)' : 'var(--text-muted)', borderColor: slot.hour ? 'var(--border-default)' : 'var(--border-subtle)' }">{{ slot.label }}</div>
          </div>
        </div>
        <div v-if="nowLinePos" class="absolute top-0 bottom-0 pointer-events-none z-20" :style="{ left: nowLinePos.left }">
          <div class="absolute top-0 w-px h-full" style="background: var(--status-occupied-border);"></div>
          <div class="absolute top-0 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap" style="background: var(--status-occupied); color: #fff;">{{ nowLinePos.label }}</div>
        </div>
        <div v-for="room in rooms" :key="room.id" class="flex group">
          <div @click="selectRoom(room)" class="flex-shrink-0 w-36 px-4 py-3.5 flex flex-col justify-center border-r border-b cursor-pointer transition-colors" :class="room.current_status==='available'?'hover:bg-white/[0.05]':''" style="border-color: var(--border-subtle);">
            <p class="text-sm font-bold truncate" :style="{ color: room.current_status==='available'?'var(--text-primary)':'var(--text-muted)' }">{{ room.name }}</p>
            <p class="text-[11px] mt-1 opacity-70" :style="{ color: room.current_status==='available'?'var(--status-available)':'var(--status-occupied)' }">{{ room.capacity }}p</p>
          </div>
          <div class="flex">
            <div v-for="(slot, si) in visibleRoomSlotsMap[room.id]" :key="si" @click="slot.status==='available'?bookSlot(room, visibleStartIndex + si):undefined"
              class="flex-shrink-0 border-r border-b flex items-center justify-center"
              :class="slot.status==='available'?'cursor-pointer hover:brightness-150':''"
              :style="slotCellStyle(slot, visibleStartIndex + si)"
              :title="slot.title">
              <span v-if="slot.status!=='available'" class="text-[10px] font-bold">{{ slot.status==='occupied'?'BUSY':'PEND' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== WEEK VIEW ==================== -->
    <div v-else-if="granularity === 'week'" class="overflow-x-auto w-full">
      <div :style="{ minWidth: `${7 * 120 + 144}px`, position: 'relative' }" v-if="!rangeLoading">
        <!-- Week now-line: red vertical line on today's column + time marker -->
        <div v-if="weekNowLineLeft" class="absolute top-0 bottom-0 pointer-events-none z-20" :style="{ left: weekNowLineLeft.colPx, width: '120px' }">
          <div class="absolute top-0 left-0 w-px h-full" style="background: var(--status-occupied); opacity: 0.6;"></div>
          <div class="absolute top-0 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap" style="background: var(--status-occupied); color: #fff;">{{ weekNowLineLeft.label }}</div>
          <!-- Small dot showing time position within the day -->
          <div class="absolute left-1 w-1.5 h-1.5 rounded-full" style="background: var(--status-occupied); box-shadow: 0 0 6px var(--status-occupied);" :style="{ top: `${4 + weekNowLineLeft.frac * 94}%` }"></div>
        </div>
        <div class="sticky top-0 z-10 flex" style="background: var(--bg-tertiary);">
          <div class="flex-shrink-0 w-36 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider border-r" style="color: var(--text-muted); border-color: var(--border-subtle);">Room</div>
          <div class="flex border-b" style="border-color: var(--border-default);">
            <div v-for="d in weekDays" :key="d.dateStr" class="flex-shrink-0 text-center py-3.5 border-r relative" :style="{ width:'120px', borderColor: d.isToday ? 'var(--status-occupied)' : 'var(--border-default)' }">
              <p class="text-[10px] font-bold uppercase tracking-wider" :style="{ color: d.isToday ? 'var(--status-occupied)' : 'var(--text-secondary)' }">{{ d.dayName }}</p>
              <p class="text-[11px] font-semibold mt-0.5" :style="{ color: d.isToday ? 'var(--status-occupied)' : 'var(--text-muted)' }">{{ d.dateLabel }}</p>
            </div>
          </div>
        </div>
        <div v-for="room in rooms" :key="room.id" class="flex group">
          <div @click="selectRoom(room)" class="flex-shrink-0 w-36 px-4 py-3.5 flex flex-col justify-center border-r border-b cursor-pointer transition-colors hover:bg-white/[0.05]" style="border-color: var(--border-subtle);">
            <p class="text-sm font-bold truncate" :style="{ color: 'var(--text-primary)' }">{{ room.name }}</p>
            <p class="text-[11px] mt-1 opacity-70" style="color: var(--text-muted);">{{ room.capacity }}p</p>
          </div>
          <div class="flex">
            <div v-for="d in weekDays" :key="d.dateStr" @click="drillToDay(d.dateStr)"
              class="flex-shrink-0 border-r border-b flex flex-col gap-[2px] justify-center p-2 cursor-pointer hover:brightness-110 transition-all"
              :style="{ width:'120px', borderColor: d.isToday ? 'var(--status-own-border)' : 'var(--border-subtle)', background: d.isToday ? 'var(--status-own-bg)' : 'transparent' }">
              <div class="flex-1 rounded-sm flex items-center justify-center text-[10px] font-bold"
                :style="periodBar(room.id, d.dateStr, 'morning')">上</div>
              <div class="flex-1 rounded-sm flex items-center justify-center text-[10px] font-bold"
                :style="periodBar(room.id, d.dateStr, 'afternoon')">下</div>
              <div class="flex-1 rounded-sm flex items-center justify-center text-[10px] font-bold"
                :style="periodBar(room.id, d.dateStr, 'evening')">晚</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center py-12"><span class="inline-block w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></span></div>
    </div>

    <!-- ==================== MONTH VIEW ==================== -->
    <div v-else-if="granularity === 'month'" class="overflow-x-auto w-full">
      <div :style="{ minWidth: `${7 * 120 + 144}px` }" v-if="!rangeLoading">
        <div class="sticky top-0 z-10 flex" style="background: var(--bg-tertiary);">
          <div class="flex-shrink-0 w-36 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider border-r" style="color: var(--text-muted); border-color: var(--border-subtle);">Room</div>
          <div class="flex border-b" style="border-color: var(--border-default);">
            <div v-for="dn in ['一','二','三','四','五','六','日']" :key="dn" class="flex-shrink-0 text-center py-3.5 border-r" :style="{ width:'120px', borderColor: 'var(--border-default)' }">
              <p class="text-[10px] font-bold uppercase tracking-wider" style="color: var(--text-secondary);">{{ dn }}</p>
            </div>
          </div>
        </div>
        <div v-for="room in rooms" :key="room.id" class="flex group">
          <div @click="selectRoom(room)" class="flex-shrink-0 w-36 px-4 py-3.5 flex flex-col justify-center border-r border-b cursor-pointer transition-colors hover:bg-white/[0.05]" style="border-color: var(--border-subtle);">
            <p class="text-sm font-bold truncate" :style="{ color: 'var(--text-primary)' }">{{ room.name }}</p>
            <p class="text-[11px] mt-1 opacity-70" style="color: var(--text-muted);">{{ room.capacity }}p</p>
          </div>
          <div class="flex">
            <div v-for="(cell, ci) in monthCells" :key="ci"
              @click="cell.dateStr && drillToDay(cell.dateStr)"
              class="flex-shrink-0 border-r border-b flex flex-col items-center justify-center text-[10px] font-bold select-none relative"
              :class="cell.dateStr ? 'cursor-pointer hover:brightness-110' : 'cursor-default opacity-30'"
              :style="monthCellStyle(room.id, cell)"
              :title="cell.dateStr ? `${room.name} ${cell.dateStr}` : ''">
              <span>{{ cell.day }}</span>
              <span v-if="cell.isToday" class="text-[10px] leading-none mt-0.5 font-bold px-1.5 py-px rounded-full" style="background: var(--status-occupied); color: #fff;">今天</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="flex items-center justify-center py-12"><span class="inline-block w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></span></div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-6 px-4 py-3 border-t text-[11px] font-medium flex-wrap" style="border-color: var(--border-subtle);">
      <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: var(--status-available-bg); border:1px solid var(--status-available-border);"></span><span style="color: var(--text-secondary);">Free</span></span>
      <template v-if="granularity === 'day'">
        <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: var(--status-occupied-bg); border:1px solid var(--status-occupied-border);"></span><span style="color: var(--text-secondary);">Occupied</span></span>
        <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: var(--status-pending-bg); border:1px solid var(--status-pending-border);"></span><span style="color: var(--text-secondary);">Pending</span></span>
      </template>
      <template v-else>
        <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: var(--period-partial); border:1px solid var(--period-partial-border);"></span><span style="color: var(--text-secondary);">Partial</span></span>
        <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: var(--period-busy); border:1px solid var(--period-busy-border);"></span><span style="color: var(--text-secondary);">Busy</span></span>
        <span class="flex items-center gap-2"><span class="w-3.5 h-3.5 rounded-sm" style="background: var(--period-full); border:1px solid var(--period-full-border);"></span><span style="color: var(--text-secondary);">Full</span></span>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api'
const props = defineProps({ rooms:{type:Array,required:true} })
const emit = defineEmits(['select-room','book-slot'])

// ---- Constants ----
const TOTAL_SLOTS = 28; const SLOT_W = 56; const ROOM_COL_W = 144

// ---- State ----
const selectedDate = ref(new Date().toISOString().split('T')[0])
const minDate = new Date().toISOString().split('T')[0]
const roomSlots = ref({})
const granularity = ref('day')
const granularities = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' }
]

// ---- Range data (week/month) ----
const rangeData = ref(null)
const rangeLoading = ref(false)

// ---- Date helpers (dynamic — not frozen at import) ----
const todayStr = computed(() => new Date().toISOString().split('T')[0])
const nowTimeLabel = computed(() => {
  const n = new Date()
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`
})
const toDate = (s) => { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d) }
const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

// ---- Day view (existing) ----
const allTimeHeaders = computed(() => {
  const h = []
  for (let i = 8; i < 22; i++) { h.push({ label: `${String(i).padStart(2,'0')}:00`, hour: true }); h.push({ label: `${String(i).padStart(2,'0')}:30`, hour: false }) }
  return h
})
const nowIdxAbs = computed(() => {
  if (selectedDate.value !== todayStr.value) return -1
  const m = new Date().getHours() * 60 + new Date().getMinutes()
  return Math.floor((m - 8 * 60) / 30)
})
const isToday = computed(() => selectedDate.value === todayStr.value || (granularity.value !== 'day' && weekDays.value.some(d => d.isToday)))

const visibleStartIndex = computed(() => selectedDate.value !== todayStr.value? 0 : Math.max(0, nowIdxAbs.value - 1))
const visibleSlotCount = computed(() => TOTAL_SLOTS - visibleStartIndex.value)
const visibleTimeHeaders = computed(() => allTimeHeaders.value.slice(visibleStartIndex.value))
const visibleStartLabel = computed(() => { const si = visibleStartIndex.value; return si < allTimeHeaders.value.length ? allTimeHeaders.value[si].label : '' })
const visibleRoomSlotsMap = computed(() => {
  const map = {}
  for (const [id, slots] of Object.entries(roomSlots.value)) {
    map[id] = (slots || []).slice(visibleStartIndex.value)
  }
  return map
})

const nowLinePos = computed(() => {
  if (selectedDate.value !== todayStr.value|| granularity.value !== 'day') return null
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const mf8 = nowMin - 8*60; if (mf8 < 0 || mf8 > 14*60) return null
  const leftPx = ROOM_COL_W + (mf8/30 - visibleStartIndex.value) * SLOT_W
  return { left: `${leftPx}px`, label: `${String(Math.floor(nowMin/60)).padStart(2,'0')}:${String(nowMin%60).padStart(2,'0')}` }
})

const loadAllTimelines = async () => {
  const map = {}
  await Promise.all(props.rooms.map(async r => {
    try {
      const res = await api.get(`/rooms/${r.id}/timeline?date=${selectedDate.value}`)
      map[r.id] = (res.data.slots || []).map(s => ({ ...s, title: `${r.name} ${s.start}–${s.end} (${s.status})` }))
    } catch {
      const s = []
      for (let h=8; h<22; h++) for (let m=0; m<60; m+=30) {
        const a=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`, eh=m===30?h+1:h, em=m===30?0:30
        s.push({ status:'available', start:a, end:`${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}`, title:`${r.name} ${a}–${String(eh).padStart(2,'0')}:${String(em).padStart(2,'0')}` })
      }
      map[r.id] = s
    }
  }))
  roomSlots.value = map
}

const slotCellStyle = (slot, index) => {
  const b = { width: `${SLOT_W}px`, height: '52px', borderColor: 'var(--border-subtle)' }
  if (nowIdxAbs.value >= 0 && index <= nowIdxAbs.value) return { ...b, background: 'var(--status-past-bg)', color: 'var(--text-muted)', cursor: 'not-allowed', opacity: '0.3' }
  if (slot.status === 'occupied') return { ...b, background: 'var(--status-occupied-bg)', borderLeft: '1px solid var(--status-occupied-border)', color: 'var(--status-occupied)' }
  if (slot.status === 'pending') return { ...b, background: 'var(--status-pending-bg)', borderLeft: '1px solid var(--status-pending-border)', color: 'var(--status-pending)' }
  // Available slots: subtle green tint to show bookability
  const even = index % 2 === 0
  return { ...b, background: even ? 'var(--status-available-bg)' : 'rgba(16,185,129,0.03)', borderLeft: even ? '1px solid var(--status-available-border)' : '1px solid rgba(16,185,129,0.06)' }
}

// ---- Week view helpers ----
const weekDays = computed(() => {
  const d = toDate(selectedDate.value)
  const dayOfWeek = d.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const mon = new Date(d); mon.setDate(d.getDate() + mondayOffset)
  const days = []
  for (let i = 0; i < 7; i++) {
    const cur = new Date(mon); cur.setDate(mon.getDate() + i)
    const ds = fmtDate(cur)
    days.push({
      dateStr: ds,
      dayName: dayNames[cur.getDay()],
      dateLabel: `${cur.getMonth()+1}/${cur.getDate()}`,
      isToday: ds === todayStr.value,
      isPast: ds < todayStr.value
    })
  }
  return days
})

const weekStart = computed(() => weekDays.value[0]?.dateStr || selectedDate.value)
const weekEnd = computed(() => weekDays.value[6]?.dateStr || selectedDate.value)
const todayWeekIndex = computed(() => weekDays.value.findIndex(d => d.isToday))
const weekNowLineLeft = computed(() => {
  const idx = todayWeekIndex.value
  if (idx < 0) return null
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  const frac = (nowMin - 8 * 60) / (14 * 60) // 0..1 within 08:00-22:00
  return { colPx: `${ROOM_COL_W + idx * 120}px`, frac, label: nowTimeLabel.value }
})

// ---- Month view helpers ----
const monthCells = computed(() => {
  const d = toDate(selectedDate.value)
  const year = d.getFullYear(); const month = d.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  // Pad: Monday=1, Sunday=7 → we want day 1 at column (getDay()==0?6:getDay()-1)
  let startDow = firstDay.getDay()  // 0=Sun
  const padStart = startDow === 0 ? 6 : startDow - 1  // Make Mon column 0
  const cells = []
  for (let i = 0; i < padStart; i++) cells.push({ day: '', dateStr: null })
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const cur = new Date(year, month, day)
    cells.push({ day: String(day), dateStr: fmtDate(cur), isToday: fmtDate(cur) === todayStr.value, isPast: fmtDate(cur) < todayStr.value })
  }
  return cells
})

const monthStart = computed(() => { const d = toDate(selectedDate.value); return fmtDate(new Date(d.getFullYear(), d.getMonth(), 1)) })
const monthEnd = computed(() => { const d = toDate(selectedDate.value); return fmtDate(new Date(d.getFullYear(), d.getMonth()+1, 0)) })

// ---- Range label ----
const rangeLabel = computed(() => {
  if (granularity.value === 'week') {
    const ws = toDate(weekStart.value); const we = toDate(weekEnd.value)
    return `${ws.getMonth()+1}/${ws.getDate()} – ${we.getMonth()+1}/${we.getDate()}`
  }
  if (granularity.value === 'month') {
    const d = toDate(selectedDate.value)
    return `${d.getFullYear()}年${d.getMonth()+1}月`
  }
  return ''
})

// ---- Navigation ----
const setGranularity = (g) => { granularity.value = g; rangeData.value = null }
const navigate = (dir) => {
  const d = toDate(selectedDate.value)
  if (granularity.value === 'month') d.setMonth(d.getMonth() + dir)
  else { const off = granularity.value === 'week' ? 7 : 1; d.setDate(d.getDate() + dir * off) }
  const nd = fmtDate(d)
  selectedDate.value = dir < 0 && nd < minDate ? minDate : nd
}
const drillToDay = (dateStr) => {
  if (dateStr < minDate) return
  granularity.value = 'day'
  selectedDate.value = dateStr
}

// ---- Range data loading (week/month) ----
const loadRangeData = async () => {
  const floor = props.rooms[0]?.floor
  if (!floor) return
  let start, end
  if (granularity.value === 'week') { start = weekStart.value; end = weekEnd.value }
  else if (granularity.value === 'month') { start = monthStart.value; end = monthEnd.value }
  else return
  rangeLoading.value = true
  try {
    const res = await api.get(`/rooms/range?start=${start}&end=${end}&floor=${encodeURIComponent(floor)}`)
    rangeData.value = res.data.rooms || []
  } catch { rangeData.value = [] }
  finally { rangeLoading.value = false }
}

// O(1) room lookup via Map (instead of O(n) .find per cell)
const rangeDataMap = computed(() => {
  if (!rangeData.value) return new Map()
  const m = new Map(); for (const r of rangeData.value) m.set(r.id, r); return m
})
const getDayData = (roomId, dateStr) => {
  const rd = rangeDataMap.value.get(roomId)
  return rd?.days?.[dateStr] || {}
}

// Module-level period color lookup (no allocation per call)
const PERIOD_COLORS = {
  free:    { background: 'var(--status-available-bg)', color: 'var(--status-available)', border: '1px solid var(--status-available-border)' },
  partial: { background: 'var(--period-partial)', color: 'var(--period-partial-text)', border: '1px solid var(--period-partial-border)' },
  busy:    { background: 'var(--period-busy)', color: 'var(--period-busy-text)', border: '1px solid var(--period-busy-border)' },
  full:    { background: 'var(--period-full)', color: 'var(--period-full-text)', border: '1px solid var(--period-full-border)' },
}
const PERIOD_DEFAULT = { background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }
const periodColor = (status) => PERIOD_COLORS[status] || PERIOD_DEFAULT

const periodBar = (roomId, dateStr, period) => {
  const dd = getDayData(roomId, dateStr)
  const c = periodColor(dd[period] || 'free')
  return { background: c.background, border: c.border, color: c.color, height: '18px' }
}

const monthCellStyle = (roomId, cell) => {
  const b = { width: '120px', height: '52px', borderColor: 'var(--border-subtle)' }
  if (!cell.dateStr) return { ...b, cursor: 'default', opacity: '0.2' }
  if (cell.isToday) { b.borderColor = 'var(--status-occupied)'; b.border = '2px solid var(--status-occupied)'; }
  else if (cell.isPast) return { ...b, background: 'var(--status-past-bg)', opacity: '0.4' }
  const dd = getDayData(roomId, cell.dateStr)
  // If no data loaded yet or no periods, show neutral
  if (!dd || Object.keys(dd).length === 0) return { ...b, background: 'var(--bg-hover)' }
  const periods = [dd.morning, dd.afternoon, dd.evening]
  const freeCount = periods.filter(p => p === 'free').length
  if (freeCount === 3) return { ...b, background: 'var(--status-available-bg)' }
  if (freeCount === 0) return { ...b, background: 'var(--period-full)' }
  if (freeCount === 1) return { ...b, background: 'var(--period-busy)' }
  return { ...b, background: 'var(--period-partial)' }
}

// ---- Emit handlers ----
const selectRoom = (room) => { emit('select-room', room) }
const bookSlot = (room, absSi) => {
  const slot = (roomSlots.value[room.id] || [])[absSi]
  if (!slot || slot.status !== 'available') return
  emit('book-slot', { room, start: slot.start, date: selectedDate.value })
}

// ---- Lifecycle ----
onMounted(() => loadAllTimelines())
watch([() => props.rooms, selectedDate], () => { if (granularity.value === 'day') loadAllTimelines() })
// Single watcher for week/month — avoids firing loadRangeData twice
watch([granularity, weekStart, monthStart], () => { if (granularity.value !== 'day') loadRangeData() })
</script>
