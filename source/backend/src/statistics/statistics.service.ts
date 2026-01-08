import { Injectable } from '@nestjs/common';
import { JsonStorageService } from '../common/json-storage.service';
import { Customer } from '../common/interfaces';
import { Lead } from '../common/interfaces';
import { Activity } from '../common/interfaces';
import { Task } from '../common/interfaces';

export interface StatisticsOverview {
  totalCustomers: number;
  totalLeads: number;
  totalActivities: number;
  totalTasks: number;
  leadsByStage: { stage: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  tasksByStatus: { status: string; count: number }[];
  activitiesByType: { type: string; count: number }[];
  recentTrend: { date: string; customers: number; leads: number }[];
}

@Injectable()
export class StatisticsService {
  constructor(private readonly storageService: JsonStorageService) {}

  getOverview(userId: string, userRole: string): StatisticsOverview {
    // 读取所有数据
    const allCustomers = this.storageService.read<Customer>('customers');
    const allLeads = this.storageService.read<Lead>('leads');
    const allActivities = this.storageService.read<Activity>('activities');
    const allTasks = this.storageService.read<Task>('tasks');

    // 根据角色过滤数据
    const customers = userRole === 'admin' 
      ? allCustomers 
      : allCustomers.filter(c => c.ownerId === userId);
    
    const leads = userRole === 'admin'
      ? allLeads
      : allLeads.filter(l => l.ownerId === userId);
    
    const activities = userRole === 'admin'
      ? allActivities
      : allActivities.filter(a => a.ownerId === userId);
    
    const tasks = userRole === 'admin'
      ? allTasks
      : allTasks.filter(t => t.ownerId === userId);

    return {
      totalCustomers: customers.length,
      totalLeads: leads.length,
      totalActivities: activities.length,
      totalTasks: tasks.length,
      leadsByStage: this.countByStage(leads),
      tasksByPriority: this.countByPriority(tasks),
      tasksByStatus: this.countByStatus(tasks),
      activitiesByType: this.countByType(activities),
      recentTrend: this.calculateTrend(customers, leads)
    };
  }

  private countByStage(leads: Lead[]): { stage: string; count: number }[] {
    const counts: Record<string, number> = {};
    leads.forEach(lead => {
      counts[lead.stage] = (counts[lead.stage] || 0) + 1;
    });
    return Object.entries(counts).map(([stage, count]) => ({ stage, count }));
  }

  private countByPriority(tasks: Task[]): { priority: string; count: number }[] {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      counts[task.priority] = (counts[task.priority] || 0) + 1;
    });
    return Object.entries(counts).map(([priority, count]) => ({ priority, count }));
  }

  private countByStatus(tasks: Task[]): { status: string; count: number }[] {
    const counts: Record<string, number> = {};
    tasks.forEach(task => {
      counts[task.status] = (counts[task.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }

  private countByType(activities: Activity[]): { type: string; count: number }[] {
    const counts: Record<string, number> = {};
    activities.forEach(activity => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }

  private calculateTrend(customers: Customer[], leads: Lead[]): { date: string; customers: number; leads: number }[] {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const customersCount = customers.filter(c => 
        c.createdAt && c.createdAt.startsWith(dateStr)
      ).length;
      
      const leadsCount = leads.filter(l => 
        l.createdAt && l.createdAt.startsWith(dateStr)
      ).length;
      
      last7Days.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        customers: customersCount,
        leads: leadsCount
      });
    }
    
    return last7Days;
  }
}
