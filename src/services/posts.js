import { api } from './api'

export const postsService = {
  getFeed(page = 1, limit = 20) {
    return api.get(`/api/feed?page=${page}&limit=${limit}`)
  },
  getPosts(page = 1, limit = 20) {
    return api.get(`/api/posts?page=${page}&limit=${limit}`)
  },
  getPost(id) {
    return api.get(`/api/posts/${id}`)
  },
  createPost(content, image = null) {
    return api.post('/api/posts', { content, image })
  },
  updatePost(id, data) {
    return api.put(`/api/posts/${id}`, data)
  },
  deletePost(id) {
    return api.delete(`/api/posts/${id}`)
  },
  toggleLike(id) {
    return api.post(`/api/posts/${id}/like`)
  },
  toggleBookmark(id) {
    return api.post(`/api/posts/${id}/bookmark`)
  },
  getComments(postId, page = 1) {
    return api.get(`/api/posts/${postId}/comments?page=${page}`)
  },
  addComment(postId, content) {
    return api.post(`/api/posts/${postId}/comments`, { content })
  },
}
