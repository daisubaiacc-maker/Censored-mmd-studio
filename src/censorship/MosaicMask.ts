import * as THREE from 'three';

export interface MosaicRegion {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  enabled: boolean;
  pixelSize: number;
}

/** Screen-space mosaic mask data; renderer remains independent of region editing. */
export class MosaicMask {
  private regions: MosaicRegion[] = [];

  setRegions(regions: MosaicRegion[]): void {
    this.regions = regions.map((r) => ({ ...r, rect: { ...r.rect } }));
  }

  getRegions(): MosaicRegion[] {
    return this.regions.map((r) => ({ ...r, rect: { ...r.rect } }));
  }

  buildTexture(width: number, height: number): THREE.DataTexture {
    const data = new Uint8Array(width * height * 4);
    for (let i = 0; i < data.length; i += 4) data[i + 3] = 255;
    for (const region of this.regions) {
      if (!region.enabled) continue;
      const x0 = Math.max(0, Math.floor(region.rect.x));
      const y0 = Math.max(0, Math.floor(region.rect.y));
      const x1 = Math.min(width, Math.ceil(region.rect.x + region.rect.width));
      const y1 = Math.min(height, Math.ceil(region.rect.y + region.rect.height));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const i = (y * width + x) * 4;
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255;
      }
    }
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }
}
