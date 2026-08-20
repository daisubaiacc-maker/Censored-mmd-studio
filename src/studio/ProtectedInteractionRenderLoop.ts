import * as THREE from 'three';
import { CensorshipCompositor } from '../censorship/CensorshipCompositor';
import { CensorshipFrameController } from '../censorship/CensorshipFrameController';
import { ObservationCensorshipController } from '../censorship/ObservationCensorshipController';
import { ObservationRule } from '../censorship/ObservationSystem';
import { FocusSystem } from './FocusSystem';
import { DepthOfFieldSystem } from './DepthOfFieldSystem';

/** Complete frame boundary: focus -> observation -> censorship -> protected render. */
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
  ) {}

  render(now = performance.now()): void {
    const deltaMs = Math.max(0, now - this.lastTime);
    this.lastTime = now;

    const focusState = this.focus.update(this.camera, this.scene);
    this.dof.update(focusState.focusDistance);
    this.observations.update(focusState.targetId, deltaMs, this.observationRule);
    this.censorshipFrames.update(this.camera, this.viewport);

    const rect = this.viewport.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    this.compositor.setRegions(this.censorshipFrames.getRegions().map((region) => ({
      id: region.id,
      rect: region.rect,
      enabled: region.enabled,
      pixelSize: 12,
    })));
    this.compositor.render(this.scene, this.camera, width, height);
  }
}
