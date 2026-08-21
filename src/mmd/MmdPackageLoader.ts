import JSZip from 'jszip';
import { LoadingManager } from 'three';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import type { Object3D } from 'three';

/** Loads a PMX model and its relative resources from a user-selected ZIP archive. */
export class MmdPackageLoader {
  async loadZip(file: File): Promise<Object3D> {
    const zip = await JSZip.loadAsync(file);
    const entries = Object.values(zip.files).filter((entry) => !entry.dir);
    const pmx = entries.find((entry) => /\.pmx$/i.test(entry.name));

    if (!pmx) {
      throw new Error('No PMX model was found in the selected ZIP archive.');
    }

    const resourceUrls = new Map<string, string>();
    const blobUrls: string[] = [];
    const pmxDirectory = pmx.name.replace(/\\/g, '/').replace(/\/[^/]*$/, '');

    try {
      // Create browser-local URLs for every file in the package so MMDLoader can
      // resolve textures and other resources through its normal URL loading path.
      for (const entry of entries) {
        const data = await entry.async('arraybuffer');
        const blobUrl = URL.createObjectURL(
          new Blob([data], { type: this.getMimeType(entry.name) }),
        );
        blobUrls.push(blobUrl);

        const normalizedName = entry.name.replace(/\\/g, '/').replace(/^\.\//, '');
        resourceUrls.set(normalizedName, blobUrl);
        resourceUrls.set(normalizedName.toLowerCase(), blobUrl);
      }

      const pmxUrl = resourceUrls.get(pmx.name.replace(/\\/g, '/'));
      if (!pmxUrl) {
        throw new Error('Failed to create a browser URL for the PMX model.');
      }

      const manager = new LoadingManager();
      manager.setURLModifier((requestedUrl) => {
        const normalizedUrl = this.normalizeResourcePath(requestedUrl, pmxDirectory);
        return (
          resourceUrls.get(normalizedUrl) ??
          resourceUrls.get(normalizedUrl.toLowerCase()) ??
          requestedUrl
        );
      });

      const loader = new MMDLoader(manager);

      return await new Promise<Object3D>((resolve, reject) => {
        // MMDLoader.load() is the public model-loading API. It detects PMX from
        // the .pmx extension and internally performs the PMX parsing/build step.
        loader.load(pmxUrl, resolve, undefined, reject);
      });
    } finally {
      for (const blobUrl of blobUrls) {
        URL.revokeObjectURL(blobUrl);
      }
    }
  }

  private normalizeResourcePath(requestedUrl: string, pmxDirectory: string): string {
    const decodedUrl = decodeURI(requestedUrl).replace(/\\/g, '/');
    const withoutQuery = decodedUrl.split(/[?#]/, 1)[0];

    if (/^[a-z]+:/i.test(withoutQuery)) {
      return withoutQuery;
    }

    const base = pmxDirectory ? `${pmxDirectory}/` : '';
    const path = withoutQuery.replace(/^\.\//, '').replace(/^\//, '');

    const parts = `${base}${path}`.split('/');
    const normalized: string[] = [];

    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') {
        normalized.pop();
      } else {
        normalized.push(part);
      }
    }

    return normalized.join('/');
  }

  private getMimeType(path: string): string {
    const extension = path.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'bmp':
        return 'image/bmp';
      case 'tga':
        return 'image/x-tga';
      case 'pmx':
        return 'application/octet-stream';
      default:
        return 'application/octet-stream';
    }
  }
}
