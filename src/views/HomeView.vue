<script setup>
import { onMounted } from 'vue'
import { usePostsStore } from '../stores/posts'
import { useUsersStore } from '../stores/users'
import Sidebar from '../components/Sidebar.vue'
import CreatePost from '../components/CreatePost.vue'
import PostFeed from '../components/PostFeed.vue'
import UserCard from '../components/UserCard.vue'

const postsStore = usePostsStore()
const usersStore = useUsersStore()

const trendingTopics = [
  { tag: '#VueJS', posts: '12.4k posts' },
  { tag: '#WebDev', posts: '8.9k posts' },
  { tag: '#OpenSource', posts: '5.2k posts' },
  { tag: '#Design', posts: '3.8k posts' }
]

onMounted(() => {
  postsStore.fetchFeed()
})

async function handlePosted({ content, image }) {
  await postsStore.createPost(content, image)
}

function handleLike(postId) { postsStore.toggleLike(postId) }
function handleDelete(postId) { postsStore.deletePost(postId) }
function handleBookmark(postId) { postsStore.toggleBookmark(postId) }
function handleFollow(userId) { usersStore.toggleFollow(userId) }
function handleLoadMore() { postsStore.fetchFeed() }
</script>

<template>
  <div class="dashboard-page">
    <main class="dashboard-container">
      <div class="dashboard-layout">
        <Sidebar>
          <div class="trending-card">
            <h4 class="card-title">Trending</h4>
            <div class="trending-list">
              <a v-for="topic in trendingTopics" :key="topic.tag" href="#" class="trending-item" @click.prevent>
                <span class="trending-tag">{{ topic.tag }}</span>
                <span class="trending-posts">{{ topic.posts }}</span>
              </a>
            </div>
          </div>
          <div class="suggested-card">
            <h4 class="card-title">Who to follow</h4>
            <div class="suggested-list">
              <UserCard v-for="user in usersStore.suggestedUsers" :key="user.id" :user="user" @follow="handleFollow" />
            </div>
          </div>
        </Sidebar>

        <section class="feed">
          <CreatePost @posted="handlePosted" />
          <PostFeed
            :posts="postsStore.posts"
            :loading="postsStore.loading"
            :has-more="postsStore.hasMore"
            @like="handleLike"
            @delete="handleDelete"
            @bookmark="handleBookmark"
            @load-more="handleLoadMore"
          />
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-page { min-height: 100vh; background: var(--color-bg); }
.dashboard-container { max-width: 60%; margin: 0 auto; padding: 1.25rem 0; }
.dashboard-layout { display: grid; grid-template-columns: 280px 1fr; gap: 1.25rem; align-items: start; }
.feed { display: flex; flex-direction: column; gap: 1rem; }

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

@media (max-width: 1400px) { .dashboard-container { max-width: 75%; } }
@media (max-width: 1100px) { .dashboard-container { max-width: 90%; padding: 1rem; } }
@media (max-width: 768px) {
  .dashboard-container { max-width: 100%; padding: 0.75rem; }
  .dashboard-layout { grid-template-columns: 1fr; }
}
</style>
