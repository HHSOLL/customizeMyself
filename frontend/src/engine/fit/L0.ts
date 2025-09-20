import type { AvatarRig } from '../avatar/types';
import type { GarmentItem } from '../../data/garments';

export interface FitResult {
  garmentId: string;
  anchorsUsed: string[];
  estimatedLatencyMs: number;
}

export const applyGarmentL0 = (rig: AvatarRig, garment: GarmentItem): FitResult => {
  void rig;
  const anchorsUsed = garment.anchors;

  for (const anchorId of anchorsUsed) {
    console.debug(`[L0] Aligning anchor ${anchorId} for garment ${garment.id}`);
  }

  return {
    garmentId: garment.id,
    anchorsUsed,
    estimatedLatencyMs: 32,
  };
};
