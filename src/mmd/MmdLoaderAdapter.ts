import * as THREE from 'three';
import { MmdLoadTargetBridge, LoadedMmdModel } from '../studio/MmdLoadTargetBridge';

export interface MmdLoadResult {
  id: string;
  root: THREE.Object3D;
}

/** Loader-neutral adapter; a concrete PMX/PMD loader can implement load(). */
export class MmdLoaderAdapter {
  constructor(private readonly targets: MmdLoadTargetBridge) {}

  onLoad(result: MmdLoadResult): LoadedMmdModel {
    const model: LoadedMmdModel = { id: result.id, root: result.root };
    this.targets.onLoaded(model);
    return model;
  }

  onUnload(modelId: string): void {
    this.targets.onUnloaded(modelId);
  }
}
