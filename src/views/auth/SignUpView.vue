<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const agreedToTerms = ref(false)

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: ''
})

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm() {
  let valid = true
  Object.keys(errors).forEach(key => errors[key] = '')

  if (!form.name.trim()) {
    errors.name = 'Full name is required'
    valid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
    valid = false
  }

  if (!form.email) {
    errors.email = 'Email is required'
    valid = false
  } else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email address'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    valid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    valid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    valid = false
  }

  if (!agreedToTerms.value) {
    errors.terms = 'You must agree to the terms'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validateForm()) return

  const result = await authStore.signUp(form.name, form.email, form.password)
  if (result.success) {
    router.push({ name: 'Home' })
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <!-- Left Side - Branding -->
      <div class="auth-branding">
        <div class="branding-content">
          <div class="brand-logo">
            <div class="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="white" stroke-width="2.5"/>
                <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="16" cy="20" r="2" fill="white"/>
              </svg>
            </div>
            <span class="brand-name">SocialApp</span>
          </div>
          <h1 class="branding-title">Join millions of people sharing their stories.</h1>
          <p class="branding-subtitle">Create your account and start connecting with people who share your interests.</p>
        </div>
        <div class="branding-art">
          <div class="art-circle art-circle-1"></div>
          <div class="art-circle art-circle-2"></div>
          <div class="art-circle art-circle-3"></div>
        </div>
      </div>

      <!-- Right Side - Form -->
      <div class="auth-form-section">
        <div class="auth-form-wrapper">
          <div class="form-header">
            <h2>Create an account</h2>
            <p>Get started with your free account</p>
          </div>

          <div class="social-login">
            <button class="social-btn google-btn" type="button">
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.84h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.34z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H1.08v2.58A9.99 9.99 0 0 0 10 20z" fill="#34A853"/>
                <path d="M4.42 11.91A6.01 6.01 0 0 1 4.1 10c0-.66.12-1.3.32-1.91V5.51H1.08A9.99 9.99 0 0 0 0 10c0 1.61.39 3.14 1.08 4.49l3.34-2.58z" fill="#FBBC05"/>
                <path d="M10 3.96c1.47 0 2.78.5 3.82 1.5l2.86-2.86C14.96.99 12.7 0 10 0 6.09 0 2.71 2.24 1.08 5.51l3.34 2.58C5.2 5.72 7.4 3.96 10 3.96z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            <button class="social-btn github-btn" type="button">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 10 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.163 20 14.418 20 10c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div class="divider">
            <span>or sign up with email</span>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
            <div class="form-group" :class="{ 'has-error': errors.name }">
              <label for="name">Full name</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 16.5C3 13.4624 5.46243 11 8.5 11H9.5C12.5376 11 15 13.4624 15 16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input id="name" v-model="form.name" type="text" placeholder="Enter your full name" autocomplete="name" @input="errors.name = ''" />
              </div>
              <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
            </div>

            <div class="form-group" :class="{ 'has-error': errors.email }">
              <label for="email">Email address</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 5L9 9.5L15 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="2" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <input id="email" v-model="form.email" type="email" placeholder="Enter your email" autocomplete="email" @input="errors.email = ''" />
              </div>
              <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
            </div>

            <div class="form-group" :class="{ 'has-error': errors.password }">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M6 8V5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="9" cy="12" r="1" fill="currentColor"/>
                </svg>
                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Create a password (min 8 chars)" autocomplete="new-password" @input="errors.password = ''" />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M1.5 9C1.5 9 4 3.5 9 3.5C14 3.5 16.5 9 16.5 9C16.5 9 14 14.5 9 14.5C4 14.5 1.5 9 1.5 9Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 2L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M6.5 6.76A3 3 0 0 0 9 12.5C10.12 12.5 11.08 11.82 11.5 10.85" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
            </div>

            <div class="form-group" :class="{ 'has-error': errors.confirmPassword }">
              <label for="confirmPassword">Confirm password</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M6 8V5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M7.5 12L8.5 13L10.5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="Confirm your password" autocomplete="new-password" @input="errors.confirmPassword = ''" />
              </div>
              <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
            </div>

            <div class="form-options">
              <label class="checkbox-label" :class="{ 'has-error-text': errors.terms }">
                <input type="checkbox" v-model="agreedToTerms" @change="errors.terms = ''" />
                <span>I agree to the <a href="#" @click.prevent>Terms of Service</a> and <a href="#" @click.prevent>Privacy Policy</a></span>
              </label>
              <span class="error-message" v-if="errors.terms">{{ errors.terms }}</span>
            </div>

            <div class="alert alert-error" v-if="authStore.error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="8" cy="11.5" r="0.75" fill="currentColor"/>
              </svg>
              <span>{{ authStore.error }}</span>
            </div>

            <button type="submit" class="btn-primary" :disabled="authStore.loading">
              <span class="spinner" v-if="authStore.loading"></span>
              <span v-else>Create Account</span>
            </button>
          </form>

          <p class="auth-footer">
            Already have an account?
            <router-link :to="{ name: 'SignIn' }">Sign in</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: stretch; }
