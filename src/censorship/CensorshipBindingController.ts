import * as THREE from 'three';
import type { CensorshipRegion } from './CensorshipRegion';
import type { CensorshipSystem } from './CensorshipSystem';

interface BoundObject {
  regionId: string;
  object: THREE.Object3D;
}

/** Bridges editable 3D objects to screen-space censorship regions. */
export class CensorshipBindingController {
  private readonly bindings: BoundObject[] = [];

  constructor(private readonly censorship: CensorshipSystem) {}

  bind(region: CensorshipRegion, object: THREE.Object3D): void {
    this.bindings.push({ regionId: region.id, object });
    this.censorship.setRegions(this.bindings.map(({ regionId }) => ({
      id: regionId,
      space: 'model',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      effect: 'mosaic',
      enabled: true,
      pixelSize: 18,
    })));
  }

  clear(): void {
    this.bindings.length = 0;
    this.censorship.setRegions([]);
  }

  update(camera: THREE.Camera, width: number, height: number): void {
    const regions: CensorshipRegion[] = [];
    for (const binding of this.bindings) {
      const box = new THREE.Box3().setFromObject(binding.object);
      if (box.isEmpty()) continue;
      const points = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z), new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z), new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z), new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z), new THREE.Vector3(box.max.x, box.max.y, box.max.z),
      ];
      const projected = points.map((point) => point.project(camera));
      const visible = projected.filter((point) => point.z >= -1 && point.z <= 1);
      if (!visible.length) continue;
      const minX = THREE.MathUtils.clamp(Math.min(...visible.map((p) => p.x)) * 0.5 + 0.5, 0, 1);
      const maxX = THREE.MathUtils.clamp(Math.max(...visible.map((p) => p.x)) * 0.5 + 0.5, 0, 1);
      const minY = THREE.MathUtils.clamp(Math.min(...visible.map((p) => p.y)) * 0.5 + 0.5, 0, 1);
      const maxY = THREE.MathUtils.clamp(Math.max(...visible.map((p) => p.y)) * 0.5 + 0.5, 0, 1);
      regions.push({
        id: binding.regionId,
        space: 'model',
        x: minX,
        y: minY,
        width: Math.max(0, maxX - minX),
        height: Math.max(0, maxY - minY),
        effect: 'mosaic',
        enabled: true,
        pixelSize: Math.max(10, Math.round(Math.min(width, height) * 0.025)),
      });
    }
    this.censorship.setRegions(regions);
  }
}
