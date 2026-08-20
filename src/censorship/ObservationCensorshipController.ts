import { CensorshipFocusBinding } from './CensorshipFocusBinding';
import { ObservationRule } from './ObservationSystem';
import { RegionEditorModel } from './RegionEditorModel';

/** Applies observation triggers to censorship state without coupling input to rendering. */
export class ObservationCensorshipController {
  constructor(
    private readonly binding: CensorshipFocusBinding,
    private readonly regions: RegionEditorModel,
  ) {}

  update(targetId: string | null, deltaMs: number, rule: ObservationRule): string[] {
    const activated = this.binding.update(targetId, deltaMs, rule);
    for (const id of activated) {
      const region = this.regions.get(id);
      if (region) {
        region.enabled = true;
        this.regions.add(region);
      }
    }
    return activated;
  }

  reset(regionId?: string): void {
    const targets = regionId ? [this.regions.get(regionId)].filter(Boolean) : this.regions.all();
    for (const region of targets) {
      if (!region) continue;
      region.enabled = false;
      this.regions.add(region);
    }
  }
}
