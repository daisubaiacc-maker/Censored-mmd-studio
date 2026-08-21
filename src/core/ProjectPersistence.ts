import { parseProject, serializeProject, type ProjectData } from './Project';

export function downloadProject(project: ProjectData, filename = 'censored-mmd-project.json'): void {
  const blob = new Blob([serializeProject(project)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function readProjectFile(file: File): Promise<ProjectData> {
  return parseProject(await file.text());
}
