import * as THREE from 'three';
import type { CensorshipRegion } from './CensorshipRegion';
import type { CensorshipSystem, CensorshipRenderRegion } from './CensorshipSystem';
import { CensorshipRegionObject3D } from './CensorshipRegionObject3D';

interface BoundRegion {
  region: CensorshipRegion;
  target: THREE.Object3D;
  localPoint: THREE.Vector3;
  object3D: CensorshipRegionObject3D;
}

/**
 * Owns model-bound censorship geometry.
 *
 * Persistent model regions stay in 3D coordinates. Projection to normalized
 * screen rectangles happens only at render time so the stored region never
 * becomes a screen-space object.
 */
export class CensorshipBindingController {
  private readonly bindings: BoundRegion[] = [];

  constructor(
    private readonly censorship: CensorshipSystem,
    private readonly scene: THREE.Scene,
  ) {}

  bind(region: CensorshipRegion, target: THREE.Object3D, worldPoint?: THREE.Vector3): void {
    const localPoint = worldPoint
      ? target.worldToLocal(worldPoint.clone())
      : new THREE.Vector3();

    const model = region.model ?? {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      width: 0.5,
      height: 0.4,
      billboard: true,
    };
    region.model = model;
    region.space = 'model';

    const object3D = new CensorshipRegionObject3D(model.width, model.height);
    object3D.position.copy(localPoint).add(new THREE.Vector3(...model.position));
    object3D.rotation.set(...model.rotation);
    object3D.setBillboard(model.billboard);
    target.add(object3D);

    this.bindings.push({ region, target, localPoint, object3D });
    this.syncRegions();
  }

  clear(): void {
    for (const binding of this.bindings) {
      binding.object3D.removeFromParent();
      binding.object3D.dispose();
    }
    this.bindings.length = 0;
    this.censorship.setRegions([]);
  }

  getRegions(): readonly CensorshipRegion[] {
    return this.bindings.map(({ region }) => region);
  }

  update(camera: THREE.Camera, width: number, height: number): void {
    const renderRegions: CensorshipRenderRegion[] = [];

    for (const binding of this.bindings) {
      const region = binding.region;
      const model = region.model;
      if (!model) continue;

      binding.object3D.position.copy(binding.localPoint).add(new THREE.Vector3(...model.position));
      binding.object3D.rotation.set(...model.rotation);
      binding.object3D.setSize(model.width, model.height);
      binding.object3D.setBillboard(model.billboard);
      binding.object3D.updateBillboard(camera);

      const corners = binding.object3D.getWorldCorners();
      const projected = corners.map((corner) => corner.project(camera));
      const visible = projected.some((point) => point.z >= -1 && point.z <= 1);
      if (!visible) continue;

      const xs = projected.map((point) => point.x * 0.5 + 0.5);
      const ys = projected.map((point) => point.y * 0.5 + 0.5);
      const x0 = THREE.MathUtils.clamp(Math.min(...xs), 0, 1);
      const x1 = THREE.MathUtils.clamp(Math.max(...xs), 0, 1);
      const y0 = THREE.MathUtils.clamp(Math.min(...ys), 0, 1);
      const y1 = THREE.MathUtils.clamp(Math.max(...ys), 0, 1);

      renderRegions.push({
        region,
        rect: new THREE.Vector4(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0)),
      });
    }

    for (const region of this.censorship.getRegions()) {
      if (region.space !== 'screen' || !region.screen) continue;
      renderRegions.push({
        region,
        rect: new THREE.Vector4(
          region.screen.x / Math.max(width, 1),
          region.screen.y / Math.max(height, 1),
          region.screen.width / Math.max(width, 1),
          region.screen.height / Math.max(height, 1),
        ),
      });
    }

    this.censorship.setRenderRegions(renderRegions);
  }

  private syncRegions(): void {
    this.censorship.setRegions(this.bindings.map(({ region }) => region));
  }
}
