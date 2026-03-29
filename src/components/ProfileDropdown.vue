<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isOpen = ref(false)
const dropdownRef = ref(null)

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

function toggle() { isOpen.value = !isOpen.value }

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

function goToProfile() {
  const userId = authStore.currentUser?._id || authStore.currentUser?.id || ''
  router.push(`/profile/${userId}`)
  isOpen.value = false
}

function goToSettings() {
  router.push('/settings')
  isOpen.value = false
}

async function handleLogout() {
  isOpen.value = false
  await authStore.signOut()
  router.push({ name: 'SignIn' })
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const userName = authStore.currentUser?.name || 'User'
const userEmail = authStore.currentUser?.email || ''
</script>

<template>
  <div class="profile-dropdown" ref="dropdownRef">
    <button class="avatar-trigger" @click="toggle" :title="userName">
      <div class="avatar avatar-sm" :style="{ background: getAvatarColor(userName) }">
        {{ getInitials(userName) }}
      </div>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <div class="avatar avatar-md" :style="{ background: getAvatarColor(userName) }">
            {{ getInitials(userName) }}
          </div>
          <div class="dropdown-user-info">
            <span class="dropdown-user-name">{{ userName }}</span>
            <span v-if="userEmail" class="dropdown-user-email">{{ userEmail }}</span>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" @click="goToProfile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          My Profile
        </button>
        <button class="dropdown-item" @click="goToSettings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Settings
        </button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item dropdown-item-danger" @click="handleLogout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.profile-dropdown { position: relative; }
.avatar-trigger {
  background: none; padding: 0; cursor: pointer; transition: transform var(--transition);
  display: flex;
}
.avatar-trigger:hover { transform: scale(1.05); }

.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-sm { width: 32px; height: 32px; font-size: 0.7rem; }
.avatar-md { width: 40px; height: 40px; font-size: 0.8rem; }

.dropdown-menu {
  position: absolute; top: calc(100% + 8px); right: 0; width: 260px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
  z-index: 200; overflow: hidden;
}
.dropdown-header {
  display: flex; align-items: center; gap: 10px; padding: 1rem;
}
.dropdown-user-info { display: flex; flex-direction: column; min-width: 0; }
.dropdown-user-name {
  font-size: 0.9rem; font-weight: 650; color: var(--color-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dropdown-user-email {
  font-size: 0.78rem; color: var(--color-text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dropdown-divider { height: 1px; background: var(--color-border); margin: 0; }
.dropdown-item {
  display: flex; align-items: center; gap: 10px; width: 100%; padding: 0.65rem 1rem;
  background: none; font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary);
  transition: all var(--transition); text-align: left;
}
.dropdown-item:hover { background: var(--color-input-bg); color: var(--color-text); }
.dropdown-item-danger { color: var(--color-danger); }
.dropdown-item-danger:hover { background: #fef2f2; color: var(--color-danger); }

.dropdown-enter-active, .dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-8px) scale(0.95); }
</style>
