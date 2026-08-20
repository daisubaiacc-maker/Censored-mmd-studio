import { MmdFilePicker } from './MmdFilePicker';
import { StudioShell } from './StudioShell';

export class StudioUI {
  private readonly root: HTMLDivElement;
  private readonly status: HTMLDivElement;

  constructor(private readonly studio: StudioShell) {
    this.root = document.createElement('div');
    this.root.className = 'studio-ui';
    this.status = document.createElement('div');
    this.status.textContent = 'Ready';

    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load PMX / PMD';
    loadButton.onclick = async () => {
      const picker = new MmdFilePicker();
      try {
        const selection = await picker.pick();
        if (!selection) return;
        this.status.textContent = `Loading: ${selection.file.name}`;
        await this.studio.loadModel(selection.url, `model:${selection.file.name}`);
        this.status.textContent = `Loaded: ${selection.file.name}`;
      } catch (error) {
        this.status.textContent = `Load failed: ${error instanceof Error ? error.message : String(error)}`;
      } finally {
        picker.dispose();
      }
    };

    const focus = document.createElement('label');
    const focusToggle = document.createElement('input');
    focusToggle.type = 'checkbox';
    focusToggle.checked = true;
    focusToggle.onchange = () => this.studio.enablePointerFocus(focusToggle.checked);
    focus.append(focusToggle, document.createTextNode(' Pointer Focus'));

    this.root.append(loadButton, focus, this.status);
    document.body.appendChild(this.root);
  }

  dispose(): void { this.root.remove(); }
}
