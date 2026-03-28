import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL || ''

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const authChecked = ref(false)

  async function checkAuth() {
    if (!token.value) {
      authChecked.value = true
      return false
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (!res.ok) {
        clearAuth()
        authChecked.value = true
        return false
      }

      const data = await res.json()

      if (data.user) {
        user.value = data.user
        localStorage.setItem('user', JSON.stringify(data.user))
        authChecked.value = true
        return true
      }

      clearAuth()
      authChecked.value = true
      return false
    } catch {
      // If backend is unreachable, fall back to local token check
      authChecked.value = true
      return !!token.value
    }
  }

  function setAuth(userData, authToken) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
  }

  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  async function signIn(email, password) {
    loading.value = true
    error.value = null

    try {
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const data = await api.post('/api/auth/signin', { email, password })
      setAuth(data.user, data.token)
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Sign in failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function signUp(name, email, password) {
    loading.value = true
    error.value = null

    try {
      if (!name || !email || !password) {
        throw new Error('All fields are required')
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      const data = await api.post('/api/auth/signup', { name, email, password })
      setAuth(data.user, data.token)
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Sign up failed. Please try again.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    loading.value = true
    try {
      await api.post('/api/auth/logout').catch(() => {})
      clearAuth()
    } finally {
      loading.value = false
    }
  }

  async function changePassword(currentPassword, newPassword) {
    loading.value = true
    error.value = null

    try {
      if (!currentPassword || !newPassword) {
        throw new Error('Both current and new password are required')
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters')
      }

      await api.post('/api/auth/change-password', { currentPassword, newPassword })
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to change password.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email) {
    loading.value = true
    error.value = null

    try {
      if (!email) {
        throw new Error('Email is required')
      }

      await api.post('/api/auth/forgot-password', { email })
      return { success: true }
    } catch (err) {
      error.value = err.message || 'Failed to send reset email.'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    currentUser,
    signIn,
    signUp,
    signOut,
    changePassword,
    forgotPassword,
    checkAuth,
    authChecked
  }
})
