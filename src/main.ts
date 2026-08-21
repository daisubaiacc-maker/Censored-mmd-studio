import * as THREE from 'three';
import { StudioViewport } from './studio/StudioViewport';
import { CensorshipSystem } from './censorship/CensorshipSystem';
import { CensorshipBindingController } from './censorship/CensorshipBindingController';
import type { CensorshipRegion } from './censorship/CensorshipRegion';
import { MmdPackageLoader } from './mmd/MmdPackageLoader';
import { ModelRegistry } from './studio/ModelRegistry';
import { ProjectStore } from './project/ProjectStore';
import { ProjectSceneController } from './project/ProjectSceneController';
import { SelectionController } from './studio/SelectionController';
import { TransformController } from './studio/TransformController';
import { saveCurrentProject, loadProjectFromFile } from './project/projectFile';
import { setLocale, t, type Locale } from './i18n';

const viewportElement = document.querySelector<HTMLElement>('#viewport')!;
const form = document.querySelector<HTMLFormElement>('#model-form')!;
const modelFile = document.querySelector<HTMLInputElement>('#model-file')!;
const status = document.querySelector<HTMLElement>('#status')!;
const modelSelect = document.querySelector<HTMLSelectElement>('#model-select')!;
const transformMode = document.querySelector<HTMLSelectElement>('#transform-mode')!;
const censorshipEditButton = document.querySelector<HTMLButtonElement>('#censorship-edit')!;
const censorshipStatus = document.querySelector<HTMLElement>('#censorship-status')!;
const censorshipSizeMode = document.querySelector<HTMLSelectElement>('#censorship-size-mode')!;
const censorshipPixelSize = document.querySelector<HTMLInputElement>('#censorship-pixel-size')!;
const saveProjectButton = document.querySelector<HTMLButtonElement>('#save-project')!;
const loadProjectButton = document.querySelector<HTMLButtonElement>('#load-project')!;
const projectFileInput = document.querySelector<HTMLInputElement>('#project-file')!;
const localeSelect = document.querySelector<HTMLSelectElement>('#locale-select')!;

function updateUiLanguage(): void {
  document.title = t().app.title;
  const title = document.querySelector<HTMLElement>('#app-title'); if (title) title.textContent = t().app.title;
}
updateUiLanguage();

const viewport = new StudioViewport({ container: viewportElement });
const { scene, camera, renderer } = viewport;
scene.background = new THREE.Color(0x181818); scene.add(new THREE.GridHelper(10, 20, 0x555555, 0x333333)); scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const censorship = new CensorshipSystem(renderer, scene, camera);
const censorshipBindings = new CensorshipBindingController(censorship);
const packageLoader = new MmdPackageLoader(); const modelRegistry = new ModelRegistry(); const projectStore = new ProjectStore(); const projectScene = new ProjectSceneController(projectStore.get(), modelRegistry); const selection = new SelectionController(); const transform = new TransformController();
let censorshipSelectionMode = false;

function refreshModelSelect(): void { const current = modelSelect.value; modelSelect.replaceChildren(new Option(t().studio.modelUrl, '')); for (const model of modelRegistry.values()) modelSelect.add(new Option(model.id, model.id)); modelSelect.value = current; viewport.setSelectableRoots([...modelRegistry.values()].map((model) => model.root)); }
function frameModel(model: THREE.Object3D): void { const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3()); const radius = Math.max(size.length() * 0.5, 0.5); const distance = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)); camera.position.set(center.x, center.y + radius * 0.15, center.z + distance * 1.15); camera.lookAt(center); viewport.cameraController.syncFromCamera(center); }
function syncTransformGizmo(): void { viewport.setTransformMode(transform.getMode()); viewport.attachTransform(selection.selectedObject); }
function selectModel(model: THREE.Object3D | null): void { selection.select(model); transform.select(model); if (model) { const registered = [...modelRegistry.values()].find((entry) => entry.root === model); if (registered) modelSelect.value = registered.id; } else modelSelect.value = ''; syncTransformGizmo(); }
function registerLoadedModel(model: THREE.Object3D, source: string, modelId = `model-${crypto.randomUUID()}`): void { model.name = modelId; scene.add(model); modelRegistry.register(modelId, model); projectScene.registerModel(modelId, source, model.name); projectScene.captureModel(modelId); selectModel(model); refreshModelSelect(); modelSelect.value = modelId; syncTransformGizmo(); scene.updateMatrixWorld(true); frameModel(model); }

