import * as THREE from 'three';

export interface StudioViewportOptions {
  container: HTMLElement;
}

/** Persistent render surface shared by future Studio and first-person modes. */
export class StudioViewport {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(45, 1, 0.01, 1000);
  readonly renderer: THREE.WebGLRenderer;
  private readonly resizeObserver: ResizeObserver;

  constructor(options: StudioViewportOptions) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    options.container.appendChild(this.renderer.domElement);
    this.camera.position.set(0, 1.4, 4);
    this.camera.lookAt(0, 1, 0);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 2));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(2, 4, 3);
    this.scene.add(key);
    this.resizeObserver = new ResizeObserver(() => this.resize(options.container));
    this.resizeObserver.observe(options.container);
    this.resize(options.container);
  }

  addPreviewObject(object: THREE.Object3D): void {
    this.scene.add(object);
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
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
