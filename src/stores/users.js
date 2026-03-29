import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersService } from '../services/users'

export const useUsersStore = defineStore('users', () => {
  const suggestedUsers = ref([
    { id: '201', name: 'Sarah Chen', username: '@sarahchen', bio: 'UX designer & creative thinker', avatar: null, isFollowing: false },
    { id: '202', name: 'Mike Rivera', username: '@mikerivera', bio: 'Backend engineer at Scale', avatar: null, isFollowing: false },
    { id: '203', name: 'Emma Wilson', username: '@emmawilson', bio: 'Open source contributor', avatar: null, isFollowing: false }
  ])

  async function toggleFollow(userId) {
    const user = suggestedUsers.value.find(u => u.id === userId)
    if (user) {
      user.isFollowing = !user.isFollowing
    }
    try {
      await usersService.toggleFollow(userId)
    } catch {
      // Already toggled optimistically
    }
  }

  return {
    suggestedUsers,
    toggleFollow
  }
})
