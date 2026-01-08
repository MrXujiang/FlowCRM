import api from './index'
import { FileAttachment } from './upload'

export interface Customer {
  id: string
  name: string
  phone: string
  company?: string
  source?: string
  tags?: string[]
  remarks?: string
  attachments?: FileAttachment[]
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerData {
  name: string
  phone: string
  company?: string
  source?: string
  tags?: string[]
  remarks?: string
}

export const customerApi = {
  getAll(keyword?: string, page?: number, pageSize?: number) {
    const params: any = {}
    if (keyword) params.keyword = keyword
    if (page) params.page = page
    if (pageSize) params.pageSize = pageSize
    return api.get<any, { data: Customer[], total: number, page: number, pageSize: number }>('/customers', { params })
  },
  
  getOne(id: string) {
    return api.get<any, Customer>(`/customers/${id}`)
  },
  
  create(data: CreateCustomerData) {
    return api.post<any, Customer>('/customers', data)
  },
  
  update(id: string, data: Partial<CreateCustomerData>) {
    return api.patch<any, Customer>(`/customers/${id}`, data)
  },
  
  delete(id: string) {
    return api.delete(`/customers/${id}`)
  },

  generateMock(count: number) {
    return api.post<any, { message: string }>('/customers/mock/generate', { count })
  },

  clearMock() {
    return api.delete<any, { message: string }>('/customers/mock/clear')
  }
}
