#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';
import { z } from 'zod';

const DEFAULT_META_DIR = 'frontend/src/assets/garments/meta';
const DEFAULT_ANCHORS_DIR = 'frontend/src/assets/garments/anchors';
const DEFAULT_OUT_PATH = 'frontend/src/assets/garments/garments.generated.json';

const MetaSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(['top', 'bottom', 'full']),
  asset: z.string(),
  thumbnail: z.string().optional(),
  anchors: z.array(z.string()).optional(),
  license: z
    .object({
      type: z.string(),
      author: z.string(),
      url: z.string().optional(),
    })
    .optional(),
});

const AnchorSchema = z.object({
  garment: z.object({
    id: z.string(),
  }),
  anchors: z.array(
    z.object({
      id: z.string(),
      description: z.string().optional(),
      position: z.array(z.number()).length(3).optional(),
      normal: z.array(z.number()).length(3).optional(),
    }),
  ),
});

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const parseArgs = () => {
  const options = {
    metaDir: DEFAULT_META_DIR,
    anchorsDir: DEFAULT_ANCHORS_DIR,
    out: DEFAULT_OUT_PATH,
  };

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--meta-dir':
        options.metaDir = args[++i];
        break;
      case '--anchors-dir':
        options.anchorsDir = args[++i];
        break;
      case '--out':
        options.out = args[++i];
        break;
      default:
        console.warn(`[codegen] Unknown argument ${arg} ignored`);
        break;
    }
  }

  return options;
};

const safeReadJson = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`[codegen] Failed to read ${filePath}: ${error.message ?? error}`);
    return null;
  }
};

const loadAnchorMap = async (anchorsDir) => {
  try {
    const files = await fg('**/*.json', { cwd: anchorsDir, dot: false, absolute: true });
    const map = new Map();
    for (const file of files) {
      const json = await safeReadJson(file);
      if (!json) continue;
      const parsed = AnchorSchema.safeParse(json);
      if (!parsed.success) {
        console.warn(`[codegen] Skipping invalid anchor file ${file}`);
        continue;
      }
      map.set(parsed.data.garment.id, parsed.data.anchors);
    }
    return map;
  } catch (error) {
    console.warn(`[codegen] Anchor scan failed: ${error.message ?? error}`);
    return new Map();
  }
};

const resolvePath = (target) => (path.isAbsolute(target) ? target : path.resolve(repoRoot, target));

const buildCatalog = async (options) => {
  const metaDir = resolvePath(options.metaDir);
  const anchorsDir = resolvePath(options.anchorsDir);
  const outPath = resolvePath(options.out);

  const metaPattern = path.join(metaDir, '**/*.json');
  let files = [];
  try {
    files = await fg(metaPattern, { dot: false, absolute: true });
  } catch (error) {
    console.warn(`[codegen] Failed to scan meta directory: ${error.message ?? error}`);
  }

  const anchorsMap = await loadAnchorMap(anchorsDir);

  const items = [];
  for (const file of files) {
    const json = await safeReadJson(file);
    if (!json) continue;
    const parsed = MetaSchema.safeParse(json);
    if (!parsed.success) {
      console.warn(`[codegen] Meta validation failed for ${file}`);
      continue;
    }
    const data = parsed.data;
    items.push({
      id: data.id,
      label: data.label,
      category: data.category,
      asset: data.asset,
      thumbnail: data.thumbnail ?? null,
      anchors: data.anchors ?? anchorsMap.get(data.id)?.map((anchor) => anchor.id) ?? [],
      anchorMeta: anchorsMap.get(data.id) ?? null,
      license: data.license ?? null,
    });
  }

  items.sort((a, b) => a.id.localeCompare(b.id));

  const catalog = {
    items,
    updatedAt: new Date().toISOString(),
  };

  try {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf-8');
    const label = items.length === 1 ? 'item' : 'items';
    console.log(`[codegen] wrote ${outPath} (${items.length} ${label})`);
  } catch (error) {
    console.error(`[codegen] Failed to write catalog: ${error.message ?? error}`);
  }
};

const main = async () => {
  const options = parseArgs();
  await buildCatalog(options).catch((error) => {
    console.error('[codegen] Unexpected error:', error.message ?? error);
  });
};

main().finally(() => {
  process.exit(0);
});
