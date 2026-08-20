import { FocusTarget, FocusTargetRegistry } from './FocusTargetRegistry';

export interface ModelTargetGroup {
  modelId: string;
  label: string;
  targets: FocusTarget[];
}

/** Presents registered MMD targets grouped by model for editor-side selection. */
export class ModelTargetPanel {
  readonly element = document.createElement('div');
  private readonly list = document.createElement('div');
  private selectedTargetId: string | null = null;
  private onSelect?: (targetId: string) => void;

  constructor(private readonly registry: FocusTargetRegistry) {
    this.element.className = 'model-target-panel';
    this.element.appendChild(this.list);
    this.refresh();
  }

  setSelectionHandler(handler: (targetId: string) => void): void {
    this.onSelect = handler;
  }

  getSelectedTargetId(): string | null {
    return this.selectedTargetId;
  }

  refresh(): void {
    this.list.replaceChildren();
    const groups = new Map<string, ModelTargetGroup>();
    for (const target of this.registry.all()) {
      const separator = target.id.indexOf(':');
      const modelId = separator > 0 ? target.id.slice(0, separator) : 'unowned';
      let group = groups.get(modelId);
      if (!group) {
        group = { modelId, label: modelId, targets: [] };
        groups.set(modelId, group);
      }
      group.targets.push(target);
    }

    for (const group of groups.values()) {
      const section = document.createElement('section');
      const heading = document.createElement('h4');
      heading.textContent = group.label;
      section.appendChild(heading);
      for (const target of group.targets) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `${target.kind}: ${target.label ?? target.id}`;
        button.dataset.targetId = target.id;
        button.onclick = () => {
          this.selectedTargetId = target.id;
          this.onSelect?.(target.id);
        };
        section.appendChild(button);
      }
      this.list.appendChild(section);
    }
  }
}
