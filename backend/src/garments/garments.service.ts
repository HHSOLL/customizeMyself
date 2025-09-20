import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGarmentDto } from './dto/create-garment.dto';
import { UpdateGarmentDto } from './dto/update-garment.dto';

@Injectable()
export class GarmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.garment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const garment = await this.prisma.garment.findUnique({ where: { id } });
    if (!garment) {
      throw new NotFoundException(`Garment ${id} not found`);
    }
    return garment;
  }

  create(dto: CreateGarmentDto) {
    const licenseValue = dto.license ? (dto.license as Prisma.InputJsonValue) : Prisma.JsonNull;
    return this.prisma.garment.upsert({
      where: { id: dto.id },
      update: {
        label: dto.label,
        category: dto.category,
        assetUrl: dto.assetUrl,
        anchors: dto.anchors,
        license: licenseValue,
        thumbnailUrl: dto.thumbnailUrl,
      },
      create: {
        id: dto.id,
        label: dto.label,
        category: dto.category,
        assetUrl: dto.assetUrl,
        anchors: dto.anchors,
        license: licenseValue,
        thumbnailUrl: dto.thumbnailUrl,
      },
    });
  }

  async update(id: string, dto: UpdateGarmentDto) {
    await this.findOne(id);
    const { license, anchors, thumbnailUrl, ...rest } = dto;
    const licenseValue = license !== undefined ? (license as Prisma.InputJsonValue) : undefined;
    return this.prisma.garment.update({
      where: { id },
      data: {
        ...rest,
        ...(anchors ? { anchors } : {}),
        ...(license !== undefined ? { license: licenseValue } : {}),
        ...(thumbnailUrl !== undefined ? { thumbnailUrl } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.garment.delete({ where: { id } });
    return { id };
  }
}
