export type CensorshipEffect = 'mosaic' | 'solid' | 'blur';
export type CensorshipRegionSpace = 'screen' | 'model';
export type CensorshipShape = 'rectangle' | 'ellipse' | 'circle' | 'custom';
export type CensorshipOrientation = 'world' | 'billboard' | 'screen';
export type CensorshipSizeMode = 'screen' | 'world';

export interface CensorshipBinding {
  modelId: string;
  boneName?: string;
  objectName?: string;
  offset?: [number, number, number];
}

export interface CensorshipObservationRule {
  targetId: string;
  activateOnFocus: boolean;
  activationGraceMs: number;
  latch: boolean;
}

/** Persistent censorship scene data. Optical focus and censorship stay separate. */
export interface CensorshipRegion {
  id: string;
  space: CensorshipRegionSpace;
  shape: CensorshipShape;
  orientation: CensorshipOrientation;
  sizeMode?: CensorshipSizeMode;
  x: number;
  y: number;
  width: number;
  height: number;
  worldWidth?: number;
  worldHeight?: number;
  rotation?: number;
  effect: CensorshipEffect;
  enabled: boolean;
  pixelSize?: number;
  color?: number;
  binding?: CensorshipBinding;
  observation?: CensorshipObservationRule;
}
