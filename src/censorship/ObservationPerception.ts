import * as THREE from 'three';

export interface PerceptionConfig {
  /** Immediate protection when any protected target enters the camera frustum. */
  triggerOnVisibility: boolean;
  /** Normalized screen-space radius around the pointer where detail recognition is possible. */
  recognitionRadius: number;
  /** Optional dwell time for recognition when immediate visibility is disabled. */
  recognitionDwellMs: number;
}

export interface PerceivedTarget {
  id: string;
  visible: boolean;
  pointerDistance: number;
  recognizable: boolean;
}

/**
 * Separates optical focus from the larger visible/perceptible area.
 * The thresholds are deliberately configurable rather than claiming a fixed
 * model of human vision.
 */
export class ObservationPerception {
  private readonly raycaster = new THREE.Raycaster();

  constructor(private readonly config: PerceptionConfig) {}

  evaluate(
    target: { id: string; object: THREE.Object3D },
    pointerNdc: THREE.Vector2,
    camera: THREE.Camera,
  ): PerceivedTarget {
    const box = new THREE.Box3().setFromObject(target.object);
    if (box.isEmpty()) {
      return { id: target.id, visible: false, pointerDistance: Infinity, recognizable: false };
    }

    const center = box.getCenter(new THREE.Vector3());
    const projected = center.clone().project(camera);
    const visible = projected.z >= -1 && projected.z <= 1 &&
      projected.x >= -1 && projected.x <= 1 &&
      projected.y >= -1 && projected.y <= 1;

    const pointerDistance = Math.hypot(projected.x - pointerNdc.x, projected.y - pointerNdc.y);
    const recognizable = visible && pointerDistance <= this.config.recognitionRadius;

    return { id: target.id, visible, pointerDistance, recognizable };
  }
}
