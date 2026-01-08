import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JsonStorageService } from '../common/json-storage.service';
import { Lead } from '../common/interfaces';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LeadsService {
  constructor(private readonly storageService: JsonStorageService) {}

  create(createLeadDto: CreateLeadDto, userId: string): Lead {
    const lead: Lead = {
      id: uuidv4(),
      ...createLeadDto,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.storageService.create('leads', lead);
  }

  findAll(userId: string, userRole: string): Lead[] {
    const leads = this.storageService.read<Lead>('leads');
    
    if (userRole === 'admin') {
      return leads;
    }
    
    return leads.filter(lead => lead.ownerId === userId);
  }

  findAllPaginated(userId: string, userRole: string, page: number = 1, pageSize: number = 10) {
    const leads = this.findAll(userId, userRole);
    return this.storageService.paginate(leads, page, pageSize);
  }

  findOne(id: string, userId: string, userRole: string): Lead {
    const lead = this.storageService.findById<Lead>('leads', id);
    
    if (!lead) {
      throw new NotFoundException('线索不存在');
    }

    if (userRole !== 'admin' && lead.ownerId !== userId) {
      throw new ForbiddenException('无权访问此线索');
    }

    return lead;
  }

  update(id: string, updateLeadDto: UpdateLeadDto, userId: string, userRole: string): Lead {
    const lead = this.findOne(id, userId, userRole);

    const updated = this.storageService.update<Lead>('leads', id, {
      ...updateLeadDto,
      updatedAt: new Date().toISOString(),
    } as Partial<Lead>);

    if (!updated) {
      throw new NotFoundException('更新失败');
    }

    return updated;
  }

  remove(id: string, userId: string, userRole: string): void {
    const lead = this.findOne(id, userId, userRole);
    
    const deleted = this.storageService.delete('leads', id);
    if (!deleted) {
      throw new NotFoundException('删除失败');
    }
  }

  findByStage(stage: string, userId: string, userRole: string): Lead[] {
    const leads = this.findAll(userId, userRole);
    return leads.filter(lead => lead.stage === stage);
  }

  findByStagePaginated(stage: string, userId: string, userRole: string, page: number = 1, pageSize: number = 10) {
    const results = this.findByStage(stage, userId, userRole);
    return this.storageService.paginate(results, page, pageSize);
  }

  generateMockData(count: number, userId: string): number {
    const names = ['张总', '李经理', '王总监', '赵主管', '刘老板', '陈总', '周经理', '吴总', '郑主任', '孙经理'];
    const stages: Array<'uncontacted' | 'contacted' | 'qualified' | 'converted' | 'invalid'> = 
      ['uncontacted', 'contacted', 'qualified', 'converted', 'invalid'];
    const intentionLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];

    for (let i = 0; i < count; i++) {
      const lead: Lead = {
        id: uuidv4(),
        leadName: names[Math.floor(Math.random() * names.length)] + `的线索${i + 1}`,
        contactInfo: `1${Math.floor(Math.random() * 9) + 3}${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`,
        stage: stages[Math.floor(Math.random() * stages.length)],
        intentionLevel: intentionLevels[Math.floor(Math.random() * intentionLevels.length)],
        ownerId: userId,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.storageService.create('leads', lead);
    }

    return count;
  }

  clearMockData(userId: string, userRole: string): number {
    const leads = this.storageService.read<Lead>('leads');
    const beforeCount = leads.length;
    
    let filteredLeads: Lead[];
    if (userRole === 'admin') {
      filteredLeads = [];
    } else {
      filteredLeads = leads.filter(l => l.ownerId !== userId);
    }
    
    this.storageService.write('leads', filteredLeads);
    return beforeCount - filteredLeads.length;
  }
}
