import JSZip from 'jszip';
import { LoadingManager, MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import type { Object3D } from 'three';

/** Loads a PMX model and its relative resources from a user-selected ZIP archive. */
export class MmdPackageLoader {
  async loadZip(file: File): Promise<Object3D> {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);
    const pmx = entries.find((entry) => /\.pmx$/i.test(entry.name));
    if (!pmx) throw new Error('No PMX model was found in the selected ZIP archive.');

    const resources = new Map<string, string>();
    for (const entry of entries) {
      resources.set(this.normalize(entry.name), URL.createObjectURL(await entry.async('blob')));
    }

    const modelUrl = resources.get(this.normalize(pmx.name));
    if (!modelUrl) throw new Error('The PMX model could not be extracted.');

    const manager = new LoadingManager();
    manager.setURLModifier((requestedUrl) => {
      const normalized = this.normalize(requestedUrl);
      const direct = resources.get(normalized);
      if (direct) return direct;
      const basename = normalized.split('/').pop() ?? normalized;
      const match = [...resources.entries()].find(([name]) => name.split('/').pop() === basename);
      return match?.[1] ?? requestedUrl;
    });

    const loader = new MMDLoader(manager);
    return await new Promise<Object3D>((resolve, reject) => {
      loader.load(modelUrl, resolve, undefined, reject);
    });
  }

  private normalize(path: string): string {
    return decodeURIComponent(path).replace(/\\/g, '/').replace(/^\.\//, '');
  }
}
