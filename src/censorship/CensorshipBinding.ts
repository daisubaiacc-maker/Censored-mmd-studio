import type { Bone, Object3D } from 'three';

export type CensorshipAnchor =
  | { type: 'screen'; regionId: string }
  | { type: 'bone'; modelId: string; boneName: string; offset?: [number, number, number] }
  | { type: 'object'; modelId: string; objectName: string };

export interface ResolvedCensorshipAnchor {
  object?: Object3D;
  bone?: Bone;
}

/** Resolves censorship targets without coupling the system to the MMD loader. */
export function resolveCensorshipAnchor(
  root: Object3D,
  anchor: CensorshipAnchor,
): ResolvedCensorshipAnchor {
  if (anchor.type === 'screen') return {};

  let result: ResolvedCensorshipAnchor = {};
  root.traverse((node) => {
    if (result.object || result.bone) return;

    if (anchor.type === 'bone' && node.isBone && node.name === anchor.boneName) {
      result.bone = node as Bone;
    }

    if (anchor.type === 'object' && node.name === anchor.objectName) {
      result.object = node;
    }
  });

  return result;
}
