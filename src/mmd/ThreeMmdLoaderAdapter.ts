import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MmdLoaderAdapter, MmdLoadResult } from './MmdLoaderAdapter';

/** Concrete adapter for three.js's official MMDLoader addon. */
export class ThreeMmdLoaderAdapter implements MmdLoaderAdapter {
  constructor(private readonly loader = new MMDLoader()) {}

  async load(url: string): Promise<MmdLoadResult> {
    const root = await this.loader.loadAsync(url);
    return { id: crypto.randomUUID(), root };
  }
}
