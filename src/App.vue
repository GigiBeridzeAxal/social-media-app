<script setup>
import { useAuthStore } from './stores/auth'
import ProfileDropdown from './components/ProfileDropdown.vue'

const authStore = useAuthStore()
</script>

<template>
  <header v-if="authStore.isAuthenticated" class="top-bar">
    <div class="top-bar-inner">
      <div class="brand">
        <router-link to="/" class="brand-link">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5"/>
              <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="16" cy="20" r="2" fill="currentColor"/>
            </svg>
          </div>
          <span class="brand-name">SocialApp</span>
        </router-link>
      </div>

      <div class="search-bar">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Search..." class="search-input" />
      </div>

      <div class="user-actions">
        <button class="icon-btn notification-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="badge-dot"></span>
        </button>
        <ProfileDropdown />
      </div>
    </div>
  </header>

  <router-view />
</template>

<style scoped>
.top-bar {
  position: sticky; top: 0; z-index: 100;
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(12px); background: rgba(255, 255, 255, 0.92);
}
.top-bar-inner {
  max-width: 1200px; margin: 0 auto; display: flex; align-items: center;
  justify-content: space-between; padding: 0.65rem 1.5rem; gap: 1rem;
}
.brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.brand-link { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { color: var(--color-primary); display: flex; }
.brand-name { font-weight: 700; font-size: 1.15rem; color: var(--color-primary); letter-spacing: -0.02em; }

.search-bar { flex: 1; max-width: 400px; position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
.search-input {
  width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.5rem; background: var(--color-input-bg);
  border: 1.5px solid transparent; border-radius: var(--radius-full);
  font-size: 0.875rem; color: var(--color-text); transition: all var(--transition);
}
.search-input::placeholder { color: var(--color-text-muted); }
.search-input:focus { border-color: var(--color-primary); background: var(--color-surface); box-shadow: 0 0 0 3px var(--color-primary-bg); }

.user-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.icon-btn {
  position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: none; border-radius: var(--radius-full); color: var(--color-text-secondary); transition: all var(--transition);
}
.icon-btn:hover { background: var(--color-input-bg); color: var(--color-primary); }
.badge-dot {
  position: absolute; top: 6px; right: 7px; width: 8px; height: 8px;
  background: var(--color-danger); border-radius: 50%; border: 2px solid var(--color-surface);
}

@media (max-width: 768px) {
  .search-bar { display: none; }
  .top-bar-inner { padding: 0.65rem 1rem; }
}
</style>
