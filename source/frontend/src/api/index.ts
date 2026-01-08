import axios from 'axios'
import { MessagePlugin } from 'tdesign-vue-next'
import router from '../router'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
        MessagePlugin.error('登录已过期，请重新登录')
      } else {
        MessagePlugin.error(data.message || '请求失败')
      }
    } else {
      MessagePlugin.error('网络错误，请检查您的网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default api
