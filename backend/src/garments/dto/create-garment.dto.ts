import { IsArray, IsNotEmpty, IsOptional, IsString, IsUrl, IsObject } from 'class-validator';

export class CreateGarmentDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  assetUrl!: string;

  @IsArray()
  @IsString({ each: true })
  anchors!: string[];

  @IsOptional()
  @IsObject()
  license?: Record<string, unknown>;

  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;
}
