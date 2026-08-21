export const CURRENT_PROJECT_FORMAT_VERSION = 1;

export interface ModelReference {
  id: string;
  source: string;
  name?: string;
}

export interface SceneModelState {
  modelId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  visible: boolean;
}

export interface SceneData {
  id: string;
  name: string;
  models: SceneModelState[];
}

export interface ProjectData {
  formatVersion: number;
  id: string;
  name: string;
  models: ModelReference[];
  scenes: SceneData[];
}

export function createProject(name = 'Untitled Project'): ProjectData {
  return {
    formatVersion: CURRENT_PROJECT_FORMAT_VERSION,
    id: crypto.randomUUID(),
    name,
    models: [],
    scenes: [
      {
        id: crypto.randomUUID(),
        name: 'Scene 1',
        models: [],
      },
    ],
  };
}

export function serializeProject(project: ProjectData): string {
  return JSON.stringify(project, null, 2);
}

export function parseProject(json: string): ProjectData {
  const parsed: unknown = JSON.parse(json);
  if (!isProjectData(parsed)) {
    throw new Error('Invalid project data.');
  }

  if (parsed.formatVersion > CURRENT_PROJECT_FORMAT_VERSION) {
    throw new Error(`Unsupported project format version: ${parsed.formatVersion}`);
  }

  return parsed;
}

function isProjectData(value: unknown): value is ProjectData {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<ProjectData>;
  return (
    typeof project.formatVersion === 'number' &&
    typeof project.id === 'string' &&
    typeof project.name === 'string' &&
    Array.isArray(project.models) &&
    Array.isArray(project.scenes)
  );
}
