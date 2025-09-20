import type { AvatarParameters, AvatarRig } from './types';

export const applyAvatarParams = (rig: AvatarRig, params: AvatarParameters): void => {
  rig.updateHeight(params.scale.height);

  for (const [name, value] of Object.entries(params.morphTargets)) {
    rig.updateMorphTarget(name, value);
  }

  for (const [name, scale] of Object.entries(params.boneScales)) {
    rig.updateBoneScale(name, scale);
  }
};

export const createLoggingRig = (label: string = 'AvatarRig'): AvatarRig => {
  return {
    updateHeight: (scale) => {
      console.debug(`[${label}] height scale ->`, scale);
    },
    updateMorphTarget: (name, value) => {
      console.debug(`[${label}] morph ${name} ->`, value);
    },
    updateBoneScale: (name, scale) => {
      console.debug(`[${label}] bone ${name} ->`, scale);
    },
  };
};
