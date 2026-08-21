import * as THREE from 'three';

/** Runtime 3D representation of a model-bound censorship region. */
export class CensorshipRegionObject3D extends THREE.Object3D {
  readonly plane: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private readonly size = new THREE.Vector2(1, 1);
  private billboard = false;

  constructor(width: number, height: number) {
    super();
    this.name = 'CensorshipRegion3D';
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    this.plane.name = 'CensorshipRegionPlane';
    this.add(this.plane);
    this.setSize(width, height);
  }

  setSize(width: number, height: number): void {
    this.size.set(Math.max(0.0001, width), Math.max(0.0001, height));
    this.plane.scale.set(this.size.x, this.size.y, 1);
  }

  getSize(): THREE.Vector2 {
    return this.size.clone();
  }

  setBillboard(enabled: boolean): void {
    this.billboard = enabled;
  }

  getBillboard(): boolean {
    return this.billboard;
  }

  updateBillboard(camera: THREE.Camera): void {
    if (!this.billboard) return;
    const worldQuaternion = camera.getWorldQuaternion(new THREE.Quaternion());
    const parentQuaternion = this.parent?.getWorldQuaternion(new THREE.Quaternion()).invert();
    this.quaternion.copy(worldQuaternion);
    if (parentQuaternion) this.quaternion.premultiply(parentQuaternion);
  }

  getWorldCorners(target: THREE.Vector3[] = []): THREE.Vector3[] {
    target.length = 0;
    const halfWidth = this.size.x * 0.5;
    const halfHeight = this.size.y * 0.5;
    const corners = [
      new THREE.Vector3(-halfWidth, -halfHeight, 0),
      new THREE.Vector3(halfWidth, -halfHeight, 0),
      new THREE.Vector3(halfWidth, halfHeight, 0),
      new THREE.Vector3(-halfWidth, halfHeight, 0),
    ];
    for (const corner of corners) target.push(this.localToWorld(corner));
    return target;
  }

  dispose(): void {
    this.plane.geometry.dispose();
    this.plane.material.dispose();
  }
}
