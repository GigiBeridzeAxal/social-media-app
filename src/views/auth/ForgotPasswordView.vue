<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Redirect authenticated users away from forgot-password page
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace({ name: 'Home' })
  }
})
const email = ref('')
const emailError = ref('')
const emailSent = ref(false)

function validateEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

async function handleSubmit() {
  emailError.value = ''
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  if (!validateEmail(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }
  const result = await authStore.forgotPassword(email.value)
  if (result.success) {
    emailSent.value = true
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <router-link :to="{ name: 'SignIn' }" class="back-link">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4L6 9L11 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back to sign in
      </router-link>

      <div v-if="!emailSent">
        <div class="form-header">
          <div class="header-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="4" y="11" width="20" height="14" rx="3" stroke="currentColor" stroke-width="2"/>
              <path d="M9 11V8C9 5.23858 11.2386 3 14 3C16.7614 3 19 5.23858 19 8V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="14" cy="18" r="2" fill="currentColor"/>
            </svg>
          </div>
          <h2>Reset your password</h2>
          <p>Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
          <div class="form-group" :class="{ 'has-error': emailError }">
            <label for="email">Email address</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5L9 9.5L15 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <input id="email" v-model="email" type="email" placeholder="Enter your email" autocomplete="email" @input="emailError = ''" />
            </div>
            <span class="error-message" v-if="emailError">{{ emailError }}</span>
          </div>

          <div class="alert alert-error" v-if="authStore.error">
            <span>{{ authStore.error }}</span>
          </div>

          <button type="submit" class="btn-primary" :disabled="authStore.loading">
            <span class="spinner" v-if="authStore.loading"></span>
            <span v-else>Send Reset Link</span>
          </button>
        </form>
      </div>

      <div v-else class="success-state">
        <div class="success-icon">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="var(--color-success)" stroke-width="2"/>
            <path d="M13 20L18 25L27 15" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>Check your email</h2>
        <p>We've sent a password reset link to <strong>{{ email }}</strong>. Check your inbox and follow the instructions.</p>
        <router-link :to="{ name: 'SignIn' }" class="btn-primary" style="display: flex; text-decoration: none;">
          Return to Sign In
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--color-bg); }
.auth-card { width: 100%; max-width: 440px; background: var(--color-surface); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-lg); }

.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 2rem; transition: color var(--transition); }
.back-link:hover { color: var(--color-primary); }

.form-header { margin-bottom: 2rem; }
.header-icon { width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: var(--color-primary-bg); border-radius: var(--radius-md); color: var(--color-primary); margin-bottom: 1.25rem; }
.form-header h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
.form-header p { color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.5; }

.auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.85rem; font-weight: 500; }
.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; color: var(--color-text-muted); pointer-events: none; }
.input-wrapper input { width: 100%; padding: 0.8rem 0.8rem 0.8rem 2.75rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.9rem; color: var(--color-text); background: var(--color-input-bg); transition: all var(--transition); }
.input-wrapper input::placeholder { color: var(--color-text-muted); }
.input-wrapper input:focus { border-color: var(--color-border-focus); background: var(--color-surface); box-shadow: 0 0 0 3px rgba(108,92,231,0.1); }
.has-error .input-wrapper input { border-color: var(--color-danger); }
.error-message { font-size: 0.78rem; color: var(--color-danger); }
.alert-error { background: #FEF0ED; color: var(--color-danger); border: 1px solid #FDDDD6; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem; }

.btn-primary { width: 100%; padding: 0.85rem; background: var(--color-primary); color: white; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 600; transition: all var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(108,92,231,0.3); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.success-state { text-align: center; }
.success-icon { margin: 0 auto 1.25rem; }
.success-state h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; }
.success-state p { color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 2rem; }
.success-state strong { color: var(--color-text); }
</style>
