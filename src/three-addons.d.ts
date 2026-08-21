declare module 'three/addons/loaders/MMDLoader.js' {
  import type { LoadingManager, Object3D } from 'three';
  export class MMDLoader {
    constructor(manager?: LoadingManager);
    setResourcePath(path: string): this;
    load(url: string, onLoad: (object: Object3D) => void, onProgress?: (event: ProgressEvent) => void, onError?: (error: unknown) => void): void;
  }
}

declare module 'three/addons/postprocessing/EffectComposer.js' {
  import type { WebGLRenderer, Scene, Camera } from 'three';
  export class EffectComposer {
    constructor(renderer: WebGLRenderer);
    addPass(pass: unknown): void;
    setSize(width: number, height: number): void;
    render(): void;
  }
}

declare module 'three/addons/postprocessing/RenderPass.js' {
  import type { Scene, Camera } from 'three';
  export class RenderPass { constructor(scene: Scene, camera: Camera); }
}

declare module 'three/addons/postprocessing/ShaderPass.js' {
  export class ShaderPass {
    uniforms: Record<string, { value: any }>;
    constructor(shader: unknown);
  }
}

declare module 'three/addons/postprocessing/OutputPass.js' {
  export class OutputPass { constructor(); }
}
