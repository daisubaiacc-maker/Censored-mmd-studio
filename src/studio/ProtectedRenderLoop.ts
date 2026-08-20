import * as THREE from 'three';
import { CensorshipCompositor } from '../censorship/CensorshipCompositor';
import { CensorshipFrameController } from '../censorship/CensorshipFrameController';

/** Single render entry point so viewport/export paths share censorship processing. */
export class ProtectedRenderLoop {
  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly camera: THREE.Camera,
    private readonly viewport: HTMLElement,
    private readonly censorshipFrames: CensorshipFrameController,
    private readonly compositor: CensorshipCompositor,
  ) {}

  render(scene: THREE.Scene): void {
    const rect = this.viewport.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    this.censorshipFrames.update(this.camera, this.viewport);
    this.compositor.setRegions(
      this.censorshipFrames.getRegions().map((region) => ({
        id: region.id,
        rect: region.rect,
        enabled: region.enabled,
        pixelSize: 12,
      })),
    );
    this.compositor.render(scene, this.camera, width, height);
  }
}
