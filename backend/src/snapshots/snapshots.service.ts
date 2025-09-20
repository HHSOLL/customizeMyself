import { Injectable } from '@nestjs/common';
import { CreatePresignDto } from './dto/create-presign.dto';

export interface PresignResponse {
  uploadUrl: string;
  fields: Record<string, string>;
  expiresIn: number;
}

@Injectable()
export class SnapshotsService {
  createPresign(dto: CreatePresignDto): PresignResponse {
    const bucket = process.env.S3_BUCKET ?? 'placeholder-bucket';
    const endpoint = process.env.S3_ENDPOINT ?? 'https://example-s3.local';
    const key = dto.filename;
    const expiresIn = Number(process.env.S3_PRESIGN_TTL ?? 900);

    const baseFields: Record<string, string> = {
      Key: key,
      'Content-Type': dto.contentType ?? 'application/octet-stream',
      Policy: 'stub-policy',
      'X-Amz-Signature': 'stub-signature',
    };

    return {
      uploadUrl: `${endpoint}/${bucket}`,
      fields: baseFields,
      expiresIn,
    };
  }
}
