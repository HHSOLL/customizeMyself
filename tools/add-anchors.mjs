#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { z } from 'zod';
import parseGlb from 'gltf-pipeline/lib/parseGlb.js';
import gltfToGlb from 'gltf-pipeline/lib/gltfToGlb.js';

const AnchorSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  position: z.array(z.number()).length(3).optional(),
  normal: z.array(z.number()).length(3).optional(),
});

const AnchorFileSchema = z.object({
  garment: z.object({
    id: z.string(),
    label: z.string(),
    category: z.enum(['top', 'bottom', 'full']),
    thumbnail: z.string().optional(),
  }),
  anchors: z.array(AnchorSchema).min(1),
  license: z.object({
    type: z.string(),
    author: z.string(),
    url: z.string().optional(),
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const REQUIRED_ANCHORS = {
  top: ['neck_base', 'shoulder_L', 'shoulder_R', 'chest_center', 'waist_center'],
  bottom: ['waist_center', 'hip_L', 'hip_R', 'inseam_L', 'inseam_R'],
};

const HELP_MESSAGE = `Usage: add-anchors --gltf <model.glb> --anchors <anchors.json> --out <path>

Options:
  --gltf <path>        Processed GLB created by convert-gltf
  --anchors <path>     Anchor definition JSON (see schema in tools/README.md)
  --out <path>         Destination GLB path with metadata injected
  --help               Show this message
`;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--gltf':
        options.gltf = args[++i];
        break;
      case '--anchors':
        options.anchors = args[++i];
        break;
      case '--out':
        options.out = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(HELP_MESSAGE);
        process.exit(0);
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        console.log(HELP_MESSAGE);
        process.exit(1);
    }
  }

  if (!options.gltf || !options.anchors || !options.out) {
    console.error('Missing required arguments.');
    console.log(HELP_MESSAGE);
    process.exit(1);
  }

  return options;
};

const validateRequiredAnchors = (category, anchors) => {
  const required = REQUIRED_ANCHORS[category];
  if (!required) {
    return [];
  }
  const present = new Set(anchors.map((anchor) => anchor.id));
  return required.filter((id) => !present.has(id));
};

const run = async () => {
  const options = parseArgs();

  const [gltfFile, anchorFile] = await Promise.all([
    fs.readFile(options.gltf).catch(() => {
      throw new Error(`GLB not found: ${options.gltf}`);
    }),
    fs.readFile(options.anchors, 'utf-8').catch(() => {
      throw new Error(`Anchor definition not found: ${options.anchors}`);
    }),
  ]);

  const parsedAnchorJson = AnchorFileSchema.parse(JSON.parse(anchorFile));
  const missing = validateRequiredAnchors(parsedAnchorJson.garment.category, parsedAnchorJson.anchors);
  if (missing.length > 0) {
    throw new Error(`Anchor file missing required ids for ${parsedAnchorJson.garment.category}: ${missing.join(', ')}`);
  }

  const gltf = parseGlb(gltfFile);
  gltf.asset = gltf.asset ?? {};
  const currentExtras = gltf.asset.extras ?? {};
  gltf.asset.extras = {
    ...currentExtras,
    garment: {
      ...parsedAnchorJson.garment,
      anchors: parsedAnchorJson.anchors,
      license: parsedAnchorJson.license ?? null,
      metadata: parsedAnchorJson.metadata ?? null,
      updatedAt: new Date().toISOString(),
    },
  };

  const { glb } = await gltfToGlb(gltf, { separate: false });
  await fs.mkdir(path.dirname(options.out), { recursive: true });
  await fs.writeFile(options.out, glb);

  console.log('[add-anchors] Metadata injected for garment', parsedAnchorJson.garment.id);
};

run().catch((error) => {
  console.error('[add-anchors] Failed:', error.message ?? error);
  process.exit(1);
});
