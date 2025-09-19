export type MeasurementKey =
  | 'height'
  | 'weight'
  | 'shoulder'
  | 'chest'
  | 'waist'
  | 'hip'
  | 'thigh'
  | 'arm'
  | 'inseam'
  | 'neck';

export interface MeasurementDefinition {
  key: MeasurementKey;
  label: string;
  unit: 'cm' | 'kg';
  min: number;
  max: number;
  step: number;
}

export const MEASUREMENT_DEFINITIONS: MeasurementDefinition[] = [
  { key: 'height', label: '키', unit: 'cm', min: 130, max: 210, step: 1 },
  { key: 'weight', label: '몸무게', unit: 'kg', min: 35, max: 150, step: 0.5 },
  { key: 'shoulder', label: '어깨너비', unit: 'cm', min: 30, max: 60, step: 0.5 },
  { key: 'chest', label: '가슴둘레', unit: 'cm', min: 70, max: 130, step: 0.5 },
  { key: 'waist', label: '허리둘레', unit: 'cm', min: 55, max: 120, step: 0.5 },
  { key: 'hip', label: '엉덩이둘레', unit: 'cm', min: 75, max: 130, step: 0.5 },
  { key: 'thigh', label: '허벅지둘레', unit: 'cm', min: 35, max: 75, step: 0.5 },
  { key: 'arm', label: '팔길이', unit: 'cm', min: 45, max: 75, step: 0.5 },
  { key: 'inseam', label: '다리길이(인심)', unit: 'cm', min: 55, max: 95, step: 0.5 },
  { key: 'neck', label: '목둘레', unit: 'cm', min: 28, max: 45, step: 0.5 },
];

export type BodyPreset = 'slim' | 'standard' | 'muscular';
export type Gender = 'female' | 'male';

export interface PresetDefinition {
  label: string;
  description: string;
  measurements: Record<MeasurementKey, number>;
}

const basePresets: Record<Gender, Record<BodyPreset, PresetDefinition>> = {
  female: {
    slim: {
      label: '슬림',
      description: '균형 잡힌 슬림 체형',
      measurements: {
        height: 165,
        weight: 52,
        shoulder: 38,
        chest: 82,
        waist: 64,
        hip: 88,
        thigh: 50,
        arm: 58,
        inseam: 74,
        neck: 32,
      },
    },
    standard: {
      label: '표준',
      description: '일반적인 체형 비율',
      measurements: {
        height: 167,
        weight: 58,
        shoulder: 39,
        chest: 86,
        waist: 68,
        hip: 92,
        thigh: 53,
        arm: 59,
        inseam: 75,
        neck: 33,
      },
    },
    muscular: {
      label: '근육형',
      description: '운동으로 단련된 체형',
      measurements: {
        height: 168,
        weight: 63,
        shoulder: 41,
        chest: 90,
        waist: 70,
        hip: 96,
        thigh: 56,
        arm: 60,
        inseam: 76,
        neck: 34,
      },
    },
  },
  male: {
    slim: {
      label: '슬림',
      description: '균형 잡힌 슬림 체형',
      measurements: {
        height: 175,
        weight: 65,
        shoulder: 43,
        chest: 90,
        waist: 76,
        hip: 94,
        thigh: 56,
        arm: 63,
        inseam: 80,
        neck: 36,
      },
    },
    standard: {
      label: '표준',
      description: '일반적인 체형 비율',
      measurements: {
        height: 177,
        weight: 72,
        shoulder: 45,
        chest: 96,
        waist: 82,
        hip: 98,
        thigh: 58,
        arm: 64,
        inseam: 82,
        neck: 37,
      },
    },
    muscular: {
      label: '근육형',
      description: '운동으로 단련된 체형',
      measurements: {
        height: 178,
        weight: 80,
        shoulder: 47,
        chest: 104,
        waist: 86,
        hip: 102,
        thigh: 61,
        arm: 65,
        inseam: 83,
        neck: 39,
      },
    },
  },
};

export const PRESETS: Record<Gender, Record<BodyPreset, PresetDefinition>> = basePresets;

export const GENDER_LABELS: Record<Gender, string> = {
  female: '여성',
  male: '남성',
};

export const PRESET_ORDER: BodyPreset[] = ['slim', 'standard', 'muscular'];
