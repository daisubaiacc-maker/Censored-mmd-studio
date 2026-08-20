import * as THREE from 'three';

export interface MmdAnimationUpdater {
  update(deltaSeconds: number): void;
}

/** Owns the animation-update boundary so target projection always sees the current pose. */
export class MmdAnimationFrameController {
  constructor(
    private readonly scene: THREE.Scene,
    private readonly updater?: MmdAnimationUpdater,
  ) {}

  update(deltaMs: number): void {
    this.updater?.update(Math.max(0, deltaMs) / 1000);
    this.scene.updateMatrixWorld(true);
  }
}
