import * as THREE from 'three';

export interface StudioCameraControllerOptions {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
}

/** Desktop orbit/pan/zoom camera controls. Pointer handling is kept separate from model transforms. */
export class StudioCameraController {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly domElement: HTMLElement;
  private readonly target = new THREE.Vector3(0, 1, 0);
  private readonly startPointer = new THREE.Vector2();
  private readonly startTarget = new THREE.Vector3();
  private readonly startPosition = new THREE.Vector3();
  private readonly startRight = new THREE.Vector3();
  private readonly startUp = new THREE.Vector3();
  private activeButton: number | null = null;
  private panMode = false;
  private spherical = new THREE.Spherical();
  private startSpherical = new THREE.Spherical();

  constructor(options: StudioCameraControllerOptions) {
    this.camera = options.camera;
    this.domElement = options.domElement;
    this.syncFromCamera();
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
    this.domElement.addEventListener('pointercancel', this.onPointerUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false });
  }

  /** Call this after external code changes the camera or its framing target. */
  syncFromCamera(target?: THREE.Vector3): void {
    if (target) this.target.copy(target);
    this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 1) return;
    event.preventDefault();
    this.activeButton = event.button;
    this.panMode = event.shiftKey;
    this.startPointer.set(event.clientX, event.clientY);
    this.startPosition.copy(this.camera.position);
    this.startTarget.copy(this.target);
    this.startSpherical.copy(this.spherical);

    this.camera.updateMatrixWorld(true);
    this.startRight.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.startUp.setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
    this.domElement.setPointerCapture(event.pointerId);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (this.activeButton !== 1) return;
    event.preventDefault();
    const dx = event.clientX - this.startPointer.x;
    const dy = event.clientY - this.startPointer.y;

    if (this.panMode) {
      const panScale = Math.max(this.startSpherical.radius, 0.1) * 0.002;
      this.target.copy(this.startTarget)
        .addScaledVector(this.startRight, -dx * panScale)
        .addScaledVector(this.startUp, dy * panScale);
      this.camera.position.copy(this.startPosition)
        .addScaledVector(this.startRight, -dx * panScale)
        .addScaledVector(this.startUp, dy * panScale);
    } else {
      this.spherical.copy(this.startSpherical);
      this.spherical.theta -= dx * 0.005;
      this.spherical.phi -= dy * 0.005;
      this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.05, Math.PI - 0.05);
      this.camera.position.copy(this.target).add(new THREE.Vector3().setFromSpherical(this.spherical));
    }

    this.camera.lookAt(this.target);
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (this.activeButton !== event.button) return;
    this.activeButton = null;
    this.panMode = false;
    if (this.domElement.hasPointerCapture(event.pointerId)) {
      this.domElement.releasePointerCapture(event.pointerId);
    }
    this.syncFromCamera();
  };

  private onWheel = (event: WheelEvent): void => {
    if (this.activeButton !== null) return;
    event.preventDefault();
    this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
    const zoomFactor = Math.exp(event.deltaY * 0.001);
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius * zoomFactor, 0.2, 100);
    this.camera.position.copy(this.target).add(new THREE.Vector3().setFromSpherical(this.spherical));
    this.camera.lookAt(this.target);
  };

  dispose(): void {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.removeEventListener('pointercancel', this.onPointerUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }
}
