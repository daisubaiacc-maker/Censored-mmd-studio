import * as THREE from 'three';
import { FocusTargetRegistry, FocusTarget } from '../studio/FocusTargetRegistry';
import { RegionEditorModel } from './RegionEditorModel';

/** Updates a region from its bound 3D target and projects the bounds into viewport pixels. */
export class BoneRegionTracker {
  private readonly box = new THREE.Box3();
  private readonly corners = Array.from({ length: 8 }, () => new THREE.Vector3());
  private readonly projected = Array.from({ length: 8 }, () => new THREE.Vector3());

  constructor(
    private readonly targets: FocusTargetRegistry,
    private readonly regions: RegionEditorModel,
  ) {}

  update(camera: THREE.Camera, viewport: HTMLElement): void {
    const rect = viewport.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);

    for (const region of this.regions.all()) {
      if (!region.targetId) continue;
      const target = this.targets.get(region.targetId);
      if (!target?.object) continue;

      target.object.updateWorldMatrix(true, true);
      this.box.setFromObject(target.object, true);
      if (this.box.isEmpty()) continue;

      const min = this.box.min;
      const max = this.box.max;
      this.corners[0].set(min.x, min.y, min.z);
      this.corners[1].set(max.x, min.y, min.z);
      this.corners[2].set(min.x, max.y, min.z);
      this.corners[3].set(max.x, max.y, min.z);
      this.corners[4].set(min.x, min.y, max.z);
      this.corners[5].set(max.x, min.y, max.z);
      this.corners[6].set(min.x, max.y, max.z);
      this.corners[7].set(max.x, max.y, max.z);

      let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      for (let i = 0; i < 8; i++) {
        this.projected[i].copy(this.corners[i]).project(camera);
        const x = (this.projected[i].x * 0.5 + 0.5) * width;
        const y = (-this.projected[i].y * 0.5 + 0.5) * height;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }

      const next = { ...region, rect: { x: left, y: top, width: right - left, height: bottom - top } };
      this.regions.add(next);
    }
  }
}
