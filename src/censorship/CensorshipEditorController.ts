import * as THREE from 'three';
import type { CensorshipRegion } from './CensorshipRegion';
import { CensorshipBindingController } from './CensorshipBindingController';

export type CensorshipEditorChange = (region: CensorshipRegion | null) => void;

/**
 * Lightweight editor for both region types. The visible handles are screen-space,
 * while model edits are converted back into the bound object's local coordinates.
 */
export class CensorshipEditorController {
  private readonly overlay: HTMLDivElement;
  private readonly outline: HTMLDivElement;
  private readonly handles = new Map<string, HTMLDivElement>();
  private selected: CensorshipRegion | null = null;
  private drag: { kind: 'move' | 'resize'; startX: number; startY: number; startRect: DOMRect; handle?: string } | null = null;
  private width = 1;
  private height = 1;
  onChange: CensorshipEditorChange | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly camera: THREE.Camera,
    private readonly renderer: THREE.WebGLRenderer,
    private readonly bindings: CensorshipBindingController,
  ) {
    this.overlay = document.createElement('div');
    this.overlay.className = 'censorship-editor-overlay';
    this.outline = document.createElement('div');
    this.outline.className = 'censorship-editor-outline';
    this.overlay.appendChild(this.outline);
    for (const name of ['nw', 'ne', 'sw', 'se']) {
      const handle = document.createElement('div');
      handle.className = `censorship-editor-handle censorship-editor-handle-${name}`;
      handle.dataset.handle = name;
      handle.addEventListener('pointerdown', this.handlePointerDown);
      this.outline.appendChild(handle);
      this.handles.set(name, handle);
    }
    this.overlay.addEventListener('pointerdown', this.handlePointerDown);
    this.container.appendChild(this.overlay);
    this.setVisible(false);
  }

  select(region: CensorshipRegion | null): void {
    this.selected = region;
    this.setVisible(Boolean(region));
    this.onChange?.(region);
  }

  getSelected(): CensorshipRegion | null { return this.selected; }

  update(width: number, height: number, camera: THREE.Camera): void {
    this.width = width;
    this.height = height;
    if (!this.selected) return;
    const rect = this.bindings.getScreenRect(this.selected, camera, width, height);
    if (!rect) return;
    this.outline.style.left = `${rect.x}px`;
    this.outline.style.top = `${rect.y}px`;
    this.outline.style.width = `${rect.width}px`;
    this.outline.style.height = `${rect.height}px`;
  }

  dispose(): void {
    this.overlay.removeEventListener('pointerdown', this.handlePointerDown);
    for (const handle of this.handles.values()) handle.removeEventListener('pointerdown', this.handlePointerDown);
    this.overlay.remove();
  }

  private setVisible(visible: boolean): void { this.overlay.style.display = visible ? 'block' : 'none'; }

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (!this.selected || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const handle = (event.target as HTMLElement).dataset.handle;
    const rect = this.outline.getBoundingClientRect();
    this.drag = { kind: handle ? 'resize' : 'move', startX: event.clientX, startY: event.clientY, startRect: rect, handle };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp, { once: true });
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (!this.drag || !this.selected) return;
    const dx = event.clientX - this.drag.startX;
    const dy = event.clientY - this.drag.startY;
    if (this.drag.kind === 'move') {
      this.bindings.moveScreenProjected(this.selected, this.camera, dx, dy, this.width, this.height);
    } else {
      this.bindings.resizeProjected(this.selected, this.camera, dx, dy, this.drag.handle ?? 'se', this.width, this.height);
    }
  };

  private readonly handlePointerUp = (): void => {
    this.drag = null;
    window.removeEventListener('pointermove', this.handlePointerMove);
  };
}
