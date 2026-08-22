import * as THREE from 'three';
import type { CensorshipRegion } from './CensorshipRegion';
import type { CensorshipSystem, CensorshipRenderRegion } from './CensorshipSystem';
import { CensorshipRegionObject3D } from './CensorshipRegionObject3D';

interface BoundRegion { region: CensorshipRegion; target: THREE.Object3D; localPoint: THREE.Vector3; object3D: CensorshipRegionObject3D; }

export class CensorshipBindingController {
  private readonly bindings: BoundRegion[] = [];
  private readonly screenRegions: CensorshipRegion[] = [];
  constructor(private readonly censorship: CensorshipSystem, _scene?: THREE.Scene) {}

  bind(region: CensorshipRegion, target: THREE.Object3D, worldPoint?: THREE.Vector3): void {
    const localPoint = worldPoint ? target.worldToLocal(worldPoint.clone()) : new THREE.Vector3();
    const model = region.model ?? { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], width: 0.5, height: 0.4, billboard: true };
    region.model = model; region.space = 'model';
    const object3D = new CensorshipRegionObject3D(model.width, model.height);
    object3D.position.copy(localPoint).add(new THREE.Vector3(...model.position));
    object3D.rotation.set(...model.rotation); object3D.setBillboard(model.billboard); target.add(object3D);
    this.bindings.push({ region, target, localPoint, object3D }); this.syncRegions();
  }

  addScreenRegion(region: CensorshipRegion): void {
    if (region.space !== 'screen' || !region.screen) throw new Error('Screen censorship regions require screen coordinates.');
    this.screenRegions.push(region); this.syncRegions();
  }

  getRegions(): readonly CensorshipRegion[] { return [...this.bindings.map(({ region }) => region), ...this.screenRegions]; }

  getScreenRect(region: CensorshipRegion, camera: THREE.Camera, width: number, height: number): { x: number; y: number; width: number; height: number } | null {
    if (region.space === 'screen' && region.screen) return { ...region.screen };
    const binding = this.bindings.find((entry) => entry.region === region);
    if (!binding || !region.model) return null;
    this.syncObject(binding, camera);
    const projected = binding.object3D.getWorldCorners().map((corner) => corner.project(camera));
    if (!projected.some((point) => point.z >= -1 && point.z <= 1)) return null;
    const xs = projected.map((point) => (point.x * 0.5 + 0.5) * width);
    const ys = projected.map((point) => (1 - (point.y * 0.5 + 0.5)) * height);
    const x = THREE.MathUtils.clamp(Math.min(...xs), 0, width); const y = THREE.MathUtils.clamp(Math.min(...ys), 0, height);
    return { x, y, width: THREE.MathUtils.clamp(Math.max(...xs) - x, 0, width), height: THREE.MathUtils.clamp(Math.max(...ys) - y, 0, height) };
  }

  moveScreenProjected(region: CensorshipRegion, camera: THREE.Camera, dx: number, dy: number, width: number, height: number): void {
    if (region.space === 'screen' && region.screen) { region.screen.x += dx; region.screen.y += dy; return; }
    const binding = this.bindings.find((entry) => entry.region === region); if (!binding || !region.model) return;
    const origin = binding.object3D.getWorldPosition(new THREE.Vector3()); const forward = camera.getWorldDirection(new THREE.Vector3());
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(forward, origin);
    const a = this.rayPoint(camera, width, height, 0, 0, plane); const b = this.rayPoint(camera, width, height, dx, dy, plane); if (!a || !b) return;
    const worldDelta = b.sub(a); const targetOrigin = binding.target.localToWorld(new THREE.Vector3());
    const localDelta = binding.target.worldToLocal(targetOrigin.clone().add(worldDelta)).sub(binding.target.worldToLocal(targetOrigin.clone()));
    region.model.position[0] += localDelta.x; region.model.position[1] += localDelta.y; region.model.position[2] += localDelta.z;
  }

  resizeProjected(region: CensorshipRegion, camera: THREE.Camera, dx: number, dy: number, handle: string, width: number, height: number): void {
    if (region.space === 'screen' && region.screen) {
      const r = region.screen; const min = 8;
      if (handle.includes('e')) r.width = Math.max(min, r.width + dx); if (handle.includes('s')) r.height = Math.max(min, r.height + dy);
      if (handle.includes('w')) { const next = Math.max(min, r.width - dx); r.x += r.width - next; r.width = next; }
      if (handle.includes('n')) { const next = Math.max(min, r.height - dy); r.y += r.height - next; r.height = next; } return;
    }
    const binding = this.bindings.find((entry) => entry.region === region); if (!binding || !region.model) return;
    const current = this.getScreenRect(region, camera, width, height); if (!current) return;
    const sx = Math.max(0.05, (current.width + ((handle.includes('e') ? dx : 0) - (handle.includes('w') ? dx : 0))) / Math.max(current.width, 1));
    const sy = Math.max(0.05, (current.height + ((handle.includes('s') ? dy : 0) - (handle.includes('n') ? dy : 0))) / Math.max(current.height, 1));
    region.model.width = Math.max(0.01, region.model.width * sx); region.model.height = Math.max(0.01, region.model.height * sy);
    if (handle.includes('w') || handle.includes('n')) this.moveScreenProjected(region, camera, dx * 0.5, dy * 0.5, width, height);
  }

  rotateProjected(region: CensorshipRegion, camera: THREE.Camera, pointerX: number, pointerY: number, width: number, height: number, startAngle: number): void {
    if (region.space !== 'model' || !region.model) return;
    const rect = this.getScreenRect(region, camera, width, height); if (!rect) return;
    const angle = Math.atan2(pointerY - (rect.y + rect.height * 0.5), pointerX - (rect.x + rect.width * 0.5));
    let delta = angle - startAngle;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    region.model.rotation[2] += delta;
  }

  setBillboard(region: CensorshipRegion, enabled: boolean): void {
    if (region.space !== 'model' || !region.model) return;
    region.model.billboard = enabled;
    const binding = this.bindings.find((entry) => entry.region === region);
    if (binding) binding.object3D.setBillboard(enabled);
  }

  getBillboard(region: CensorshipRegion): boolean | null { return region.space === 'model' && region.model ? region.model.billboard : null; }

  clear(): void { for (const binding of this.bindings) { binding.object3D.removeFromParent(); binding.object3D.dispose(); } this.bindings.length = 0; this.screenRegions.length = 0; this.censorship.setRegions([]); this.censorship.setRenderRegions([]); }

  update(camera: THREE.Camera, width: number, height: number): void {
    const renderRegions: CensorshipRenderRegion[] = [];
    for (const binding of this.bindings) {
      const region = binding.region; if (!region.model || !region.enabled) continue;
      this.syncObject(binding, camera);
      const projected = binding.object3D.getWorldCorners().map((corner) => corner.project(camera)); if (!projected.some((point) => point.z >= -1 && point.z <= 1)) continue;
      const xs = projected.map((point) => point.x * 0.5 + 0.5); const ys = projected.map((point) => point.y * 0.5 + 0.5); const x0 = THREE.MathUtils.clamp(Math.min(...xs), 0, 1); const x1 = THREE.MathUtils.clamp(Math.max(...xs), 0, 1); const y0 = THREE.MathUtils.clamp(Math.min(...ys), 0, 1); const y1 = THREE.MathUtils.clamp(Math.max(...ys), 0, 1);
      renderRegions.push({ region, rect: new THREE.Vector4(x0, y0, Math.max(0, x1 - x0), Math.max(0, y1 - y0)) });
    }
    for (const region of this.screenRegions) { if (!region.enabled || !region.screen) continue; const screen = region.screen; renderRegions.push({ region, rect: new THREE.Vector4(screen.x / Math.max(width, 1), 1 - (screen.y + screen.height) / Math.max(height, 1), screen.width / Math.max(width, 1), screen.height / Math.max(height, 1)) }); }
    this.censorship.setRenderRegions(renderRegions);
  }

  private syncObject(binding: BoundRegion, camera: THREE.Camera): void {
    const model = binding.region.model; if (!model) return;
    binding.object3D.position.copy(binding.localPoint).add(new THREE.Vector3(...model.position));
    binding.object3D.rotation.set(...model.rotation);
    binding.object3D.setSize(model.width, model.height); binding.object3D.setBillboard(model.billboard);
    binding.object3D.updateBillboard(camera, model.rotation[2]);
  }

  private rayPoint(camera: THREE.Camera, width: number, height: number, dx: number, dy: number, plane: THREE.Plane): THREE.Vector3 | null {
    const p = new THREE.Vector2(((width * 0.5 + dx) / width) * 2 - 1, -((height * 0.5 + dy) / height) * 2 + 1); const ray = new THREE.Raycaster(); ray.setFromCamera(p, camera); return ray.ray.intersectPlane(plane, new THREE.Vector3());
  }
  private syncRegions(): void { this.censorship.setRegions(this.getRegions().filter((region) => region.enabled)); }
}
