import { PartialType } from '@nestjs/mapped-types';
import { CreateGarmentDto } from './create-garment.dto';

export class UpdateGarmentDto extends PartialType(CreateGarmentDto) {}
