import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateActivityDto {
  @IsEnum(['call', 'email', 'meeting', 'other'])
  type: 'call' | 'email' | 'meeting' | 'other';

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  notes: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsDateString()
  @IsOptional()
  remindDate?: string;
}

export class UpdateActivityDto {
  @IsEnum(['call', 'email', 'meeting', 'other'])
  @IsOptional()
  type?: 'call' | 'email' | 'meeting' | 'other';

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsDateString()
  @IsOptional()
  remindDate?: string;
}
