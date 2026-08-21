export type CensorshipEffect = 'mosaic' | 'solid' | 'blur';
export type CensorshipRegionSpace = 'screen' | 'model';
export type CensorshipShape = 'rectangle' | 'ellipse' | 'circle' | 'custom';

export interface CensorshipBinding {
  modelId: string;
  boneName?: string;
  objectName?: string;
  /** Position relative to the bound object/bone. */
  localOffset?: [number, number, number];
}

export interface CensorshipObservationRule {
  targetId: string;
  activateOnFocus: boolean;
  activationGraceMs: number;
  latch: boolean;
}

export interface CensorshipModelTransform {
  /** Local position relative to the binding target. */
  position: [number, number, number];
  /** Local Euler rotation in radians. */
  rotation: [number, number, number];
  /** Physical 3D size. Never screen pixels. */
  width: number;
  height: number;
  /** Face the active camera while retaining the 3D anchor and size. */
  billboard: boolean;
}

export interface CensorshipScreenRect {
  /** CSS-pixel coordinates in the viewport. */
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Persistent censorship scene data. Model and screen regions use separate coordinate systems. */
export interface CensorshipRegion {
  id: string;
  space: CensorshipRegionSpace;
  shape: CensorshipShape;
  effect: CensorshipEffect;
  enabled: boolean;
  pixelSize?: number;
  color?: number;
  binding?: CensorshipBinding;
  model?: CensorshipModelTransform;
  screen?: CensorshipScreenRect;
  observation?: CensorshipObservationRule;
}
