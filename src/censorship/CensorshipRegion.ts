export type CensorshipEffect = 'mosaic' | 'solid' | 'blur';
export type CensorshipRegionSpace = 'screen' | 'model';

export interface CensorshipBinding {
  modelId: string;
  boneName?: string;
  objectName?: string;
  offset?: [number, number, number];
}

export interface CensorshipObservationRule {
  activateOnFocus: boolean;
  activationGraceMs: number;
}

/** Persistent censorship scene data. Optical focus and censorship stay separate. */
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
  observation?: CensorshipObservationRule;
}
