import { defineStore } from 'pinia'
import { ref } from 'vue'
import { postsService } from '../services/posts'

export const usePostsStore = defineStore('posts', () => {
  const posts = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const page = ref(1)

  const mockPosts = [
    {
      id: 1,
      author: { id: '101', name: 'Jessica Park', username: '@jessicapark', avatar: null },
      content: 'Just shipped a major update to our design system! New components, better accessibility, and dark mode support. Check it out and let me know what you think.',
      image: null,
      likes: 142,
      comments: 28,
      shares: 15,
      time: '2h ago',
      liked: false,
      bookmarked: false
    },
    {
      id: 2,
      author: { id: '102', name: 'David Kim', username: '@davidkim', avatar: null },
      content: 'Hot take: CSS has become more powerful than most people realize. Container queries, :has() selector, subgrid — we barely need JavaScript for layout anymore. The web platform is amazing.',
      image: null,
      likes: 89,
      comments: 45,
      shares: 22,
      time: '4h ago',
      liked: true,
      bookmarked: false
    },
    {
      id: 3,
      author: { id: '103', name: 'Mia Thompson', username: '@miathompson', avatar: null },
      content: 'Spent the weekend building a real-time collaborative whiteboard with Vue 3 and WebSockets. The Composition API makes reactive state management so elegant. Thread with demo below.',
      image: null,
      likes: 234,
      comments: 67,
      shares: 41,
      time: '6h ago',
      liked: false,
      bookmarked: true
    },
    {
      id: 4,
      author: { id: '104', name: 'Ryan Foster', username: '@ryanfoster', avatar: null },
      content: 'Tip: Use `git stash --include-untracked` instead of `git stash`. You\'ll thank me later when you realize your new files aren\'t lost.',
      image: null,
      likes: 312,
      comments: 19,
      shares: 88,
      time: '8h ago',
      liked: false,
      bookmarked: false
    },
    {
      id: 5,
      author: { id: '105', name: 'Olivia Martinez', username: '@oliviam', avatar: null },
      content: 'Our team just open-sourced our internal component library! 1200+ components, fully typed, tree-shakeable. Building in public feels incredible. Link in bio.',
      image: null,
      likes: 567,
      comments: 93,
      shares: 124,
      time: '12h ago',
      liked: true,
      bookmarked: false
    }
  ]

  async function fetchFeed() {
    if (loading.value) return
    loading.value = true
    try {
      const data = await postsService.getFeed(page.value)
      if (Array.isArray(data.posts)) {
        posts.value = page.value === 1 ? data.posts : [...posts.value, ...data.posts]
        hasMore.value = data.hasMore !== false
        page.value++
      }
    } catch {
      if (posts.value.length === 0) {
        posts.value = mockPosts
        hasMore.value = false
      }
    } finally {
      loading.value = false
    }
  }

  async function createPost(content, image = null) {
    try {
      const newPost = await postsService.createPost(content, image)
      posts.value.unshift(newPost)
      return newPost
    } catch {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const mockPost = {
        id: Date.now(),
        author: {
          id: user.id || 'me',
          name: user.name || 'You',
          username: user.username || '@you',
          avatar: null
        },
        content,
        image,
        likes: 0,
        comments: 0,
        shares: 0,
        time: 'Just now',
        liked: false,
        bookmarked: false
      }
      posts.value.unshift(mockPost)
      return mockPost
    }
  }

  async function toggleLike(postId) {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return
    post.liked = !post.liked
    post.likes += post.liked ? 1 : -1
    try {
      await postsService.toggleLike(postId)
    } catch {
      post.liked = !post.liked
      post.likes += post.liked ? 1 : -1
    }
  }

  async function deletePost(postId) {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index === -1) return
    const removed = posts.value.splice(index, 1)[0]
    try {
      await postsService.deletePost(postId)
    } catch {
      posts.value.splice(index, 0, removed)
    }
  }

  async function addComment(postId, content) {
    try {
      const comment = await postsService.addComment(postId, content)
      const post = posts.value.find(p => p.id === postId)
      if (post) post.comments++
      return comment
    } catch {
      const post = posts.value.find(p => p.id === postId)
      if (post) post.comments++
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return {
        id: Date.now(),
        author: { name: user.name || 'You', username: user.username || '@you' },
        content,
        time: 'Just now'
      }
    }
  }

  function toggleBookmark(postId) {
    const post = posts.value.find(p => p.id === postId)
    if (post) post.bookmarked = !post.bookmarked
  }

  return {
    posts,
    loading,
    hasMore,
    fetchFeed,
    createPost,
    toggleLike,
    deletePost,
    addComment,
    toggleBookmark
  }
})
