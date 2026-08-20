import * as THREE from 'three';

export interface DepthOfFieldPassOptions {
  focusDistance: number;
  focalLength?: number;
  bokehScale?: number;
}

/**
 * Lightweight DOF pass boundary. The pass is intentionally isolated from
 * FocusSystem so the renderer can later swap in a higher-quality bokeh
 * implementation without changing focus or censorship semantics.
 */
export class DepthOfFieldPass {
  readonly renderTarget: THREE.WebGLRenderTarget;
  private readonly sceneTarget: THREE.WebGLRenderTarget;
  private focusDistance: number;
  private bokehScale: number;

  constructor(width: number, height: number, options: DepthOfFieldPassOptions) {
    this.renderTarget = new THREE.WebGLRenderTarget(width, height);
    this.sceneTarget = new THREE.WebGLRenderTarget(width, height);
    this.focusDistance = Math.max(0.01, options.focusDistance);
    this.bokehScale = Math.max(0, options.bokehScale ?? 1.5);
  }

  setFocusDistance(distance: number): void {
    this.focusDistance = Math.max(0.01, distance);
  }

  setBokehScale(scale: number): void {
    this.bokehScale = Math.max(0, scale);
  }

  getState(): { focusDistance: number; bokehScale: number } {
    return { focusDistance: this.focusDistance, bokehScale: this.bokehScale };
  }

  dispose(): void {
    this.renderTarget.dispose();
    this.sceneTarget.dispose();
  }
}
