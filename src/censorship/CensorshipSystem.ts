import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import type { CensorshipRegion } from './CensorshipRegion';
import { MosaicShader } from './MosaicShader';

const MAX_REGIONS = 32;

/**
 * Owns the final visual censorship pipeline.
 *
 * The important architectural decision is that censorship is a render pass,
 * not a UI overlay. This allows future regions to follow projected 3D objects
 * or MMD bones and keeps the result present in screenshots/exported frames.
 */
export class CensorshipSystem {
  private readonly composer: EffectComposer;
  private readonly mosaicPass: ShaderPass;
  private regions: CensorshipRegion[] = [];

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    this.mosaicPass = new ShaderPass(MosaicShader);
    this.composer.addPass(this.mosaicPass);
    this.composer.addPass(new OutputPass());
  }

  setRegions(regions: CensorshipRegion[]): void {
    this.regions = regions.filter((region) => region.enabled).slice(0, MAX_REGIONS);
    this.syncUniforms();
  }

  getRegions(): readonly CensorshipRegion[] {
    return this.regions;
  }

  resize(width: number, height: number): void {
    this.composer.setSize(width, height);
    (this.mosaicPass.uniforms.uResolution.value as THREE.Vector2).set(width, height);
  }

  render(): void {
    this.syncUniforms();
    this.composer.render();
  }

  private syncUniforms(): void {
    const rects = this.mosaicPass.uniforms.uRegionRects.value as THREE.Vector4[];
    const pixelSizes = this.mosaicPass.uniforms.uRegionPixelSizes.value as number[];

    for (let i = 0; i < MAX_REGIONS; i += 1) {
      const region = this.regions[i];
      if (!region) {
        rects[i].set(0, 0, 0, 0);
        pixelSizes[i] = 12;
        continue;
      }

      rects[i].set(region.x, region.y, region.width, region.height);
      pixelSizes[i] = region.pixelSize ?? 12;
    }

    this.mosaicPass.uniforms.uRegionCount.value = this.regions.length;
  }
}
