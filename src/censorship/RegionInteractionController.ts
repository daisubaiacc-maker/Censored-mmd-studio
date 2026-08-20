import { RegionEditorModel } from './RegionEditorModel';

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | null;

/** Pointer interaction logic for moving/resizing censorship regions. */
export class RegionInteractionController {
  private activeId: string | null = null;
  private handle: ResizeHandle = null;
  private lastX = 0;
  private lastY = 0;

  constructor(private readonly model: RegionEditorModel) {}

  begin(id: string, x: number, y: number, handle: ResizeHandle = null): void {
    this.activeId = id;
    this.handle = handle;
    this.lastX = x;
    this.lastY = y;
  }

  move(x: number, y: number): void {
    if (!this.activeId) return;
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const region = this.model.get(this.activeId);
    if (!region) return;

    if (!this.handle) {
      this.model.move(this.activeId, dx, dy);
    } else {
      let width = region.rect.width;
      let height = region.rect.height;
      if (this.handle.includes('e')) width += dx;
      if (this.handle.includes('s')) height += dy;
      if (this.handle.includes('w')) width -= dx;
      if (this.handle.includes('n')) height -= dy;
      this.model.resize(this.activeId, width, height);
    }
    this.lastX = x;
    this.lastY = y;
  }

  end(): void {
    this.activeId = null;
    this.handle = null;
  }
}
