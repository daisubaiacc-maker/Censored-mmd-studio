export type CensorshipEffect = 'mosaic' | 'solid' | 'blur';

/**
 * Screen-space censorship region.
 *
 * Keeping this as scene data (rather than DOM state) lets future versions
 * attach a region to a model, bone, or arbitrary 3D anchor and project it
 * into screen space every frame.
 */
export interface CensorshipRegion {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  effect: CensorshipEffect;
  enabled: boolean;
  pixelSize?: number;
  color?: number;
  /** Optional future binding to a scene object or MMD bone. */
  targetObjectId?: string;
  targetBoneName?: string;
}
