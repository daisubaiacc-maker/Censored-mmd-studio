import * as THREE from 'three';
import { TargetRegionProjector } from './TargetRegionProjector';
import { CensorshipFrameController } from './CensorshipFrameController';

/** Updates screen-space censorship regions from their bound 3D targets. */
export class TargetRegionFrameBinding {
  constructor(
    private readonly projector: TargetRegionProjector,
    private readonly frames: CensorshipFrameController,
  ) {}

  update(camera: THREE.Camera, viewport: HTMLElement): void {
    const rect = viewport.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    for (const region of this.frames.getRegions()) {
      if (!region.targetId) continue;
      const projected = this.projector.project(region.targetId, camera, width, height);
      if (!projected) continue;
      region.rect = projected;
    }
  }
}
