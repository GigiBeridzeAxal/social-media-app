<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  post: { type: Object, required: true }
})

const emit = defineEmits(['like', 'comment', 'delete', 'bookmark'])

const authStore = useAuthStore()

const isAuthor = computed(() => {
  const userId = authStore.currentUser?.id || authStore.currentUser?._id
  const authorId = props.post.author?.id || props.post.author?._id
  return userId && authorId && String(userId) === String(authorId)
})

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
</script>

<template>
  <div class="post-card">
    <div class="post-header">
      <div class="avatar avatar-md" :style="{ background: getAvatarColor(post.author?.name) }">
        {{ getInitials(post.author?.name) }}
      </div>
      <div class="post-author-info">
        <span class="post-author-name">{{ post.author?.name }}</span>
        <span class="post-author-meta">{{ post.author?.username }} &middot; {{ post.time }}</span>
      </div>
      <button v-if="isAuthor" class="post-delete-btn" title="Delete post" @click="emit('delete', post.id)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>
      <button v-else class="post-menu-btn" title="More options">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>

    <p class="post-content">{{ post.content }}</p>

    <img v-if="post.image" :src="post.image" alt="Post image" class="post-image" />

    <div class="post-actions">
      <button class="action-btn" :class="{ liked: post.liked }" @click="emit('like', post.id)">
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>{{ formatCount(post.likes) }}</span>
      </button>
      <button class="action-btn" @click="emit('comment', post.id)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>{{ formatCount(post.comments) }}</span>
      </button>
      <button class="action-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="17 1 21 5 17 9"/>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
          <polyline points="7 23 3 19 7 15"/>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
        </svg>
        <span>{{ formatCount(post.shares) }}</span>
      </button>
      <button class="action-btn bookmark-btn" :class="{ bookmarked: post.bookmarked }" @click="emit('bookmark', post.id)">
        <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.bookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.post-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: box-shadow var(--transition);
}
.post-card:hover { box-shadow: var(--shadow-md); }

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.75rem;
}
.post-author-info { flex: 1; display: flex; flex-direction: column; }
.post-author-name { font-size: 0.88rem; font-weight: 650; color: var(--color-text); }
.post-author-meta { font-size: 0.76rem; color: var(--color-text-muted); }

.post-menu-btn, .post-delete-btn {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: none; border-radius: var(--radius-full); color: var(--color-text-muted); transition: all var(--transition);
}
.post-menu-btn:hover { background: var(--color-input-bg); color: var(--color-text-secondary); }
.post-delete-btn:hover { background: #fef2f2; color: var(--color-danger); }

.post-content { font-size: 0.9rem; line-height: 1.6; color: var(--color-text); margin-bottom: 0.85rem; word-wrap: break-word; }
.post-image { width: 100%; border-radius: var(--radius-md); margin-bottom: 0.85rem; }

.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-md { width: 40px; height: 40px; font-size: 0.8rem; }

.post-actions {
  display: flex; align-items: center; gap: 4px;
  padding-top: 0.65rem; border-top: 1px solid var(--color-border);
}
.action-btn {
  display: flex; align-items: center; gap: 6px; padding: 0.4rem 0.75rem;
  background: none; border-radius: var(--radius-full); color: var(--color-text-muted);
  font-size: 0.8rem; font-weight: 500; transition: all var(--transition);
}
.action-btn:hover { background: var(--color-input-bg); color: var(--color-text-secondary); }
.action-btn.liked { color: #E74C3C; }
.action-btn.liked:hover { background: #FDE8E8; }
.bookmark-btn { margin-left: auto; }
.bookmark-btn.bookmarked { color: var(--color-primary); }
.bookmark-btn.bookmarked:hover { background: var(--color-primary-bg); }
</style>
