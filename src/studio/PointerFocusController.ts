import * as THREE from 'three';
import { FocusSystem } from './FocusSystem';
import { DepthOfFieldSystem } from './DepthOfFieldSystem';

/** Wires viewport pointer movement into focus and optical state. */
export class PointerFocusController {
  constructor(
    private readonly focus: FocusSystem,
    private readonly dof: DepthOfFieldSystem,
  ) {}

  handlePointerMove(
    event: PointerEvent,
    element: HTMLElement,
    camera: THREE.Camera,
    scene: THREE.Scene,
  ): void {
    const rect = element.getBoundingClientRect();
    this.focus.setPointer(
      event.clientX - rect.left,
      event.clientY - rect.top,
      rect.width,
      rect.height,
    );
    const state = this.focus.update(camera, scene);
    this.dof.update(state.focusDistance);
  }
}
