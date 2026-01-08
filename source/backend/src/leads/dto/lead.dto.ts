import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  leadName: string;

  @IsString()
  @IsNotEmpty()
  contactInfo: string;

  @IsEnum(['uncontacted', 'contacted', 'qualified', 'converted', 'invalid'])
  stage: 'uncontacted' | 'contacted' | 'qualified' | 'converted' | 'invalid';

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  intentionLevel?: 'low' | 'medium' | 'high';

  @IsString()
  @IsOptional()
  relatedCustomerId?: string;
}

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  leadName?: string;

  @IsString()
  @IsOptional()
  contactInfo?: string;

  @IsEnum(['uncontacted', 'contacted', 'qualified', 'converted', 'invalid'])
  @IsOptional()
  stage?: 'uncontacted' | 'contacted' | 'qualified' | 'converted' | 'invalid';

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  intentionLevel?: 'low' | 'medium' | 'high';

  @IsString()
  @IsOptional()
  relatedCustomerId?: string;
}
