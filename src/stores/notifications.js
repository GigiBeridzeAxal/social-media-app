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
      // Notifications API not yet implemented - return empty for now
      // Will be replaced with real API call: api.get('/api/notifications')
      notifications.value = []
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  function markAllRead() {
    notifications.value.forEach(n => { n.read = true })
  }

  function addNotification(notification) {
    notifications.value = [notification, ...notifications.value]
  }

  function clearNotifications() {
    notifications.value = []
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllRead,
    addNotification,
    clearNotifications,
  }
})
