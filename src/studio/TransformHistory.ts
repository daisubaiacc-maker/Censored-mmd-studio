import * as THREE from 'three';
import type { Command } from '../core/CommandHistory';

export function createTransformCommand(
  object: THREE.Object3D,
  label: string,
  apply: () => void,
  before: THREE.Matrix4,
): Command {
  const after = new THREE.Matrix4();
  return {
    label,
    execute() {
      apply();
      object.updateMatrix();
      after.copy(object.matrix);
    },
    undo() {
      object.matrix.copy(before);
      object.matrix.decompose(object.position, object.quaternion, object.scale);
      object.rotation.setFromQuaternion(object.quaternion);
      object.updateMatrixWorld(true);
    },
  };
}
