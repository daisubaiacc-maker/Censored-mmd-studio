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

  update(camera: THREE.Camera, width: number, height: number): void {
    const minDimension = Math.max(1, Math.min(width, height));
    const defaultWidth = 180 / minDimension;
    const defaultHeight = 140 / minDimension;

    for (const binding of this.bindings) {
      const worldPosition = binding.object.localToWorld(binding.localPoint.clone());
      const projected = worldPosition.project(camera);
      if (projected.z < -1 || projected.z > 1) {
        binding.region.enabled = false;
        continue;
      }

      const centerX = THREE.MathUtils.clamp(projected.x * 0.5 + 0.5, 0, 1);
      const centerY = THREE.MathUtils.clamp(projected.y * 0.5 + 0.5, 0, 1);
      if (binding.region.width <= 0) binding.region.width = defaultWidth;
      if (binding.region.height <= 0) binding.region.height = defaultHeight;

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
