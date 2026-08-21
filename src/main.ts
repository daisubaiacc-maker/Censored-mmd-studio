import * as THREE from 'three';
import './styles.css';
import { CensorshipSystem } from './censorship/CensorshipSystem';
import { ProjectSceneController } from './core/ProjectSceneController';
import { ProjectStore } from './core/ProjectStore';
import { saveCurrentProject, loadProjectFromFile } from './core/ProjectFileActions';
import { MmdPackageLoader } from './mmd/MmdPackageLoader';
import { ModelRegistry } from './mmd/ModelRegistry';
import { StudioViewport } from './studio/StudioViewport';
import { SelectionController } from './studio/SelectionController';
import { TransformController } from './studio/TransformController';
import { getLocale, setLocale, t, type Locale } from './i18n';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root element was not found.');

app.innerHTML = `
  <main class="studio-shell">
    <header class="studio-toolbar">
      <strong id="studio-title"></strong>
      <span id="studio-mode">Studio</span>
      <label><span id="language-label" class="sr-only"></span><select id="locale-select"><option value="ja"></option><option value="en"></option></select></label>
      <button id="save-project-button" type="button">保存</button>
      <button id="load-project-button" type="button">読み込み</button>
      <input id="project-file-input" type="file" accept="application/json,.json" hidden />
      <form id="model-form" class="model-loader-form">
        <input id="model-file" type="file" accept=".zip,application/zip,application/x-zip-compressed" />
        <button id="load-model-button" type="submit"></button>
        <span id="model-status" role="status" aria-live="polite"></span>
      </form>
    </header>
    <aside class="studio-panel" aria-label="Studio controls">
      <select id="model-select" aria-label="Model selection"><option value=""></option></select>
      <select id="transform-mode" aria-label="Transform mode"><option value="translate">Move</option><option value="rotate">Rotate</option><option value="scale">Scale</option></select>
      <div class="transform-buttons">
        <button type="button" data-axis="x" data-sign="-1">X−</button><button type="button" data-axis="x" data-sign="1">X+</button>
        <button type="button" data-axis="y" data-sign="-1">Y−</button><button type="button" data-axis="y" data-sign="1">Y+</button>
        <button type="button" data-axis="z" data-sign="-1">Z−</button><button type="button" data-axis="z" data-sign="1">Z+</button>
      </div>
    </aside>
    <section id="viewport" class="studio-viewport" aria-label="3D viewport"></section>
  </main>`;

const viewportElement = document.querySelector<HTMLElement>('#viewport')!;
const form = document.querySelector<HTMLFormElement>('#model-form')!;
const modelFile = document.querySelector<HTMLInputElement>('#model-file')!;
const status = document.querySelector<HTMLSpanElement>('#model-status')!;
const localeSelect = document.querySelector<HTMLSelectElement>('#locale-select')!;
const title = document.querySelector<HTMLElement>('#studio-title')!;
const languageLabel = document.querySelector<HTMLElement>('#language-label')!;
const loadModelButton = document.querySelector<HTMLButtonElement>('#load-model-button')!;
const saveProjectButton = document.querySelector<HTMLButtonElement>('#save-project-button')!;
const loadProjectButton = document.querySelector<HTMLButtonElement>('#load-project-button')!;
const projectFileInput = document.querySelector<HTMLInputElement>('#project-file-input')!;
const modelSelect = document.querySelector<HTMLSelectElement>('#model-select')!;
const transformMode = document.querySelector<HTMLSelectElement>('#transform-mode')!;

function updateUiLanguage(): void {
  const labels = t();
  document.documentElement.lang = getLocale();
  title.textContent = labels.studio.title;
  languageLabel.textContent = labels.settings.language;
  localeSelect.setAttribute('aria-label', labels.settings.language);
  localeSelect.options[0].textContent = labels.settings.japanese;
  localeSelect.options[1].textContent = labels.settings.english;
  localeSelect.value = getLocale();
  modelFile.setAttribute('aria-label', labels.studio.modelUrl);
  loadModelButton.textContent = labels.studio.loadModel;
}
updateUiLanguage();

const viewport = new StudioViewport({ container: viewportElement });
const { scene, camera, renderer } = viewport;
scene.background = new THREE.Color(0x181818);
scene.add(new THREE.GridHelper(10, 20, 0x555555, 0x333333));
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const censorship = new CensorshipSystem(renderer, scene, camera);
const packageLoader = new MmdPackageLoader();
const modelRegistry = new ModelRegistry();
const projectStore = new ProjectStore();
const projectScene = new ProjectSceneController(projectStore.get(), modelRegistry);
const selection = new SelectionController();
const transform = new TransformController();

