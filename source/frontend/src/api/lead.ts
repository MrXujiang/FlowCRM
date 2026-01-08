import api from './index'

export interface Lead {
  id: string
  leadName: string
  contactInfo: string
  stage: 'uncontacted' | 'contacted' | 'qualified' | 'converted' | 'invalid'
  intentionLevel?: 'low' | 'medium' | 'high'
  relatedCustomerId?: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateLeadData {
  leadName: string
  contactInfo: string
  stage: 'uncontacted' | 'contacted' | 'qualified' | 'converted' | 'invalid'
  intentionLevel?: 'low' | 'medium' | 'high'
  relatedCustomerId?: string
}

export const leadApi = {
  getAll(stage?: string, page?: number, pageSize?: number) {
    const params: any = {}
    if (stage) params.stage = stage
    if (page) params.page = page
    if (pageSize) params.pageSize = pageSize
    return api.get<any, { data: Lead[], total: number, page: number, pageSize: number }>('/leads', { params })
  },
  
  getOne(id: string) {
    return api.get<any, Lead>(`/leads/${id}`)
  },
  
  create(data: CreateLeadData) {
    return api.post<any, Lead>('/leads', data)
  },
  
  update(id: string, data: Partial<CreateLeadData>) {
    return api.patch<any, Lead>(`/leads/${id}`, data)
  },
  
  delete(id: string) {
    return api.delete(`/leads/${id}`)
  },

  generateMock(count: number) {
    return api.post<any, { message: string }>('/leads/mock/generate', { count })
  },

  clearMock() {
    return api.delete<any, { message: string }>('/leads/mock/clear')
  }
}
