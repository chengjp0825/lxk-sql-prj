<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-8">九号楼会议室管理系统</h1>

      <div v-if="isLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入用户名"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <button
          @click="handleLogin"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          登录
        </button>
        <p class="text-center text-sm text-gray-600 mt-4">
          还没有账号?
          <span @click="isLogin = false" class="text-blue-500 cursor-pointer hover:underline">立即注册</span>
        </p>
      </div>

      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入用户名"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入密码"
          />
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <button
          @click="handleRegister"
          class="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          注册
        </button>
        <p class="text-center text-sm text-gray-600 mt-4">
          已有账号?
          <span @click="isLogin = true" class="text-blue-500 cursor-pointer hover:underline">返回登录</span>
        </p>
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
const form = reactive({
  username: '',
  password: '',
})

const handleLogin = async () => {
  error.value = ''
  try {
    const res = await api.post('/auth/login', {
      username: form.username,
      password: form.password,
    })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('role', res.data.user.role)
    localStorage.setItem('username', res.data.user.username)

    if (res.data.user.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  } catch (e) {
    error.value = e.response?.data?.error || '登录失败'
  }
}

const handleRegister = async () => {
  error.value = ''
  try {
    await api.post('/auth/register', {
      username: form.username,
      password: form.password,
    })
    error.value = ''
    alert('注册成功，请登录')
    isLogin.value = true
  } catch (e) {
    error.value = e.response?.data?.error || '注册失败'
  }
}
</script>
