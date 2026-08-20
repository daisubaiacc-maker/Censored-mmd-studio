import type { Object3D } from 'three';
import { inspectMmdModel, type MmdModelMetadata } from './MmdModelMetadata';

export interface RegisteredMmdModel {
  id: string;
  root: Object3D;
  metadata: MmdModelMetadata;
}

/** Stable registry used by studio, posing, and censorship subsystems. */
export class ModelRegistry {
  private readonly models = new Map<string, RegisteredMmdModel>();

  register(id: string, root: Object3D): RegisteredMmdModel {
    const model = { id, root, metadata: inspectMmdModel(root) };
    this.models.set(id, model);
    return model;
  }

  get(id: string): RegisteredMmdModel | undefined {
    return this.models.get(id);
  }

  remove(id: string): boolean {
    return this.models.delete(id);
  }

  clear(): void {
    this.models.clear();
  }

  values(): IterableIterator<RegisteredMmdModel> {
    return this.models.values();
  }
}
