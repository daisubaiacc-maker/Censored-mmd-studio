import * as THREE from 'three';
import { MosaicMask, MosaicRegion } from './MosaicMask';
import { MosaicMaterial } from './MosaicMaterial';

/** Renders a scene to an offscreen target and composites the censorship mask. */
export class CensorshipCompositor {
  readonly sceneTarget: THREE.WebGLRenderTarget;
  readonly mask = new MosaicMask();
  readonly material = new MosaicMaterial();
  private readonly quad: THREE.Mesh;
  private readonly quadScene = new THREE.Scene();
  private readonly quadCamera = new THREE.Camera();

  constructor(private readonly renderer: THREE.WebGLRenderer, width: number, height: number) {
    this.sceneTarget = new THREE.WebGLRenderTarget(width, height, { depthBuffer: true });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.quadScene.add(this.quad);
  }

  setRegions(regions: MosaicRegion[]): void { this.mask.setRegions(regions); }

  render(scene: THREE.Scene, camera: THREE.Camera, width: number, height: number): void {
    if (this.sceneTarget.width !== width || this.sceneTarget.height !== height) {
      this.sceneTarget.setSize(width, height);
    }
    const maskTexture = this.mask.buildTexture(width, height);
    this.material.uniforms.tScene.value = this.sceneTarget.texture;
    this.material.uniforms.tMask.value = maskTexture;
    this.material.uniforms.uResolution.value.set(width, height);

    this.renderer.setRenderTarget(this.sceneTarget);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.quadScene, this.quadCamera);
    maskTexture.dispose();
  }

  dispose(): void {
    this.sceneTarget.dispose();
    this.quad.geometry.dispose();
    this.material.dispose();
  }
}
