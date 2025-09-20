#!/usr/bin/env node
/*
 * add-anchors.js
 *
 * Placeholder CLI that validates anchor metadata before it is merged into a glTF file.
 * It currently checks JSON structure and writes a stub summary file. Later we will
 * inject the metadata into glTF extras/metadata and verify required keys.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const REQUIRED_KEYS = ['category', 'anchors'];
const REQUIRED_ANCHORS = {
  top: ['neck_base', 'shoulder_L', 'shoulder_R', 'chest_center', 'waist_center'],
  bottom: ['waist_center', 'hip_L', 'hip_R', 'inseam_L', 'inseam_R'],
};

const HELP_MESSAGE = `Usage: add-anchors --gltf <path> --anchors <anchors.json> --out <path>

Options:
  --gltf <path>        Converted GLB to annotate
  --anchors <path>     Anchor JSON definition
  --out <path>         Output GLB with anchors merged (placeholder)
  --category <name>    Expected garment category (top|bottom|full) for validation
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
      case '--category':
        options.category = args[++i];
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

const readAnchors = async (file) => {
  const raw = await fs.readFile(file, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON: ${file}`);
  }

  for (const key of REQUIRED_KEYS) {
    if (!(key in data)) {
      throw new Error(`Anchor file missing required key: ${key}`);
    }
  }

  if (!Array.isArray(data.anchors)) {
    throw new Error('Anchor file requires an "anchors" array.');
  }

  return data;
};

const validateAnchors = (anchorData, category) => {
  const expectedCategory = category ?? anchorData.category;
  if (!expectedCategory) {
    throw new Error('Garment category must be provided either via JSON or --category.');
  }

  const required = REQUIRED_ANCHORS[expectedCategory];
  if (!required) {
    console.warn(`No strict anchor list for category: ${expectedCategory}. Skipping key check.`);
    return { expectedCategory, missing: [] };
  }

  const present = new Set(anchorData.anchors.map((entry) => entry.id));
  const missing = required.filter((anchorId) => !present.has(anchorId));
  return { expectedCategory, missing };
};

const run = async () => {
  const options = parseArgs();
  try {
    await Promise.all([fs.stat(options.gltf), fs.stat(options.anchors)]);
  } catch (error) {
    console.error('Input files not found:', error.message);
    process.exit(1);
  }

  const anchorData = await readAnchors(options.anchors);
  const validation = validateAnchors(anchorData, options.category);

  if (validation.missing.length > 0) {
    console.error('Missing required anchors:', validation.missing.join(', '));
    process.exit(1);
  }

  const summary = {
    gltf: path.resolve(options.gltf),
    anchors: path.resolve(options.anchors),
    category: validation.expectedCategory,
    appliedAt: new Date().toISOString(),
    note: 'No glTF modifications performed yet. Replace with real merging logic.',
  };

  await fs.writeFile(options.out, JSON.stringify(summary, null, 2), 'utf-8');
  console.log('[add-anchors] Validation succeeded. Summary written to', options.out);
};

run().catch((error) => {
  console.error('[add-anchors] Unexpected error:', error);
  process.exit(1);
});
