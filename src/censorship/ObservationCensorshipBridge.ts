import type { CensorshipRegion } from './CensorshipRegion';
import type { ObservationState } from './ObservationSystem';

/** Applies observation results to region activation without coupling focus to rendering. */
export class ObservationCensorshipBridge {
  apply(regions: CensorshipRegion[], observation: ObservationState): CensorshipRegion[] {
    return regions.map((region) => {
      if (!region.observation || region.observation.targetId !== observation.targetId) {
        return region;
      }

      return {
        ...region,
        enabled: observation.triggered,
      };
    });
  }
}
