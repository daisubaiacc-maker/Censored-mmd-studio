import * as THREE from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';

export interface MmdAsset {
  root: THREE.Object3D;
  meshes: THREE.SkinnedMesh[];
  bones: THREE.Bone[];
}

/** Loads PMX/PMD and exposes stable scene metadata for focus/censorship systems. */
export class MmdAssetLoader {
  private readonly loader = new MMDLoader();

  load(url: string): Promise<MmdAsset> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (root) => {
          const meshes: THREE.SkinnedMesh[] = [];
          const bones: THREE.Bone[] = [];
          root.traverse((object) => {
            if (object instanceof THREE.SkinnedMesh) meshes.push(object);
            if (object instanceof THREE.Bone) bones.push(object);
          });
          resolve({ root, meshes, bones });
        },
        undefined,
        reject,
      );
    });
  }
}
