import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/HomeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () => import('../views/auth/SignInView.vue'),
    meta: { guest: true }
  },
  {
    path: '/login',
    redirect: '/signin'
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: () => import('../views/auth/SignUpView.vue'),
    meta: { guest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/auth/ForgotPasswordView.vue'),
    meta: { guest: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // On first navigation, verify auth status with backend
  if (!authStore.authChecked) {
    await authStore.checkAuth()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'SignIn' })
  } else if (to.meta.guest && authStore.isAuthenticated) {
    // Authenticated users visiting login/signup pages get redirected to dashboard
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
