import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsEnum(['low', 'medium', 'high'])
  priority: 'low' | 'medium' | 'high';

  @IsString()
  @IsOptional()
  relatedCustomerId?: string;

  @IsString()
  @IsOptional()
  relatedLeadId?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @IsEnum(['todo', 'completed'])
  @IsOptional()
  status?: 'todo' | 'completed';

  @IsString()
  @IsOptional()
  relatedCustomerId?: string;

  @IsString()
  @IsOptional()
  relatedLeadId?: string;
}
