import { api } from './api'

export const usersService = {
  getProfile(id) {
    return api.get(`/api/users/${id}`)
  },
  updateProfile(id, data) {
    return api.put(`/api/users/${id}`, data)
  },
  toggleFollow(id) {
    return api.post(`/api/users/${id}/follow`)
  },
  getUserPosts(id, page = 1, limit = 20) {
    return api.get(`/api/users/${id}/posts?page=${page}&limit=${limit}`)
  },
}
