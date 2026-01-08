import api from './index'

export interface FileAttachment {
  filename: string
  originalName: string
  size: number
  mimetype: string
  url: string
  uploadedAt?: string
}

export const uploadApi = {
  // 单文件上传
  async uploadSingle(file: File): Promise<FileAttachment> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<any, FileAttachment>('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return {
      ...response,
      uploadedAt: new Date().toISOString()
    }
  },

  // 多文件上传
  async uploadMultiple(files: File[]): Promise<FileAttachment[]> {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })
    
    const response = await api.post<any, FileAttachment[]>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.map(item => ({
      ...item,
      uploadedAt: new Date().toISOString()
    }))
  },

  // 删除文件
  deleteFile(filename: string) {
    return api.delete('/upload/file', { data: { filename } })
  },

  // 获取文件完整URL
  getFileUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }
    // 生产环境使用相对路径，开发环境使用绝对路径
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    return isDev ? `http://localhost:3000${url}` : url
  }
}
