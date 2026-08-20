import * as THREE from 'three';
import { FocusSystem } from './FocusSystem';
import { FocusTargetRegistry } from './FocusTargetRegistry';

/** Mirrors the shared target registry into the raycast-based focus system. */
export class FocusTargetRegistration {
  constructor(
    private readonly registry: FocusTargetRegistry,
    private readonly focus: FocusSystem,
  ) {}

  sync(): void {
    for (const target of this.registry.all()) {
      this.focus.registerTarget({
        id: target.id,
        object: target.object,
      });
    }
  }

  registerObject(id: string, object: THREE.Object3D): void {
    this.registry.register({ id, object, kind: 'object', label: object.name || id });
    this.sync();
  }
}
