import * as THREE from 'three';

export interface StudioCameraControllerOptions {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
}

/** Desktop orbit/pan/zoom plus touch gestures. */
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
  private readonly touchPointers = new Map<number, THREE.Vector2>();
  private touchMode: 'orbit' | 'gesture' | null = null;
  private touchStartCenter = new THREE.Vector2();
  private touchStartDistance = 0;
  private touchStartTarget = new THREE.Vector3();
  private touchStartSpherical = new THREE.Spherical();
  private touchStartPosition = new THREE.Vector3();
  private touchStartRight = new THREE.Vector3();
  private touchStartUp = new THREE.Vector3();

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

  syncFromCamera(target?: THREE.Vector3): void {
    if (target) this.target.copy(target);
    this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      event.preventDefault();
      this.touchPointers.set(event.pointerId, new THREE.Vector2(event.clientX, event.clientY));
      if (this.touchPointers.size === 1) {
        this.touchMode = 'orbit';
        this.touchStartCenter.set(event.clientX, event.clientY);
        this.touchStartTarget.copy(this.target);
        this.touchStartSpherical.copy(this.spherical);
      } else if (this.touchPointers.size === 2) {
        this.beginTouchGesture();
      }
      this.domElement.setPointerCapture(event.pointerId);
      return;
    }

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
    if (event.pointerType === 'touch') {
      if (!this.touchPointers.has(event.pointerId)) return;
      event.preventDefault();
      this.touchPointers.get(event.pointerId)!.set(event.clientX, event.clientY);
      if (this.touchPointers.size === 1 && this.touchMode === 'orbit') {
        const dx = event.clientX - this.touchStartCenter.x;
        const dy = event.clientY - this.touchStartCenter.y;
        this.spherical.copy(this.touchStartSpherical);
        this.spherical.theta -= dx * 0.005;
        this.spherical.phi -= dy * 0.005;
        this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.05, Math.PI - 0.05);
        this.camera.position.copy(this.target).add(new THREE.Vector3().setFromSpherical(this.spherical));
        this.camera.lookAt(this.target);
      } else if (this.touchPointers.size === 2 && this.touchMode === 'gesture') {
        this.updateTouchGesture();
      }
      return;
    }

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
    if (event.pointerType === 'touch') {
      this.touchPointers.delete(event.pointerId);
      if (this.domElement.hasPointerCapture(event.pointerId)) this.domElement.releasePointerCapture(event.pointerId);
      if (this.touchPointers.size === 0) {
        this.touchMode = null;
        this.syncFromCamera();
      } else if (this.touchPointers.size === 1) {
        const remaining = [...this.touchPointers.values()][0];
        this.touchMode = 'orbit';
        this.touchStartCenter.copy(remaining);
        this.touchStartTarget.copy(this.target);
        this.touchStartSpherical.copy(this.spherical);
      }
      return;
    }

    if (this.activeButton !== event.button) return;
    this.activeButton = null;
    this.panMode = false;
    if (this.domElement.hasPointerCapture(event.pointerId)) this.domElement.releasePointerCapture(event.pointerId);
    this.syncFromCamera();
  };

  private beginTouchGesture(): void {
    const points = [...this.touchPointers.values()];
    const a = points[0];
    const b = points[1];
    this.touchStartCenter.set((a.x + b.x) * 0.5, (a.y + b.y) * 0.5);
    this.touchStartDistance = Math.max(1, a.distanceTo(b));
    this.touchStartTarget.copy(this.target);
    this.touchStartSpherical.copy(this.spherical);
    this.touchStartPosition.copy(this.camera.position);
    this.camera.updateMatrixWorld(true);
    this.touchStartRight.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.touchStartUp.setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
    this.touchMode = 'gesture';
  }

  private updateTouchGesture(): void {
    const points = [...this.touchPointers.values()];
    const a = points[0];
    const b = points[1];
    const centerX = (a.x + b.x) * 0.5;
    const centerY = (a.y + b.y) * 0.5;
    const dx = centerX - this.touchStartCenter.x;
    const dy = centerY - this.touchStartCenter.y;
    const panScale = Math.max(this.touchStartSpherical.radius, 0.1) * 0.002;

    this.target.copy(this.touchStartTarget)
      .addScaledVector(this.touchStartRight, -dx * panScale)
      .addScaledVector(this.touchStartUp, dy * panScale);
    this.camera.position.copy(this.touchStartPosition)
      .addScaledVector(this.touchStartRight, -dx * panScale)
      .addScaledVector(this.touchStartUp, dy * panScale);

    const distance = Math.max(1, a.distanceTo(b));
    this.spherical.copy(this.touchStartSpherical);
    this.spherical.radius = THREE.MathUtils.clamp(
      this.touchStartSpherical.radius * this.touchStartDistance / distance,
      0.2,
      100,
    );
    this.camera.position.copy(this.target).add(new THREE.Vector3().setFromSpherical(this.spherical));
    this.camera.lookAt(this.target);
  }

  private onWheel = (event: WheelEvent): void => {
    if (this.activeButton !== null || this.touchPointers.size > 0) return;
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
