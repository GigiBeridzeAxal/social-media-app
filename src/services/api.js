const API_BASE = import.meta.env.VITE_API_URL || ''

class ApiService {
  constructor() {
    this.baseUrl = API_BASE
  }

  getToken() {
    return localStorage.getItem('token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    })

    if (response.status === 401) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getToken()}`
        const retryResponse = await fetch(url, { ...options, headers, credentials: 'include' })
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({ error: 'Request failed' }))
          throw new ApiError(retryResponse.status, error.error || 'Request failed')
        }
        return retryResponse.json()
      }
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/signin'
      throw new ApiError(401, 'Session expired')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new ApiError(response.status, error.error || 'Request failed')
    }

    return response.json()
  }

  async refreshToken() {
    try {
      const token = this.getToken()
      if (!token) return false

      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (!response.ok) return false

      const data = await response.json()
      localStorage.setItem('token', data.token)
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
      return true
    } catch {
      return false
    }
  }

  get(endpoint) { return this.request(endpoint) }
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }) }
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }) }
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }) }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export const api = new ApiService()
export { ApiError }
