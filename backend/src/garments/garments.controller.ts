import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GarmentsService } from './garments.service';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';

@Controller('garments')
export class GarmentsController {
  constructor(private readonly garmentsService: GarmentsService) {}

  @Get()
  findAll() {
    return this.garmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.garmentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGarmentDto) {
    return this.garmentsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGarmentDto) {
    return this.garmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.garmentsService.remove(id);
  }
}
