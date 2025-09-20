import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateFitHistoryDto {
  @IsString()
  @IsNotEmpty()
  tier!: string;

  @IsInt()
  @Min(0)
  latencyMs!: number;

  @IsOptional()
  @IsUUID()
  measurementId?: string;

  @IsOptional()
  @IsString()
  garmentId?: string;

  @IsOptional()
  degraded?: boolean;

  @IsOptional()
  details?: Record<string, unknown>;
}
