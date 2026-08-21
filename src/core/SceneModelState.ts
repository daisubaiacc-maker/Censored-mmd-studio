import * as THREE from 'three';
import type { SceneModelState } from './Project';

/** Converts runtime Three.js transforms into serializable project state. */
export function captureSceneModelState(modelId: string, object: THREE.Object3D): SceneModelState {
  return {
    modelId,
    position: [object.position.x, object.position.y, object.position.z],
    rotation: [object.rotation.x, object.rotation.y, object.rotation.z],
    scale: [object.scale.x, object.scale.y, object.scale.z],
    visible: object.visible,
  };
}

/** Applies saved project state to a runtime Three.js object. */
export function applySceneModelState(object: THREE.Object3D, state: SceneModelState): void {
  object.position.set(...state.position);
  object.rotation.set(...state.rotation);
  object.scale.set(...state.scale);
  object.visible = state.visible;
  object.updateMatrixWorld(true);
}
