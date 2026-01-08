import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JsonStorageService } from '../common/json-storage.service';
import { Customer } from '../common/interfaces';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomersService {
  constructor(private readonly storageService: JsonStorageService) {}

  create(createCustomerDto: CreateCustomerDto, userId: string): Customer {
    const customer: Customer = {
      id: uuidv4(),
      ...createCustomerDto,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.storageService.create('customers', customer);
  }

  findAll(userId: string, userRole: string): Customer[] {
    const customers = this.storageService.read<Customer>('customers');
    
    // 管理员可以查看所有客户，销售只能看自己的
    if (userRole === 'admin') {
      return customers;
    }
    
    return customers.filter(customer => customer.ownerId === userId);
  }

  findAllPaginated(userId: string, userRole: string, page: number = 1, pageSize: number = 10) {
    const customers = this.findAll(userId, userRole);
    return this.storageService.paginate(customers, page, pageSize);
  }

  findOne(id: string, userId: string, userRole: string): Customer {
    const customer = this.storageService.findById<Customer>('customers', id);
    
    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    // 验证权限
    if (userRole !== 'admin' && customer.ownerId !== userId) {
      throw new ForbiddenException('无权访问此客户');
    }

    return customer;
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string, userRole: string): Customer {
    const customer = this.findOne(id, userId, userRole);

    const updated = this.storageService.update<Customer>('customers', id, {
      ...updateCustomerDto,
      updatedAt: new Date().toISOString(),
    } as Partial<Customer>);

    if (!updated) {
      throw new NotFoundException('更新失败');
    }

    return updated;
  }

  remove(id: string, userId: string, userRole: string): void {
    const customer = this.findOne(id, userId, userRole);
    
    const deleted = this.storageService.delete('customers', id);
    if (!deleted) {
      throw new NotFoundException('删除失败');
    }
  }

  search(keyword: string, userId: string, userRole: string): Customer[] {
    const customers = this.findAll(userId, userRole);
    
    if (!keyword) return customers;

    const lowerKeyword = keyword.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerKeyword) ||
      customer.phone.includes(keyword) ||
      customer.company?.toLowerCase().includes(lowerKeyword)
    );
  }

  searchPaginated(keyword: string, userId: string, userRole: string, page: number = 1, pageSize: number = 10) {
    const results = this.search(keyword, userId, userRole);
    return this.storageService.paginate(results, page, pageSize);
  }

  generateMockData(count: number, userId: string): number {
    const names = ['张三', '李四', '王五', '赵六', '刘七', '陈八', '周九', '吴十', '郑十一', '孙十二'];
    const companies = ['阿里巴巴', '腾讯科技', '百度公司', '字节跳动', '京东集团', '美团', '小米科技', '华为技术', '滴滴出行', '网易公司'];
    const sources = ['网络推广', '朋友介绍', '线下活动', '电话联系', '官网咨询'];
    const tagOptions = ['重点客户', '意向客户', '老客户', '高价值', '需要跟进'];

    for (let i = 0; i < count; i++) {
      const customer: Customer = {
        id: uuidv4(),
        name: names[Math.floor(Math.random() * names.length)] + (i + 1),
        phone: `1${Math.floor(Math.random() * 9) + 3}${Math.floor(Math.random() * 100000000).toString().padStart(9, '0')}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        tags: [tagOptions[Math.floor(Math.random() * tagOptions.length)]],
        remarks: `这是一条Mock数据，用于测试。编号: ${i + 1}`,
        ownerId: userId,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.storageService.create('customers', customer);
    }

    return count;
  }

  clearMockData(userId: string, userRole: string): number {
    const customers = this.storageService.read<Customer>('customers');
    const beforeCount = customers.length;
    
    let filteredCustomers: Customer[];
    if (userRole === 'admin') {
      // 管理员清空所有数据
      filteredCustomers = [];
    } else {
      // 销售只清空自己的数据
      filteredCustomers = customers.filter(c => c.ownerId !== userId);
    }
    
    this.storageService.write('customers', filteredCustomers);
    return beforeCount - filteredCustomers.length;
  }
}
