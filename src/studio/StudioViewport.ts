import * as THREE from 'three';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { StudioCameraController } from './StudioCameraController';

export interface StudioViewportOptions {
  container: HTMLElement;
}

/** Persistent render surface shared by future Studio and first-person modes. */
export class StudioViewport {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
  readonly renderer: THREE.WebGLRenderer;
  readonly transformControls: TransformControls;
  readonly cameraController: StudioCameraController;
  private readonly resizeObserver: ResizeObserver;

  constructor(options: StudioViewportOptions) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    options.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('contextmenu', this.handleContextMenu);
    this.camera.position.set(0, 1.4, 4);
    this.camera.lookAt(0, 1, 0);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(2, 4, 3);
    this.scene.add(key);

    this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
    this.transformControls.setSpace('world');
    this.scene.add(this.transformControls.getHelper());

    this.cameraController = new StudioCameraController({
      camera: this.camera,
      domElement: this.renderer.domElement,
    });

    this.resizeObserver = new ResizeObserver(() => this.resize(options.container));
    this.resizeObserver.observe(options.container);
    this.resize(options.container);
  }

  addPreviewObject(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  attachTransform(object: THREE.Object3D | null): void {
    if (object) this.transformControls.attach(object);
    else this.transformControls.detach();
  }

  setTransformMode(mode: 'translate' | 'rotate' | 'scale'): void {
    this.transformControls.setMode(mode);
  }

  resize(container: HTMLElement): void {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  render(): void {
    this.scene.updateMatrixWorld(true);
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.resizeObserver.disconnect();
    this.transformControls.dispose();
    this.cameraController.dispose();
    this.renderer.domElement.removeEventListener('contextmenu', this.handleContextMenu);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private readonly handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };
}
