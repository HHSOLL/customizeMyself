#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const DEFAULT_META_DIR = 'frontend/src/assets/garments/meta';
const DEFAULT_ANCHORS_DIR = 'frontend/src/assets/garments/anchors';
const DEFAULT_OUT_PATH = 'frontend/src/assets/garments/garments.generated.json';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const resolvePath = (target) => (path.isAbsolute(target) ? target : path.resolve(repoRoot, target));

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
        console.warn(`[codegen] unknown argument ${arg} ignored`);
        break;
    }
  }

  return {
    metaDir: resolvePath(options.metaDir),
    anchorsDir: resolvePath(options.anchorsDir),
    out: resolvePath(options.out),
  };
};

const safeReadJson = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`[codegen] failed to read ${filePath}: ${error.message ?? error}`);
    return null;
  }
};

const pathExists = async (target) => {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
};

const globJsonFiles = async (dir) => {
  if (!(await pathExists(dir))) {
    return [];
  }

  try {
    return await fg('**/*.json', { cwd: dir, dot: false, absolute: true });
  } catch (error) {
    console.warn(`[codegen] glob failed in ${dir}: ${error.message ?? error}`);
    return [];
  }
};

const loadAnchorMap = async (anchorsDir) => {
  const map = new Map();
  const files = await globJsonFiles(anchorsDir);
  for (const file of files) {
    const json = await safeReadJson(file);
    if (!json || typeof json.id !== 'string') {
      continue;
    }
    map.set(json.id, json);
  }
  return map;
};

const normalizeMeta = (meta, anchorEntry) => {
  const asset = meta.asset ?? meta.assetUrl ?? '';
  if (!asset) {
    throw new Error('asset field is required');
  }

  return {
    id: meta.id,
    name: meta.name ?? meta.label ?? meta.id,
    category: meta.category ?? null,
    asset,
    thumbnail: meta.thumbnail ?? meta.thumbnailUrl ?? null,
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    anchors: Array.isArray(meta.anchors) ? meta.anchors : anchorEntry?.anchors ?? [],
    anchorMeta: anchorEntry ?? null,
    license: meta.license ?? null,
  };
};

const writeCatalog = async (outPath, catalog) => {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf-8');
  const label = catalog.items.length === 1 ? 'item' : 'items';
  console.log(`[codegen] wrote ${outPath} (${catalog.items.length} ${label})`);
};

const buildCatalog = async (options) => {
  const items = [];
  const metaFiles = await globJsonFiles(options.metaDir);
  const anchorMap = await loadAnchorMap(options.anchorsDir);

  for (const file of metaFiles) {
    const json = await safeReadJson(file);
    if (!json || typeof json.id !== 'string') {
      continue;
    }
    try {
      items.push(normalizeMeta(json, anchorMap.get(json.id)));
    } catch (error) {
      console.warn(`[codegen] skipped ${file}: ${error.message ?? error}`);
    }
  }

  items.sort((a, b) => a.id.localeCompare(b.id));

  const catalog = {
    items,
    updatedAt: new Date().toISOString(),
  };

  await writeCatalog(options.out, catalog);
  return catalog;
};

const main = async () => {
  const options = parseArgs();
  try {
    await buildCatalog(options);
  } catch (error) {
    console.error('[codegen] unexpected error:', error.message ?? error);
    const fallback = {
      items: [],
      updatedAt: new Date().toISOString(),
    };
    await writeCatalog(options.out, fallback);
  } finally {
    process.exit(0);
  }
};

main();
