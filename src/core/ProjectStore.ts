import { createProject, type ProjectData } from './Project';

export class ProjectStore {
  private project: ProjectData = createProject();

  get(): ProjectData {
    return this.project;
  }

  replace(project: ProjectData): void {
    this.project = project;
  }

  update(mutator: (project: ProjectData) => void): void {
    mutator(this.project);
  }

  snapshot(): ProjectData {
    return structuredClone(this.project);
  }
}
