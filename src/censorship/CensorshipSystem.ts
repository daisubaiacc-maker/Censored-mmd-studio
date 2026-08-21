import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import type { CensorshipRegion } from './CensorshipRegion';
import { MosaicShader } from './MosaicShader';

const MAX_REGIONS = 32;

export interface CensorshipRenderRegion {
  region: CensorshipRegion;
  /** Normalized viewport rectangle. This is ephemeral render data only. */
  rect: THREE.Vector4;
}

/** Owns the final visual censorship pipeline. */
export class CensorshipSystem {
  private readonly composer: EffectComposer;
  private readonly mosaicPass: ShaderPass;
  private regions: CensorshipRegion[] = [];
  private renderRegions: CensorshipRenderRegion[] = [];

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
    this.renderRegions = [];
    this.syncUniforms();
  }

  setRenderRegions(regions: CensorshipRenderRegion[]): void {
    this.renderRegions = regions.slice(0, MAX_REGIONS);
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
    const shapes = this.mosaicPass.uniforms.uRegionShapes.value as number[];

    for (let i = 0; i < MAX_REGIONS; i += 1) {
      const renderRegion = this.renderRegions[i];
      if (!renderRegion) {
        rects[i].set(0, 0, 0, 0);
        pixelSizes[i] = 12;
        shapes[i] = 0;
        continue;
      }

      rects[i].copy(renderRegion.rect);
      pixelSizes[i] = renderRegion.region.pixelSize ?? 12;
      shapes[i] = renderRegion.region.shape === 'ellipse' || renderRegion.region.shape === 'circle' ? 1 : 0;
    }

    this.mosaicPass.uniforms.uRegionCount.value = this.renderRegions.length;
  }
}
