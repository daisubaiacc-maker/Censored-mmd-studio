import * as THREE from 'three';
import { applySceneModelState, captureSceneModelState } from './SceneModelState';
import type { ProjectData, SceneData } from './Project';
import type { ModelRegistry } from '../mmd/ModelRegistry';

/** Keeps the serializable project scene synchronized with runtime model objects. */
export class ProjectSceneController {
  constructor(
    private readonly project: ProjectData,
    private readonly registry: ModelRegistry,
  ) {}

  get activeScene(): SceneData {
    const scene = this.project.scenes[0];
    if (!scene) throw new Error('Project has no scene.');
    return scene;
  }

  registerModel(modelId: string, source: string, name?: string): void {
    if (!this.project.models.some((model) => model.id === modelId)) {
      this.project.models.push({ id: modelId, source, name });
    }
  }

  captureModel(modelId: string): void {
    const registered = this.registry.get(modelId);
    if (!registered) throw new Error(`Model is not registered: ${modelId}`);

    const state = captureSceneModelState(modelId, registered.root);
    const scene = this.activeScene;
    const index = scene.models.findIndex((item) => item.modelId === modelId);
    if (index >= 0) scene.models[index] = state;
    else scene.models.push(state);
  }

  applySceneToRuntime(): void {
    for (const state of this.activeScene.models) {
      const registered = this.registry.get(state.modelId);
      if (registered) applySceneModelState(registered.root, state);
    }
  }

  captureAll(): void {
    for (const model of this.registry.values()) {
      this.captureModel(model.id);
    }
  }
}

/** Helper for copying a scene into a fresh THREE.Scene without changing project data. */
export function addRegisteredModelsToScene(scene: THREE.Scene, registry: ModelRegistry): void {
  for (const model of registry.values()) scene.add(model.root);
}
