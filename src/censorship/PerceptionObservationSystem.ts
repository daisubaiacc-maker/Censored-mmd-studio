export type PerceptionLevel = 'outside' | 'peripheral' | 'recognizable' | 'focused';

export interface PerceptionSample {
  targetId: string | null;
  angularDistance: number;
  inView: boolean;
}

export interface PerceptionRule {
  /** Maximum normalized angular distance at which the target is still recognizable. */
  recognitionRadius: number;
  /** Maximum normalized distance considered truly focused. */
  focusRadius: number;
  /** Trigger protection as soon as a target enters the camera view. */
  triggerOnEnterView: boolean;
  /** Trigger protection when the target becomes recognizable, without requiring exact focus. */
  triggerOnRecognition: boolean;
  /** Optional dwell time for the focused state. */
  focusedDwellMs: number;
}

export interface PerceptionState {
  targetId: string | null;
  level: PerceptionLevel;
  elapsedFocusedMs: number;
  triggered: boolean;
}

/**
 * Separates optical focus from visual perception.
 * A target can be visible and recognizable without being the current focus.
 */
export class PerceptionObservationSystem {
  private state: PerceptionState = {
    targetId: null,
    level: 'outside',
    elapsedFocusedMs: 0,
    triggered: false,
  };

  update(sample: PerceptionSample, deltaMs: number, rule: PerceptionRule): PerceptionState {
    const level = !sample.inView
      ? 'outside'
      : sample.angularDistance <= rule.focusRadius
        ? 'focused'
        : sample.angularDistance <= rule.recognitionRadius
          ? 'recognizable'
          : 'peripheral';

    if (sample.targetId !== this.state.targetId) {
      this.state.targetId = sample.targetId;
      this.state.elapsedFocusedMs = 0;
      this.state.triggered = false;
    }

    this.state.level = level;

    if (level === 'focused') {
      this.state.elapsedFocusedMs += Math.max(0, deltaMs);
    } else {
      this.state.elapsedFocusedMs = 0;
    }

    if (sample.inView && rule.triggerOnEnterView) this.state.triggered = true;
    if ((level === 'recognizable' || level === 'focused') && rule.triggerOnRecognition) {
      this.state.triggered = true;
    }
    if (level === 'focused' && this.state.elapsedFocusedMs >= rule.focusedDwellMs) {
      this.state.triggered = true;
    }

    return { ...this.state };
  }

  reset(): void {
    this.state = { targetId: null, level: 'outside', elapsedFocusedMs: 0, triggered: false };
  }

  getState(): PerceptionState {
    return { ...this.state };
  }
}
