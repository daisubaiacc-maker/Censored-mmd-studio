import * as THREE from 'three';

export interface DepthOfFieldState {
  enabled: boolean;
  focusDistance: number;
  aperture: number;
}

/** Camera-focus data for a future DOF post-processing pass. */
export class DepthOfFieldSystem {
  private state: DepthOfFieldState = {
    enabled: true,
    focusDistance: 5,
    aperture: 0.02,
  };

  update(focusDistance: number): void {
    this.state.focusDistance = Math.max(0.01, focusDistance);
  }

  setEnabled(enabled: boolean): void { this.state.enabled = enabled; }
  setAperture(aperture: number): void { this.state.aperture = Math.max(0, aperture); }
  getState(): DepthOfFieldState { return { ...this.state }; }

  /** Reserved for wiring a real DOF pass without coupling it to FocusSystem. */
  applyToCamera(_camera: THREE.Camera): void {
    // Intentionally empty until the renderer pass is introduced.
  }
}
