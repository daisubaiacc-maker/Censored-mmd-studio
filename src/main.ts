import * as THREE from 'three';
import './styles.css';
import { CensorshipSystem } from './censorship/CensorshipSystem';
import { MmdModelLoader } from './mmd/MmdModelLoader';
import { ModelRegistry } from './mmd/ModelRegistry';
import { StudioModelSession } from './studio/StudioModelSession';
import { StudioViewport } from './studio/StudioViewport';
import { getLocale, setLocale, t, type Locale } from './i18n';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root element was not found.');

app.innerHTML = `
  <main class="studio-shell">
    <header class="studio-toolbar">
      <strong id="studio-title"></strong>
      <span id="studio-mode">Studio</span>
      <label>
        <span id="language-label" class="sr-only"></span>
        <select id="locale-select">
          <option value="ja"></option>
          <option value="en"></option>
        </select>
      </label>
      <form id="model-form" class="model-loader-form">
        <input id="model-url" type="url" />
        <button id="load-model-button" type="submit"></button>
        <span id="model-status" role="status" aria-live="polite"></span>
      </form>
    </header>
    <section id="viewport" class="studio-viewport" aria-label="3D viewport"></section>
  </main>
`;

const viewportElement = document.querySelector<HTMLElement>('#viewport');
const form = document.querySelector<HTMLFormElement>('#model-form');
const urlInput = document.querySelector<HTMLInputElement>('#model-url');
const status = document.querySelector<HTMLSpanElement>('#model-status');
const localeSelect = document.querySelector<HTMLSelectElement>('#locale-select');
const title = document.querySelector<HTMLElement>('#studio-title');
const languageLabel = document.querySelector<HTMLElement>('#language-label');
const loadModelButton = document.querySelector<HTMLButtonElement>('#load-model-button');
if (!viewportElement || !form || !urlInput || !status || !localeSelect || !title || !languageLabel || !loadModelButton) {
  throw new Error('Studio UI elements were not found.');
}

function updateUiLanguage(): void {
  const labels = t();
  document.documentElement.lang = getLocale();
  title.textContent = labels.studio.title;
  languageLabel.textContent = labels.settings.language;
  localeSelect.setAttribute('aria-label', labels.settings.language);
  localeSelect.options[0].textContent = labels.settings.japanese;
  localeSelect.options[1].textContent = labels.settings.english;
  localeSelect.value = getLocale();
  urlInput.placeholder = labels.studio.modelUrl;
  urlInput.setAttribute('aria-label', labels.studio.modelUrl);
  loadModelButton.textContent = labels.studio.loadModel;
}

updateUiLanguage();

const viewport = new StudioViewport({ container: viewportElement });
const { scene, camera, renderer } = viewport;
scene.background = new THREE.Color(0x181818);

const grid = new THREE.GridHelper(10, 20, 0x555555, 0x333333);
scene.add(grid);

const ambient = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(ambient);

const censorship = new CensorshipSystem(renderer, scene, camera);
const modelLoader = new MmdModelLoader();
const modelRegistry = new ModelRegistry();
const modelSession = new StudioModelSession(viewport, modelLoader);

function frameModel(model: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radius = Math.max(size.length() * 0.5, 0.5);
  const distance = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));

  camera.position.set(center.x, center.y + radius * 0.15, center.z + distance * 1.15);
  camera.lookAt(center);
  camera.near = Math.max(0.01, radius / 100);
  camera.far = Math.max(2000, radius * 100);
  camera.updateProjectionMatrix();
}

/** Load an MMD model into the shared Studio scene and registry. */
export async function loadMmdModel(url: string, modelId = 'model'): Promise<void> {
  const model = await modelSession.load({ modelUrl: url });
  model.name = modelId;
  modelRegistry.register(modelId, model);
  scene.updateMatrixWorld(true);
  frameModel(model);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  status.textContent = t().studio.loading;
  try {
    await loadMmdModel(url, 'preview-model');
    status.textContent = t().studio.loaded;
  } catch (error) {
    console.error(error);
    status.textContent = t().studio.failed;
  }
});

localeSelect.addEventListener('change', () => {
  setLocale(localeSelect.value as Locale);
  updateUiLanguage();
});

function resize(): void {
  viewport.resize(viewportElement);
  const rect = viewportElement.getBoundingClientRect();
  censorship.resize(Math.max(1, rect.width), Math.max(1, rect.height));
}

window.addEventListener('resize', resize);

function animate(): void {
  requestAnimationFrame(animate);
  viewport.render();
  censorship.render();
}

resize();
animate();

window.addEventListener('beforeunload', () => viewport.dispose(), { once: true });
