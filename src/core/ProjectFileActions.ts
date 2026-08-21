import { downloadProject, readProjectFile } from './ProjectPersistence';
import { ProjectStore } from './ProjectStore';

export function saveCurrentProject(store: ProjectStore, filename = 'censored-mmd-project.json'): void {
  downloadProject(store.get(), filename);
}

export async function loadProjectFromFile(store: ProjectStore, file: File): Promise<void> {
  const project = await readProjectFile(file);
  store.replace(project);
}
