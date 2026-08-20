import * as THREE from 'three';
import './styles.css';
import { CensorshipSystem } from './censorship/CensorshipSystem';
import { MmdModelLoader } from './mmd/MmdModelLoader';
import { ModelRegistry } from './mmd/ModelRegistry';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Application root element was not found.');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181818);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(light);

const grid = new THREE.GridHelper(10, 20, 0x555555, 0x333333);
scene.add(grid);

const censorship = new CensorshipSystem(renderer, scene, camera);
const modelLoader = new MmdModelLoader();
const modelRegistry = new ModelRegistry();

/** Load an MMD model into the scene while registering its bones/meshes for future editing and censorship. */
export async function loadMmdModel(url: string, modelId: string): Promise<void> {
  const model = await modelLoader.load(url);
  model.name = modelId;
  modelRegistry.register(modelId, model);
  scene.add(model);
}

function resize(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  censorship.resize(width, height);
}

window.addEventListener('resize', resize);

function animate(): void {
  requestAnimationFrame(animate);
  censorship.render();
}

animate();
