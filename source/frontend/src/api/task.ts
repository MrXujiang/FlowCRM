import api from './index'

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'completed'
  relatedCustomerId?: string
  relatedLeadId?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  title: string
  description?: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  relatedCustomerId?: string
  relatedLeadId?: string
}

export const taskApi = {
  getAll(status?: string, page?: number, pageSize?: number) {
    const params: any = {}
    if (status) params.status = status
    if (page) params.page = page
    if (pageSize) params.pageSize = pageSize
    return api.get<any, { data: Task[], total: number, page: number, pageSize: number }>('/tasks', { params })
  },
  
  getDueSoon(days?: number) {
    return api.get<any, Task[]>('/tasks/due-soon', { params: { days } })
  },
  
  create(data: CreateTaskData) {
    return api.post<any, Task>('/tasks', data)
  },
  
  update(id: string, data: Partial<CreateTaskData> & { status?: 'todo' | 'completed' }) {
    return api.patch<any, Task>(`/tasks/${id}`, data)
  },
  
  delete(id: string) {
    return api.delete(`/tasks/${id}`)
  },

  generateMock(count: number) {
    return api.post<any, { message: string }>('/tasks/mock/generate', { count })
  },

  clearMock() {
    return api.delete<any, { message: string }>('/tasks/mock/clear')
  }
}
