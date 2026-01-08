import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(@Body(ValidationPipe) createActivityDto: CreateActivityDto, @Request() req: any) {
    return this.activitiesService.create(createActivityDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any, @Query('customerId') customerId?: string, @Query('leadId') leadId?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    
    // 注意：customerId 和 leadId 的查询暂时不分页，因为通常单个客户/线索的跟进数量不多
    if (customerId) {
      return this.activitiesService.findByCustomer(customerId, req.user.id, req.user.role);
    }
    if (leadId) {
      return this.activitiesService.findByLead(leadId, req.user.id, req.user.role);
    }
    return this.activitiesService.findAllPaginated(req.user.id, req.user.role, pageNum, pageSizeNum);
  }

  @Get('reminders')
  getReminders(@Request() req: any) {
    return this.activitiesService.getUpcomingReminders(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.activitiesService.remove(id);
    return { message: '删除成功' };
  }

  @Post('mock/generate')
  generateMock(@Body('count') count: number, @Request() req: any) {
    const generatedCount = this.activitiesService.generateMockData(count || 10, req.user.id);
    return { message: `成功生成 ${generatedCount} 条Mock数据` };
  }

  @Delete('mock/clear')
  clearMock(@Request() req: any) {
    const deletedCount = this.activitiesService.clearMockData(req.user.id, req.user.role);
    return { message: `成功清空 ${deletedCount} 条数据` };
  }
}
