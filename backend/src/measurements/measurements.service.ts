import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';

@Injectable()
export class MeasurementsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.measurementProfile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const profile = await this.prisma.measurementProfile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Measurement profile ${id} not found`);
    }
    return profile;
  }

  create(dto: CreateMeasurementDto) {
    return this.prisma.measurementProfile.create({
      data: {
        gender: dto.gender,
        preset: dto.preset,
        data: dto.data as Prisma.InputJsonValue,
      },
    });
  }
}
