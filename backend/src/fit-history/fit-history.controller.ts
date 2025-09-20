import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FitHistoryService } from './fit-history.service';
import { CreateFitHistoryDto } from './dto/create-fit-history.dto';

@Controller('fit-history')
export class FitHistoryController {
  constructor(private readonly fitHistoryService: FitHistoryService) {}

  @Get()
  findRecent(@Query('limit') limit?: string) {
    const parsed = limit ? Number(limit) : undefined;
    return this.fitHistoryService.findRecent(parsed && parsed > 0 ? parsed : 50);
  }

  @Post()
  create(@Body() dto: CreateFitHistoryDto) {
    return this.fitHistoryService.create(dto);
  }
}
