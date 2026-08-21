import JSZip from 'jszip';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import type { Object3D } from 'three';

/** Loads a PMX model and its relative resources from a user-selected ZIP archive. */
export class MmdPackageLoader {
  private readonly loader = new MMDLoader();

  async loadZip(file: File): Promise<Object3D> {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);
    const pmx = entries.find((entry) => /\.pmx$/i.test(entry.name));
    if (!pmx) throw new Error('No PMX model was found in the selected ZIP archive.');

    const basePath = pmx.name.slice(0, pmx.name.lastIndexOf('/') + 1);
    const resources = new Map<string, string>();
    for (const entry of entries) {
      const blob = await entry.async('blob');
      resources.set(entry.name, URL.createObjectURL(blob));
    }

    const modelUrl = resources.get(pmx.name);
    if (!modelUrl) throw new Error('The PMX model could not be extracted.');

    this.loader.setResourcePath((resources.get(basePath) ?? modelUrl).replace(/[^/]*$/, ''));
    try {
      return await new Promise<Object3D>((resolve, reject) => {
        this.loader.load(modelUrl, resolve, undefined, reject);
      });
    } finally {
      for (const url of resources.values()) URL.revokeObjectURL(url);
    }
  }
}
