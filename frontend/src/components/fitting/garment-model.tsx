import { memo, useEffect, useMemo, useState } from 'react';
import type { Group } from 'three';
import { BoxGeometry, Group as ThreeGroup, Mesh, MeshStandardMaterial } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GarmentItem } from '../../data/garments';

interface GarmentModelProps {
  garment: GarmentItem;
}

const createPlaceholder = () => {
  const placeholder = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshStandardMaterial());
  const group = new ThreeGroup();
  group.name = 'garment-placeholder';
  group.add(placeholder);
  return group;
};

export const GarmentModel = memo(({ garment }: GarmentModelProps) => {
  const [group, setGroup] = useState<Group | null>(null);

  const placeholder = useMemo(() => createPlaceholder(), []);

  useEffect(() => {
    let disposed = false;

    const loader = new GLTFLoader();
    loader.crossOrigin = 'anonymous';

    const handleSuccess = (loaded: { scene: Group | undefined | null }) => {
      if (disposed) {
        return;
      }
      const scene = loaded.scene ? loaded.scene.clone(true) : placeholder.clone();
      setGroup(scene);
    };

    const handleError = (error: unknown) => {
      if (disposed) {
        return;
      }
      console.warn('asset load failed:', garment.asset, error);
      const fallback = placeholder.clone();
      setGroup(fallback);
    };

    setGroup(placeholder.clone());
    loader.load(garment.asset, handleSuccess, undefined, handleError);

    return () => {
      disposed = true;
    };
  }, [garment.asset, placeholder, garment.id]);

  if (!group) {
    return null;
  }

  return <primitive object={group} />;
});

GarmentModel.displayName = 'GarmentModel';
