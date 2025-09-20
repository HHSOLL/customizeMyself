import { useEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  CapsuleGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Group as ThreeGroup, Object3D } from 'three';
import { useAvatarStore } from '../../store/avatar.store';

type MannequinProps = {
  onLoaded?: (group: ThreeGroup) => void;
};

type LoaderState = 'idle' | 'loading' | 'loaded' | 'failed';

const CM_TO_M = 0.01;

const createPlaceholder = () => {
  const group = new Group();
  group.name = 'mannequin-placeholder';
  const material = new MeshStandardMaterial({ color: 0x9aa4b8, roughness: 0.6, metalness: 0.1 });
  const capsule = new Mesh(new CapsuleGeometry(0.35, 1.4, 16, 32), material);
  capsule.position.y = 1.0;
  group.add(capsule);
  const base = new Mesh(new BoxGeometry(0.6, 0.1, 0.6), material.clone());
  base.position.y = 0.05;
  group.add(base);
  return group;
};

const createProceduralMannequin = (
  measurements: ReturnType<typeof useAvatarStore>['measurements'],
) => {
  const root = new Group();
  root.name = 'mannequin-generated';

  const height = (measurements.height ?? 170) * CM_TO_M;
  const torsoHeight = height * 0.45;
  const legLength = height * 0.45;
  const armLength = (measurements.arm ?? 60) * CM_TO_M;
  const shoulderWidth = (measurements.shoulder ?? 40) * CM_TO_M;
  const chestCirc = (measurements.chest ?? 90) * CM_TO_M;
  const hipCirc = (measurements.hip ?? 95) * CM_TO_M;

  const torsoRadius = Math.max(chestCirc / (Math.PI * 3.5), 0.15);
  const hipRadius = Math.max(hipCirc / (Math.PI * 3.8), 0.18);
  const limbRadius = Math.max(((measurements.thigh ?? 55) * CM_TO_M) / (Math.PI * 4.5), 0.09);

  const material = new MeshStandardMaterial({ color: 0x5c7bd6, metalness: 0.05, roughness: 0.7 });

  const pelvis = new Mesh(
    new CapsuleGeometry(hipRadius, torsoHeight * 0.15, 12, 24),
    material.clone(),
  );
  pelvis.position.y = legLength + torsoHeight * 0.35;
  root.add(pelvis);

  const torso = new Mesh(
    new CapsuleGeometry(torsoRadius, torsoHeight * 0.4, 18, 32),
    material.clone(),
  );
  torso.position.y = legLength + torsoHeight * 0.75;
  root.add(torso);

  const headMaterial = material.clone();
  headMaterial.color.setHex(0xd5defa);
  const head = new Mesh(new SphereGeometry(torsoRadius * 0.6, 24, 24), headMaterial);
  head.position.y = legLength + torsoHeight * 1.2;
  root.add(head);

  const upperLeg = new CapsuleGeometry(limbRadius, Math.max(legLength * 0.55, 0.5), 12, 24);
  const lowerLeg = new CapsuleGeometry(limbRadius * 0.9, Math.max(legLength * 0.35, 0.4), 12, 24);

  const createLeg = (side: 'left' | 'right') => {
    const legGroup = new Group();
    legGroup.name = `mannequin-leg-${side}`;
    const sign = side === 'left' ? 1 : -1;
    const upper = new Mesh(upperLeg, material.clone());
    upper.position.set(sign * hipRadius * 0.6, legLength * 0.75, 0);
    legGroup.add(upper);
    const lower = new Mesh(lowerLeg, material.clone());
    lower.position.set(sign * hipRadius * 0.6, legLength * 0.3, 0);
    legGroup.add(lower);
    return legGroup;
  };

  const leftLeg = createLeg('left');
  const rightLeg = createLeg('right');
  root.add(leftLeg, rightLeg);

  const armGeometry = new CapsuleGeometry(limbRadius * 0.7, Math.max(armLength * 0.4, 0.4), 12, 24);
  const forearmGeometry = new CapsuleGeometry(
    limbRadius * 0.6,
    Math.max(armLength * 0.3, 0.3),
    12,
    24,
  );

  const createArm = (side: 'left' | 'right') => {
    const armGroup = new Group();
    armGroup.name = `mannequin-arm-${side}`;
    const sign = side === 'left' ? 1 : -1;
    const shoulderY = legLength + torsoHeight * 0.95;
    const upper = new Mesh(armGeometry, material.clone());
    upper.rotation.z = (sign * -Math.PI) / 12;
    upper.position.set(sign * shoulderWidth * 0.6, shoulderY, 0);
    armGroup.add(upper);
    const lower = new Mesh(forearmGeometry, material.clone());
    lower.position.set(sign * shoulderWidth * 0.85, shoulderY - armLength * 0.35, 0);
    lower.rotation.z = (sign * -Math.PI) / 12;
    armGroup.add(lower);
    return armGroup;
  };

  root.add(createArm('left'), createArm('right'));

  const ground = new Mesh(
    new BoxGeometry(hipRadius * 2.4, 0.08, hipRadius * 2.4),
    material.clone(),
  );
  ground.position.y = 0.04;
  root.add(ground);

  // lift everything so that feet rest at y=0
  root.position.y = 0;
  return root;
};

export function Mannequin({ onLoaded }: MannequinProps) {
  const measurements = useAvatarStore((state) => state.measurements);
  const rootGroup = useMemo(() => {
    const group = new Group();
    group.name = 'mannequin-root';
    return group;
  }, []);

  const loaderStateRef = useRef<LoaderState>('idle');
  const loaderRef = useRef(new GLTFLoader());
  const placeholderRef = useRef<Group | null>(null);

  useEffect(() => {
    const root = rootGroup;
    root.clear();
    const placeholder = createPlaceholder();
    placeholderRef.current = placeholder;
    root.add(placeholder);
    onLoaded?.(root);

    let disposed = false;

    const applyObject = (object: Object3D) => {
      if (disposed) {
        return;
      }
      root.clear();
      root.add(object);
      onLoaded?.(root);
    };

    const buildProcedural = () => {
      const generated = createProceduralMannequin(measurements);
      applyObject(generated);
      loaderStateRef.current = 'failed';
    };

    const loadStatic = () => {
      loaderStateRef.current = 'loading';
      loaderRef.current.load(
        '/mannequin.glb',
        (gltf) => {
          loaderStateRef.current = 'loaded';
          const scene = gltf.scene ?? gltf.scenes?.[0];
          if (scene) {
            scene.traverse((child) => {
              if (child instanceof Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            applyObject(scene.clone(true));
          } else {
            buildProcedural();
          }
        },
        undefined,
        () => {
          loaderStateRef.current = 'failed';
          buildProcedural();
        },
      );
    };

    if (loaderStateRef.current === 'idle') {
      loadStatic();
    } else if (loaderStateRef.current === 'failed') {
      buildProcedural();
    } else if (loaderStateRef.current === 'loaded') {
      // already loaded static asset, no change
      onLoaded?.(root);
    }

    return () => {
      disposed = true;
    };
  }, [measurements, onLoaded, rootGroup]);

  return <primitive object={rootGroup} />;
}

export default Mannequin;
