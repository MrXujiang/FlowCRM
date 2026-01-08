import api from './index'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: 'admin' | 'sales'
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'sales'
  createdAt: string
}

export const authApi = {
  login(data: LoginData) {
    return api.post<any, { user: User; token: string }>('/auth/login', data)
  },
  
  register(data: RegisterData) {
    return api.post<any, { user: User; token: string }>('/auth/register', data)
  }
}
