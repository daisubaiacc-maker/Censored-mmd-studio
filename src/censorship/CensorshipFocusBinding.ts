import { ObservationSystem, ObservationRule } from './ObservationSystem';
import { RegionEditorModel } from './RegionEditorModel';

/** Connects focused target observation to editable censorship regions. */
export class CensorshipFocusBinding {
  constructor(
    private readonly observations: ObservationSystem,
    private readonly regions: RegionEditorModel,
  ) {}

  update(targetId: string | null, deltaMs: number, rule: ObservationRule): string[] {
    const state = this.observations.update(targetId, deltaMs, rule);
    if (!state.triggered) return [];

    const activated: string[] = [];
    for (const region of this.regions.all()) {
      if (region.targetId === targetId && !region.enabled) {
        activated.push(region.id);
      }
    }
    return activated;
  }
}
