import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body(ValidationPipe) createLeadDto: CreateLeadDto, @Request() req: any) {
    return this.leadsService.create(createLeadDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any, @Query('stage') stage?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    
    if (stage) {
      return this.leadsService.findByStagePaginated(stage, req.user.id, req.user.role, pageNum, pageSizeNum);
    }
    return this.leadsService.findAllPaginated(req.user.id, req.user.role, pageNum, pageSizeNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.leadsService.findOne(id, req.user.id, req.user.role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateLeadDto: UpdateLeadDto, @Request() req: any) {
    return this.leadsService.update(id, updateLeadDto, req.user.id, req.user.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    this.leadsService.remove(id, req.user.id, req.user.role);
    return { message: '删除成功' };
  }

  @Post('mock/generate')
  generateMock(@Body('count') count: number, @Request() req: any) {
    const generatedCount = this.leadsService.generateMockData(count || 10, req.user.id);
    return { message: `成功生成 ${generatedCount} 条Mock数据` };
  }

  @Delete('mock/clear')
  clearMock(@Request() req: any) {
    const deletedCount = this.leadsService.clearMockData(req.user.id, req.user.role);
    return { message: `成功清空 ${deletedCount} 条数据` };
  }
}
