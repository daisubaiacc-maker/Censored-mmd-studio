import * as THREE from 'three';
import type { CensorshipRegion } from './CensorshipRegion';
import { CensorshipBindingController } from './CensorshipBindingController';

export type CensorshipEditorChange = (region: CensorshipRegion | null) => void;
type DragKind = 'move' | 'resize' | 'rotate';

/** Screen-space editor whose model edits are converted back into bound local 3D values. */
export class CensorshipEditorController {
  private readonly overlay: HTMLDivElement;
  private readonly outline: HTMLDivElement;
  private readonly handles = new Map<string, HTMLDivElement>();
  private selected: CensorshipRegion | null = null;
  private drag: { kind: DragKind; startX: number; startY: number; startRect: DOMRect; handle?: string; startAngle?: number } | null = null;
  private width = 1;
  private height = 1;
  onChange: CensorshipEditorChange | null = null;

  constructor(private readonly container: HTMLElement, private readonly camera: THREE.Camera, private readonly renderer: THREE.WebGLRenderer, private readonly bindings: CensorshipBindingController) {
    this.overlay = document.createElement('div'); this.overlay.className = 'censorship-editor-overlay';
    this.outline = document.createElement('div'); this.outline.className = 'censorship-editor-outline'; this.overlay.appendChild(this.outline);
    for (const name of ['nw', 'ne', 'sw', 'se', 'rot']) {
      const handle = document.createElement('div'); handle.className = `censorship-editor-handle censorship-editor-handle-${name}`; handle.dataset.handle = name;
      handle.addEventListener('pointerdown', this.handlePointerDown); this.outline.appendChild(handle); this.handles.set(name, handle);
    }
    this.overlay.addEventListener('pointerdown', this.handlePointerDown); this.container.appendChild(this.overlay); this.setVisible(false);
  }

  select(region: CensorshipRegion | null): void { this.selected = region; this.setVisible(Boolean(region)); this.onChange?.(region); }
  getSelected(): CensorshipRegion | null { return this.selected; }

  update(width: number, height: number, camera: THREE.Camera): void {
    this.width = width; this.height = height; if (!this.selected) return;
    const rect = this.bindings.getScreenRect(this.selected, camera, width, height); if (!rect) return;
    this.outline.style.left = `${rect.x}px`; this.outline.style.top = `${rect.y}px`; this.outline.style.width = `${rect.width}px`; this.outline.style.height = `${rect.height}px`;
    const rotate = this.handles.get('rot'); if (rotate) rotate.style.display = this.selected.space === 'model' ? 'block' : 'none';
  }

  dispose(): void { this.overlay.removeEventListener('pointerdown', this.handlePointerDown); for (const handle of this.handles.values()) handle.removeEventListener('pointerdown', this.handlePointerDown); this.overlay.remove(); }
  private setVisible(visible: boolean): void { this.overlay.style.display = visible ? 'block' : 'none'; }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.selected || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    const target = event.target as HTMLElement; const handle = target.dataset.handle;
    const rect = this.outline.getBoundingClientRect();
    let kind: DragKind = handle === 'rot' ? 'rotate' : handle ? 'resize' : 'move';
    if (kind === 'rotate' && this.selected.space !== 'model') kind = 'move';
    const startAngle = kind === 'rotate' ? Math.atan2(event.clientY - (rect.top + rect.height * 0.5), event.clientX - (rect.left + rect.width * 0.5)) : undefined;
    this.drag = { kind, startX: event.clientX, startY: event.clientY, startRect: rect, handle, startAngle };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    window.addEventListener('pointermove', this.handlePointerMove); window.addEventListener('pointerup', this.handlePointerUp, { once: true });
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.drag || !this.selected) return;
    if (this.drag.kind === 'move') this.bindings.moveScreenProjected(this.selected, this.camera, event.clientX - this.drag.startX, event.clientY - this.drag.startY, this.width, this.height);
    else if (this.drag.kind === 'resize') this.bindings.resizeProjected(this.selected, this.camera, event.clientX - this.drag.startX, event.clientY - this.drag.startY, this.drag.handle ?? 'se', this.width, this.height);
    else this.bindings.rotateProjected(this.selected, this.camera, event.clientX, event.clientY, this.width, this.height, this.drag.startAngle ?? 0);
  };

  private readonly handlePointerUp = (): void => { this.drag = null; window.removeEventListener('pointermove', this.handlePointerMove); };
}
