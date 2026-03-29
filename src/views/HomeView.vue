<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { usePostsStore } from '../stores/posts'
import { useUsersStore } from '../stores/users'
import ProfileDropdown from '../components/ProfileDropdown.vue'
import Sidebar from '../components/Sidebar.vue'
import CreatePost from '../components/CreatePost.vue'
import PostFeed from '../components/PostFeed.vue'
import UserCard from '../components/UserCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const usersStore = useUsersStore()

async function handleSignOut() {
  await authStore.signOut()
  router.push({ name: 'SignIn' })
}

async function handlePosted({ content, image }) {
  await postsStore.createPost(content, image)
}

function handleLike(postId) {
  postsStore.toggleLike(postId)
}

function handleBookmark(postId) {
  postsStore.toggleBookmark(postId)
}

function handleDelete(postId) {
  postsStore.deletePost(postId)
}

function handleFollow(userId) {
  usersStore.toggleFollow(userId)
}

const trendingTopics = [
  { tag: '#VueJS', posts: '12.4k posts' },
  { tag: '#WebDev', posts: '8.9k posts' },
  { tag: '#OpenSource', posts: '5.2k posts' },
  { tag: '#Design', posts: '3.8k posts' }
]

onMounted(() => {
  postsStore.fetchFeed()
})
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
          <ProfileDropdown
            :user-name="authStore.currentUser?.name || 'User'"
            :user-id="authStore.currentUser?.id || 'me'"
            @signout="handleSignOut"
          />
        </div>
      </div>
    </header>

    <!-- Dashboard Layout -->
    <main class="dashboard-container">
      <div class="dashboard-layout">
        <!-- Left Sidebar -->
        <Sidebar />

        <!-- Center: Posts Feed -->
        <section class="feed">
          <CreatePost @posted="handlePosted" />
          <PostFeed
            :posts="postsStore.posts"
            :loading="postsStore.loading"
            :has-more="postsStore.hasMore"
            @like="handleLike"
            @delete="handleDelete"
            @bookmark="handleBookmark"
            @load-more="postsStore.fetchFeed"
          />
        </section>

        <!-- Right Sidebar: Suggestions -->
        <aside class="right-sidebar">
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
              <UserCard
                v-for="user in usersStore.suggestedUsers"
                :key="user.id"
                :user="user"
                @follow="handleFollow"
              />
            </div>
          </div>
        </aside>
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
.logo-icon { color: var(--color-primary); display: flex; }
.brand-name { font-weight: 700; font-size: 1.15rem; color: var(--color-primary); letter-spacing: -0.02em; }

.search-bar { flex: 1; max-width: 400px; position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }
.search-input {
  width: 100%; padding: 0.5rem 0.75rem 0.5rem 2.5rem; background: var(--color-input-bg);
  border: 1.5px solid transparent; border-radius: var(--radius-full); font-size: 0.875rem;
  color: var(--color-text); transition: all var(--transition);
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

/* Dashboard Layout: sidebar | feed | right sidebar */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 260px 1fr 280px;
  gap: 1.25rem;
  align-items: start;
}

/* Feed */
.feed { display: flex; flex-direction: column; gap: 1rem; }

/* Right Sidebar */
.right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 70px;
}

.trending-card, .suggested-card {
  background: var(--color-surface); border-radius: var(--radius-lg); padding: 1rem;
  box-shadow: var(--shadow-sm); border: 1px solid var(--color-border);
}
.card-title { font-size: 0.9rem; font-weight: 700; color: var(--color-text); margin-bottom: 0.75rem; letter-spacing: -0.01em; }

.trending-list { display: flex; flex-direction: column; gap: 2px; }
.trending-item {
  display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.6rem;
  border-radius: var(--radius-sm); text-decoration: none; transition: background var(--transition);
}
.trending-item:hover { background: var(--color-input-bg); }
.trending-tag { font-size: 0.85rem; font-weight: 600; color: var(--color-primary); }
.trending-posts { font-size: 0.75rem; color: var(--color-text-muted); }

.suggested-list { display: flex; flex-direction: column; gap: 10px; }

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-layout { grid-template-columns: 260px 1fr; }
  .right-sidebar { display: none; }
}

@media (max-width: 900px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .dashboard-container { padding: 1rem; }
}

@media (max-width: 768px) {
  .search-bar { display: none; }
  .top-bar-inner { padding: 0.65rem 1rem; }
}
</style>
