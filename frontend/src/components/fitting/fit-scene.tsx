import { memo, useCallback, useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import type { JSX } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box3, Group, Sphere } from 'three';
import type { PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { GarmentModel } from './garment-model';
import Mannequin from './Mannequin';
import type { GarmentCatalog, GarmentItem } from '../../data/garments';

interface FitSceneProps {
  garmentIds: string[];
  catalog: GarmentCatalog;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onSceneReady?: (context: {
    root: Group;
    camera: PerspectiveCamera;
    controls: OrbitControlsImpl | null;
  }) => void;
  onContentChanged?: (root: Group) => void;
}

const tempBox = new Box3();
const tempSphere = new Sphere();
const SceneContents = ({
  garments,
  containerRef,
  onSceneReady,
  onContentChanged,
}: {
  garments: GarmentItem[];
  containerRef: MutableRefObject<HTMLDivElement | null>;
  onSceneReady?: FitSceneProps['onSceneReady'];
  onContentChanged?: FitSceneProps['onContentChanged'];
}) => {
  const rootRef = useRef<Group>(new Group());
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera, gl } = useThree();
  const perspectiveCamera = camera as PerspectiveCamera;

  const emitContentChange = useCallback(() => {
    const root = rootRef.current;
    root.scale.setScalar(1);
    tempBox.setFromObject(root);
    tempBox.getBoundingSphere(tempSphere);
    if (Number.isFinite(tempSphere.radius) && tempSphere.radius > 0) {
      const radius = tempSphere.radius;
      if (radius > 5) {
        root.scale.setScalar(5 / radius);
      } else if (radius < 0.5) {
        root.scale.setScalar(0.5 / radius);
      }
    }
    onContentChanged?.(root);
  }, [onContentChanged]);

  useEffect(() => {
    if (onSceneReady) {
      onSceneReady({
        root: rootRef.current,
        camera: perspectiveCamera,
        controls: controlsRef.current,
      });
    }
  }, [onSceneReady, perspectiveCamera]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const resize = () => {
      const { clientWidth, clientHeight } = element;
      if (clientWidth <= 0 || clientHeight <= 0) {
        return;
      }
      gl.setSize(clientWidth, clientHeight, false);
      const nextAspect = clientWidth / clientHeight;
      if (Math.abs(perspectiveCamera.aspect - nextAspect) > 0.0001) {
        perspectiveCamera.aspect = nextAspect;
        perspectiveCamera.updateProjectionMatrix();
      }
      emitContentChange();
    };

    resize();

    const hasWindow = typeof window !== 'undefined';
    let observer: ResizeObserver | null = null;
    if (hasWindow && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(resize);
      observer.observe(element);
    } else if (hasWindow) {
      window.addEventListener('resize', resize);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      } else if (hasWindow) {
        window.removeEventListener('resize', resize);
      }
    };
  }, [perspectiveCamera, gl, containerRef, emitContentChange]);

  useEffect(() => {
    emitContentChange();
  }, [garments.length, emitContentChange]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 2]} intensity={1.2} />
      <directionalLight position={[-4, 4, -2]} intensity={0.4} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.1}
        minDistance={0.6}
        maxDistance={8}
        target={[0, 1.4, 0]}
      />
      <group ref={rootRef} name="fit-stage-root" position={[0, 0, 0]}>
        <Mannequin onLoaded={emitContentChange} />
        {garments.map((garment) => (
          <GarmentModel key={garment.id} garment={garment} onLoaded={emitContentChange} />
        ))}
      </group>
    </>
  );
};

export const FitScene = memo(
  ({
    garmentIds,
    catalog,
    containerRef,
    onSceneReady,
    onContentChanged,
  }: FitSceneProps): JSX.Element => {
    const garments = useMemo(
      () =>
        garmentIds
          .map((id) => catalog.items.find((item) => item.id === id))
          .filter(Boolean) as GarmentItem[],
      [garmentIds, catalog.items],
    );

    return (
      <Canvas camera={{ position: [0, 1.6, 3.5], fov: 45 }} shadows>
        <SceneContents
          garments={garments}
          containerRef={containerRef}
          onSceneReady={onSceneReady}
          onContentChanged={onContentChanged}
        />
      </Canvas>
    );
  },
);

FitScene.displayName = 'FitScene';
