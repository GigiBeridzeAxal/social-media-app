<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleSignOut() {
  await authStore.signOut()
  router.push({ name: 'SignIn' })
}

const mockUser = {
  name: authStore.currentUser?.name || 'Alex Johnson',
  username: '@alexjohnson',
  avatar: null,
  bio: 'Full-stack developer & design enthusiast. Building cool things.',
  followers: 1284,
  following: 562,
  posts: 47
}

const sidebarLinks = [
  { icon: 'home', label: 'Feed', active: true },
  { icon: 'explore', label: 'Explore', active: false },
  { icon: 'notifications', label: 'Notifications', badge: 3, active: false },
  { icon: 'messages', label: 'Messages', badge: 1, active: false },
  { icon: 'bookmarks', label: 'Bookmarks', active: false },
  { icon: 'profile', label: 'Profile', active: false },
  { icon: 'settings', label: 'Settings', active: false }
]

const trendingTopics = [
  { tag: '#VueJS', posts: '12.4k posts' },
  { tag: '#WebDev', posts: '8.9k posts' },
  { tag: '#OpenSource', posts: '5.2k posts' },
  { tag: '#Design', posts: '3.8k posts' }
]

const suggestedUsers = [
  { name: 'Sarah Chen', username: '@sarahchen', avatar: null },
  { name: 'Mike Rivera', username: '@mikerivera', avatar: null },
  { name: 'Emma Wilson', username: '@emmawilson', avatar: null }
]

const posts = ref([
  {
    id: 1,
    author: { name: 'Jessica Park', username: '@jessicapark', avatar: null },
    content: 'Just shipped a major update to our design system! 🎨 New components, better accessibility, and dark mode support. Check it out and let me know what you think.',
    image: null,
    likes: 142,
    comments: 28,
    shares: 15,
    time: '2h ago',
    liked: false,
    bookmarked: false
  },
  {
    id: 2,
    author: { name: 'David Kim', username: '@davidkim', avatar: null },
    content: 'Hot take: CSS has become more powerful than most people realize. Container queries, :has() selector, subgrid — we barely need JavaScript for layout anymore. The web platform is amazing. 🔥',
    image: null,
    likes: 89,
    comments: 45,
    shares: 22,
    time: '4h ago',
    liked: true,
    bookmarked: false
  },
  {
    id: 3,
    author: { name: 'Mia Thompson', username: '@miathompson', avatar: null },
    content: 'Spent the weekend building a real-time collaborative whiteboard with Vue 3 and WebSockets. The Composition API makes reactive state management so elegant. Thread with demo below 👇',
    image: null,
    likes: 234,
    comments: 67,
    shares: 41,
    time: '6h ago',
    liked: false,
    bookmarked: true
  },
  {
    id: 4,
    author: { name: 'Ryan Foster', username: '@ryanfoster', avatar: null },
    content: 'Tip: Use `git stash --include-untracked` instead of `git stash`. You\'ll thank me later when you realize your new files aren\'t lost. 😅',
    image: null,
    likes: 312,
    comments: 19,
    shares: 88,
    time: '8h ago',
    liked: false,
    bookmarked: false
  },
  {
    id: 5,
    author: { name: 'Olivia Martinez', username: '@oliviam', avatar: null },
    content: 'Our team just open-sourced our internal component library! 1200+ components, fully typed, tree-shakeable. Building in public feels incredible. Link in bio. 🚀',
    image: null,
    likes: 567,
    comments: 93,
    shares: 124,
    time: '12h ago',
    liked: true,
    bookmarked: false
  }
])

const newPostText = ref('')

function toggleLike(post) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

