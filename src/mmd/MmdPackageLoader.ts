import JSZip from 'jszip';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { LoadingManager } from 'three';
import type { Object3D } from 'three';

/** Loads a PMX model and its relative resources from a user-selected ZIP archive. */
export class MmdPackageLoader {
  async loadZip(file: File): Promise<Object3D> {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);
    const pmx = entries.find((entry) => /\.pmx$/i.test(entry.name));
    if (!pmx) throw new Error('No PMX model was found in the selected ZIP archive.');

    const manager = new LoadingManager();
    const loader = new MMDLoader(manager);
    const data = await pmx.async('arraybuffer');
    return await new Promise<Object3D>((resolve, reject) => {
      loader.loadPMX(data, resolve, undefined, reject);
    });
  }
}
