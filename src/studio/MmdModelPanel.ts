import { MmdFilePicker } from '../mmd/MmdFilePicker';
import { MmdSceneLoader } from '../mmd/PmxPmdLoaderContract';
import { MmdLoadTargetBridge } from './MmdLoadTargetBridge';

export interface LoadedModelEntry { id: string; label: string; }

/** Minimal model-management UI; rendering and target registration stay in their own layers. */
export class MmdModelPanel {
  readonly element = document.createElement('section');
  private readonly loadButton = document.createElement('button');
  private readonly list = document.createElement('ul');
  private readonly entries = new Map<string, LoadedModelEntry>();

  constructor(
    private readonly picker: MmdFilePicker,
    private readonly sceneLoader: MmdSceneLoader,
    private readonly targets: MmdLoadTargetBridge,
  ) {
    this.element.className = 'mmd-model-panel';
    this.loadButton.textContent = 'Load PMX / PMD';
    this.loadButton.onclick = () => void this.loadModel();
    this.element.append(this.loadButton, this.list);
  }

  private async loadModel(): Promise<void> {
    const selected = await this.picker.pick();
    if (!selected) return;
    const id = `${selected.file.name}:${crypto.randomUUID()}`;
    try {
      const result = await this.sceneLoader.load(selected.url);
      const entry = { id, label: selected.file.name };
      this.entries.set(id, entry);
      this.targets.onLoaded({ id, root: result.root });
      this.renderList();
    } finally {
      URL.revokeObjectURL(selected.url);
    }
  }

  removeModel(id: string): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    this.targets.onUnloaded(id);
    this.entries.delete(id);
    this.renderList();
  }

  private renderList(): void {
    this.list.replaceChildren();
    for (const entry of this.entries.values()) {
      const item = document.createElement('li');
      item.textContent = entry.label;
      this.list.appendChild(item);
    }
  }
}
