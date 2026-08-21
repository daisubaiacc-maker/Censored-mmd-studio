import * as THREE from 'three';

export interface StudioOrbitOptions {
  distance?: number;
  azimuth?: number;
  elevation?: number;
  minDistance?: number;
  maxDistance?: number;
}

/** Mouse orbit camera for Studio mode. The camera remains independent from the scene/model. */
export class StudioOrbitController {
  private target = new THREE.Vector3();
  private distance: number;
  private azimuth: number;
  private elevation: number;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private readonly minDistance: number;
  private readonly maxDistance: number;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly viewport: HTMLElement,
    options: StudioOrbitOptions = {},
  ) {
    this.distance = options.distance ?? 5;
    this.azimuth = options.azimuth ?? 0;
    this.elevation = options.elevation ?? 0.15;
    this.minDistance = options.minDistance ?? 0.25;
    this.maxDistance = options.maxDistance ?? 100;

    viewport.addEventListener('pointerdown', this.onPointerDown);
    viewport.addEventListener('pointermove', this.onPointerMove);
    viewport.addEventListener('pointerup', this.onPointerUp);
    viewport.addEventListener('pointercancel', this.onPointerUp);
    viewport.addEventListener('wheel', this.onWheel, { passive: false });
  }

  setTarget(target: THREE.Vector3): void {
    this.target.copy(target);
    this.apply();
  }

  setDistance(distance: number): void {
    this.distance = THREE.MathUtils.clamp(distance, this.minDistance, this.maxDistance);
    this.apply();
  }

  update(): void {
    this.apply();
  }

  private apply(): void {
    const cosElevation = Math.cos(this.elevation);
    this.camera.position.set(
      this.target.x + this.distance * cosElevation * Math.sin(this.azimuth),
      this.target.y + this.distance * Math.sin(this.elevation),
      this.target.z + this.distance * cosElevation * Math.cos(this.azimuth),
    );
    this.camera.lookAt(this.target);
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return;
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.viewport.setPointerCapture(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.dragging) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
    this.azimuth -= dx * 0.01;
    this.elevation = THREE.MathUtils.clamp(this.elevation - dy * 0.01, -1.45, 1.45);
    this.apply();
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    this.dragging = false;
    if (this.viewport.hasPointerCapture(event.pointerId)) {
      this.viewport.releasePointerCapture(event.pointerId);
    }
  };

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.setDistance(this.distance * Math.exp(event.deltaY * 0.001));
  };

  dispose(): void {
    this.viewport.removeEventListener('pointerdown', this.onPointerDown);
    this.viewport.removeEventListener('pointermove', this.onPointerMove);
    this.viewport.removeEventListener('pointerup', this.onPointerUp);
    this.viewport.removeEventListener('pointercancel', this.onPointerUp);
    this.viewport.removeEventListener('wheel', this.onWheel);
  }
}
