import * as THREE from 'three';
import { MmdAssetLoader, MmdAsset } from '../mmd/MmdAssetLoader';
import { FocusSystem } from './FocusSystem';
import { DepthOfFieldSystem } from './DepthOfFieldSystem';
import { FocusTargetRegistry } from './FocusTargetRegistry';
import { PointerFocusController } from './PointerFocusController';

export class StudioShell {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  readonly focus = new FocusSystem();
  readonly dof = new DepthOfFieldSystem();
  readonly targets = new FocusTargetRegistry();
  readonly pointerFocus = new PointerFocusController(this.focus, this.dof);
  readonly loader = new MmdAssetLoader();

  private currentModel: MmdAsset | null = null;

  async loadModel(url: string, modelId = 'model-1'): Promise<MmdAsset> {
    if (this.currentModel) this.scene.remove(this.currentModel.root);
    const asset = await this.loader.load(url);
    this.currentModel = asset;
    this.scene.add(asset.root);
    this.targets.registerModel(modelId, asset.root);
    return asset;
  }

  enablePointerFocus(enabled = true): void {
    this.focus.setEnabled(enabled);
  }

  handlePointerMove(event: PointerEvent, element: HTMLElement): void {
    this.pointerFocus.handlePointerMove(event, element, this.camera, this.scene);
  }
}
