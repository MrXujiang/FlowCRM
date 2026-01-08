import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { JsonStorageService } from '../common/json-storage.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, JsonStorageService],
})
export class LeadsModule {}
