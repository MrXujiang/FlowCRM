import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi, type User } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // 初始化从localStorage读取
  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    user.value = response.user
    token.value = response.token
    
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  const register = async (email: string, password: string, name: string, role: 'admin' | 'sales') => {
    const response = await authApi.register({ email, password, name, role })
    user.value = response.user
    token.value = response.token
    
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    user,
    token,
    initAuth,
    login,
    register,
    logout,
    isAuthenticated
  }
})
