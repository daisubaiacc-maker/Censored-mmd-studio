export type CensorshipEffect = 'mosaic' | 'solid' | 'blur';
export type CensorshipRegionSpace = 'screen' | 'model';
export type CensorshipShape = 'rectangle' | 'ellipse' | 'circle' | 'custom';
export type CensorshipOrientation = 'world' | 'billboard' | 'screen';

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
  /** screen = fixed viewport effect; model = anchored to a 3D model point. */
  space: CensorshipRegionSpace;
  shape: CensorshipShape;
  orientation: CensorshipOrientation;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Screen-space dimensions in CSS pixels. Used only when space is screen. */
  screenWidth?: number;
  screenHeight?: number;
  /** Real 3D dimensions. Used only when space is model. */
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
