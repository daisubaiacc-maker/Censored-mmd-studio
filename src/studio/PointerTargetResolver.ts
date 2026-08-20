import * as THREE from 'three';
import { FocusTarget, FocusTargetRegistry } from './FocusTargetRegistry';

/** Resolves the current pointer position to the nearest registered MMD target hit by the camera ray. */
export class PointerTargetResolver {
  private readonly raycaster = new THREE.Raycaster();

  constructor(private readonly registry: FocusTargetRegistry) {}

  resolve(pointer: THREE.Vector2, camera: THREE.Camera): FocusTarget | null {
    this.raycaster.setFromCamera(pointer, camera);
    let best: { target: FocusTarget; distance: number } | null = null;

    for (const target of this.registry.all()) {
      const object = target.object;
      if (!(object instanceof THREE.Object3D)) continue;
      const hits = this.raycaster.intersectObject(object, true);
      if (hits.length === 0) continue;
      const distance = hits[0].distance;
      if (!best || distance < best.distance) best = { target, distance };
    }

    return best?.target ?? null;
  }
}
