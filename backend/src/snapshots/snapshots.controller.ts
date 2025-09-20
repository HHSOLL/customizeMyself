import { Body, Controller, Post } from '@nestjs/common';
import type { PresignResponse } from './snapshots.service';
import { SnapshotsService } from './snapshots.service';
import { CreatePresignDto } from './dto/create-presign.dto';

@Controller('snapshots')
export class SnapshotsController {
  constructor(private readonly snapshotsService: SnapshotsService) {}

  @Post('presign')
  createPresign(@Body() dto: CreatePresignDto): PresignResponse {
    return this.snapshotsService.createPresign(dto);
  }
}
