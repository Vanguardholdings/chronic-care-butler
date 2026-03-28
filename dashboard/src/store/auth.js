import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  const login = async (credentials) => {
    // TODO: Call login API
    const mockToken = 'mock_token_' + Date.now()
    token.value = mockToken
    localStorage.setItem('token', mockToken)
    user.value = { name: '护士小李', role: 'nurse' }
    return true
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    logout
  }
})
