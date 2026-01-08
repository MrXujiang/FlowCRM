import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../common/json-storage.service';
import { Task } from '../common/interfaces';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TasksService {
  constructor(private readonly storageService: JsonStorageService) {}

  create(createTaskDto: CreateTaskDto, userId: string): Task {
    const task: Task = {
      id: uuidv4(),
      ...createTaskDto,
      status: 'todo',
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.storageService.create('tasks', task);
  }

  findAll(userId: string, userRole: string): Task[] {
    const tasks = this.storageService.read<Task>('tasks');
    
    if (userRole === 'admin') {
      return tasks;
    }
    
    return tasks.filter(task => task.ownerId === userId);
  }

  findAllPaginated(userId: string, userRole: string, page: number = 1, pageSize: number = 10) {
    const tasks = this.findAll(userId, userRole);
    return this.storageService.paginate(tasks, page, pageSize);
  }

  findOne(id: string): Task {
    const task = this.storageService.findById<Task>('tasks', id);
    
    if (!task) {
      throw new NotFoundException('任务不存在');
    }

    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const updated = this.storageService.update<Task>('tasks', id, {
      ...updateTaskDto,
      updatedAt: new Date().toISOString(),
    } as Partial<Task>);

    if (!updated) {
      throw new NotFoundException('更新失败');
    }

    return updated;
  }

  remove(id: string): void {
    const deleted = this.storageService.delete('tasks', id);
    if (!deleted) {
      throw new NotFoundException('删除失败');
    }
  }

  findByStatus(status: string, userId: string, userRole: string): Task[] {
    const tasks = this.findAll(userId, userRole);
    return tasks.filter(task => task.status === status);
  }

  findByStatusPaginated(status: string, userId: string, userRole: string, page: number = 1, pageSize: number = 10) {
    const results = this.findByStatus(status, userId, userRole);
    return this.storageService.paginate(results, page, pageSize);
  }

  getDueSoon(userId: string, userRole: string, days: number = 3): Task[] {
    const tasks = this.findAll(userId, userRole);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return tasks
      .filter(task => {
        if (task.status === 'completed') return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= futureDate;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  generateMockData(count: number, userId: string): number {
    const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const taskTitles = [
      '跟进客户需求',
      '准备报价方案',
      '约见客户洽谈',
      '整理客户资料',
      '签署合作协议',
      '提交项目方案',
      '回访老客户',
      '整理销售报表',
      '参加行业会议',
      '学习产品知识'
    ];
    const descriptions = [
      '需要及时完成，注意沟通方式',
      '准备相关材料，提前联系客户',
      '重要任务，请优先处理',
      '按照标准流程执行',
      '注意时间节点，不要遗漏'
    ];

    for (let i = 0; i < count; i++) {
      const task: Task = {
        id: uuidv4(),
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)] + ` #${i + 1}`,
        description: descriptions[Math.floor(Math.random() * descriptions.length)] + `（Mock数据）`,
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 14 * 24 * 60 * 60 * 1000)).toISOString(),
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: Math.random() > 0.7 ? 'completed' : 'todo',
        ownerId: userId,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.storageService.create('tasks', task);
    }

    return count;
  }

  clearMockData(userId: string, userRole: string): number {
    const tasks = this.storageService.read<Task>('tasks');
    const beforeCount = tasks.length;
    
    let filteredTasks: Task[];
    if (userRole === 'admin') {
      filteredTasks = [];
    } else {
      filteredTasks = tasks.filter(t => t.ownerId !== userId);
    }
    
    this.storageService.write('tasks', filteredTasks);
    return beforeCount - filteredTasks.length;
  }
}
