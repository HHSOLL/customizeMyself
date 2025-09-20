#!/usr/bin/env node
/*
 * convert-gltf.js
 *
 * Placeholder CLI for the garment asset pipeline. It validates CLI arguments,
 * performs basic file-system checks, and prints the operations that would be
 * executed (scale normalization, triangulation, PBR material audit, etc.).
 *
 * TODO (future stages):
 *  - Integrate with gltf-transform / assimp for actual conversion.
 *  - Apply consistent axis transforms and unit scaling.
 *  - Generate baked textures and material maps.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const HELP_MESSAGE = `Usage: convert-gltf --input <path> --out <directory> [options]

Options:
  --input <path>        Source 3D asset (fbx, obj, gltf)
  --out <directory>     Output directory for converted glTF/GLB
  --scale <number>      Apply uniform scale factor (default: 1.0)
  --triangulate         Force triangulation of mesh primitives
  --draco                Enable Draco compression (placeholder)
  --pbr-check           Run basic PBR material checks (placeholder)
  --overwrite           Allow overwriting existing output files
  --help                Show this message
`;

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    overwrite: false,
    triangulate: false,
    draco: false,
    pbrCheck: false,
    scale: 1,
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
      case '--triangulate':
        options.triangulate = true;
        break;
      case '--draco':
        options.draco = true;
        break;
      case '--pbr-check':
        options.pbrCheck = true;
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

const run = async () => {
  const options = parseArgs();
  try {
    await ensurePaths(options);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }

  const outputStem = path.parse(options.input).name;
  const outputGlb = path.join(options.out, `${outputStem}.glb`);

  const plan = {
    normalizeUnits: options.scale !== 1,
    triangulate: options.triangulate,
    draco: options.draco,
    pbrCheck: options.pbrCheck,
  };

  console.log('[convert-gltf] Planned operations:');
  console.table(plan);
  console.log('[convert-gltf] Writing placeholder output to:', outputGlb);

  if (!options.overwrite) {
    const exists = await fs.stat(outputGlb).catch(() => null);
    if (exists) {
      console.error(`Output already exists. Use --overwrite to replace: ${outputGlb}`);
      process.exit(1);
    }
  }

  await fs.writeFile(
    outputGlb,
    JSON.stringify(
      {
        stub: true,
        source: path.resolve(options.input),
        generatedAt: new Date().toISOString(),
        options,
      },
      null,
      2,
    ),
    'utf-8',
  );

  console.log('[convert-gltf] Stub file generated. Replace with real conversion in later stages.');
};

run().catch((error) => {
  console.error('[convert-gltf] Unexpected error:', error);
  process.exit(1);
});
