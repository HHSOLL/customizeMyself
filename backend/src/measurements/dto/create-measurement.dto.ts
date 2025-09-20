import { IsNotEmpty, IsOptional, IsString, IsUUID, IsObject } from 'class-validator';

export class CreateMeasurementDto {
  @IsString()
  @IsNotEmpty()
  gender!: string;

  @IsOptional()
  @IsString()
  preset?: string;

  @IsObject()
  data!: Record<string, number>;

  @IsOptional()
  @IsUUID()
  baseMeasurementId?: string;
}
