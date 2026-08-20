import * as THREE from 'three';

export interface ProjectedRegion {
  id: string;
  rect: { x: number; y: number; width: number; height: number };
  visible: boolean;
}

/** Projects a target Object3D's world-space bounds into viewport pixels. */
export class TargetRegionProjector {
  private readonly box = new THREE.Box3();
  private readonly corners = Array.from({ length: 8 }, () => new THREE.Vector3());

  project(id: string, target: THREE.Object3D, camera: THREE.Camera, width: number, height: number): ProjectedRegion {
    target.updateWorldMatrix(true, true);
    this.box.setFromObject(target, true);

    if (this.box.isEmpty()) {
      return { id, rect: { x: 0, y: 0, width: 0, height: 0 }, visible: false };
    }

    const min = this.box.min;
    const max = this.box.max;
    this.corners[0].set(min.x, min.y, min.z);
    this.corners[1].set(min.x, min.y, max.z);
    this.corners[2].set(min.x, max.y, min.z);
    this.corners[3].set(min.x, max.y, max.z);
    this.corners[4].set(max.x, min.y, min.z);
    this.corners[5].set(max.x, min.y, max.z);
    this.corners[6].set(max.x, max.y, min.z);
    this.corners[7].set(max.x, max.y, max.z);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let anyInFront = false;

    for (const corner of this.corners) {
      const projected = corner.clone().project(camera);
      if (projected.z >= -1 && projected.z <= 1) anyInFront = true;
      minX = Math.min(minX, projected.x);
      maxX = Math.max(maxX, projected.x);
      minY = Math.min(minY, projected.y);
      maxY = Math.max(maxY, projected.y);
    }

    const x = THREE.MathUtils.clamp((minX + 1) * 0.5 * width, 0, width);
    const right = THREE.MathUtils.clamp((maxX + 1) * 0.5 * width, 0, width);
    const bottom = THREE.MathUtils.clamp((1 - maxY) * 0.5 * height, 0, height);
    const top = THREE.MathUtils.clamp((1 - minY) * 0.5 * height, 0, height);

    return {
      id,
      rect: { x, y: bottom, width: Math.max(0, right - x), height: Math.max(0, top - bottom) },
      visible: anyInFront && right > x && top > bottom,
    };
  }
}
