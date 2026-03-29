import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsService } from '../services/posts'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const page = ref(1)
  const hasMore = ref(true)

  function resetPosts() {
    posts.value = []
    page.value = 1
    hasMore.value = true
  }

  async function fetchFeed(reset = false) {
    if (reset) resetPosts()
    loading.value = true
    error.value = null
    try {
      const data = await postsService.getFeed(page.value)
      if (reset) {
        posts.value = data.posts
      } else {
        posts.value.push(...data.posts)
      }
      hasMore.value = posts.value.length < data.total
      page.value++
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchPosts(reset = false) {
    if (reset) resetPosts()
    loading.value = true
    error.value = null
    try {
      const data = await postsService.getPosts(page.value)
      if (reset) {
        posts.value = data.posts
      } else {
        posts.value.push(...data.posts)
      }
      hasMore.value = posts.value.length < data.total
      page.value++
      return data
    } catch (err) {
      error.value = err.message
      throw err
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
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPost(content, image = null) {
    error.value = null
    try {
      const data = await postsService.createPost(content, image)
      posts.value.unshift(data.post)
      return data.post
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function deletePost(id) {
    error.value = null
    try {
      await postsService.deletePost(id)
      posts.value = posts.value.filter(p => p.id !== id)
      if (currentPost.value && currentPost.value.id === id) {
        currentPost.value = null
      }
    } catch (err) {
      error.value = err.message
      throw err
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
      if (currentPost.value && currentPost.value.id === id) {
        currentPost.value.liked = data.liked
        currentPost.value.likesCount = data.likesCount
      }
      return data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function addComment(postId, content) {
    error.value = null
    try {
      const data = await postsService.addComment(postId, content)
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.commentsCount = (post.commentsCount || 0) + 1
      }
      if (currentPost.value && currentPost.value.id === postId) {
        currentPost.value.commentsCount = (currentPost.value.commentsCount || 0) + 1
      }
      return data.comment
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    posts,
    currentPost,
    loading,
    error,
    page,
    hasMore,
    fetchFeed,
    fetchPosts,
    fetchPostById,
    createPost,
    deletePost,
    toggleLike,
    addComment,
    resetPosts,
  }
})
