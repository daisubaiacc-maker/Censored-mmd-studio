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
    const pmxPath = this.normalizePath(pmx.name);
    const pmxDirectory = pmxPath.includes('/') ? pmxPath.slice(0, pmxPath.lastIndexOf('/')) : '';

    try {
      for (const entry of entries) {
        const data = await entry.async('arraybuffer');
        const blobUrl = URL.createObjectURL(
          new Blob([data], { type: this.getMimeType(entry.name) }),
        );
        blobUrls.push(blobUrl);

        const normalizedName = this.normalizePath(entry.name);
        resourceUrls.set(normalizedName, blobUrl);
        resourceUrls.set(normalizedName.toLowerCase(), blobUrl);
      }

      const pmxUrl = resourceUrls.get(pmxPath) ?? resourceUrls.get(pmxPath.toLowerCase());
      if (!pmxUrl) {
        throw new Error('Failed to create a browser URL for the PMX model.');
      }

      const manager = new LoadingManager();
      manager.setURLModifier((requestedUrl) => {
        // MMDLoader resolves relative texture names against the PMX blob URL
        // before invoking the URL modifier. For example:
        // blob:https://host/Textures\\face.png
        // Strip that generated blob base before matching the ZIP entry.
        const resourcePath = this.extractPackagePath(requestedUrl);
        const normalizedUrl = this.normalizeResourcePath(resourcePath, pmxDirectory);
        return (
          resourceUrls.get(normalizedUrl) ??
          resourceUrls.get(normalizedUrl.toLowerCase()) ??
          requestedUrl
        );
      });

      const loader = new MMDLoader(manager);

      return await new Promise<Object3D>((resolve, reject) => {
        loader.load(pmxUrl, resolve, undefined, reject);
      });
    } finally {
      for (const blobUrl of blobUrls) {
        URL.revokeObjectURL(blobUrl);
      }
    }
  }

  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\//, '');
  }

  private extractPackagePath(requestedUrl: string): string {
    let path = requestedUrl;

    // URLModifier can receive a blob URL produced by resolving a relative
    // resource against the PMX blob URL. Remove the blob scheme and origin,
    // leaving the package-relative resource path.
    if (path.startsWith('blob:')) {
      path = path.slice(5);
      try {
        const parsed = new URL(path);
        path = parsed.pathname;
      } catch {
        const originPrefix = `${window.location.origin}/`;
        if (path.startsWith(originPrefix)) path = path.slice(originPrefix.length);
      }
    }

    try {
      path = decodeURI(path);
    } catch {
      // Keep the original path when decoding fails.
    }

    return path.replace(/^\//, '');
  }

  private normalizeResourcePath(requestedUrl: string, pmxDirectory: string): string {
    const normalizedRequest = this.normalizePath(requestedUrl.split(/[?#]/, 1)[0]);
    const base = pmxDirectory && !normalizedRequest.startsWith(`${pmxDirectory}/`)
      ? `${pmxDirectory}/`
      : '';
    const parts = `${base}${normalizedRequest}`.split('/');
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
