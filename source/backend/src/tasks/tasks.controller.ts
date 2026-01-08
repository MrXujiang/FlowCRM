import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body(ValidationPipe) createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: any, @Query('status') status?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    
    if (status) {
      return this.tasksService.findByStatusPaginated(status, req.user.id, req.user.role, pageNum, pageSizeNum);
    }
    return this.tasksService.findAllPaginated(req.user.id, req.user.role, pageNum, pageSizeNum);
  }

  @Get('due-soon')
  getDueSoon(@Request() req: any, @Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 3;
    return this.tasksService.getDueSoon(req.user.id, req.user.role, daysNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.tasksService.remove(id);
    return { message: '删除成功' };
  }

  @Post('mock/generate')
  generateMock(@Body('count') count: number, @Request() req: any) {
    const generatedCount = this.tasksService.generateMockData(count || 10, req.user.id);
    return { message: `成功生成 ${generatedCount} 条Mock数据` };
  }

  @Delete('mock/clear')
  clearMock(@Request() req: any) {
    const deletedCount = this.tasksService.clearMockData(req.user.id, req.user.role);
    return { message: `成功清空 ${deletedCount} 条数据` };
  }
}
