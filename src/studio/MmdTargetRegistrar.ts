import * as THREE from 'three';
import { FocusTargetRegistry, FocusTarget } from './FocusTargetRegistry';

/** Registers a loaded MMD hierarchy's meshes and bones as stable studio targets. */
export class MmdTargetRegistrar {
  constructor(private readonly registry: FocusTargetRegistry) {}

  registerModel(root: THREE.Object3D, modelId: string): FocusTarget[] {
    const registered: FocusTarget[] = [];
    root.traverse((object) => {
      if (object === root) return;
      const targetId = `${modelId}:${object.uuid}`;
      const kind: FocusTarget['kind'] = object.type === 'Bone' ? 'bone' : object.type === 'SkinnedMesh' ? 'mesh' : 'object';
      const target = { id: targetId, kind, label: object.name || object.type, object } as FocusTarget;
      this.registry.add(target);
      registered.push(target);
    });
    return registered;
  }

  unregisterModel(modelId: string): void {
    for (const target of this.registry.all()) {
      if (target.id.startsWith(`${modelId}:`)) this.registry.remove(target.id);
    }
  }
}
