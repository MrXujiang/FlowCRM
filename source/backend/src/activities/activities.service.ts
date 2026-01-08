import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../common/json-storage.service';
import { Activity } from '../common/interfaces';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ActivitiesService {
  constructor(private readonly storageService: JsonStorageService) {}

  create(createActivityDto: CreateActivityDto, userId: string): Activity {
    const activity: Activity = {
      id: uuidv4(),
      ...createActivityDto,
      ownerId: userId,
      createdAt: new Date().toISOString(),
    };

    return this.storageService.create('activities', activity);
  }

  findAll(userId: string, userRole: string): Activity[] {
    const activities = this.storageService.read<Activity>('activities');
    
    if (userRole === 'admin') {
      return activities;
    }
    
    return activities.filter(activity => activity.ownerId === userId);
  }

  findAllPaginated(userId: string, userRole: string, page: number = 1, pageSize: number = 10) {
    const activities = this.findAll(userId, userRole);
    return this.storageService.paginate(activities, page, pageSize);
  }

  findByCustomer(customerId: string, userId: string, userRole: string): Activity[] {
    const activities = this.findAll(userId, userRole);
    return activities
      .filter(activity => activity.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  findByLead(leadId: string, userId: string, userRole: string): Activity[] {
    const activities = this.findAll(userId, userRole);
    return activities
      .filter(activity => activity.leadId === leadId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  findOne(id: string): Activity {
    const activity = this.storageService.findById<Activity>('activities', id);
    
    if (!activity) {
      throw new NotFoundException('跟进记录不存在');
    }

    return activity;
  }

  update(id: string, updateActivityDto: UpdateActivityDto): Activity {
    const updated = this.storageService.update<Activity>('activities', id, updateActivityDto as Partial<Activity>);

    if (!updated) {
      throw new NotFoundException('更新失败');
    }

    return updated;
  }

  remove(id: string): void {
    const deleted = this.storageService.delete('activities', id);
    if (!deleted) {
      throw new NotFoundException('删除失败');
    }
  }

  getUpcomingReminders(userId: string, userRole: string): Activity[] {
    const activities = this.findAll(userId, userRole);
    const now = new Date();
    
    return activities
      .filter(activity => {
        if (!activity.remindDate) return false;
        const remindDate = new Date(activity.remindDate);
        return remindDate > now;
      })
      .sort((a, b) => new Date(a.remindDate!).getTime() - new Date(b.remindDate!).getTime());
  }

  generateMockData(count: number, userId: string): number {
    const types: Array<'call' | 'email' | 'meeting' | 'other'> = ['call', 'email', 'meeting', 'other'];
    const typeLabels = { call: '电话沟通', email: '邮件联系', meeting: '会议洽谈', other: '其他联系' };
    const noteTemplates = [
      '与客户进行了深入沟通，了解了具体需求',
      '讨论了合作的可能性，客户表现出浓厚兴趣',
      '跟进项目进展，客户反馈良好',
      '解答了客户的一些疑问，建立了信任',
      '预约了下次见面时间，继续深入交流'
    ];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const activity: Activity = {
        id: uuidv4(),
        type,
        date: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        notes: `${typeLabels[type]}: ${noteTemplates[Math.floor(Math.random() * noteTemplates.length)]}（Mock数据 ${i + 1}）`,
        remindDate: Math.random() > 0.5 
          ? new Date(Date.now() + Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString()
          : undefined,
        ownerId: userId,
        createdAt: new Date().toISOString(),
      };

      this.storageService.create('activities', activity);
    }

    return count;
  }

  clearMockData(userId: string, userRole: string): number {
    const activities = this.storageService.read<Activity>('activities');
    const beforeCount = activities.length;
    
    let filteredActivities: Activity[];
    if (userRole === 'admin') {
      filteredActivities = [];
    } else {
      filteredActivities = activities.filter(a => a.ownerId !== userId);
    }
    
    this.storageService.write('activities', filteredActivities);
    return beforeCount - filteredActivities.length;
  }
}
