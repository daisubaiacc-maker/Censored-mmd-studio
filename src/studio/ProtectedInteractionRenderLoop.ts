import * as THREE from 'three';
import { CensorshipCompositor } from '../censorship/CensorshipCompositor';
import { CensorshipFrameController } from '../censorship/CensorshipFrameController';
import { ObservationCensorshipController } from '../censorship/ObservationCensorshipController';
import { ObservationRule } from '../censorship/ObservationSystem';
import { FocusSystem } from './FocusSystem';
import { DepthOfFieldSystem } from './DepthOfFieldSystem';
import { BoneRegionFrameController } from './BoneRegionFrameController';

/** Complete frame boundary: focus -> observation -> region tracking -> protected render. */
export class ProtectedInteractionRenderLoop {
  private lastTime = performance.now();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    private readonly viewport: HTMLElement,
    private readonly focus: FocusSystem,
    private readonly dof: DepthOfFieldSystem,
    private readonly observations: ObservationCensorshipController,
    private readonly censorshipFrames: CensorshipFrameController,
    private readonly compositor: CensorshipCompositor,
    private readonly observationRule: ObservationRule,
    private readonly boneRegions?: BoneRegionFrameController,
  ) {}

  render(now = performance.now()): void {
    const deltaMs = Math.max(0, now - this.lastTime);
    this.lastTime = now;

    // 1. Resolve pointer focus and depth-of-field state.
    const focusState = this.focus.update(this.camera, this.scene);
    this.dof.update(focusState.focusDistance);

    // 2. Observation may change which censorship regions are active.
    this.observations.update(focusState.targetId, deltaMs, this.observationRule);

    // 3. Reproject target-bound regions after animation/camera state is current.
    //    This must happen before the final frame controller snapshot.
    this.boneRegions?.update(this.camera);
    this.censorshipFrames.update(this.camera, this.viewport);

    // 4. Snapshot only the currently active protection regions.
    const rect = this.viewport.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    const activeRegions = this.censorshipFrames.getRegions().filter((region) => region.enabled);
    this.compositor.setRegions(activeRegions.map((region) => ({
      id: region.id,
      rect: region.rect,
      enabled: true,
      pixelSize: 12,
    })));

    // 5. Render the protected frame after the mask snapshot is complete.
    this.compositor.render(this.scene, this.camera, width, height);
  }
}
