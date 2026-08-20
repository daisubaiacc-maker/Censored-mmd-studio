import * as THREE from 'three';
import { CensorshipCompositor } from '../censorship/CensorshipCompositor';
import { CensorshipFrameController } from '../censorship/CensorshipFrameController';
import { ObservationCensorshipController } from '../censorship/ObservationCensorshipController';
import { ObservationRule } from '../censorship/ObservationSystem';
import { FocusSystem } from './FocusSystem';
import { DepthOfFieldSystem } from './DepthOfFieldSystem';
import { BoneRegionFrameController } from './BoneRegionFrameController';
import { MmdAnimationFrameController } from '../mmd/MmdAnimationFrameController';
import { PointerFocusController } from './PointerFocusController';

/** Complete frame boundary: animation -> pointer focus -> observation -> region tracking -> protected render. */
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
    private readonly animation?: MmdAnimationFrameController,
    private readonly pointerFocus?: PointerFocusController,
  ) {}

  handlePointerMove(event: PointerEvent): void {
    this.pointerFocus?.handlePointerMove(event, this.viewport, this.camera, this.scene);
  }

  render(now = performance.now()): void {
    const deltaMs = Math.max(0, now - this.lastTime);
    this.lastTime = now;

    // 0. Advance MMD animation/pose first so all following systems see the same pose.
    this.animation?.update(deltaMs);

    // 1. Resolve pointer focus and depth-of-field state from the registered focus targets.
    const focusState = this.focus.update(this.camera, this.scene);
    this.dof.update(focusState.focusDistance);

    // 2. Observation uses the exact same resolved target id as focus.
    this.observations.update(focusState.targetId, deltaMs, this.observationRule);

    // 3. Reproject target-bound regions from the current pose/camera.
    this.boneRegions?.update(this.camera);
    this.censorshipFrames.update(this.camera, this.viewport);

    // 4. Snapshot only currently active protection regions.
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

    // 5. Render only after the protection mask is finalized for this frame.
    this.compositor.render(this.scene, this.camera, width, height);
  }
}