function refreshModelSelect(): void {
  const current = modelSelect.value;
  modelSelect.replaceChildren(new Option(t().studio.modelUrl, ''));
  for (const model of modelRegistry.values()) modelSelect.add(new Option(model.id, model.id));
  modelSelect.value = current;
}
function frameModel(model: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const radius = Math.max(size.length() * 0.5, 0.5);
  const distance = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5));
  camera.position.set(center.x, center.y + radius * 0.15, center.z + distance * 1.15);
  camera.lookAt(center);
}
function syncTransformGizmo(): void {
  viewport.setTransformMode(transform.getMode());
  viewport.attachTransform(selection.selectedObject);
}
function registerLoadedModel(model: THREE.Object3D, source: string, modelId = `model-${crypto.randomUUID()}`): void {
  model.name = modelId;
  scene.add(model);
  modelRegistry.register(modelId, model);
  projectScene.registerModel(modelId, source, model.name);
  projectScene.captureModel(modelId);
  selection.select(model);
  transform.select(model);
  refreshModelSelect();
  modelSelect.value = modelId;
  syncTransformGizmo();
  scene.updateMatrixWorld(true);
  frameModel(model);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = modelFile.files?.[0];
  if (!file) return;
  status.textContent = t().studio.loading;
  try {
    const model = await packageLoader.loadZip(file);
    registerLoadedModel(model, `local:${file.name}`);
    status.textContent = t().studio.loaded;
  } catch (error) {
    console.error(error);
    status.textContent = t().studio.failed;
  }
});

saveProjectButton.addEventListener('click', () => {
  projectScene.captureAll();
  saveCurrentProject(projectStore, `${projectStore.get().name || 'censored-mmd-project'}.json`);
});
loadProjectButton.addEventListener('click', () => projectFileInput.click());
projectFileInput.addEventListener('change', async () => {
  const file = projectFileInput.files?.[0];
  projectFileInput.value = '';
  if (!file) return;
  status.textContent = 'プロジェクト読み込み中…';
  try {
    await loadProjectFromFile(projectStore, file);
    const modelRef = projectStore.get().models[0];
    if (!modelRef) throw new Error('Project contains no model.');
    status.textContent = 'プロジェクトを読み込みました。モデルZIPを再選択してください。';
  } catch (error) {
    console.error(error);
    status.textContent = 'プロジェクトの読み込みに失敗しました';
  }
});

modelSelect.addEventListener('change', () => {
  const model = modelSelect.value ? modelRegistry.get(modelSelect.value)?.root : null;
  selection.select(model ?? null);
  transform.select(model ?? null);
  syncTransformGizmo();
});
transformMode.addEventListener('change', () => {
  transform.setMode(transformMode.value as 'translate' | 'rotate' | 'scale');
  syncTransformGizmo();
});
viewport.transformControls.addEventListener('objectChange', () => {
  if (modelSelect.value) projectScene.captureModel(modelSelect.value);
});
document.querySelectorAll<HTMLButtonElement>('[data-axis]').forEach((button) => button.addEventListener('click', () => {
  const axis = button.dataset.axis as 'x' | 'y' | 'z';
  const sign = Number(button.dataset.sign);
  if (!selection.selectedObject) return;
  const step = 0.1 * sign;
  if (transform.getMode() === 'translate') transform.translate(new THREE.Vector3(axis === 'x' ? step : 0, axis === 'y' ? step : 0, axis === 'z' ? step : 0));
  else if (transform.getMode() === 'rotate') transform.rotate(new THREE.Euler(axis === 'x' ? step : 0, axis === 'y' ? step : 0, axis === 'z' ? step : 0));
  else transform.scale(new THREE.Vector3(axis === 'x' ? 1 + step : 1, axis === 'y' ? 1 + step : 1, axis === 'z' ? 1 + step : 1));
  if (modelSelect.value) projectScene.captureModel(modelSelect.value);
}));
localeSelect.addEventListener('change', () => { setLocale(localeSelect.value as Locale); updateUiLanguage(); });
window.addEventListener('resize', () => { viewport.resize(viewportElement); const rect = viewportElement.getBoundingClientRect(); censorship.resize(Math.max(1, rect.width), Math.max(1, rect.height)); });
function animate(): void { requestAnimationFrame(animate); viewport.render(); censorship.render(); }
viewport.resize(viewportElement);
animate();
window.addEventListener('beforeunload', () => viewport.dispose(), { once: true });
