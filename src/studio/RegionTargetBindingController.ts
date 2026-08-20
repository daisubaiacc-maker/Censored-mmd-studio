import { FocusTargetRegistry } from './FocusTargetRegistry';
import { RegionEditorModel } from '../censorship/RegionEditorModel';
import { TargetBindingPanel } from './TargetBindingPanel';

/** Keeps region selection and target binding UI synchronized. */
export class RegionTargetBindingController {
  constructor(
    private readonly panel: TargetBindingPanel,
    private readonly targets: FocusTargetRegistry,
    private readonly regions: RegionEditorModel,
  ) {}

  selectRegion(regionId: string | null): void {
    this.panel.setRegion(regionId);
  }

  refresh(): void {
    this.panel.refresh();
  }

  bindSelectedTarget(regionId: string, targetId: string | null): void {
    if (!this.regions.get(regionId)) return;
    if (targetId && !this.targets.get(targetId)) return;
    this.regions.bind(regionId, targetId);
    this.panel.setRegion(regionId);
  }
}
