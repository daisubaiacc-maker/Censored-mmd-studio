import * as THREE from 'three';
import type { Object3D, SkinnedMesh, Bone } from 'three';

export interface MmdBoneInfo {
  name: string;
  node: Bone;
}

export interface MmdMeshInfo {
  name: string;
  node: SkinnedMesh;
}

export interface MmdModelMetadata {
  root: Object3D;
  bones: MmdBoneInfo[];
  meshes: MmdMeshInfo[];
}

/** Collect stable scene references used by editing and censorship systems. */
export function inspectMmdModel(root: Object3D): MmdModelMetadata {
  const bones: MmdBoneInfo[] = [];
  const meshes: MmdMeshInfo[] = [];

  root.traverse((node) => {
    if (node instanceof THREE.Bone) bones.push({ name: node.name, node });
    if (node instanceof THREE.SkinnedMesh) meshes.push({ name: node.name, node });
  });

  return { root, bones, meshes };
}
