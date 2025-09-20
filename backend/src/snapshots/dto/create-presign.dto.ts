import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePresignDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsOptional()
  @IsString()
  contentType?: string;
}
