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
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();
  private readonly pointerDown = new THREE.Vector2();
  private readonly selectableRoots = new Set<THREE.Object3D>();
  private pointerMoved = false;
  private censorshipSelectionMode = false;

  /** Called when a selectable model root is clicked in the viewport. */
  onObjectSelected: ((object: THREE.Object3D) => void) | null = null;
  /** Called when a mesh is clicked while censorship editing is enabled. */
  onMeshSelected: ((mesh: THREE.Mesh) => void) | null = null;

  constructor(options: StudioViewportOptions) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    options.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('contextmenu', this.handleContextMenu);
    this.renderer.domElement.addEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.addEventListener('pointerup', this.handlePointerUp);
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

  setSelectableRoots(objects: Iterable<THREE.Object3D>): void {
    this.selectableRoots.clear();
    for (const object of objects) this.selectableRoots.add(object);
  }

  setCensorshipSelectionMode(enabled: boolean): void {
    this.censorshipSelectionMode = enabled;
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
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('pointermove', this.handlePointerMove);
    this.renderer.domElement.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    this.pointerDown.set(event.clientX, event.clientY);
    this.pointerMoved = false;
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if ((event.buttons & 1) === 0) return;
    const dx = event.clientX - this.pointerDown.x;
    const dy = event.clientY - this.pointerDown.y;
    if (dx * dx + dy * dy > 16) this.pointerMoved = true;
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (event.button !== 0 || this.pointerMoved) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);

    if (this.censorshipSelectionMode) {
      const hits = this.raycaster.intersectObjects([...this.selectableRoots], true);
      const meshHit = hits.find((hit) => hit.object instanceof THREE.Mesh);
      if (meshHit?.object instanceof THREE.Mesh) this.onMeshSelected?.(meshHit.object);
      return;
    }

    const roots = [...this.selectableRoots];
    const hits = this.raycaster.intersectObjects(roots, true);
    if (hits.length === 0) return;
    let selected = hits[0].object;
    while (selected.parent && !this.selectableRoots.has(selected)) selected = selected.parent;
    if (this.selectableRoots.has(selected)) this.onObjectSelected?.(selected);
  };

  private readonly handleContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
  };
}
