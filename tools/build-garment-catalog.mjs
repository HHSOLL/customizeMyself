#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import fg from 'fast-glob';
import { z } from 'zod';

const META_PATTERN = 'frontend/assets/garments/meta/*.json';
const OUTPUT_PATH = 'frontend/assets/garments/garments.generated.json';

const MetaSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(['top', 'bottom', 'full']),
  asset: z.string(),
  thumbnail: z.string(),
  anchors: z.array(z.string()).nonempty(),
  license: z.object({
    type: z.string(),
    author: z.string(),
    url: z.string().optional(),
  }),
});

const buildCatalog = async () => {
  const files = await fg(META_PATTERN, { dot: false });
  if (files.length === 0) {
    throw new Error('No garment meta files found.');
  }

  const items = [];
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    const parsed = MetaSchema.parse(JSON.parse(content));
    items.push(parsed);
  }

  items.sort((a, b) => a.id.localeCompare(b.id));

  const catalog = {
    items,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf-8');
  console.log(`[build-catalog] Wrote ${items.length} items to ${OUTPUT_PATH}`);
};

buildCatalog().catch((error) => {
  console.error('[build-catalog] Failed:', error.message ?? error);
  process.exit(1);
});
