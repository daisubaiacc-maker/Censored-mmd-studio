import * as THREE from 'three';
import { CensorshipFrameController } from '../censorship/CensorshipFrameController';

export interface TrackedRegionSource {
  getScreenRect(camera: THREE.Camera): { x: number; y: number; width: number; height: number } | null;
}

/** Updates target-bound censorship regions immediately before composition. */
export class BoneRegionFrameController {
  constructor(
    private readonly censorshipFrames: CensorshipFrameController,
    private readonly sources: Map<string, TrackedRegionSource>,
  ) {}

  update(camera: THREE.Camera): void {
    for (const region of this.censorshipFrames.getRegions()) {
      if (!region.targetId) continue;
      const source = this.sources.get(region.targetId);
      if (!source) continue;
      const rect = source.getScreenRect(camera);
      if (!rect) continue;
      this.censorshipFrames.setScreenRect(region.id, rect);
    }
  }
}
