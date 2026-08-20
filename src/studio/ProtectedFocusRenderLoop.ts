import * as THREE from 'three';
import { CensorshipCompositor } from '../censorship/CensorshipCompositor';
import { CensorshipFrameController } from '../censorship/CensorshipFrameController';
import { FocusSystem } from './FocusSystem';
import { DepthOfFieldSystem } from './DepthOfFieldSystem';

/** Coordinates focus state and protected rendering in one frame boundary. */
export class ProtectedFocusRenderLoop {
  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
    private readonly viewport: HTMLElement,
    private readonly focus: FocusSystem,
    private readonly dof: DepthOfFieldSystem,
    private readonly censorshipFrames: CensorshipFrameController,
    private readonly compositor: CensorshipCompositor,
  ) {}

  render(): void {
    const rect = this.viewport.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    const focusState = this.focus.update(this.camera, this.scene);
    this.dof.update(focusState.focusDistance);
    this.censorshipFrames.update(this.camera, this.viewport);

    this.compositor.setRegions(this.censorshipFrames.getRegions().map((region) => ({
      id: region.id,
      rect: region.rect,
      enabled: region.enabled,
      pixelSize: 12,
    })));
    this.compositor.render(this.scene, this.camera, width, height);
  }
}
