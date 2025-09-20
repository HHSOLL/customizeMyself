import type { AvatarRig } from '../avatar/types';
import type { GarmentItem } from '../../data/garments';
import type { FitResult } from './L0';

export interface L1FitResult extends FitResult {
  solverIterations: number;
  degraded: boolean;
}

export const applyGarmentL1 = (rig: AvatarRig, garment: GarmentItem): L1FitResult => {
  const anchors = garment.anchors;
  const solverIterations = Math.max(8, anchors.length * 3);
  const estimatedLatencyMs = solverIterations * 6;
  const degraded = estimatedLatencyMs > 72;

  for (const anchorId of anchors) {
    console.debug(`[L1] Solving constraint for ${garment.id} @ ${anchorId}`);
  }

  if (degraded) {
    console.warn(`[L1] ${garment.id} exceeded latency budget. Will fall back to L0.`);
  }

  return {
    garmentId: garment.id,
    anchorsUsed: anchors,
    estimatedLatencyMs,
    solverIterations,
    degraded,
  };
};
