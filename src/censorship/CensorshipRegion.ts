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
  /** Focus target that must be intentionally observed. */
  targetId: string;
  /** Whether observation can activate this region. */
  activateOnFocus: boolean;
  /** Continuous focus time required before activation. */
  activationGraceMs: number;
  /** Keep the region active after activation until reset. */
  latch: boolean;
}

/** Persistent censorship scene data. Optical focus and censorship stay separate. */
export interface CensorshipRegion {
  id: string;
  space: CensorshipRegionSpace;
  shape: CensorshipShape;
  orientation: CensorshipOrientation;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  effect: CensorshipEffect;
  enabled: boolean;
  pixelSize?: number;
  color?: number;
  binding?: CensorshipBinding;
  observation?: CensorshipObservationRule;
}
