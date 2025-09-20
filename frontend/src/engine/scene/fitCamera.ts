import { Box3, MathUtils, Sphere, Vector3 } from 'three';
import type { PerspectiveCamera, Object3D } from 'three';
import type { OrbitControls } from 'three-stdlib';

interface FitCameraOptions {
  padding?: number;
  minDistance?: number;
  maxDistance?: number;
}

const tempBox = new Box3();
const tempSphere = new Sphere();
const lookDirection = new Vector3();

export function fitCameraToObject(
  camera: PerspectiveCamera,
  controls: OrbitControls | null | undefined,
  object: Object3D,
  options: FitCameraOptions = {},
): void {
  const { padding = 1.3, minDistance = 0.8, maxDistance = 8 } = options;

  tempBox.setFromObject(object);
  tempBox.getBoundingSphere(tempSphere);

  const radius = Math.max(tempSphere.radius, 1e-3);
  const center = tempSphere.center;
  const fov = MathUtils.degToRad(camera.fov);
  const distance = Math.min(
    Math.max((radius * padding) / Math.sin(fov / 2), minDistance),
    maxDistance,
  );

  lookDirection.set(0, 0, -1);
  camera.getWorldDirection(lookDirection).normalize().multiplyScalar(-1);
  const position = lookDirection.clone().multiplyScalar(distance).add(center);

  camera.position.copy(position);
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = distance * 10;
  camera.updateProjectionMatrix();

  if (controls) {
    controls.target.copy(center);
    controls.update();
  }
}

export default fitCameraToObject;
