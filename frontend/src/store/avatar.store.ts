import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  type BodyPreset,
  type Gender,
  type MeasurementDefinition,
  type MeasurementKey,
  MEASUREMENT_DEFINITIONS,
  PRESETS,
} from '../constants/measurements';

export type PhysicsTier = 'L0' | 'L1';

export type MeasurementState = Record<MeasurementKey, number>;

export interface AvatarState {
  gender: Gender | null;
  preset: BodyPreset | null;
  measurements: MeasurementState;
  physicsTier: PhysicsTier;
  garmentSelections: string[];
  setGender: (gender: Gender) => void;
  setPreset: (preset: BodyPreset) => void;
  setMeasurement: (key: MeasurementKey, value: number) => void;
  resetMeasurementsToPreset: () => void;
  togglePhysicsTier: () => void;
  setGarmentSelections: (ids: string[]) => void;
  resetAll: () => void;
}

const definitionLookup: Record<MeasurementKey, MeasurementDefinition> = Object.fromEntries(
  MEASUREMENT_DEFINITIONS.map((definition) => [definition.key, definition] as const),
) as Record<MeasurementKey, MeasurementDefinition>;

const defaultMeasurements = (): MeasurementState => {
  const entries = MEASUREMENT_DEFINITIONS.map(
    (definition) => [definition.key, (definition.min + definition.max) / 2] as const,
  );

  return Object.fromEntries(entries) as MeasurementState;
};

const createInMemoryStorage = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key) => (store.has(key) ? (store.get(key) ?? null) : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  } satisfies Storage;
};

const storage = createJSONStorage<AvatarState>(() =>
  typeof window === 'undefined' ? createInMemoryStorage() : window.localStorage,
);

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => ({
      gender: null,
      preset: null,
      measurements: defaultMeasurements(),
      physicsTier: 'L0',
      garmentSelections: [],
      setGender: (gender) => {
        set({ gender });
        const { preset } = get();
        if (preset) {
          set({ measurements: structuredClone(PRESETS[gender][preset].measurements) });
        }
      },
      setPreset: (preset) => {
        const { gender } = get();
        set({ preset });
        if (gender) {
          set({ measurements: structuredClone(PRESETS[gender][preset].measurements) });
        }
      },
      setMeasurement: (key, value) => {
        const definition = definitionLookup[key];
        const clampedValue = Math.min(definition.max, Math.max(definition.min, value));
        set((state) => ({
          measurements: {
            ...state.measurements,
            [key]: Number(clampedValue.toFixed(2)),
          },
        }));
      },
      resetMeasurementsToPreset: () => {
        const { gender, preset } = get();
        if (gender && preset) {
          set({ measurements: structuredClone(PRESETS[gender][preset].measurements) });
        } else {
          set({ measurements: defaultMeasurements() });
        }
      },
      togglePhysicsTier: () => {
        set((state) => ({ physicsTier: state.physicsTier === 'L0' ? 'L1' : 'L0' }));
      },
      setGarmentSelections: (ids) => set({ garmentSelections: ids }),
      resetAll: () => {
        set({
          gender: null,
          preset: null,
          measurements: defaultMeasurements(),
          garmentSelections: [],
          physicsTier: 'L0',
        });
      },
    }),
    {
      name: 'avatar-state-v1',
      version: 1,
      storage,
      partialize: (state) => ({
        gender: state.gender,
        preset: state.preset,
        measurements: state.measurements,
        physicsTier: state.physicsTier,
        garmentSelections: state.garmentSelections,
      }),
      skipHydration: typeof window === 'undefined',
    },
  ),
);

export const useHydratedAvatarStore = (): AvatarState | null => {
  const state = useAvatarStore();
  const isServer = typeof window === 'undefined';

  if (isServer || !useAvatarStore.persist.hasHydrated()) {
    return null;
  }

  return state;
};
