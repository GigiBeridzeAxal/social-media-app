<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usersService } from '../services/users'

const router = useRouter()
const authStore = useAuthStore()

const profileName = ref(authStore.currentUser?.name || '')
const profileBio = ref(authStore.currentUser?.bio || '')
const profileLoading = ref(false)
const profileSuccess = ref(false)
const profileError = ref(null)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)
const passwordSuccess = ref(false)
const passwordError = ref(null)

const showDeleteConfirm = ref(false)

async function updateProfile() {
  profileLoading.value = true
  profileSuccess.value = false
  profileError.value = null

  try {
    const userId = authStore.currentUser?.id
    if (!userId) throw new Error('User not found')

    await usersService.updateProfile(userId, {
      name: profileName.value,
      bio: profileBio.value
    })

    // Update local user data
    const updatedUser = { ...authStore.currentUser, name: profileName.value, bio: profileBio.value }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    authStore.user = updatedUser
    profileSuccess.value = true
  } catch (err) {
    profileError.value = err.message || 'Failed to update profile'
  } finally {
    profileLoading.value = false
  }
}

async function handleChangePassword() {
  passwordLoading.value = true
  passwordSuccess.value = false
  passwordError.value = null

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match'
    passwordLoading.value = false
    return
  }

  if (newPassword.value.length < 8) {
    passwordError.value = 'New password must be at least 8 characters'
    passwordLoading.value = false
    return
  }

  try {
    const result = await authStore.changePassword(currentPassword.value, newPassword.value)
    if (result.success) {
      passwordSuccess.value = true
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      passwordError.value = result.error
    }
  } catch (err) {
    passwordError.value = err.message || 'Failed to change password'
  } finally {
    passwordLoading.value = false
  }
}

async function handleSignOut() {
  await authStore.signOut()
  router.push({ name: 'SignIn' })
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

function getAvatarColor(name) {
  const colors = ['#6C5CE7', '#00CEC9', '#E17055', '#00B894', '#FDCB6E', '#A29BFE', '#FF7675', '#74B9FF']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
</script>

<template>
  <div class="settings-page">
    <!-- Top Navigation Bar -->
    <header class="top-bar">
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
          <div class="user-avatar-btn" @click="handleSignOut" :title="'Sign out'">
            <div class="avatar avatar-sm" :style="{ background: getAvatarColor(authStore.currentUser?.name || 'User') }">
              {{ getInitials(authStore.currentUser?.name || 'User') }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="settings-container">
      <h1 class="page-title">Settings</h1>

      <!-- Profile Settings -->
      <div class="settings-card">
        <h2 class="card-heading">Profile</h2>
        <form @submit.prevent="updateProfile" class="settings-form">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input v-model="profileName" type="text" class="form-input" placeholder="Your name" />
          </div>
          <div class="form-group">
            <label class="form-label">Bio</label>
            <textarea v-model="profileBio" class="form-input form-textarea" placeholder="Tell us about yourself" rows="3"></textarea>
          </div>
          <div v-if="profileError" class="form-message error">{{ profileError }}</div>
          <div v-if="profileSuccess" class="form-message success">Profile updated successfully!</div>
          <button type="submit" class="btn btn-primary" :disabled="profileLoading">
            {{ profileLoading ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="settings-card">
        <h2 class="card-heading">Change Password</h2>
        <form @submit.prevent="handleChangePassword" class="settings-form">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input v-model="currentPassword" type="password" class="form-input" placeholder="Enter current password" />
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input v-model="newPassword" type="password" class="form-input" placeholder="Enter new password" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input v-model="confirmPassword" type="password" class="form-input" placeholder="Confirm new password" />
          </div>
          <div v-if="passwordError" class="form-message error">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="form-message success">Password changed successfully!</div>
          <button type="submit" class="btn btn-primary" :disabled="passwordLoading">
            {{ passwordLoading ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
      </div>

      <!-- Account Actions -->
      <div class="settings-card">
        <h2 class="card-heading">Account</h2>
        <div class="account-actions">
          <button class="btn btn-outline" @click="handleSignOut">Sign Out</button>
          <button class="btn btn-danger" @click="showDeleteConfirm = true">Delete Account</button>
        </div>

        <!-- Delete Confirmation -->
        <div v-if="showDeleteConfirm" class="delete-confirm">
          <p class="delete-warning">Are you sure you want to delete your account? This action cannot be undone.</p>
          <div class="delete-actions">
            <button class="btn btn-outline" @click="showDeleteConfirm = false">Cancel</button>
            <button class="btn btn-danger">Confirm Delete</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.92);
}

.top-bar-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1.5rem;
  gap: 1rem;
}

.brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.brand-link { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.logo-icon { color: var(--color-primary); display: flex; }
.brand-name { font-weight: 700; font-size: 1.15rem; color: var(--color-primary); letter-spacing: -0.02em; }

.search-bar { flex: 1; max-width: 400px; position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  background: var(--color-input-bg);
  border: 1.5px solid transparent;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  color: var(--color-text);
  transition: all var(--transition);
}
.search-input::placeholder { color: var(--color-text-muted); }
.search-input:focus { border-color: var(--color-primary); background: var(--color-surface); box-shadow: 0 0 0 3px var(--color-primary-bg); }

.user-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.user-avatar-btn { cursor: pointer; transition: transform var(--transition); }
.user-avatar-btn:hover { transform: scale(1.05); }

.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-sm { width: 32px; height: 32px; font-size: 0.7rem; }

.settings-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
}

.settings-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  margin-bottom: 1rem;
}

.card-heading {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form-input {
  padding: 0.6rem 0.85rem;
  background: var(--color-input-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: var(--color-text);
  transition: all var(--transition);
  font-family: var(--font-family);
}

.form-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-message {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
}

.form-message.error {
  background: #fef2f2;
  color: var(--color-danger);
  border: 1px solid #fecaca;
}

.form-message.success {
  background: #f0fdf4;
  color: var(--color-success);
  border: 1px solid #bbf7d0;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  border: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-outline {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
}

.btn-outline:hover {
  border-color: var(--color-text);
}

.btn-danger {
  background: var(--color-danger);
  color: white;
}

.btn-danger:hover {
  background: var(--color-danger-hover, #D35B3E);
}

.account-actions {
  display: flex;
  gap: 0.75rem;
}

.delete-confirm {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
}

.delete-warning {
  font-size: 0.9rem;
  color: var(--color-danger);
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.delete-actions {
  display: flex;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .settings-container { padding: 1rem 0.5rem; }
  .top-bar-inner { padding: 0.5rem 1rem; }
  .search-bar { display: none; }
  .account-actions { flex-direction: column; }
}
</style>
