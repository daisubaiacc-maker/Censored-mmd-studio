import type { StudioUIElements } from '../StudioUI';
import { createPCUIImplementation } from './PCUIImplementation';
import { createMobileUI } from '../mobile/MobileUI';

export type PCUIElements = StudioUIElements;

/**
 * Temporary UI entry point used by main.ts.
 * The actual PC and Mobile implementations are independent; this factory only
 * selects which UI shell owns the screen at startup.
 */
export function createPCUI(app: HTMLElement): PCUIElements {
  const isMobile = window.matchMedia('(max-width: 700px)').matches;
  return isMobile ? createMobileUI(app) : createPCUIImplementation(app);
}
