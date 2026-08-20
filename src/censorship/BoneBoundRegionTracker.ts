import * as THREE from 'three';
import { RegionEditorModel } from './RegionEditorModel';
import { RegionOverlay } from './RegionOverlay';

export interface BoneRegionBinding {
  regionId: string;
  target: THREE.Object3D;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
}

/** Keeps model-bound censorship regions aligned with animated bones. */
export class BoneBoundRegionTracker {
  private readonly bindings = new Map<string, BoneRegionBinding>();

  constructor(private readonly regions: RegionEditorModel) {}

  bind(binding: BoneRegionBinding): void { this.bindings.set(binding.regionId, binding); }
  unbind(regionId: string): void { this.bindings.delete(regionId); }

  update(camera: THREE.Camera, viewport: HTMLElement): void {
    for (const binding of this.bindings.values()) {
      const projected = RegionOverlay.projectAnchor(binding.target, camera, viewport);
      const region = this.regions.get(binding.regionId);
      if (!region) continue;
      region.rect.x = projected.x + binding.offsetX;
      region.rect.y = projected.y + binding.offsetY;
      region.rect.width = binding.width;
      region.rect.height = binding.height;
      this.regions.add(region);
    }
  }
}
