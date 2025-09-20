import { memo, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import type { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GarmentItem } from '../../data/garments';

interface GarmentModelProps {
  garment: GarmentItem;
}

const EMPTY_GROUP = null as unknown as Group;

export const GarmentModel = memo(({ garment }: GarmentModelProps) => {
  const gltf = useLoader(GLTFLoader, garment.asset, (loader) => {
    loader.crossOrigin = 'anonymous';
  });

  const mesh = useMemo(() => (gltf.scene ? gltf.scene.clone(true) : EMPTY_GROUP), [gltf.scene]);

  return <primitive object={mesh} />;
});

GarmentModel.displayName = 'GarmentModel';
