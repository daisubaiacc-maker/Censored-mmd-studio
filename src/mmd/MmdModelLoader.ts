import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import type { Object3D } from 'three';

export interface MmdLoadOptions {
  resourcePath?: string;
}

/** Thin application wrapper around Three.js' MMD loader. */
export class MmdModelLoader {
  private readonly loader = new MMDLoader();

  load(url: string, options: MmdLoadOptions = {}): Promise<Object3D> {
    if (options.resourcePath) {
      this.loader.setResourcePath(options.resourcePath);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (object) => resolve(object),
        undefined,
        (error) => reject(error),
      );
    });
  }
}
