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
  private readonly pointer = new THREE.Vector2();
  private readonly startPointer = new THREE.Vector2();
  private readonly startTarget = new THREE.Vector3();
  private readonly startPosition = new THREE.Vector3();
  private activeButton: number | null = null;
  private spherical = new THREE.Spherical();
  private startSpherical = new THREE.Spherical();

  constructor(options: StudioCameraControllerOptions) {
    this.camera = options.camera;
    this.domElement = options.domElement;
    this.updateSphericalFromCamera();
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerup', this.onPointerUp);
    this.domElement.addEventListener('pointercancel', this.onPointerUp);
    this.domElement.addEventListener('wheel', this.onWheel, { passive: false });
  }

  private onPointerDown = (event: PointerEvent): void => {
    // Middle mouse: orbit camera. Shift + middle mouse: pan camera.
    if (event.button !== 1) return;
    event.preventDefault();
    this.activeButton = event.button;
    this.pointer.set(event.clientX, event.clientY);
    this.startPointer.copy(this.pointer);
    this.startPosition.copy(this.camera.position);
    this.startTarget.copy(this.target);
    this.startSpherical.copy(this.spherical);
    this.domElement.setPointerCapture(event.pointerId);
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (this.activeButton !== 1) return;
    event.preventDefault();
    this.pointer.set(event.clientX, event.clientY);
    const dx = this.pointer.x - this.startPointer.x;
    const dy = this.pointer.y - this.startPointer.y;

    if (event.shiftKey) {
      this.camera.position.copy(this.startPosition);
      this.target.copy(this.startTarget);
      const distance = this.startSpherical.radius;
      const panScale = Math.max(distance, 0.1) * 0.002;
      const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0);
      const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 1);
      this.target.addScaledVector(right, -dx * panScale);
      this.target.addScaledVector(up, dy * panScale);
      this.camera.position.copy(this.target).add(this.camera.position.clone().sub(this.startTarget));
    } else {
      this.spherical.copy(this.startSpherical);
      this.spherical.theta -= dx * 0.005;
      this.spherical.phi -= dy * 0.005;
      this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.05, Math.PI - 0.05);
      this.updateCameraFromSpherical();
    }

    this.camera.lookAt(this.target);
  };

  private onPointerUp = (event: PointerEvent): void => {
    if (this.activeButton !== event.button) return;
    this.activeButton = null;
    if (this.domElement.hasPointerCapture(event.pointerId)) {
      this.domElement.releasePointerCapture(event.pointerId);
    }
  };

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.updateSphericalFromCamera();
    const zoomFactor = Math.exp(event.deltaY * 0.001);
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius * zoomFactor, 0.2, 100);
    this.updateCameraFromSpherical();
    this.camera.lookAt(this.target);
  };

  private updateSphericalFromCamera(): void {
    const offset = this.camera.position.clone().sub(this.target);
    this.spherical.setFromVector3(offset);
  }

  private updateCameraFromSpherical(): void {
    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(this.target).add(offset);
  }

  dispose(): void {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.domElement.removeEventListener('pointercancel', this.onPointerUp);
    this.domElement.removeEventListener('wheel', this.onWheel);
  }
}
