import * as THREE from 'three';
import { MmdLoadResult } from './MmdLoaderAdapter';

export interface PmxPmdLoader {
  load(url: string): Promise<MmdLoadResult>;
}

/** Scene-facing loader contract; concrete PMX/PMD implementations stay replaceable. */
export class MmdSceneLoader {
  constructor(private readonly loader: PmxPmdLoader, private readonly scene: THREE.Scene) {}

  async load(url: string): Promise<MmdLoadResult> {
    const result = await this.loader.load(url);
    this.scene.add(result.root);
    return result;
  }

  unload(result: MmdLoadResult): void {
    this.scene.remove(result.root);
  }
}
