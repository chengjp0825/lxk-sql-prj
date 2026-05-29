import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import UserDashboardView from '../views/UserDashboardView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import MyBookingsView from '../views/MyBookingsView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/dashboard', name: 'Dashboard', component: UserDashboardView },
  { path: '/admin', name: 'Admin', component: AdminDashboardView },
  { path: '/my-bookings', name: 'MyBookings', component: MyBookingsView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login') {
    next('/login')
  } else if (token && to.path === '/login') {
    const role = localStorage.getItem('role')
    if (role === 'admin') {
      next('/admin')
    } else {
      next('/dashboard')
    }
  } else {
    next()
  }
})

export default router
