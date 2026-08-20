import * as THREE from 'three';
import { FocusTargetRegistry } from '../studio/FocusTargetRegistry';
import { RegionEditorModel } from './RegionEditorModel';

/** Creates a censorship region from a selected 3D target and keeps its target binding. */
export class RegionFromTargetController {
  constructor(
    private readonly targets: FocusTargetRegistry,
    private readonly regions: RegionEditorModel,
  ) {}

  createForTarget(targetId: string): string | null {
    const target = this.targets.get(targetId);
    if (!target) return null;

    const regionId = `censor:${targetId}`;
    if (this.regions.get(regionId)) return regionId;

    const region = {
      id: regionId,
      name: `Censorship: ${target.label ?? targetId}`,
      targetId,
      enabled: false,
      rect: { x: 0, y: 0, width: 0, height: 0 },
      bounds: new THREE.Box3(),
    };
    this.regions.add(region);
    return regionId;
  }
}
