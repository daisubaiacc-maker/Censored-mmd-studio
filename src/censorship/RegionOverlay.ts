import * as THREE from 'three';
import { EditableCensorshipRegion, RegionEditorModel } from './RegionEditorModel';

/** Lightweight viewport overlay for selecting and editing censorship regions. */
export class RegionOverlay {
  readonly element: HTMLDivElement;
  private selectedId: string | null = null;

  constructor(private readonly model: RegionEditorModel, private readonly viewport: HTMLElement) {
    this.element = document.createElement('div');
    this.element.className = 'censorship-region-overlay';
    Object.assign(this.element.style, {
      position: 'absolute', left: '0', top: '0', width: '100%', height: '100%',
      pointerEvents: 'none',
    });
    viewport.style.position ||= 'relative';
    viewport.appendChild(this.element);
  }

  refresh(): void {
    this.element.replaceChildren();
    for (const region of this.model.all()) this.renderRegion(region);
  }

  select(id: string | null): void { this.selectedId = id; this.refresh(); }

  /** Project a world-space anchor into the viewport for future bone-bound regions. */
  static projectAnchor(object: THREE.Object3D, camera: THREE.Camera, viewport: HTMLElement): { x: number; y: number } {
    const p = object.getWorldPosition(new THREE.Vector3()).project(camera);
    const rect = viewport.getBoundingClientRect();
    return { x: (p.x + 1) * 0.5 * rect.width, y: (-p.y + 1) * 0.5 * rect.height };
  }

  private renderRegion(region: EditableCensorshipRegion): void {
    const el = document.createElement('div');
    const r = region.rect;
    Object.assign(el.style, {
      position: 'absolute', left: `${r.x}px`, top: `${r.y}px`, width: `${r.width}px`, height: `${r.height}px`,
      boxSizing: 'border-box', border: region.id === this.selectedId ? '2px solid #fff' : '1px dashed #aaa',
      background: 'rgba(128,128,128,0.08)', pointerEvents: 'auto', cursor: 'move',
    });
    el.title = `${region.effect}${region.targetId ? ` → ${region.targetId}` : ''}`;
    el.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      this.selectedId = region.id;
      this.refresh();
    });
    this.element.appendChild(el);
  }

  dispose(): void { this.element.remove(); }
}
