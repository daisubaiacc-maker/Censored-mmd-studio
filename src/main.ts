import * as THREE from 'three';
import './styles.css';
import { CensorshipBindingController } from './censorship/CensorshipBindingController';
import { CensorshipEditorController } from './censorship/CensorshipEditorController';
import { CensorshipSystem } from './censorship/CensorshipSystem';
import type { CensorshipRegion } from './censorship/CensorshipRegion';
import { ProjectSceneController } from './core/ProjectSceneController';
import { ProjectStore } from './core/ProjectStore';
import { saveCurrentProject, loadProjectFromFile } from './core/ProjectFileActions';
import { MmdPackageLoader } from './mmd/MmdPackageLoader';
import { ModelRegistry } from './mmd/ModelRegistry';
import { StudioViewport } from './studio/StudioViewport';
import { SelectionController } from './studio/SelectionController';
import { TransformController } from './studio/TransformController';
import { getLocale, setLocale, t, type Locale } from './i18n';
import { createPCUI } from './ui/pc/PCUI';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root element was not found.');

const ui = createPCUI(app);
const { viewportElement, form, modelFile, status, localeSelect, title, languageLabel, loadModelButton, saveProjectButton, loadProjectButton, projectFileInput, modelSelect, transformMode, cameraZoom, censorshipEditButton, censorshipStatus, censorshipSizeMode, censorshipBillboardButton, censorshipPixelSize } = ui;

function updateUiLanguage(): void { const labels = t(); document.documentElement.lang = getLocale(); title.textContent = labels.studio.title; languageLabel.textContent = labels.settings.language; localeSelect.setAttribute('aria-label', labels.settings.language); localeSelect.options[0].textContent = labels.settings.japanese; localeSelect.options[1].textContent = labels.settings.english; localeSelect.value = getLocale(); modelFile.setAttribute('aria-label', labels.studio.modelUrl); loadModelButton.textContent = labels.studio.loadModel; }
updateUiLanguage();

const viewport = new StudioViewport({ container: viewportElement });
const { scene, camera, renderer } = viewport;
scene.background = new THREE.Color(0x181818); scene.add(new THREE.GridHelper(10, 20, 0x555555, 0x333333)); scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
const censorship = new CensorshipSystem(renderer, scene, camera);
const censorshipBindings = new CensorshipBindingController(censorship, scene);
const censorshipEditor = new CensorshipEditorController(viewportElement, camera, renderer, censorshipBindings);
const packageLoader = new MmdPackageLoader(); const modelRegistry = new ModelRegistry(); const projectStore = new ProjectStore(); const projectScene = new ProjectSceneController(projectStore.get(), modelRegistry); const selection = new SelectionController(); const transform = new TransformController();
let censorshipSelectionMode = false;

function refreshModelSelect(): void { const current = modelSelect.value; modelSelect.replaceChildren(new Option(t().studio.modelUrl, '')); for (const model of modelRegistry.values()) modelSelect.add(new Option(model.id, model.id)); modelSelect.value = current; viewport.setSelectableRoots([...modelRegistry.values()].map((model) => model.root)); }
function frameModel(model: THREE.Object3D): void { const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3()); const radius = Math.max(size.length() * 0.5, 0.5); const distance = radius / Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)); camera.position.set(center.x, center.y + radius * 0.15, center.z + distance * 1.15); camera.lookAt(center); viewport.cameraController.syncFromCamera(center); cameraZoom.value = viewport.cameraController.getZoomNormalized().toFixed(3); }
function syncTransformGizmo(): void { viewport.setTransformMode(transform.getMode()); viewport.attachTransform(selection.selectedObject); }
function selectModel(model: THREE.Object3D | null): void { selection.select(model); transform.select(model); if (model) { const registered = [...modelRegistry.values()].find((entry) => entry.root === model); if (registered) modelSelect.value = registered.id; } else modelSelect.value = ''; syncTransformGizmo(); }
function registerLoadedModel(model: THREE.Object3D, source: string, modelId = `model-${crypto.randomUUID()}`): void { model.name = modelId; scene.add(model); modelRegistry.register(modelId, model); projectScene.registerModel(modelId, source, model.name); projectScene.captureModel(modelId); selectModel(model); refreshModelSelect(); modelSelect.value = modelId; syncTransformGizmo(); scene.updateMatrixWorld(true); frameModel(model); }
function syncCensorshipControls(): void { const region = censorshipEditor.getSelected(); const isModel = region?.space === 'model'; censorshipBillboardButton.disabled = !isModel; censorshipBillboardButton.textContent = isModel && region?.model?.billboard ? 'ON' : 'OFF'; }

viewport.onObjectSelected = selectModel;
viewport.onMeshSelected = (mesh, hitPoint) => {
  const root = [...modelRegistry.values()].find((entry) => { let current: THREE.Object3D | null = mesh; while (current) { if (current === entry.root) return true; current = current.parent; } return false; });
  if (!root) return;
  let region: CensorshipRegion;
  if (censorshipSizeMode.value === 'screen') {
    region = { id: `censor-${crypto.randomUUID()}`, space: 'screen', shape: 'rectangle', effect: 'mosaic', enabled: true, pixelSize: Number(censorshipPixelSize.value), screen: { x: viewportElement.clientWidth * 0.5 - 90, y: viewportElement.clientHeight * 0.5 - 70, width: 180, height: 140 } };
    censorshipBindings.addScreenRegion(region); censorshipStatus.textContent = '登録: 画面固定 Rectangle';
  } else {
    region = { id: `censor-${crypto.randomUUID()}`, space: 'model', shape: 'rectangle', effect: 'mosaic', enabled: true, pixelSize: Number(censorshipPixelSize.value), binding: { modelId: root.id, objectName: mesh.name, localOffset: [0, 0, 0] }, model: { position: [0, 0, 0], rotation: [0, 0, 0], width: 0.5, height: 0.4, billboard: true } };
    censorshipBindings.bind(region, mesh, hitPoint); censorshipStatus.textContent = `登録: ${mesh.name || '(名称なし)'} / Rectangle / モデル追従 / Billboard ON`;
  }
  censorshipEditor.select(region); syncCensorshipControls(); censorshipSelectionMode = false; viewport.setCensorshipSelectionMode(false); censorshipEditButton.textContent = '検閲対象を選択';
};
censorshipEditor.onChange = () => syncCensorshipControls();

