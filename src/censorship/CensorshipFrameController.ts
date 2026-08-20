import * as THREE from 'three';
import { BoneBoundRegionTracker } from './BoneBoundRegionTracker';
import { RegionEditorModel } from './RegionEditorModel';
import { RegionOverlay } from './RegionOverlay';

/** Per-frame coordinator for model-bound censorship geometry. */
export class CensorshipFrameController {
  constructor(
    private readonly tracker: BoneBoundRegionTracker,
    private readonly regions: RegionEditorModel,
    private readonly overlay?: RegionOverlay,
  ) {}

  update(camera: THREE.Camera, viewport: HTMLElement): void {
    this.tracker.update(camera, viewport);
    this.overlay?.refresh();
  }

  getRegions() { return this.regions.all(); }
}
