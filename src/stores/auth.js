import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

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
      // Simulate API call — replace with real API endpoint
      await new Promise(resolve => setTimeout(resolve, 1200))

      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      // Simulated successful response
      const userData = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0],
        avatar: null,
        createdAt: new Date().toISOString()
      }
      const authToken = 'token_' + crypto.randomUUID()

      setAuth(userData, authToken)
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
      await new Promise(resolve => setTimeout(resolve, 1200))

      if (!name || !email || !password) {
        throw new Error('All fields are required')
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      const userData = {
        id: crypto.randomUUID(),
        email,
        name,
        avatar: null,
        createdAt: new Date().toISOString()
      }
      const authToken = 'token_' + crypto.randomUUID()

      setAuth(userData, authToken)
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
      await new Promise(resolve => setTimeout(resolve, 300))
      clearAuth()
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email) {
    loading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (!email) {
        throw new Error('Email is required')
      }

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
    forgotPassword
  }
})