function toggleBookmark(post) {
  post.bookmarked = !post.bookmarked
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
</script>

<template>
  <div class="dashboard-page">
    <!-- Top Navigation Bar -->
    <header class="top-bar">
      <div class="top-bar-inner">
        <div class="brand">
          <div class="logo-icon">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2.5"/>
              <path d="M10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              <circle cx="16" cy="20" r="2" fill="currentColor"/>
            </svg>
          </div>
          <span class="brand-name">SocialApp</span>
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
          <div class="user-avatar-btn" @click="handleSignOut" :title="'Sign out (' + mockUser.name + ')'">
            <div class="avatar avatar-sm" :style="{ background: getAvatarColor(mockUser.name) }">
              {{ getInitials(mockUser.name) }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Dashboard Layout: 60% centered, sidebar left + posts right -->
    <main class="dashboard-container">
      <div class="dashboard-layout">
        <!-- Left Sidebar -->
        <aside class="sidebar">
          <!-- User Profile Card -->
          <div class="profile-card">
            <div class="profile-header">
              <div class="avatar avatar-lg" :style="{ background: getAvatarColor(mockUser.name) }">
                {{ getInitials(mockUser.name) }}
              </div>
              <div class="profile-info">
                <h3 class="profile-name">{{ mockUser.name }}</h3>
                <span class="profile-username">{{ mockUser.username }}</span>
              </div>
            </div>
            <p class="profile-bio">{{ mockUser.bio }}</p>
            <div class="profile-stats">
              <div class="stat">
                <span class="stat-value">{{ formatCount(mockUser.followers) }}</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ formatCount(mockUser.following) }}</span>
                <span class="stat-label">Following</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ mockUser.posts }}</span>
                <span class="stat-label">Posts</span>
              </div>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="sidebar-nav">
            <template v-for="link in sidebarLinks" :key="link.label">
              <!-- Profile link - routes to profile page -->
              <router-link
                v-if="link.icon === 'profile'"
                :to="'/profile/' + (authStore.currentUser?._id || authStore.currentUser?.id || '')"
                class="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>{{ link.label }}</span>
              </router-link>
              <!-- Settings link - routes to settings page -->
              <router-link
                v-else-if="link.icon === 'settings'"
                to="/settings"
                class="nav-link"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span>{{ link.label }}</span>
              </router-link>
              <!-- All other links -->
              <a
                v-else
                href="#"
                class="nav-link"
                :class="{ active: link.active }"
                @click.prevent
              >
                <svg v-if="link.icon === 'home'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <svg v-else-if="link.icon === 'explore'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
                </svg>
                <svg v-else-if="link.icon === 'notifications'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <svg v-else-if="link.icon === 'messages'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <svg v-else-if="link.icon === 'bookmarks'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{{ link.label }}</span>
                <span v-if="link.badge" class="nav-badge">{{ link.badge }}</span>
              </a>
            </template>
          </nav>

          <!-- Trending Topics -->
          <div class="trending-card">
            <h4 class="card-title">Trending</h4>
            <div class="trending-list">
              <a v-for="topic in trendingTopics" :key="topic.tag" href="#" class="trending-item" @click.prevent>
                <span class="trending-tag">{{ topic.tag }}</span>
                <span class="trending-posts">{{ topic.posts }}</span>
              </a>
            </div>
          </div>

          <!-- Suggested Users -->
          <div class="suggested-card">
            <h4 class="card-title">Who to follow</h4>
            <div class="suggested-list">
              <div v-for="u in suggestedUsers" :key="u.username" class="suggested-user">
                <div class="avatar avatar-sm" :style="{ background: getAvatarColor(u.name) }">
                  {{ getInitials(u.name) }}
                </div>
                <div class="suggested-info">
                  <span class="suggested-name">{{ u.name }}</span>
                  <span class="suggested-username">{{ u.username }}</span>
                </div>
                <button class="follow-btn">Follow</button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Side: Posts Feed -->
        <section class="feed">
          <!-- Create Post -->
          <div class="create-post-card">
            <div class="create-post-row">
              <div class="avatar avatar-md" :style="{ background: getAvatarColor(mockUser.name) }">
                {{ getInitials(mockUser.name) }}
              </div>
              <textarea
                v-model="newPostText"
                class="post-input"
                placeholder="What's on your mind?"
                rows="2"
              ></textarea>
            </div>
            <div class="create-post-actions">
              <div class="media-actions">
                <button class="media-btn" title="Add image">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </button>
                <button class="media-btn" title="Add GIF">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                    <line x1="7" y1="2" x2="7" y2="22"/>
                    <line x1="17" y1="2" x2="17" y2="22"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <line x1="2" y1="7" x2="7" y2="7"/>
                    <line x1="2" y1="17" x2="7" y2="17"/>
                    <line x1="17" y1="7" x2="22" y2="7"/>
                    <line x1="17" y1="17" x2="22" y2="17"/>
                  </svg>
                </button>
                <button class="media-btn" title="Add emoji">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </button>
              </div>
              <button class="post-btn" :disabled="!newPostText.trim()">Post</button>
            </div>
          </div>

          <!-- Posts Feed -->
          <div v-for="post in posts" :key="post.id" class="post-card">
            <div class="post-header">
              <div class="avatar avatar-md" :style="{ background: getAvatarColor(post.author.name) }">
                {{ getInitials(post.author.name) }}
              </div>
              <div class="post-author-info">
                <span class="post-author-name">{{ post.author.name }}</span>
                <span class="post-author-meta">{{ post.author.username }} &middot; {{ post.time }}</span>
              </div>
              <button class="post-menu-btn" title="More options">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <circle cx="12" cy="5" r="1"/>
                  <circle cx="12" cy="12" r="1"/>
                  <circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
            </div>
            <p class="post-content">{{ post.content }}</p>
            <div class="post-actions">
              <button class="action-btn" :class="{ liked: post.liked }" @click="toggleLike(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ formatCount(post.likes) }}</span>
              </button>
              <button class="action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{{ post.comments }}</span>
              </button>
              <button class="action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="17 1 21 5 17 9"/>
                  <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                  <polyline points="7 23 3 19 7 15"/>
                  <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                </svg>
                <span>{{ post.shares }}</span>
              </button>
              <button class="action-btn bookmark-btn" :class="{ bookmarked: post.bookmarked }" @click="toggleBookmark(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.bookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--color-bg);
}

