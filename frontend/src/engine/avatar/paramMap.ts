import {
  MEASUREMENT_DEFINITIONS,
  type BodyPreset,
  type Gender,
  type MeasurementDefinition,
  type MeasurementKey,
  PRESETS,
} from '../../constants/measurements';
import type { MeasurementState } from '../../store/avatar.store';
import type { AvatarParamInput, AvatarParamResult, AvatarParameters } from './types';

const DEFINITION_LOOKUP: Record<MeasurementKey, MeasurementDefinition> = Object.fromEntries(
  MEASUREMENT_DEFINITIONS.map((definition) => [definition.key, definition] as const),
) as Record<MeasurementKey, MeasurementDefinition>;

const HEIGHT_BASELINE = (DEFINITION_LOOKUP.height.min + DEFINITION_LOOKUP.height.max) / 2;

interface MorphLink {
  key: MeasurementKey;
  target: string;
  gain: number;
  curve?: (offset: number) => number;
}

const MORPH_LINKS: MorphLink[] = [
  { key: 'chest', target: 'Torso_ChestVolume', gain: 1.2 },
  { key: 'waist', target: 'Torso_WaistTaper', gain: -1 },
  { key: 'hip', target: 'Pelvis_HipVolume', gain: 1 },
  { key: 'thigh', target: 'Leg_ThighVolume', gain: 0.9 },
  { key: 'arm', target: 'Arm_Length', gain: 0.6 },
  { key: 'neck', target: 'Torso_NeckVolume', gain: 0.8 },
];

interface BoneLink {
  key: MeasurementKey;
  bones: string[];
  gain: number;
}

const BONE_LINKS: BoneLink[] = [
  { key: 'shoulder', bones: ['Shoulder_L', 'Shoulder_R'], gain: 0.18 },
  { key: 'waist', bones: ['Spine_03'], gain: 0.12 },
  { key: 'hip', bones: ['Pelvis'], gain: 0.15 },
  { key: 'inseam', bones: ['Leg_L', 'Leg_R'], gain: 0.4 },
  { key: 'height', bones: ['Spine_All'], gain: 0.3 },
];

const clampMeasurement = (key: MeasurementKey, value: number): number => {
  const definition = DEFINITION_LOOKUP[key];
  return Math.min(definition.max, Math.max(definition.min, value));
};

const offsetFromBaseline = (key: MeasurementKey, value: number): number => {
  const definition = DEFINITION_LOOKUP[key];
  const midpoint = (definition.min + definition.max) / 2;
  const halfRange = (definition.max - definition.min) / 2;
  if (halfRange === 0) {
    return 0;
  }

  return (value - midpoint) / halfRange;
};

const computeMorphTargets = (measurements: MeasurementState): AvatarParameters['morphTargets'] => {
  const morph: AvatarParameters['morphTargets'] = {};

  for (const link of MORPH_LINKS) {
    const value = clampMeasurement(link.key, measurements[link.key]);
    const offset = offsetFromBaseline(link.key, value);
    const curveValue = link.curve ? link.curve(offset) : offset;
    morph[link.target] = Number((curveValue * link.gain).toFixed(3));
  }

  return morph;
};

const computeBoneScales = (measurements: MeasurementState): AvatarParameters['boneScales'] => {
  const bones: AvatarParameters['boneScales'] = {};

  for (const link of BONE_LINKS) {
    const value = clampMeasurement(link.key, measurements[link.key]);
    const offset = offsetFromBaseline(link.key, value);
    const scale = Number((1 + offset * link.gain).toFixed(3));
    for (const bone of link.bones) {
      bones[bone] = { x: scale, y: scale, z: scale };
    }
  }

  return bones;
};

const collectWarnings = (
  measurements: MeasurementState,
  gender: Gender,
  preset: BodyPreset,
): AvatarParamResult['warnings'] => {
  const warnings: AvatarParamResult['warnings'] = [];
  const presetMeasurements = PRESETS[gender][preset].measurements;

  for (const definition of MEASUREMENT_DEFINITIONS) {
    const value = measurements[definition.key];
    if (value < definition.min || value > definition.max) {
      warnings.push({
        key: definition.key,
        message: `${definition.label} 값이 권장 범위를 벗어났습니다 (${definition.min}~${definition.max}${definition.unit})`,
      });
    }

    const presetValue = presetMeasurements[definition.key];
    const delta = Math.abs(value - presetValue);
    const tolerance = (definition.max - definition.min) * 0.4;
    if (delta > tolerance) {
      warnings.push({
        key: definition.key,
        message: `${definition.label} 값이 프리셋과 크게 다릅니다 (차이 ${delta.toFixed(1)}${definition.unit})`,
      });
    }
  }

  return warnings;
};

export const createAvatarParameters = ({
  gender,
  preset,
  measurements,
}: AvatarParamInput): AvatarParamResult => {
  const morphTargets = computeMorphTargets(measurements);
  const boneScales = computeBoneScales(measurements);
  const heightValue = clampMeasurement('height', measurements.height);
  const heightScale = Number((heightValue / HEIGHT_BASELINE).toFixed(3));

  const params: AvatarParameters = {
    scale: {
      height: heightScale,
    },
    morphTargets,
    boneScales,
  };

  const warnings = collectWarnings(measurements, gender, preset);

  return { params, warnings };
};
