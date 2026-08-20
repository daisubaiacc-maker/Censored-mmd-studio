import * as THREE from 'three';
import { FocusTarget, FocusTargetRegistry } from './FocusTargetRegistry';
import { MmdTargetRegistrar } from './MmdTargetRegistrar';

export interface LoadedMmdModel {
  id: string;
  root: THREE.Object3D;
}

/** Bridges an MMD loader's successful result into the shared focus/censorship target registry. */
export class MmdLoadTargetBridge {
  constructor(
    private readonly registry: FocusTargetRegistry,
    private readonly registrar: MmdTargetRegistrar = new MmdTargetRegistrar(registry),
  ) {}

  onLoaded(model: LoadedMmdModel): FocusTarget[] {
    return this.registrar.registerModel(model.root, model.id);
  }

  onUnloaded(modelId: string): void {
    this.registrar.unregisterModel(modelId);
  }
}
