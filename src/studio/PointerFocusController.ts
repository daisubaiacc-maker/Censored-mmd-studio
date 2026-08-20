import * as THREE from 'three';
import { FocusSystem } from './FocusSystem';
import { DepthOfFieldSystem } from './DepthOfFieldSystem';
import { PointerTargetResolver } from './PointerTargetResolver';

/** Wires viewport pointer movement into resolved 3D focus and optical state. */
export class PointerFocusController {
  constructor(
    private readonly focus: FocusSystem,
    private readonly dof: DepthOfFieldSystem,
    private readonly resolver: PointerTargetResolver,
  ) {}

  handlePointerMove(
    event: PointerEvent,
    element: HTMLElement,
    camera: THREE.Camera,
  ): void {
    const rect = element.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / width) * 2 - 1,
      -((event.clientY - rect.top) / height) * 2 + 1,
    );
    const resolved = this.resolver.resolve(ndc, camera);
    this.focus.setResolvedTarget(
      resolved?.target.id ?? null,
      resolved?.distance,
    );
    this.dof.update(this.focus.getState().focusDistance);
  }
}
