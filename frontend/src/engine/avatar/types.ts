import type { MeasurementState } from '../../store/avatar.store';
import type { BodyPreset, Gender } from '../../constants/measurements';

export interface AvatarParameters {
  scale: {
    height: number;
  };
  morphTargets: Record<string, number>;
  boneScales: Record<string, { x: number; y: number; z: number }>;
}

export interface AvatarParamInput {
  gender: Gender;
  preset: BodyPreset;
  measurements: MeasurementState;
}

export interface MeasurementWarning {
  key: keyof MeasurementState;
  message: string;
}

export interface AvatarParamResult {
  params: AvatarParameters;
  warnings: MeasurementWarning[];
}

export interface AvatarRig {
  updateMorphTarget: (name: string, value: number) => void;
  updateBoneScale: (name: string, scale: { x: number; y: number; z: number }) => void;
  updateHeight: (scale: number) => void;
}
