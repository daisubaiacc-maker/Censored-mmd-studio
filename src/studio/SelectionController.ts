import * as THREE from 'three';

/** Keeps Studio selection state independent from presentation/UI. */
export class SelectionController {
  private selected: THREE.Object3D | null = null;

  select(object: THREE.Object3D | null): void {
    this.selected = object;
  }

  clear(): void {
    this.selected = null;
  }

  get selectedObject(): THREE.Object3D | null {
    return this.selected;
  }

  isSelected(object: THREE.Object3D): boolean {
    return this.selected === object;
  }
}
