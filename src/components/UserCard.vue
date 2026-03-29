<script setup>
defineProps({
  user: { type: Object, required: true }
})

const emit = defineEmits(['follow'])

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
</script>

<template>
  <div class="user-card">
    <div class="avatar avatar-sm" :style="{ background: getAvatarColor(user.name) }">
      {{ getInitials(user.name) }}
    </div>
    <div class="user-card-info">
      <span class="user-card-name">{{ user.name }}</span>
      <span class="user-card-bio">{{ user.bio || user.username }}</span>
    </div>
    <button
      class="follow-btn"
      :class="{ following: user.isFollowing }"
      @click="emit('follow', user.id)"
    >
      {{ user.isFollowing ? 'Following' : 'Follow' }}
    </button>
  </div>
</template>

<style scoped>
.user-card { display: flex; align-items: center; gap: 10px; }
.avatar {
  display: flex; align-items: center; justify-content: center; border-radius: 50%;
  font-weight: 600; color: white; flex-shrink: 0; user-select: none;
}
.avatar-sm { width: 32px; height: 32px; font-size: 0.7rem; }
.user-card-info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.user-card-name {
  font-size: 0.82rem; font-weight: 600; color: var(--color-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-card-bio {
  font-size: 0.73rem; color: var(--color-text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.follow-btn {
  padding: 0.3rem 0.75rem; font-size: 0.75rem; font-weight: 600;
  color: var(--color-primary); background: var(--color-primary-bg);
  border-radius: var(--radius-full); transition: all var(--transition); flex-shrink: 0;
}
.follow-btn:hover { background: var(--color-primary); color: white; }
.follow-btn.following {
  background: var(--color-surface); color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.follow-btn.following:hover { border-color: var(--color-danger); color: var(--color-danger); }
</style>
