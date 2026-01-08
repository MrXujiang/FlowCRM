import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { JsonStorageService } from '../common/json-storage.service';

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService, JsonStorageService]
})
export class StatisticsModule {}
