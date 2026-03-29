<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function getAvatarColor(name) {
  const colors = ['#6C5CE7', '#00CEC9', '#E17055', '#00B894', '#FDCB6E', '#A29BFE', '#FF7675', '#74B9FF']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function formatCount(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num || 0)
}

const userId = authStore.currentUser?._id || authStore.currentUser?.id || ''
const userName = authStore.currentUser?.name || 'User'
const userUsername = authStore.currentUser?.username || '@user'
const userBio = authStore.currentUser?.bio || 'Social media user.'

const navItems = [
  { icon: 'home', label: 'Feed', to: '/' },
  { icon: 'explore', label: 'Explore', to: '#' },
  { icon: 'notifications', label: 'Notifications', to: '#', badge: 3 },
  { icon: 'messages', label: 'Messages', to: '#', badge: 1 },
  { icon: 'bookmarks', label: 'Bookmarks', to: '#' },
  { icon: 'profile', label: 'Profile', to: '/profile/' + userId },
  { icon: 'settings', label: 'Settings', to: '/settings' }
]

function isActive(item) {
  if (item.to === '#') return false
  if (item.to === '/') return route.path === '/' || route.path === '/dashboard'
  return route.path.startsWith(item.to)
}
</script>

<template>
  <aside class="sidebar">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar avatar-lg" :style="{ background: getAvatarColor(userName) }">
          {{ getInitials(userName) }}
        </div>
        <div class="profile-info">
          <h3 class="profile-name">{{ userName }}</h3>
          <span class="profile-username">{{ userUsername }}</span>
        </div>
      </div>
      <p class="profile-bio">{{ userBio }}</p>
      <div class="profile-stats">
        <div class="stat">
          <span class="stat-value">{{ formatCount(authStore.currentUser?.followers || 0) }}</span>
          <span class="stat-label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatCount(authStore.currentUser?.following || 0) }}</span>
          <span class="stat-label">Following</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ authStore.currentUser?.posts || 0 }}</span>
          <span class="stat-label">Posts</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <template v-for="item in navItems" :key="item.label">
        <router-link v-if="item.to !== '#'" :to="item.to" class="nav-link" :class="{ active: isActive(item) }">
          <svg v-if="item.icon === 'home'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <svg v-else-if="item.icon === 'profile'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <svg v-else-if="item.icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
        <a v-else href="#" class="nav-link" @click.prevent>
          <svg v-if="item.icon === 'explore'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
          </svg>
          <svg v-else-if="item.icon === 'notifications'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <svg v-else-if="item.icon === 'messages'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <svg v-else-if="item.icon === 'bookmarks'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </a>
      </template>
    </nav>

    <slot></slot>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex; flex-direction: column; gap: 1rem;
  position: sticky; top: 70px;
}
.profile-card {
  background: var(--color-surface); border-radius: var(--radius-lg);
  padding: 1.25rem; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border);
}
.profile-header { display: flex; align-items: center; gap: 12px; margin-bottom: 0.75rem; }
.profile-name { font-size: 0.95rem; font-weight: 700; color: var(--color-text); letter-spacing: -0.01em; }
.profile-username { font-size: 0.8rem; color: var(--color-text-muted); }
.profile-bio { font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 1rem; }
.profile-stats {
  display: flex; justify-content: space-between;
  padding-top: 0.75rem; border-top: 1px solid var(--color-border);
}
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.stat-value { font-size: 0.9rem; font-weight: 700; color: var(--color-text); }
.stat-label { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-lg { width: 52px; height: 52px; font-size: 1rem; }

.sidebar-nav {
  background: var(--color-surface); border-radius: var(--radius-lg); padding: 0.5rem;
  box-shadow: var(--shadow-sm); border: 1px solid var(--color-border);
  display: flex; flex-direction: column; gap: 2px;
}
.nav-link {
  display: flex; align-items: center; gap: 12px; padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md); color: var(--color-text-secondary);
  font-size: 0.88rem; font-weight: 500; transition: all var(--transition);
  text-decoration: none; position: relative;
}
.nav-link:hover { background: var(--color-input-bg); color: var(--color-text); }
.nav-link.active { background: var(--color-primary-bg); color: var(--color-primary); font-weight: 600; }
.nav-badge {
  margin-left: auto; background: var(--color-primary); color: white;
  font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full); min-width: 18px; text-align: center;
}
</style>
