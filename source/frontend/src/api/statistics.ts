import api from './index'

export interface StatisticsData {
  totalCustomers: number
  totalLeads: number
  totalActivities: number
  totalTasks: number
  leadsByStage: { stage: string; count: number }[]
  tasksByPriority: { priority: string; count: number }[]
  tasksByStatus: { status: string; count: number }[]
  activitiesByType: { type: string; count: number }[]
  recentTrend: { date: string; customers: number; leads: number }[]
}

export const statisticsApi = {
  async getOverview(): Promise<StatisticsData> {
    return api.get<any, StatisticsData>('/statistics/overview')
  }
}
