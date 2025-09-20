import type { JSX } from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense, memo, useMemo } from 'react';
import { GarmentModel } from './garment-model';
import type { GarmentCatalog } from '../../data/garments';

interface FitSceneProps {
  garmentIds: string[];
  catalog: GarmentCatalog;
}

export const FitScene = memo(({ garmentIds, catalog }: FitSceneProps): JSX.Element => {
  const garments = useMemo(
    () => garmentIds.map((id) => catalog.items.find((item) => item.id === id)).filter(Boolean),
    [garmentIds, catalog.items],
  );

  return (
    <Canvas camera={{ position: [0, 1.6, 3.5], fov: 45 }}>
      <color attach="background" args={[0.03, 0.05, 0.08]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 2]} intensity={1.2} />
      <Suspense fallback={null}>
        {garments.map((garment) => (
          <GarmentModel key={garment!.id} garment={garment!} />
        ))}
      </Suspense>
    </Canvas>
  );
});

FitScene.displayName = 'FitScene';
