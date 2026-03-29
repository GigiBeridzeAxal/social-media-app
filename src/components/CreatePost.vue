<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const emit = defineEmits(['posted'])

const authStore = useAuthStore()
const content = ref('')
const imageUrl = ref('')
const showImageInput = ref(false)
const posting = ref(false)

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

async function handlePost() {
  if (!content.value.trim() || posting.value) return
  posting.value = true
  try {
    emit('posted', { content: content.value.trim(), image: imageUrl.value || null })
    content.value = ''
    imageUrl.value = ''
    showImageInput.value = false
  } finally {
    posting.value = false
  }
}

const userName = authStore.currentUser?.name || 'User'
</script>

<template>
  <div class="create-post-card">
    <div class="create-post-row">
      <div class="avatar avatar-md" :style="{ background: getAvatarColor(userName) }">
        {{ getInitials(userName) }}
      </div>
      <textarea
        v-model="content"
        class="post-input"
        placeholder="What's on your mind?"
        rows="2"
      ></textarea>
    </div>
    <div v-if="showImageInput" class="image-input-row">
      <input v-model="imageUrl" type="url" class="image-url-input" placeholder="Paste image URL..." />
      <button class="close-image-btn" @click="showImageInput = false; imageUrl = ''">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="create-post-actions">
      <div class="media-actions">
        <button class="media-btn" title="Add image" @click="showImageInput = !showImageInput">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
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
      <button class="post-btn" :disabled="!content.trim() || posting" @click="handlePost">
        {{ posting ? 'Posting...' : 'Post' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.create-post-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}
.create-post-row { display: flex; gap: 12px; align-items: flex-start; }
.post-input {
  flex: 1; border: none; background: none; font-size: 0.9rem; color: var(--color-text);
  resize: none; line-height: 1.5; padding: 0.4rem 0; font-family: var(--font-family);
}
.post-input::placeholder { color: var(--color-text-muted); }

.image-input-row {
  display: flex; gap: 8px; align-items: center; margin-top: 0.5rem; padding-left: 52px;
}
.image-url-input {
  flex: 1; padding: 0.4rem 0.75rem; background: var(--color-input-bg);
  border: 1.5px solid var(--color-border); border-radius: var(--radius-md);
  font-size: 0.82rem; color: var(--color-text); font-family: var(--font-family);
}
.image-url-input:focus { border-color: var(--color-primary); }
.close-image-btn {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  background: none; border-radius: var(--radius-full); color: var(--color-text-muted); transition: all var(--transition);
}
.close-image-btn:hover { background: var(--color-input-bg); color: var(--color-text); }

.create-post-actions {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border);
}
.media-actions { display: flex; gap: 4px; }
.media-btn {
  width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
  background: none; border-radius: var(--radius-full); color: var(--color-primary); transition: all var(--transition);
}
.media-btn:hover { background: var(--color-primary-bg); }
.post-btn {
  padding: 0.45rem 1.25rem; font-size: 0.82rem; font-weight: 600; color: white;
  background: var(--color-primary); border-radius: var(--radius-full); transition: all var(--transition);
}
.post-btn:hover:not(:disabled) { background: var(--color-primary-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
.post-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-md { width: 40px; height: 40px; font-size: 0.8rem; }
</style>
