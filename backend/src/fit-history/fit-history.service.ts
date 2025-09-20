import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFitHistoryDto } from './dto/create-fit-history.dto';

@Injectable()
export class FitHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  findRecent(limit = 50) {
    return this.prisma.fitHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async create(dto: CreateFitHistoryDto) {
    const entry = await this.prisma.fitHistory.create({
      data: {
        tier: dto.tier,
        latencyMs: dto.latencyMs,
        details: dto.details ? (dto.details as Prisma.InputJsonValue) : Prisma.JsonNull,
        garmentId: dto.garmentId,
        measurementId: dto.measurementId,
      },
    });

    if (dto.degraded && dto.measurementId) {
      await this.prisma.measurementProfile.update({
        where: { id: dto.measurementId },
        data: { updatedAt: new Date() },
      });
    }

    return entry;
  }
}
