import * as THREE from 'three';
import { MmdModelLoader } from '../mmd/MmdModelLoader';
import { StudioViewport } from './StudioViewport';

export interface StudioModelSessionOptions {
  modelUrl: string;
}

/** Loads one MMD model into the shared Studio scene without coupling the viewport to the loader. */
export class StudioModelSession {
  private model: THREE.Object3D | null = null;

  constructor(
    private readonly viewport: StudioViewport,
    private readonly loader: MmdModelLoader,
  ) {}

  async load(options: StudioModelSessionOptions): Promise<THREE.Object3D> {
    this.unload();
    const model = await this.loader.load(options.modelUrl);
    this.model = model;
    this.viewport.addPreviewObject(model);
    model.updateMatrixWorld(true);
    return model;
  }

  unload(): void {
    if (!this.model) return;
    this.viewport.scene.remove(this.model);
    this.model = null;
  }

  getModel(): THREE.Object3D | null {
    return this.model;
  }
}
