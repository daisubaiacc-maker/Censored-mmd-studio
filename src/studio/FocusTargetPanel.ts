import { FocusTargetRegistry } from './FocusTargetRegistry';
import { RegionEditorModel } from '../censorship/RegionEditorModel';

export class FocusTargetPanel {
  readonly element = document.createElement('select');

  constructor(private readonly targets: FocusTargetRegistry, private readonly regions: RegionEditorModel) {
    this.element.className = 'focus-target-panel';
    this.refresh();
  }

  refresh(): void {
    this.element.replaceChildren();
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'No target';
    this.element.appendChild(none);
    for (const target of this.targets.all()) {
      const option = document.createElement('option');
      option.value = target.id;
      option.textContent = `${target.kind}: ${target.label ?? target.id}`;
      this.element.appendChild(option);
    }
  }

  bindRegion(regionId: string): void {
    this.regions.bind(regionId, this.element.value || null);
  }
}
