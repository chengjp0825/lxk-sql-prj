<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden">
    <div class="absolute inset-0 opacity-40">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[128px] animate-pulse"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-[128px] animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full blur-[96px] animate-pulse" style="animation-delay: 2s;"></div>
    </div>

    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
             style="background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05)); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 8px 0 0 rgba(0,0,0,0.15), 0 20px 40px -12px rgba(0,0,0,0.3);">
          <span class="text-3xl">&#x1F3E2;</span>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight">九号楼会议室管理系统</h1>
        <p class="text-indigo-200/60 text-sm mt-2">高效 &middot; 透明 &middot; 极简的空间调度平台</p>
      </div>

      <div class="relative" style="background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; box-shadow: 0 8px 0 0 rgba(0,0,0,0.1), 0 24px 48px -12px rgba(0,0,0,0.3); backdrop-filter: blur(24px); padding: 32px;">
        <div v-if="isLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-indigo-200/80 mb-1.5">用户名</label>
            <input v-model="form.username" type="text"
              class="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);"
              placeholder="请输入用户名" />
          </div>
          <div>
            <label class="block text-sm font-medium text-indigo-200/80 mb-1.5">密码</label>
            <input v-model="form.password" type="password"
              class="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);"
              placeholder="请输入密码" @keyup.enter="handleLogin" />
          </div>
          <div v-if="error" class="text-rose-300 text-sm bg-rose-500/10 rounded-lg px-3 py-2 border border-rose-500/20">{{ error }}</div>
          <button @click="handleLogin"
            class="w-full py-2.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 active:scale-[0.98]"
            style="background: linear-gradient(135deg, #6366f1, #8b5cf6); box-shadow: 0 4px 0 0 rgba(99,102,241,0.3), 0 8px 24px -6px rgba(99,102,241,0.4);">
            登 录
          </button>
          <p class="text-center text-sm text-indigo-200/50">
            还没有账号？<span @click="isLogin = false" class="text-white cursor-pointer hover:underline font-medium">立即注册</span>
          </p>
        </div>

        <div v-else class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-indigo-200/80 mb-1.5">用户名</label>
            <input v-model="form.username" type="text"
              class="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);"
              placeholder="请输入用户名" />
          </div>
          <div>
            <label class="block text-sm font-medium text-indigo-200/80 mb-1.5">密码</label>
            <input v-model="form.password" type="password"
              class="w-full px-4 py-2.5 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);"
              placeholder="请输入密码" />
          </div>
          <div v-if="error" class="text-rose-300 text-sm bg-rose-500/10 rounded-lg px-3 py-2 border border-rose-500/20">{{ error }}</div>
          <button @click="handleRegister"
            class="w-full py-2.5 px-4 rounded-xl text-white font-semibold transition-all duration-200 active:scale-[0.98]"
            style="background: linear-gradient(135deg, #10b981, #14b8a6); box-shadow: 0 4px 0 0 rgba(16,185,129,0.3), 0 8px 24px -6px rgba(16,185,129,0.3);">
            注 册
          </button>
          <p class="text-center text-sm text-indigo-200/50">
            已有账号？<span @click="isLogin = true" class="text-white cursor-pointer hover:underline font-medium">返回登录</span>
          </p>
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
  try {
    const res = await api.post('/auth/login', { username: form.username, password: form.password })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', res.data.user.role)
    localStorage.setItem('username', res.data.user.username)
    router.push(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
  } catch (e) {
    error.value = e.response?.data?.error || '登录失败'
  }
}

const handleRegister = async () => {
  error.value = ''
  try {
    await api.post('/auth/register', { username: form.username, password: form.password })
    alert('注册成功，请登录')
    isLogin.value = true
  } catch (e) {
    error.value = e.response?.data?.error || '注册失败'
  }
}
</script>
