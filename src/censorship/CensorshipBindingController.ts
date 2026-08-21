import * as THREE from 'three';
import type { CensorshipRegion } from './CensorshipRegion';
import type { CensorshipSystem } from './CensorshipSystem';

interface BoundObject {
  region: CensorshipRegion;
  object: THREE.Object3D;
  localPoint: THREE.Vector3;
}

/** Bridges exact target points to camera-facing censorship shapes in screen space. */
export class CensorshipBindingController {
  private readonly bindings: BoundObject[] = [];

  constructor(private readonly censorship: CensorshipSystem) {}

  bind(region: CensorshipRegion, object: THREE.Object3D, worldPoint?: THREE.Vector3): void {
    const localPoint = worldPoint ? object.worldToLocal(worldPoint.clone()) : new THREE.Vector3();
    this.bindings.push({ region, object, localPoint });
    this.syncRegions();
  }

  clear(): void {
    this.bindings.length = 0;
    this.censorship.setRegions([]);
  }

  getRegions(): readonly CensorshipRegion[] {
    return this.bindings.map(({ region }) => region);
  }

  update(camera: THREE.Camera, width: number, height: number): void {
    for (const binding of this.bindings) {
      const worldPosition = binding.object.localToWorld(binding.localPoint.clone());
      const projected = worldPosition.project(camera);
      if (projected.z < -1 || projected.z > 1) {
        binding.region.enabled = false;
        continue;
      }

      const centerX = THREE.MathUtils.clamp(projected.x * 0.5 + 0.5, 0, 1);
      const centerY = THREE.MathUtils.clamp(projected.y * 0.5 + 0.5, 0, 1);
      const sizeMode = binding.region.sizeMode ?? 'screen';

      if (sizeMode === 'screen') {
        // Screen-space dimensions are pixels converted to UV units. They do not
        // change when the camera zooms or orbits.
        const pixelWidth = binding.region.width > 0 ? binding.region.width * width : 180;
        const pixelHeight = binding.region.height > 0 ? binding.region.height * height : 140;
        binding.region.width = pixelWidth / Math.max(width, 1);
        binding.region.height = pixelHeight / Math.max(height, 1);
      } else {
        // World-space dimensions are projected every frame, so camera zoom changes
        // their apparent size as expected.
        const worldSize = Math.max(binding.region.width, binding.region.height, 0.01);
        const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).normalize();
        const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).normalize();
        const half = worldSize * 0.5;
        const projectedRight = worldPosition.clone().addScaledVector(right, half).project(camera);
        const projectedUp = worldPosition.clone().addScaledVector(up, half).project(camera);
        binding.region.width = Math.abs(projectedRight.x - projected.x);
        binding.region.height = Math.abs(projectedUp.y - projected.y);
      }

      const offset = binding.region.binding?.offset;
      binding.region.x = THREE.MathUtils.clamp(
        centerX - binding.region.width * 0.5 + (offset?.[0] ?? 0),
        0,
        1,
      );
      binding.region.y = THREE.MathUtils.clamp(
        centerY - binding.region.height * 0.5 + (offset?.[1] ?? 0),
        0,
        1,
      );
      binding.region.enabled = true;
    }
    this.syncRegions();
  }

  private syncRegions(): void {
    this.censorship.setRegions(this.bindings.map(({ region }) => region));
  }
}
