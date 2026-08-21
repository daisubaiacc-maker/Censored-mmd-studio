import * as THREE from 'three';

export type TransformMode = 'translate' | 'rotate' | 'scale';

/** Small runtime transform controller kept independent from UI widgets. */
export class TransformController {
  private selected: THREE.Object3D | null = null;
  private mode: TransformMode = 'translate';

  select(object: THREE.Object3D | null): void {
    this.selected = object;
  }

  get selectedObject(): THREE.Object3D | null {
    return this.selected;
  }

  setMode(mode: TransformMode): void {
    this.mode = mode;
  }

  getMode(): TransformMode {
    return this.mode;
  }

  translate(delta: THREE.Vector3): void {
    if (!this.selected) return;
    this.selected.position.add(delta);
  }

  rotate(delta: THREE.Euler): void {
    if (!this.selected) return;
    this.selected.rotation.x += delta.x;
    this.selected.rotation.y += delta.y;
    this.selected.rotation.z += delta.z;
  }

  scale(factor: THREE.Vector3): void {
    if (!this.selected) return;
    this.selected.scale.multiply(factor);
  }
}
