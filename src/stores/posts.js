import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { postsService } from '../services/posts'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const page = ref(1)
  const hasMore = ref(true)
  const total = ref(0)

  function resetPosts() {
    posts.value = []
    page.value = 1
    hasMore.value = true
    total.value = 0
  }

  async function fetchFeed(reset = false) {
    if (loading.value) return
    loading.value = true
    error.value = null

    try {
      if (reset) resetPosts()

      const currentPage = reset ? 1 : page.value
      const data = await postsService.getFeed(currentPage)

      if (reset) {
        posts.value = data.posts
      } else {
        const existingIds = new Set(posts.value.map(p => p.id))
        const newPosts = data.posts.filter(p => !existingIds.has(p.id))
        posts.value = [...posts.value, ...newPosts]
      }

      total.value = data.total
      hasMore.value = posts.value.length < data.total
      page.value = currentPage + 1
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchPosts(reset = false) {
    if (loading.value) return
    loading.value = true
    error.value = null

    try {
      if (reset) resetPosts()

      const currentPage = reset ? 1 : page.value
      const data = await postsService.getPosts(currentPage)

      if (reset) {
        posts.value = data.posts
      } else {
        const existingIds = new Set(posts.value.map(p => p.id))
        const newPosts = data.posts.filter(p => !existingIds.has(p.id))
        posts.value = [...posts.value, ...newPosts]
      }

      total.value = data.total
      hasMore.value = posts.value.length < data.total
      page.value = currentPage + 1
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchPostById(id) {
    loading.value = true
    error.value = null

    try {
      const data = await postsService.getPost(id)
      currentPost.value = data.post
      return data.post
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function createPost(content, image = null) {
    loading.value = true
    error.value = null

    try {
      const data = await postsService.createPost(content, image)
      posts.value = [data.post, ...posts.value]
      total.value += 1
      return data.post
    } catch (err) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function deletePost(id) {
    error.value = null

    try {
      await postsService.deletePost(id)
      posts.value = posts.value.filter(p => p.id !== id)
      total.value -= 1
      if (currentPost.value?.id === id) {
        currentPost.value = null
      }
      return true
    } catch (err) {
      error.value = err.message
      return false
    }
  }

  async function toggleLike(id) {
    error.value = null

    try {
      const data = await postsService.toggleLike(id)
      const post = posts.value.find(p => p.id === id)
      if (post) {
        post.liked = data.liked
        post.likesCount = data.likesCount
      }
      if (currentPost.value?.id === id) {
        currentPost.value.liked = data.liked
        currentPost.value.likesCount = data.likesCount
      }
      return data
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  async function toggleBookmark(id) {
    error.value = null

    try {
      const data = await postsService.toggleBookmark(id)
      const post = posts.value.find(p => p.id === id)
      if (post) {
        post.bookmarked = data.bookmarked
      }
      if (currentPost.value?.id === id) {
        currentPost.value.bookmarked = data.bookmarked
      }
      return data
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  async function addComment(postId, content) {
    error.value = null

    try {
      const data = await postsService.addComment(postId, content)
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.commentsCount += 1
      }
      if (currentPost.value?.id === postId) {
        currentPost.value.commentsCount += 1
      }
      return data.comment
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  async function fetchComments(postId, commentPage = 1) {
    error.value = null

    try {
      const data = await postsService.getComments(postId, commentPage)
      return data
    } catch (err) {
      error.value = err.message
      return null
    }
  }

  return {
    posts,
    currentPost,
    loading,
    error,
    page,
    hasMore,
    total,
    fetchFeed,
    fetchPosts,
    fetchPostById,
    createPost,
    deletePost,
    toggleLike,
    toggleBookmark,
    addComment,
    fetchComments,
    resetPosts,
  }
})
