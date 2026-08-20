export interface RegionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditableCensorshipRegion {
  id: string;
  rect: RegionRect;
  targetId: string | null;
  effect: 'mosaic' | 'blur' | 'solid';
  enabled: boolean;
}

/** UI-independent model for interactive censorship region editing. */
export class RegionEditorModel {
  private regions = new Map<string, EditableCensorshipRegion>();

  add(region: EditableCensorshipRegion): void { this.regions.set(region.id, { ...region, rect: { ...region.rect } }); }
  remove(id: string): void { this.regions.delete(id); }
  get(id: string): EditableCensorshipRegion | undefined {
    const region = this.regions.get(id);
    return region ? { ...region, rect: { ...region.rect } } : undefined;
  }
  all(): EditableCensorshipRegion[] {
    return [...this.regions.values()].map((r) => ({ ...r, rect: { ...r.rect } }));
  }

  move(id: string, dx: number, dy: number): void {
    const region = this.regions.get(id);
    if (!region) return;
    region.rect.x += dx;
    region.rect.y += dy;
  }

  resize(id: string, width: number, height: number): void {
    const region = this.regions.get(id);
    if (!region) return;
    region.rect.width = Math.max(1, width);
    region.rect.height = Math.max(1, height);
  }

  bind(id: string, targetId: string | null): void {
    const region = this.regions.get(id);
    if (region) region.targetId = targetId;
  }
}
