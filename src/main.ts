import * as THREE from 'three';
import './styles.css';
import { CensorshipSystem } from './censorship/CensorshipSystem';
import { MmdModelLoader } from './mmd/MmdModelLoader';
import { ModelRegistry } from './mmd/ModelRegistry';
import { StudioViewport } from './studio/StudioViewport';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root element was not found.');

app.innerHTML = `
  <main class="studio-shell">
    <header class="studio-toolbar">
      <strong>Censored MMD Studio</strong>
      <span>Studio</span>
    </header>
    <section id="viewport" class="studio-viewport" aria-label="3D viewport"></section>
  </main>
`;

const viewportElement = document.querySelector<HTMLElement>('#viewport');
if (!viewportElement) throw new Error('Studio viewport element was not found.');

const viewport = new StudioViewport({ container: viewportElement });
const { scene, camera, renderer } = viewport;
scene.background = new THREE.Color(0x181818);

const grid = new THREE.GridHelper(10, 20, 0x555555, 0x333333);
scene.add(grid);

const censorship = new CensorshipSystem(renderer, scene, camera);
const modelLoader = new MmdModelLoader();
const modelRegistry = new ModelRegistry();

/** Load an MMD model into the shared Studio scene. */
export async function loadMmdModel(url: string, modelId: string): Promise<void> {
  const model = await modelLoader.load(url);
  model.name = modelId;
  modelRegistry.register(modelId, model);
  scene.add(model);
  scene.updateMatrixWorld(true);
}

function resize(): void {
  const rect = viewportElement.getBoundingClientRect();
  censorship.resize(Math.max(1, rect.width), Math.max(1, rect.height));
}

window.addEventListener('resize', resize);

function animate(): void {
  requestAnimationFrame(animate);
  censorship.render();
}

resize();
animate();

window.addEventListener('beforeunload', () => viewport.dispose(), { once: true });