/* Top Bar */
.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-surface);
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

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo-icon {
  color: var(--color-primary);
  display: flex;
}

.brand-name {
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.search-bar {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

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

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:focus {
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px var(--color-primary-bg);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  transition: all var(--transition);
}

.icon-btn:hover {
  background: var(--color-input-bg);
  color: var(--color-primary);
}

.badge-dot {
  position: absolute;
  top: 6px;
  right: 7px;
  width: 8px;
  height: 8px;
  background: var(--color-danger);
  border-radius: 50%;
  border: 2px solid var(--color-surface);
}

.user-avatar-btn {
  cursor: pointer;
  transition: transform var(--transition);
}

.user-avatar-btn:hover {
  transform: scale(1.05);
}

/* Avatar System */
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

.avatar-md {
  width: 40px;
  height: 40px;
  font-size: 0.8rem;
}

.avatar-lg {
  width: 52px;
  height: 52px;
  font-size: 1rem;
}

/* Dashboard Container - 60% centered */
.dashboard-container {
  max-width: 60%;
  margin: 0 auto;
  padding: 1.25rem 0;
}

/* Dashboard Layout: sidebar left, feed right */
.dashboard-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.25rem;
  align-items: start;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 70px;
}

/* Profile Card */
.profile-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.75rem;
}

.profile-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.profile-username {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.profile-bio {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.profile-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}

.stat-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* Sidebar Navigation */
.sidebar-nav {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 0.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  font-weight: 500;
  transition: all var(--transition);
  text-decoration: none;
  position: relative;
}

.nav-link:hover {
  background: var(--color-input-bg);
  color: var(--color-text);
}

.nav-link.active {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 600;
}

.nav-badge {
  margin-left: auto;
  background: var(--color-primary);
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full);
  min-width: 18px;
  text-align: center;
}

/* Trending Card */
.trending-card,
.suggested-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trending-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.6rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background var(--transition);
}

.trending-item:hover {
  background: var(--color-input-bg);
}

.trending-tag {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
}

.trending-posts {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Suggested Users */
.suggested-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.suggested-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.suggested-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.suggested-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.suggested-username {
  font-size: 0.73rem;
  color: var(--color-text-muted);
}

.follow-btn {
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
  background: var(--color-primary-bg);
  border-radius: var(--radius-full);
  transition: all var(--transition);
  flex-shrink: 0;
}

.follow-btn:hover {
  background: var(--color-primary);
  color: white;
}

/* Feed */
.feed {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Create Post Card */
.create-post-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.create-post-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.post-input {
  flex: 1;
  border: none;
  background: none;
  font-size: 0.9rem;
  color: var(--color-text);
  resize: none;
  line-height: 1.5;
  padding: 0.4rem 0;
  font-family: var(--font-family);
}

.post-input::placeholder {
  color: var(--color-text-muted);
}

.create-post-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.media-actions {
  display: flex;
  gap: 4px;
}

.media-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: var(--radius-full);
  color: var(--color-primary);
  transition: all var(--transition);
}

.media-btn:hover {
  background: var(--color-primary-bg);
}

.post-btn {
  padding: 0.45rem 1.25rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: white;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: all var(--transition);
}

.post-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.post-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Post Card */
.post-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: box-shadow var(--transition);
}

.post-card:hover {
  box-shadow: var(--shadow-md);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.75rem;
}

.post-author-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-author-name {
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--color-text);
}

.post-author-meta {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.post-menu-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  transition: all var(--transition);
}

.post-menu-btn:hover {
  background: var(--color-input-bg);
  color: var(--color-text-secondary);
}

.post-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text);
  margin-bottom: 0.85rem;
  word-wrap: break-word;
}

/* Post Actions */
.post-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 0.65rem;
  border-top: 1px solid var(--color-border);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.75rem;
  background: none;
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font-size: 0.8rem;
  font-weight: 500;
  transition: all var(--transition);
}

.action-btn:hover {
  background: var(--color-input-bg);
  color: var(--color-text-secondary);
}

.action-btn.liked {
  color: #E74C3C;
}

.action-btn.liked:hover {
  background: #FDE8E8;
}

.bookmark-btn {
  margin-left: auto;
}

.bookmark-btn.bookmarked {
  color: var(--color-primary);
}

.bookmark-btn.bookmarked:hover {
  background: var(--color-primary-bg);
}

/* Responsive adjustments */
@media (max-width: 1400px) {
  .dashboard-container {
    max-width: 75%;
  }
}

@media (max-width: 1100px) {
  .dashboard-container {
    max-width: 90%;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    max-width: 100%;
    padding: 0.75rem;
  }

  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .search-bar {
    display: none;
  }

  .top-bar-inner {
    padding: 0.65rem 1rem;
  }
}
</style>
