import * as THREE from 'three';

export type FocusTargetKind = 'object' | 'mesh' | 'bone';

export interface FocusTargetMetadata {
  id: string;
  kind: FocusTargetKind;
  object: THREE.Object3D;
  modelId?: string;
  label?: string;
}

/** Central registry shared by focus, DOF, observation, and future UI tools. */
export class FocusTargetRegistry {
  private readonly targets = new Map<string, FocusTargetMetadata>();

  register(target: FocusTargetMetadata): void { this.targets.set(target.id, target); }
  remove(id: string): void { this.targets.delete(id); }
  get(id: string): FocusTargetMetadata | undefined { return this.targets.get(id); }
  all(): FocusTargetMetadata[] { return [...this.targets.values()]; }

  registerModel(modelId: string, root: THREE.Object3D): void {
    root.traverse((object) => {
      if (object instanceof THREE.Bone) {
        this.register({ id: `${modelId}:bone:${object.name}`, kind: 'bone', object, modelId, label: object.name });
      } else if (object instanceof THREE.SkinnedMesh) {
        this.register({ id: `${modelId}:mesh:${object.uuid}`, kind: 'mesh', object, modelId, label: object.name || object.uuid });
      }
    });
  }
}
