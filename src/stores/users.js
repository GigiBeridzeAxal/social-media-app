import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersService } from '../services/users'

export const useUsersStore = defineStore('users', () => {
  const profile = ref(null)
  const userPosts = ref([])
  const loading = ref(false)
  const error = ref(null)
  const userPostsPage = ref(1)
  const userPostsHasMore = ref(true)
  const userPostsTotal = ref(0)

  async function fetchProfile(userId) {
    loading.value = true
    error.value = null

    try {
      const data = await usersService.getProfile(userId)
      profile.value = data.user
      return data.user
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data) {
    loading.value = true
    error.value = null

    try {
      if (!profile.value) {
        throw new Error('No profile loaded')
      }
      const result = await usersService.updateProfile(profile.value.id, data)
      profile.value = result.user
      return result.user
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function toggleFollow(userId) {
    error.value = null

    try {
      const data = await usersService.toggleFollow(userId)
      if (profile.value?.id === userId) {
        profile.value.isFollowing = data.following
        profile.value.followersCount = data.followersCount
      }
      return data
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  async function fetchUserPosts(userId, reset = false) {
    if (loading.value) return
    loading.value = true
    error.value = null

    try {
      if (reset) {
        userPosts.value = []
        userPostsPage.value = 1
        userPostsHasMore.value = true
        userPostsTotal.value = 0
      }

      const currentPage = reset ? 1 : userPostsPage.value
      const data = await usersService.getUserPosts(userId, currentPage)

      if (reset) {
        userPosts.value = data.posts
      } else {
        const existingIds = new Set(userPosts.value.map(p => p.id))
        const newPosts = data.posts.filter(p => !existingIds.has(p.id))
        userPosts.value = [...userPosts.value, ...newPosts]
      }

      userPostsTotal.value = data.total
      userPostsHasMore.value = userPosts.value.length < data.total
      userPostsPage.value = currentPage + 1
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function clearProfile() {
    profile.value = null
    userPosts.value = []
    userPostsPage.value = 1
    userPostsHasMore.value = true
    userPostsTotal.value = 0
  }

  return {
    profile,
    userPosts,
    loading,
    error,
    userPostsPage,
    userPostsHasMore,
    userPostsTotal,
    fetchProfile,
    updateProfile,
    toggleFollow,
    fetchUserPosts,
    clearProfile,
  }
})
