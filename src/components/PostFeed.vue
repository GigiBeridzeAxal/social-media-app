<script setup>
import PostCard from './PostCard.vue'

defineProps({
  posts: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  hasMore: { type: Boolean, default: false }
})

const emit = defineEmits(['like', 'comment', 'delete', 'bookmark', 'loadMore'])
</script>

<template>
  <div class="post-feed">
    <!-- Loading skeleton -->
    <template v-if="loading && posts.length === 0">
      <div v-for="n in 3" :key="n" class="skeleton-card">
        <div class="skeleton-header">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-lines">
            <div class="skeleton-line skeleton-line-short"></div>
            <div class="skeleton-line skeleton-line-shorter"></div>
          </div>
        </div>
        <div class="skeleton-line skeleton-line-full"></div>
        <div class="skeleton-line skeleton-line-medium"></div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="!loading && posts.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <p class="empty-text">No posts yet</p>
      <p class="empty-subtext">Be the first to share something!</p>
    </div>

    <!-- Posts list -->
    <template v-else>
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @like="emit('like', $event)"
        @comment="emit('comment', $event)"
        @delete="emit('delete', $event)"
        @bookmark="emit('bookmark', $event)"
      />
    </template>

    <!-- Load more -->
    <div v-if="hasMore && posts.length > 0" class="load-more-wrapper">
      <button class="load-more-btn" :disabled="loading" @click="emit('loadMore')">
        {{ loading ? 'Loading...' : 'Load More' }}
      </button>
    </div>

    <!-- Inline loading for pagination -->
    <div v-if="loading && posts.length > 0" class="feed-loading">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.post-feed { display: flex; flex-direction: column; gap: 1rem; }

.skeleton-card {
  background: var(--color-surface); border-radius: var(--radius-lg); padding: 1.25rem;
  border: 1px solid var(--color-border);
}
.skeleton-header { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
.skeleton-avatar {
  width: 40px; height: 40px; border-radius: 50%; background: var(--color-input-bg);
  animation: shimmer 1.5s infinite;
}
.skeleton-lines { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.skeleton-line {
  height: 12px; border-radius: 6px; background: var(--color-input-bg);
  animation: shimmer 1.5s infinite;
}
.skeleton-line-short { width: 120px; }
.skeleton-line-shorter { width: 80px; }
.skeleton-line-full { width: 100%; margin-bottom: 6px; }
.skeleton-line-medium { width: 70%; }

@keyframes shimmer {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.empty-state {
  display: flex; flex-direction: column; align-items: center; padding: 3rem 1rem;
  background: var(--color-surface); border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}
.empty-icon { color: var(--color-text-muted); margin-bottom: 1rem; }
.empty-text { font-size: 1rem; font-weight: 600; color: var(--color-text); margin-bottom: 0.25rem; }
.empty-subtext { font-size: 0.85rem; color: var(--color-text-muted); }

.load-more-wrapper { display: flex; justify-content: center; padding: 0.5rem 0; }
.load-more-btn {
  padding: 0.5rem 1.5rem; font-size: 0.85rem; font-weight: 600; color: var(--color-primary);
  background: var(--color-primary-bg); border-radius: var(--radius-full); transition: all var(--transition);
}
.load-more-btn:hover:not(:disabled) { background: var(--color-primary); color: white; }
.load-more-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.feed-loading { display: flex; justify-content: center; padding: 1rem; }
.spinner {
  width: 24px; height: 24px; border: 2.5px solid var(--color-border);
  border-top-color: var(--color-primary); border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
