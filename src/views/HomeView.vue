<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleSignOut() {
  await authStore.signOut()
  router.push({ name: 'SignIn' })
}
</script>

<template>
  <div class="home-page">
    <header class="top-bar">
      <div class="brand">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5"/>
            <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="16" cy="20" r="2" fill="currentColor"/>
          </svg>
        </div>
        <span>SocialApp</span>
      </div>
      <div class="user-info">
        <span class="user-name">{{ authStore.currentUser?.name }}</span>
        <button class="sign-out-btn" @click="handleSignOut">Sign Out</button>
      </div>
    </header>

    <main class="main-content">
      <div class="welcome-card">
        <h1>Welcome, {{ authStore.currentUser?.name }}!</h1>
        <p>You're signed in successfully. This is your social media feed — more features coming soon.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page { min-height: 100vh; background: var(--color-bg); }

.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky; top: 0; z-index: 10;
}

.brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1.1rem; color: var(--color-primary); }
.logo-icon { color: var(--color-primary); display: flex; }

.user-info { display: flex; align-items: center; gap: 12px; }
.user-name { font-size: 0.9rem; font-weight: 500; color: var(--color-text-secondary); }
.sign-out-btn { padding: 0.4rem 1rem; font-size: 0.85rem; font-weight: 500; color: var(--color-danger); background: none; border: 1.5px solid var(--color-danger); border-radius: var(--radius-sm); transition: all var(--transition); }
.sign-out-btn:hover { background: var(--color-danger); color: white; }

.main-content { max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
.welcome-card { background: var(--color-surface); border-radius: var(--radius-lg); padding: 2.5rem; box-shadow: var(--shadow-md); text-align: center; }
.welcome-card h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
.welcome-card p { color: var(--color-text-secondary); line-height: 1.6; }
</style>
