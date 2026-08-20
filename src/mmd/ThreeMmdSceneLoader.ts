import * as THREE from 'three';
import { MmdSceneLoader, PmxPmdLoader } from './PmxPmdLoaderContract';
import { MmdLoadTargetBridge } from '../studio/MmdLoadTargetBridge';
import { MmdLoaderAdapter } from './MmdLoaderAdapter';

/** Concrete scene loader that registers every loaded MMD hierarchy for focus/censorship. */
export class ThreeMmdSceneLoader {
  private readonly sceneLoader: MmdSceneLoader;

  constructor(
    loader: PmxPmdLoader,
    private readonly scene: THREE.Scene,
    private readonly targets: MmdLoadTargetBridge,
  ) {
    this.sceneLoader = new MmdSceneLoader(loader, scene);
  }

  async load(url: string, modelId: string) {
    const result = await this.sceneLoader.load(url);
    const adapter = new MmdLoaderAdapter(this.targets);
    adapter.onLoad({ id: modelId, root: result.root });
    return result;
  }

  unload(modelId: string, root: THREE.Object3D): void {
    this.scene.remove(root);
    this.targets.onUnloaded(modelId);
  }
}