viewport.onObjectSelected = selectModel;
viewport.onMeshSelected = (mesh, hitPoint) => {
  const root = [...modelRegistry.values()].find((entry) => { let current: THREE.Object3D | null = mesh; while (current) { if (current === entry.root) return true; current = current.parent; } return false; });
  if (!root) return;
  const region: CensorshipRegion = { id: `censor-${crypto.randomUUID()}`, space: 'model', shape: 'rectangle', orientation: 'billboard', x: 0, y: 0, width: 0, height: 0, worldWidth: 0.5, worldHeight: 0.4, screenWidth: 180, screenHeight: 140, effect: 'mosaic', enabled: true, pixelSize: Number(censorshipPixelSize.value), binding: { modelId: root.id, objectName: mesh.name } };
  censorshipBindings.bind(region, mesh, hitPoint); censorshipSelectionMode = false; viewport.setCensorshipSelectionMode(false); censorshipEditButton.textContent = '検閲対象を選択'; censorshipStatus.textContent = `登録: ${mesh.name || '(名称なし)'} / Rectangle Billboard / Model`;
};

function updateCensorshipOptions(): void { for (const region of censorshipBindings.getRegions()) { region.space = censorshipSizeMode.value === 'world' ? 'model' : 'screen'; region.pixelSize = Number(censorshipPixelSize.value); } }
censorshipSizeMode.addEventListener('change', updateCensorshipOptions); censorshipPixelSize.addEventListener('input', updateCensorshipOptions);

form.addEventListener('submit', async (event) => { event.preventDefault(); const file = modelFile.files?.[0]; if (!file) return; status.textContent = t().studio.loading; try { const model = await packageLoader.loadZip(file); registerLoadedModel(model, `local:${file.name}`); status.textContent = t().studio.loaded; } catch (error) { console.error(error); status.textContent = t().studio.failed; } });
censorshipEditButton.addEventListener('click', () => { censorshipSelectionMode = !censorshipSelectionMode; viewport.setCensorshipSelectionMode(censorshipSelectionMode); censorshipEditButton.textContent = censorshipSelectionMode ? '検閲選択を終了' : '検閲対象を選択'; censorshipStatus.textContent = censorshipSelectionMode ? 'Viewport上のメッシュをクリックしてください' : ''; });
saveProjectButton.addEventListener('click', () => { projectScene.captureAll(); saveCurrentProject(projectStore, `${projectStore.get().name || 'censored-mmd-project'}.json`); });
loadProjectButton.addEventListener('click', () => projectFileInput.click());
projectFileInput.addEventListener('change', async () => { const file = projectFileInput.files?.[0]; projectFileInput.value = ''; if (!file) return; status.textContent = 'プロジェクト読み込み中…'; try { await loadProjectFromFile(projectStore, file); const modelRef = projectStore.get().models[0]; if (!modelRef) throw new Error('Project contains no model.'); status.textContent = 'プロジェクトを読み込みました。モデルZIPを再選択してください。'; } catch (error) { console.error(error); status.textContent = 'プロジェクトの読み込みに失敗しました'; } });
modelSelect.addEventListener('change', () => { const model = modelSelect.value ? modelRegistry.get(modelSelect.value)?.root : null; selectModel(model ?? null); });
transformMode.addEventListener('change', () => { transform.setMode(transformMode.value as 'translate' | 'rotate' | 'scale'); syncTransformGizmo(); });
viewport.transformControls.addEventListener('objectChange', () => { if (modelSelect.value) projectScene.captureModel(modelSelect.value); });
document.querySelectorAll<HTMLButtonElement>('[data-axis]').forEach((button) => button.addEventListener('click', () => { const axis = button.dataset.axis as 'x' | 'y' | 'z'; const sign = Number(button.dataset.sign); if (!selection.selectedObject) return; const step = 0.1 * sign; if (transform.getMode() === 'translate') transform.translate(new THREE.Vector3(axis === 'x' ? step : 0, axis === 'y' ? step : 0, axis === 'z' ? step : 0)); else if (transform.getMode() === 'rotate') transform.rotate(new THREE.Euler(axis === 'x' ? step : 0, axis === 'y' ? step : 0, axis === 'z' ? step : 0)); else transform.scale(new THREE.Vector3(axis === 'x' ? 1 + step : 1, axis === 'y' ? 1 + step : 1, axis === 'z' ? 1 + step : 1)); if (modelSelect.value) projectScene.captureModel(modelSelect.value); }));
localeSelect.addEventListener('change', () => { setLocale(localeSelect.value as Locale); updateUiLanguage(); });
window.addEventListener('resize', () => { viewport.resize(viewportElement); const rect = viewportElement.getBoundingClientRect(); censorship.resize(Math.max(1, rect.width), Math.max(1, rect.height)); });
function animate(): void { requestAnimationFrame(animate); const rect = viewportElement.getBoundingClientRect(); censorshipBindings.update(camera, Math.max(1, rect.width), Math.max(1, rect.height)); viewport.render(); censorship.render(); }
viewport.resize(viewportElement); animate(); window.addEventListener('beforeunload', () => viewport.dispose(), { once: true });
