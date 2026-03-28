<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  userName: { type: String, required: true },
  userEmail: { type: String, default: '' },
  userId: { type: [String, Number], required: true }
})

const emit = defineEmits(['signout'])
const router = useRouter()
const isOpen = ref(false)
const dropdownRef = ref(null)

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function getAvatarColor(name) {
  const colors = ['#6C5CE7', '#00CEC9', '#E17055', '#00B894', '#FDCB6E', '#A29BFE', '#FF7675', '#74B9FF']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function toggle() {
  isOpen.value = !isOpen.value
}

function goToProfile() {
  isOpen.value = false
  router.push(`/profile/${props.userId}`)
}

function goToSettings() {
  isOpen.value = false
  router.push('/settings')
}

function signOut() {
  isOpen.value = false
  emit('signout')
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="profile-dropdown" ref="dropdownRef">
    <div class="profile-dropdown-trigger" @click="toggle" :title="userName">
      <div class="avatar avatar-sm" :style="{ background: getAvatarColor(userName) }">
        {{ getInitials(userName) }}
      </div>
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen" class="profile-dropdown-panel">
        <div class="dropdown-header">
          <div class="dropdown-header-name">{{ userName }}</div>
          <div v-if="userEmail" class="dropdown-header-email">{{ userEmail }}</div>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" @click="goToProfile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>My Profile</span>
        </button>
        <button class="dropdown-item" @click="goToSettings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span>Settings</span>
        </button>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item dropdown-item-danger" @click="signOut">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Sign Out</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.profile-dropdown {
  position: relative;
}

.profile-dropdown-trigger {
  cursor: pointer;
  transition: transform var(--transition);
}

.profile-dropdown-trigger:hover {
  transform: scale(1.05);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
  user-select: none;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.7rem;
}

.profile-dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 200;
  overflow: hidden;
}

.dropdown-header {
  padding: 12px 14px;
}

.dropdown-header-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}

.dropdown-header-email {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition);
  text-align: left;
}

.dropdown-item:hover {
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.dropdown-item-danger {
  color: var(--color-danger);
}

.dropdown-item-danger:hover {
  background: #FFF0ED;
  color: var(--color-danger);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
