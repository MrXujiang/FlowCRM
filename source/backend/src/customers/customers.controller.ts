import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto, @Request() req: any) {
    return this.customersService.create(createCustomerDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any, @Query('keyword') keyword?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    
    if (keyword) {
      return this.customersService.searchPaginated(keyword, req.user.id, req.user.role, pageNum, pageSizeNum);
    }
    return this.customersService.findAllPaginated(req.user.id, req.user.role, pageNum, pageSizeNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.customersService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateCustomerDto: UpdateCustomerDto, @Request() req: any) {
    return this.customersService.update(id, updateCustomerDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    this.customersService.remove(id, req.user.id, req.user.role);
    return { message: '删除成功' };
  }

  @Post('mock/generate')
  generateMock(@Body('count') count: number, @Request() req: any) {
    const generatedCount = this.customersService.generateMockData(count || 10, req.user.id);
    return { message: `成功生成 ${generatedCount} 条Mock数据` };
  }

  @Delete('mock/clear')
  clearMock(@Request() req: any) {
    const deletedCount = this.customersService.clearMockData(req.user.id, req.user.role);
    return { message: `成功清空 ${deletedCount} 条数据` };
  }
}
