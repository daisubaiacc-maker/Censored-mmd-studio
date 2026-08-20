import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MmdLoadResult } from './MmdLoaderAdapter';
import { PmxPmdLoader } from './PmxPmdLoaderContract';

/** Concrete PMX/PMD implementation backed by three.js's MMDLoader addon. */
export class ThreeMmdLoader implements PmxPmdLoader {
  private readonly loader: MMDLoader;

  constructor(manager?: THREE.LoadingManager) {
    this.loader = new MMDLoader(manager);
  }

  async load(url: string): Promise<MmdLoadResult> {
    const root = await this.loader.loadAsync(url);
    const id = this.createModelId(url, root);
    return { id, root };
  }

  private createModelId(url: string, root: THREE.Object3D): string {
    const name = root.name?.trim();
    if (name) return name;
    const file = url.split('/').pop()?.split(/[?#]/)[0] ?? 'mmd-model';
    return `${file}-${root.uuid.slice(0, 8)}`;
  }
}
