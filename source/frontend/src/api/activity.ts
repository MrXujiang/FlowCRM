import api from './index'

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'other'
  date: string
  notes: string
  customerId?: string
  leadId?: string
  remindDate?: string
  ownerId: string
  createdAt: string
}

export interface CreateActivityData {
  type: 'call' | 'email' | 'meeting' | 'other'
  date: string
  notes: string
  customerId?: string
  leadId?: string
  remindDate?: string
}

export const activityApi = {
  getAll(customerId?: string, leadId?: string, page?: number, pageSize?: number) {
    const params: any = {}
    if (customerId) params.customerId = customerId
    if (leadId) params.leadId = leadId
    if (page) params.page = page
    if (pageSize) params.pageSize = pageSize
    return api.get<any, { data: Activity[], total: number, page: number, pageSize: number }>('/activities', { params })
  },
  
  getReminders() {
    return api.get<any, Activity[]>('/activities/reminders')
  },
  
  create(data: CreateActivityData) {
    return api.post<any, Activity>('/activities', data)
  },
  
  update(id: string, data: Partial<CreateActivityData>) {
    return api.patch<any, Activity>(`/activities/${id}`, data)
  },
  
  delete(id: string) {
    return api.delete(`/activities/${id}`)
  },

  generateMock(count: number) {
    return api.post<any, { message: string }>('/activities/mock/generate', { count })
  },

  clearMock() {
    return api.delete<any, { message: string }>('/activities/mock/clear')
  }
}
