export interface ObservationRule {
  /** Time in milliseconds the user must continuously focus a target. */
  dwellMs: number;
  /** Whether focusing is enough to trigger the protected state. */
  enabled: boolean;
  /** Once triggered, keep the region protected until explicitly reset. */
  latch: boolean;
}

export interface ObservationState {
  targetId: string | null;
  elapsedMs: number;
  observed: boolean;
  triggered: boolean;
}

/**
 * Converts focus information into an explicit observation event.
 * Optical focus and censorship remain separate systems: this class only
 * decides whether a protected target has been intentionally observed.
 */
export class ObservationSystem {
  private state: ObservationState = {
    targetId: null,
    elapsedMs: 0,
    observed: false,
    triggered: false,
  };

  update(targetId: string | null, deltaMs: number, rule: ObservationRule): ObservationState {
    if (!rule.enabled || !targetId) {
      if (!rule.latch) this.reset();
      return { ...this.state };
    }

    if (this.state.targetId !== targetId) {
      this.state.targetId = targetId;
      this.state.elapsedMs = 0;
      this.state.observed = false;
      if (!rule.latch) this.state.triggered = false;
    }

    if (!this.state.triggered || !rule.latch) {
      this.state.elapsedMs += Math.max(0, deltaMs);
      this.state.observed = this.state.elapsedMs >= rule.dwellMs;
      if (this.state.observed) this.state.triggered = true;
    }

    return { ...this.state };
  }

  reset(): void {
    this.state = { targetId: null, elapsedMs: 0, observed: false, triggered: false };
  }

  getState(): ObservationState { return { ...this.state }; }
}
