import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { JsonStorageService } from '../common/json-storage.service';

@Module({
  controllers: [ActivitiesController],
  providers: [ActivitiesService, JsonStorageService],
})
export class ActivitiesModule {}
