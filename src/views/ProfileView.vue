<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usersService } from '../services/users'
import ProfileDropdown from '../components/ProfileDropdown.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const profileUser = ref(null)
const userPosts = ref([])
const loading = ref(true)
const error = ref(null)
const followLoading = ref(false)

const isOwnProfile = computed(() => {
  return authStore.currentUser && String(authStore.currentUser.id) === String(route.params.id)
})

const mockProfile = computed(() => ({
  id: route.params.id,
  name: isOwnProfile.value ? (authStore.currentUser?.name || 'Alex Johnson') : 'User',
  username: isOwnProfile.value ? (authStore.currentUser?.username || '@alexjohnson') : '@user',
  bio: isOwnProfile.value ? 'Full-stack developer & design enthusiast. Building cool things.' : 'Social media user.',
  avatar: null,
  followers: 1284,
  following: 562,
  posts: 47,
  isFollowing: false
}))

async function loadProfile() {
  loading.value = true
  error.value = null
  try {
    const data = await usersService.getProfile(route.params.id)
    profileUser.value = data
  } catch {
    // Use mock data if API is unavailable
    profileUser.value = mockProfile.value
  } finally {
    loading.value = false
  }
}

async function toggleFollow() {
  if (!profileUser.value) return
  followLoading.value = true
  try {
    await usersService.toggleFollow(route.params.id)
    profileUser.value.isFollowing = !profileUser.value.isFollowing
    profileUser.value.followers += profileUser.value.isFollowing ? 1 : -1
  } catch {
    // Optimistic toggle on error
    profileUser.value.isFollowing = !profileUser.value.isFollowing
    profileUser.value.followers += profileUser.value.isFollowing ? 1 : -1
  } finally {
    followLoading.value = false
  }
}

function formatCount(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
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

function handleSignOut() {
  authStore.signOut()
  router.push({ name: 'SignIn' })
}

const displayUser = computed(() => profileUser.value || mockProfile.value)

watch(() => route.params.id, () => {
  loadProfile()
}, { immediate: true })
</script>

<template>
  <div class="profile-page">
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
          <button class="icon-btn" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <ProfileDropdown
            :user-name="authStore.currentUser?.name || 'User'"
            :user-id="authStore.currentUser?.id || 'me'"
            @signout="handleSignOut"
          />
        </div>
      </div>
    </header>

    <main class="profile-container">
      <div v-if="loading" class="loading-state">Loading profile...</div>

      <div v-else class="profile-content">
        <!-- Profile Header Card -->
        <div class="profile-header-card">
          <div class="profile-cover"></div>
          <div class="profile-header-body">
            <div class="profile-avatar-wrapper">
              <div class="avatar avatar-xl" :style="{ background: getAvatarColor(displayUser.name) }">
                {{ getInitials(displayUser.name) }}
              </div>
            </div>
            <div class="profile-header-info">
              <div class="profile-name-row">
                <div>
                  <h1 class="profile-display-name">{{ displayUser.name }}</h1>
                  <span class="profile-handle">{{ displayUser.username || '@user' }}</span>
                </div>
                <button
                  v-if="isOwnProfile"
                  class="edit-profile-btn"
                  @click="router.push('/settings')"
                >
                  Edit Profile
                </button>
                <button
                  v-else
                  class="follow-toggle-btn"
                  :class="{ following: displayUser.isFollowing }"
                  :disabled="followLoading"
                  @click="toggleFollow"
                >
                  {{ displayUser.isFollowing ? 'Following' : 'Follow' }}
                </button>
              </div>
              <p class="profile-bio-text">{{ displayUser.bio }}</p>
              <div class="profile-stats-row">
                <div class="stat-item">
                  <span class="stat-number">{{ formatCount(displayUser.followers || 0) }}</span>
                  <span class="stat-text">Followers</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ formatCount(displayUser.following || 0) }}</span>
                  <span class="stat-text">Following</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ displayUser.posts || 0 }}</span>
                  <span class="stat-text">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User's Posts -->
        <div class="posts-section">
          <h3 class="section-title">Posts</h3>
          <div v-if="userPosts.length === 0" class="empty-posts">
            <p>No posts yet.</p>
          </div>
          <div v-for="post in userPosts" :key="post.id" class="post-card">
            <div class="post-header">
              <div class="avatar avatar-md" :style="{ background: getAvatarColor(displayUser.name) }">
                {{ getInitials(displayUser.name) }}
              </div>
              <div class="post-author-info">
                <span class="post-author-name">{{ displayUser.name }}</span>
                <span class="post-author-meta">{{ post.time }}</span>
              </div>
            </div>
            <p class="post-content">{{ post.content }}</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
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
.icon-btn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  background: none; border-radius: var(--radius-full); color: var(--color-text-secondary); transition: all var(--transition);
}
.icon-btn:hover { background: var(--color-input-bg); color: var(--color-primary); }
.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-sm { width: 32px; height: 32px; font-size: 0.7rem; }
.avatar-md { width: 40px; height: 40px; font-size: 0.8rem; }
.avatar-xl { width: 80px; height: 80px; font-size: 1.5rem; }

.profile-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 1.25rem 1rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.profile-header-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.profile-cover {
  height: 120px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light, #A29BFE));
}

.profile-header-body {
  padding: 0 1.5rem 1.5rem;
  position: relative;
}

.profile-avatar-wrapper {
  margin-top: -40px;
  margin-bottom: 0.75rem;
}

.profile-avatar-wrapper .avatar-xl {
  border: 4px solid var(--color-surface);
}

.profile-name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.profile-display-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.profile-handle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.profile-bio-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.profile-stats-row {
  display: flex;
  gap: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
}

.stat-text {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.edit-profile-btn {
  padding: 0.45rem 1.2rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.edit-profile-btn:hover {
  border-color: var(--color-text);
}

.follow-toggle-btn {
  padding: 0.45rem 1.2rem;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
}

.follow-toggle-btn:hover {
  background: var(--color-primary-hover);
}

.follow-toggle-btn.following {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
}

.follow-toggle-btn.following:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.follow-toggle-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.posts-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.empty-posts {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  text-align: center;
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.post-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  margin-bottom: 0.75rem;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.75rem;
}

.post-author-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
}

.post-author-meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.post-author-info {
  display: flex;
  flex-direction: column;
}

.post-content {
  font-size: 0.9rem;
  color: var(--color-text);
  line-height: 1.55;
}

@media (max-width: 768px) {
  .profile-container { padding: 1rem 0.5rem; }
  .profile-cover { height: 80px; }
  .top-bar-inner { padding: 0.5rem 1rem; }
  .search-bar { display: none; }
}
</style>
