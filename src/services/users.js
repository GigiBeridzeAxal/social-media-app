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
}
