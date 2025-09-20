#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import gltfPipeline from 'gltf-pipeline';
import parseGlb from 'gltf-pipeline/lib/parseGlb.js';

const { processGltf } = gltfPipeline;

const HELP_MESSAGE = `Usage: convert-gltf --input <model.glb> --out <directory> [options]

Options:
  --input <path>        Source asset (currently supports .glb)
  --out <directory>     Output directory for the processed GLB
  --scale <number>      Uniform scale applied to root nodes (default: 1.0)
  --draco               Enable Draco compression
  --stats               Print pipeline statistics
  --overwrite           Allow overwriting an existing output file
  --help                Show this message
`;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    scale: 1,
    draco: false,
    stats: false,
    overwrite: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case '--input':
        options.input = args[++i];
        break;
      case '--out':
        options.out = args[++i];
        break;
      case '--scale':
        options.scale = Number(args[++i]);
        break;
      case '--draco':
        options.draco = true;
        break;
      case '--stats':
        options.stats = true;
        break;
      case '--overwrite':
        options.overwrite = true;
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

  if (!options.input || !options.out) {
    console.error('Missing required arguments.');
    console.log(HELP_MESSAGE);
    process.exit(1);
  }

  if (Number.isNaN(options.scale) || options.scale <= 0) {
    console.error('Scale must be a positive number.');
    process.exit(1);
  }

  return options;
};

const ensurePaths = async (options) => {
  const inputStat = await fs.stat(options.input).catch(() => null);
  if (!inputStat || !inputStat.isFile()) {
    throw new Error(`Input file not found: ${options.input}`);
  }
  await fs.mkdir(options.out, { recursive: true });
};

const applyRootScale = (gltf, scale) => {
  if (scale === 1) {
    return;
  }

  const nodes = gltf.nodes ?? [];
  const rootIndices = new Set();
  for (const scene of gltf.scenes ?? []) {
    for (const nodeIndex of scene.nodes ?? []) {
      rootIndices.add(nodeIndex);
    }
  }

  for (const index of rootIndices) {
    const node = nodes[index];
    if (!node) continue;
    if (Array.isArray(node.scale)) {
      node.scale = node.scale.map((value) => Number((value * scale).toFixed(6)));
    } else {
      node.scale = [scale, scale, scale];
    }
  }
};

const run = async () => {
  const options = parseArgs();
  try {
    await ensurePaths(options);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const extension = path.extname(options.input).toLowerCase();
  if (extension !== '.glb') {
    console.error('Only binary glTF (.glb) files are supported in the current pipeline.');
    process.exit(1);
  }

  const sourceBuffer = await fs.readFile(options.input);
  const gltf = parseGlb(sourceBuffer);
  applyRootScale(gltf, options.scale);

  const pipelineOptions = {
    binary: true,
    stats: options.stats,
  };

  if (options.draco) {
    pipelineOptions.dracoCompression = {};
  }

  const { glb, stats } = await processGltf(gltf, pipelineOptions);

  const outputName = `${path.parse(options.input).name}_processed.glb`;
  const outputPath = path.join(options.out, outputName);

  if (!options.overwrite) {
    const exists = await fs.stat(outputPath).catch(() => null);
    if (exists) {
      console.error(`Output already exists. Use --overwrite to replace: ${outputPath}`);
      process.exit(1);
    }
  }

  await fs.writeFile(outputPath, glb);

  if (options.stats && stats) {
    console.log('[convert-gltf] Pipeline statistics');
    console.table({
      meshes: stats.meshes,
      primitives: stats.primitives,
      textures: stats.textures,
      drawCalls: stats.drawCalls,
    });
  }

  console.log('[convert-gltf] Wrote processed GLB to', outputPath);
};

run().catch((error) => {
  console.error('[convert-gltf] Unexpected error:', error);
  process.exit(1);
});
