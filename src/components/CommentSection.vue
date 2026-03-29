<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

defineProps({
  comments: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['addComment'])

const authStore = useAuthStore()
const newComment = ref('')

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

function submitComment() {
  if (!newComment.value.trim()) return
  emit('addComment', newComment.value.trim())
  newComment.value = ''
}

const userName = authStore.currentUser?.name || 'User'
</script>

<template>
  <div class="comment-section">
    <div class="add-comment">
      <div class="avatar avatar-sm" :style="{ background: getAvatarColor(userName) }">
        {{ getInitials(userName) }}
      </div>
      <form class="comment-form" @submit.prevent="submitComment">
        <input v-model="newComment" type="text" class="comment-input" placeholder="Write a comment..." />
        <button type="submit" class="comment-submit" :disabled="!newComment.trim()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
    <div v-if="loading" class="comments-loading">Loading comments...</div>
    <div v-else-if="comments.length > 0" class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="avatar avatar-xs" :style="{ background: getAvatarColor(comment.author?.name || 'User') }">
          {{ getInitials(comment.author?.name || 'User') }}
        </div>
        <div class="comment-body">
          <div class="comment-header-row">
            <span class="comment-author">{{ comment.author?.name || 'User' }}</span>
            <span class="comment-time">{{ comment.time || '' }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
        </div>
      </div>
    </div>
    <div v-else class="no-comments">No comments yet</div>
  </div>
</template>

<style scoped>
.comment-section { padding-top: 0.75rem; }
.add-comment { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
.comment-form { flex: 1; display: flex; gap: 6px; }
.comment-input {
  flex: 1; padding: 0.45rem 0.75rem; background: var(--color-input-bg);
  border: 1.5px solid var(--color-border); border-radius: var(--radius-full);
  font-size: 0.82rem; color: var(--color-text); font-family: var(--font-family);
  transition: all var(--transition);
}
.comment-input:focus { border-color: var(--color-primary); }
.comment-input::placeholder { color: var(--color-text-muted); }
.comment-submit {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  background: var(--color-primary); color: white; border-radius: 50%;
  transition: all var(--transition); flex-shrink: 0;
}
.comment-submit:hover:not(:disabled) { background: var(--color-primary-hover); }
.comment-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.comments-loading { font-size: 0.82rem; color: var(--color-text-muted); padding: 0.5rem 0; }
.comments-list { display: flex; flex-direction: column; gap: 0.6rem; }
.comment-item { display: flex; gap: 8px; }
.comment-body { flex: 1; background: var(--color-input-bg); border-radius: var(--radius-md); padding: 0.5rem 0.75rem; }
.comment-header-row { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.comment-author { font-size: 0.8rem; font-weight: 600; color: var(--color-text); }
.comment-time { font-size: 0.72rem; color: var(--color-text-muted); }
.comment-text { font-size: 0.82rem; color: var(--color-text-secondary); line-height: 1.4; }
.no-comments { font-size: 0.82rem; color: var(--color-text-muted); text-align: center; padding: 0.5rem 0; }
.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-sm { width: 32px; height: 32px; font-size: 0.7rem; }
.avatar-xs { width: 26px; height: 26px; font-size: 0.6rem; }
</style>
