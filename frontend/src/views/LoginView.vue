<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden" style="background: var(--bg-primary);">
    <div class="absolute inset-0 overflow-hidden">
      <div v-for="i in 20" :key="i" class="absolute rounded-full opacity-20" :style="{ width: `${4+(i%4)*2}px`, height: `${4+(i%4)*2}px`, left: `${(i*17+3)%100}%`, top: `${(i*13+7)%100}%`, background: i%3===0?'#818cf8':i%3===1?'#c084fc':'#38bdf8', animation: `float ${6+(i%4)}s ease-in-out ${i*0.3}s infinite` }"></div>
    </div>
    <div class="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px] animate-float"></div>
    <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] animate-float-delayed"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/15 rounded-full blur-[100px]"></div>

    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 glass-strong">
          <span class="text-3xl">&#x1F3E2;</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight" style="color: var(--text-primary);">九号楼会议室管理系统</h1>
        <p class="text-sm mt-2" style="color: var(--text-secondary);">高效 &middot; 透明 &middot; 极简的空间调度平台</p>
      </div>

      <div class="glass-strong rounded-2xl p-8">
        <div v-if="isLogin" class="space-y-5">
          <div><label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-secondary);">用户名</label><input v-model="form.username" type="text" class="w-full px-4 py-3 border rounded-xl text-base placeholder-slate-400 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all" style="background: var(--bg-input); border-color: var(--border-strong); color: var(--text-primary);" placeholder="请输入用户名" /></div>
          <div><label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-secondary);">密码</label><input v-model="form.password" type="password" class="w-full px-4 py-3 border rounded-xl text-base placeholder-slate-400 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all" style="background: var(--bg-input); border-color: var(--border-strong); color: var(--text-primary);" placeholder="请输入密码" @keyup.enter="handleLogin" /></div>
          <div v-if="error" class="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-3 border border-rose-500/20">{{ error }}</div>
          <button @click="handleLogin" class="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] uppercase" style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); box-shadow: 0 0 30px rgba(99,102,241,0.4), 0 4px 0 0 rgba(79,70,229,0.3);">登录</button>
          <p class="text-center text-sm" style="color: var(--text-muted);">还没有账号？<span @click="isLogin = false" class="text-indigo-400 cursor-pointer hover:text-indigo-300 font-medium transition-colors">立即注册</span></p>
        </div>
        <div v-else class="space-y-5">
          <div><label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-secondary);">用户名</label><input v-model="form.username" type="text" class="w-full px-4 py-3 border rounded-xl text-base placeholder-slate-400 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all" style="background: var(--bg-input); border-color: var(--border-strong); color: var(--text-primary);" placeholder="请输入用户名" /></div>
          <div><label class="block text-xs font-semibold uppercase tracking-wider mb-2" style="color: var(--text-secondary);">密码</label><input v-model="form.password" type="password" class="w-full px-4 py-3 border rounded-xl text-base placeholder-slate-400 focus:outline-none focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20 transition-all" style="background: var(--bg-input); border-color: var(--border-strong); color: var(--text-primary);" placeholder="请输入密码" /></div>
          <div v-if="error" class="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-3 border border-rose-500/20">{{ error }}</div>
          <button @click="handleRegister" class="w-full py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-300 active:scale-[0.98] hover:scale-[1.02] uppercase" style="background: linear-gradient(135deg, #10b981, #14b8a6); box-shadow: 0 0 30px rgba(16,185,129,0.4), 0 4px 0 0 rgba(5,150,105,0.3);">注册</button>
          <p class="text-center text-sm" style="color: var(--text-muted);">已有账号？<span @click="isLogin = true" class="text-indigo-400 cursor-pointer hover:text-indigo-300 font-medium transition-colors">返回登录</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
const router = useRouter()
const isLogin = ref(true)
const error = ref('')
const form = reactive({ username: '', password: '' })
const handleLogin = async () => {
  error.value = ''
  try { const res = await api.post('/auth/login', { username: form.username, password: form.password }); localStorage.setItem('token', res.data.token); localStorage.setItem('role', res.data.user.role); localStorage.setItem('username', res.data.user.username); router.push(res.data.user.role === 'admin' ? '/admin' : '/dashboard') } catch (e) { error.value = e.response?.data?.error || '登录失败' }
}
const handleRegister = async () => {
  error.value = ''
  try { await api.post('/auth/register', { username: form.username, password: form.password }); alert('注册成功，请登录'); isLogin.value = true } catch (e) { error.value = e.response?.data?.error || '注册失败' }
}
</script>
