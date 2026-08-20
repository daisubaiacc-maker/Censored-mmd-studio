import * as THREE from 'three';
import { BoneRegionTracker } from './BoneRegionTracker';
import { CensorshipFrameController } from './CensorshipFrameController';

/** Updates target-bound censorship regions immediately before mask generation. */
export class BoneRegionRenderBridge {
  constructor(
    private readonly tracker: BoneRegionTracker,
    private readonly frames: CensorshipFrameController,
  ) {}

  update(camera: THREE.Camera, viewport: HTMLElement): void {
    const rect = viewport.getBoundingClientRect();
    this.frames.update(camera, viewport);

    for (const region of this.frames.getRegions()) {
      if (!region.targetId) continue;
      const projected = this.tracker.projectRegion(region.targetId, camera, rect.width, rect.height);
      if (!projected) continue;
      region.rect = projected;
    }
  }
}
