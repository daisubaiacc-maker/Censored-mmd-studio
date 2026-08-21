import type { ProjectSceneController } from '../core/ProjectSceneController';
import type { SelectionController } from './SelectionController';

/** Synchronizes the currently selected runtime object back into project state. */
export function captureSelectedTransform(
  selection: SelectionController,
  projectScene: ProjectSceneController,
  modelId: string,
): boolean {
  if (!selection.selectedObject) return false;
  projectScene.captureModel(modelId);
  return true;
}
