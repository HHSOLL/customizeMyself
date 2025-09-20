import { useMemo } from 'react';
import { createAvatarParameters } from './paramMap';
import type { AvatarParameters, AvatarParamResult } from './types';
import { useAvatarStore } from '../../store/avatar.store';

export const useAvatarParameters = (): AvatarParameters | null => {
  const gender = useAvatarStore((state) => state.gender);
  const preset = useAvatarStore((state) => state.preset);
  const measurements = useAvatarStore((state) => state.measurements);

  return useMemo(() => {
    if (!gender || !preset) {
      return null;
    }

    return createAvatarParameters({ gender, preset, measurements }).params;
  }, [gender, preset, measurements]);
};

export const useAvatarWarnings = (): AvatarParamResult['warnings'] => {
  const gender = useAvatarStore((state) => state.gender);
  const preset = useAvatarStore((state) => state.preset);
  const measurements = useAvatarStore((state) => state.measurements);

  return useMemo(() => {
    if (!gender || !preset) {
      return [];
    }

    return createAvatarParameters({ gender, preset, measurements }).warnings;
  }, [gender, preset, measurements]);
};
