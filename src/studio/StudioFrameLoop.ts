import * as THREE from 'three';
import { CensorshipFrameController } from '../censorship/CensorshipFrameController';

/** Central per-frame update hook; animation/pose systems can feed into it later. */
export class StudioFrameLoop {
  constructor(
    private readonly camera: THREE.Camera,
    private readonly viewport: HTMLElement,
    private readonly censorship: CensorshipFrameController,
  ) {}

  update(): void {
    this.censorship.update(this.camera, this.viewport);
  }
}
