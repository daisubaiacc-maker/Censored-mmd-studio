import { RegionEditorModel } from './RegionEditorModel';
import { RegionInteractionController, ResizeHandle } from './RegionInteractionController';
import { RegionOverlay } from './RegionOverlay';

export class RegionHandleUI {
  constructor(
    private readonly model: RegionEditorModel,
    private readonly overlay: RegionOverlay,
    private readonly interaction: RegionInteractionController,
  ) {}

  refresh(): void {
    this.overlay.refresh();
    for (const region of this.model.all()) this.bindRegion(region.id);
  }

  private bindRegion(id: string): void {
    const region = this.model.get(id);
    if (!region) return;
    const node = [...this.overlay.element.children].find((child) =>
      (child as HTMLElement).title.startsWith(region.effect),
    ) as HTMLElement | undefined;
    if (!node) return;

    node.addEventListener('pointerdown', (event) => {
      const e = event as PointerEvent;
      this.interaction.begin(id, e.clientX, e.clientY, null);
      const move = (moveEvent: PointerEvent) => {
        this.interaction.move(moveEvent.clientX, moveEvent.clientY);
        this.overlay.refresh();
      };
      const end = () => {
        this.interaction.end();
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end, { once: true });
    });
  }
}
