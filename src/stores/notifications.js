import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])
  const loading = ref(false)
  const error = ref(null)

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length
  })

  async function fetchNotifications() {
    loading.value = true
    error.value = null
    try {
      // Mock data until notifications backend is built
      notifications.value = [
        { id: '1', type: 'like', message: 'Someone liked your post', read: false, createdAt: new Date().toISOString() },
        { id: '2', type: 'follow', message: 'Someone started following you', read: false, createdAt: new Date().toISOString() },
        { id: '3', type: 'comment', message: 'Someone commented on your post', read: true, createdAt: new Date().toISOString() },
      ]
      return notifications.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function markAsRead(id) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllRead,
  }
})