censorshipBillboardButton.addEventListener('click', () => { const region = censorshipEditor.getSelected(); if (!region || region.space !== 'model') return; const next = !(region.model?.billboard ?? false); censorshipBindings.setBillboard(region, next); syncCensorshipControls(); censorshipStatus.textContent = `Billboard ${next ? 'ON' : 'OFF'}`; });
censorshipPixelSize.addEventListener('input', () => { for (const region of censorshipBindings.getRegions()) region.pixelSize = Number(censorshipPixelSize.value); });
censorshipSizeMode.addEventListener('change', () => { censorshipEditor.select(null); syncCensorshipControls(); censorshipStatus.textContent = censorshipSizeMode.value === 'model' ? '次のクリックでモデル追従検閲を配置します' : '次のクリックで画面固定検閲を配置します'; });
censorshipEditButton.addEventListener('click', () => { censorshipSelectionMode = !censorshipSelectionMode; if (censorshipSelectionMode) censorshipEditor.select(null); viewport.setCensorshipSelectionMode(censorshipSelectionMode); censorshipEditButton.textContent = censorshipSelectionMode ? '検閲対象を選択終了' : '検閲対象を選択'; censorshipStatus.textContent = censorshipSelectionMode ? 'Viewport上のメッシュをクリックしてください' : ''; });

form.addEventListener('submit', async (event) => { event.preventDefault(); const file = modelFile.files?.[0]; if (!file) return; status.textContent = t().studio.loading; try { const model = await packageLoader.loadZip(file); registerLoadedModel(model, `local:${file.name}`); status.textContent = t().studio.loaded; } catch (error) { console.error(error); status.textContent = t().studio.failed; } });
saveProjectButton.addEventListener('click', () => { projectScene.captureAll(); saveCurrentProject(projectStore, `${projectStore.get().name || 'censored-mmd-project'}.json`); });
loadProjectButton.addEventListener('click', () => projectFileInput.click());
projectFileInput.addEventListener('change', async () => { const file = projectFileInput.files?.[0]; projectFileInput.value = ''; if (!file) return; status.textContent = 'プロジェクト読み込み中…'; try { await loadProjectFromFile(projectStore, file); const modelRef = projectStore.get().models[0]; if (!modelRef) throw new Error('Project contains no model.'); status.textContent = 'プロジェクトを読み込みました。モデルZIPを再選択してください。'; } catch (error) { console.error(error); status.textContent = 'プロジェクトの読み込みに失敗しました'; } });
modelSelect.addEventListener('change', () => { const model = modelSelect.value ? modelRegistry.get(modelSelect.value)?.root : null; selectModel(model ?? null); });
transformMode.addEventListener('change', () => { transform.setMode(transformMode.value as 'translate' | 'rotate' | 'scale'); syncTransformGizmo(); });
cameraZoom.addEventListener('input', () => viewport.cameraController.setZoomNormalized(Number(cameraZoom.value)));
viewport.transformControls.addEventListener('objectChange', () => { if (modelSelect.value) projectScene.captureModel(modelSelect.value); });
document.querySelectorAll<HTMLButtonElement>('[data-axis]').forEach((button) => button.addEventListener('click', () => { const axis = button.dataset.axis as 'x' | 'y' | 'z'; const sign = Number(button.dataset.sign); if (!selection.selectedObject) return; const step = 0.1 * sign; if (transform.getMode() === 'translate') transform.translate(new THREE.Vector3(axis === 'x' ? step : 0, axis === 'y' ? step : 0, axis === 'z' ? step : 0)); else if (transform.getMode() === 'rotate') transform.rotate(new THREE.Euler(axis === 'x' ? step : 0, axis === 'y' ? step : 0, axis === 'z' ? step : 0)); else transform.scale(new THREE.Vector3(axis === 'x' ? 1 + step : 1, axis === 'y' ? 1 + step : 1, axis === 'z' ? 1 + step : 1)); if (modelSelect.value) projectScene.captureModel(modelSelect.value); }));
localeSelect.addEventListener('change', () => { setLocale(localeSelect.value as Locale); updateUiLanguage(); });
window.addEventListener('resize', () => { viewport.resize(viewportElement); const rect = viewportElement.getBoundingClientRect(); censorship.resize(Math.max(1, rect.width), Math.max(1, rect.height)); });
function animate(): void { requestAnimationFrame(animate); const rect = viewportElement.getBoundingClientRect(); censorshipBindings.update(camera, Math.max(1, rect.width), Math.max(1, rect.height)); censorshipEditor.update(Math.max(1, rect.width), Math.max(1, rect.height), camera); viewport.render(); censorship.render(); }
viewport.resize(viewportElement); cameraZoom.value = viewport.cameraController.getZoomNormalized().toFixed(3); animate(); window.addEventListener('beforeunload', () => { censorshipEditor.dispose(); viewport.dispose(); }, { once: true });
