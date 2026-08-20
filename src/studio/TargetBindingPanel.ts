import { FocusTargetRegistry } from './FocusTargetRegistry';
import { RegionEditorModel } from '../censorship/RegionEditorModel';

/** Studio panel for assigning one shared target ID to focus and censorship regions. */
export class TargetBindingPanel {
  readonly element = document.createElement('div');
  private readonly select = document.createElement('select');
  private readonly bindButton = document.createElement('button');
  private selectedRegionId: string | null = null;

  constructor(private readonly targets: FocusTargetRegistry, private readonly regions: RegionEditorModel) {
    this.element.className = 'target-binding-panel';
    this.bindButton.textContent = 'Bind selected region';
    this.bindButton.onclick = () => {
      if (this.selectedRegionId) this.regions.bind(this.selectedRegionId, this.select.value || null);
    };
    this.element.append(this.select, this.bindButton);
    this.refresh();
  }

  setRegion(regionId: string | null): void {
    this.selectedRegionId = regionId;
    const region = regionId ? this.regions.get(regionId) : undefined;
    this.select.value = region?.targetId ?? '';
  }

  refresh(): void {
    this.select.replaceChildren();
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'No target';
    this.select.appendChild(none);
    for (const target of this.targets.all()) {
      const option = document.createElement('option');
      option.value = target.id;
      option.textContent = `${target.kind}: ${target.label ?? target.id}`;
      this.select.appendChild(option);
    }
    if (this.selectedRegionId) this.setRegion(this.selectedRegionId);
  }
}