.auth-container { display: flex; width: 100%; min-height: 100vh; }

.auth-branding {
  flex: 1;
  background: linear-gradient(135deg, #6C5CE7 0%, #8B7CF7 50%, #A29BFE 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 3rem; position: relative; overflow: hidden;
}
.branding-content { position: relative; z-index: 2; max-width: 480px; color: white; }
.brand-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 2.5rem; }
.logo-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.15); border-radius: var(--radius-sm); backdrop-filter: blur(10px); }
.brand-name { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; }
.branding-title { font-size: 2.2rem; font-weight: 700; line-height: 1.2; margin-bottom: 1rem; letter-spacing: -0.03em; }
.branding-subtitle { font-size: 1rem; line-height: 1.6; opacity: 0.85; }
.branding-art { position: absolute; inset: 0; z-index: 1; }
.art-circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); }
.art-circle-1 { width: 300px; height: 300px; top: -80px; right: -60px; }
.art-circle-2 { width: 200px; height: 200px; bottom: -40px; left: -40px; }
.art-circle-3 { width: 120px; height: 120px; bottom: 30%; right: 10%; }

.auth-form-section { flex: 1; display: flex; align-items: center; justify-content: center; padding: 2rem; background: var(--color-surface); }
.auth-form-wrapper { width: 100%; max-width: 420px; }
.form-header { margin-bottom: 2rem; }
.form-header h2 { font-size: 1.75rem; font-weight: 700; color: var(--color-text); margin-bottom: 0.5rem; letter-spacing: -0.02em; }
.form-header p { color: var(--color-text-secondary); font-size: 0.95rem; }

.social-login { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
.social-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 0.75rem 1rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); font-size: 0.9rem; font-weight: 500; color: var(--color-text); transition: all var(--transition); }
.social-btn:hover { border-color: var(--color-text-muted); background: var(--color-input-bg); }

.divider { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--color-border); }
.divider span { font-size: 0.8rem; color: var(--color-text-muted); white-space: nowrap; }

.auth-form { display: flex; flex-direction: column; gap: 1.1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-group label { font-size: 0.85rem; font-weight: 500; color: var(--color-text); }

.input-wrapper { position: relative; display: flex; align-items: center; }
.input-icon { position: absolute; left: 14px; color: var(--color-text-muted); pointer-events: none; transition: color var(--transition); }
.input-wrapper input { width: 100%; padding: 0.8rem 0.8rem 0.8rem 2.75rem; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.9rem; color: var(--color-text); background: var(--color-input-bg); transition: all var(--transition); }
.input-wrapper input::placeholder { color: var(--color-text-muted); }
.input-wrapper input:focus { border-color: var(--color-border-focus); background: var(--color-surface); box-shadow: 0 0 0 3px rgba(108,92,231,0.1); }
.has-error .input-wrapper input { border-color: var(--color-danger); }

.toggle-password { position: absolute; right: 12px; background: none; padding: 4px; color: var(--color-text-muted); transition: color var(--transition); }
.toggle-password:hover { color: var(--color-text-secondary); }
.error-message { font-size: 0.78rem; color: var(--color-danger); }

.form-options { display: flex; flex-direction: column; gap: 4px; }
.checkbox-label { display: flex; align-items: flex-start; gap: 8px; font-size: 0.85rem; color: var(--color-text-secondary); cursor: pointer; user-select: none; }
.checkbox-label input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer; margin-top: 2px; flex-shrink: 0; }
.checkbox-label a { color: var(--color-primary); font-weight: 500; }

.alert { display: flex; align-items: center; gap: 8px; padding: 0.75rem 1rem; border-radius: var(--radius-sm); font-size: 0.85rem; }
.alert-error { background: #FEF0ED; color: var(--color-danger); border: 1px solid #FDDDD6; }

.btn-primary { width: 100%; padding: 0.85rem; background: var(--color-primary); color: white; border-radius: var(--radius-md); font-size: 0.95rem; font-weight: 600; transition: all var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 0.25rem; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-hover); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(108,92,231,0.3); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.auth-footer { text-align: center; margin-top: 1.75rem; font-size: 0.9rem; color: var(--color-text-secondary); }
.auth-footer a { font-weight: 600; color: var(--color-primary); }

@media (max-width: 968px) {
  .auth-container { flex-direction: column; }
  .auth-branding { padding: 2rem; min-height: auto; }
  .branding-title { font-size: 1.6rem; }
  .branding-subtitle { display: none; }
}
@media (max-width: 480px) {
  .auth-branding { padding: 1.5rem; }
  .branding-title { font-size: 1.3rem; }
  .auth-form-section { padding: 1.5rem 1rem 2rem; }
  .form-header h2 { font-size: 1.4rem; }
}
</style>
