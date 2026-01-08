import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { JsonStorageService } from '../common/json-storage.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, JsonStorageService],
})
export class CustomersModule {}
