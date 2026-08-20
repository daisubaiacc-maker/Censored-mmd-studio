import { ObservationSystem, type ObservationRule } from '../censorship/ObservationSystem';
import type { FocusState } from './FocusSystem';

export interface FocusObservationResult {
  targetId: string | null;
  observed: boolean;
  triggered: boolean;
}

/** Converts pointer focus frames into censorship-ready observation state. */
export class FocusObservationController {
  constructor(private readonly observation: ObservationSystem) {}

  update(focus: FocusState, deltaMs: number, rule: ObservationRule): FocusObservationResult {
    const state = this.observation.update(focus.targetId, deltaMs, rule);
    return {
      targetId: state.targetId,
      observed: state.observed,
      triggered: state.triggered,
    };
  }
}
