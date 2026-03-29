import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersService } from '../services/users'

export const useUsersStore = defineStore('users', () => {
  const profile = ref(null)
  const userPosts = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchProfile(userId) {
    loading.value = true
    error.value = null
    try {
      const data = await usersService.getProfile(userId)
      profile.value = data.user
      return data.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data) {
    if (!profile.value) return
    loading.value = true
    error.value = null
    try {
      const result = await usersService.updateProfile(profile.value.id, data)
      profile.value = result.user
      return result.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function toggleFollow(userId) {
    error.value = null
    try {
      const data = await usersService.toggleFollow(userId)
      if (profile.value && profile.value.id === userId) {
        profile.value.isFollowing = data.following
        profile.value.followersCount = data.followersCount
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function fetchUserPosts(userId, page = 1) {
    loading.value = true
    error.value = null
    try {
      const data = await usersService.getUserPosts(userId, page)
      userPosts.value = data.posts
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    userPosts,
    loading,
    error,
    fetchProfile,
    updateProfile,
    toggleFollow,
    fetchUserPosts,
  }
})
