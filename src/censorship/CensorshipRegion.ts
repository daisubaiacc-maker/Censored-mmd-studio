export type CensorshipEffect = 'mosaic' | 'solid' | 'blur';

export type CensorshipRegionSpace = 'screen' | 'model';

export interface CensorshipBinding {
  modelId: string;
  boneName?: string;
  objectName?: string;
  offset?: [number, number, number];
}

/**
 * Persistent censorship scene data.
 *
 * Screen-space regions are useful for manual framing. Model-space bindings
 * are the long-term path for regions that follow bones/objects as the camera
 * and pose change.
 */
export interface CensorshipRegion {
  id: string;
  space: CensorshipRegionSpace;
  x: number;
  y: number;
  width: number;
  height: number;
  effect: CensorshipEffect;
  enabled: boolean;
  pixelSize?: number;
  color?: number;
  binding?: CensorshipBinding;
}
