import * as THREE from 'three';
import { FocusSystem } from './FocusSystem';

/** Keeps pointer state in FocusSystem; rendering consumes the state on each frame. */
export class PointerFocusInput {
  private readonly onMove = (event: PointerEvent) => {
    const rect = this.viewport.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    this.focus.setPointer(
      event.clientX - rect.left,
      event.clientY - rect.top,
      rect.width,
      rect.height,
    );
  };

  constructor(
    private readonly viewport: HTMLElement,
    private readonly focus: FocusSystem,
  ) {
    viewport.addEventListener('pointermove', this.onMove);
  }

  dispose(): void {
    this.viewport.removeEventListener('pointermove', this.onMove);
  }
}
