import * as THREE from 'three';

export interface FocusTarget {
  id: string;
  object: THREE.Object3D;
  focusRadius?: number;
}

export interface FocusState {
  enabled: boolean;
  targetId: string | null;
  depthOfFieldEnabled: boolean;
  aperture: number;
  focusDistance: number;
}

/** Pointer-driven focus state, kept separate from censorship. */
export class FocusSystem {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly targets = new Map<string, FocusTarget>();
  private state: FocusState = {
    enabled: false,
    targetId: null,
    depthOfFieldEnabled: true,
    aperture: 0.02,
    focusDistance: 5,
  };

  registerTarget(target: FocusTarget): void { this.targets.set(target.id, target); }

  removeTarget(id: string): void {
    this.targets.delete(id);
    if (this.state.targetId === id) this.state.targetId = null;
  }

  setEnabled(enabled: boolean): void {
    this.state.enabled = enabled;
    if (!enabled) this.state.targetId = null;
  }

  setPointer(clientX: number, clientY: number, width: number, height: number): void {
    this.pointer.x = (clientX / width) * 2 - 1;
    this.pointer.y = -(clientY / height) * 2 + 1;
  }

  update(camera: THREE.Camera, scene: THREE.Scene): FocusState {
    if (!this.state.enabled) return { ...this.state };
    this.raycaster.setFromCamera(this.pointer, camera);
    const hit = this.raycaster.intersectObjects(scene.children, true)[0];
    if (!hit) {
      this.state.targetId = null;
      return { ...this.state };
    }
    this.state.focusDistance = hit.distance;
    this.state.targetId = this.findTargetId(hit.object);
    return { ...this.state };
  }

  getState(): FocusState { return { ...this.state }; }

  private findTargetId(object: THREE.Object3D): string | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      for (const [id, target] of this.targets) {
        if (target.object === current) return id;
      }
      current = current.parent;
    }
    return null;
  }
}
