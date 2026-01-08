import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JsonStorageService } from '../common/json-storage.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, JsonStorageService],
})
export class TasksModule {}
