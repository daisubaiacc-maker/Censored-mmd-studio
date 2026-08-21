import * as THREE from 'three';

export const MosaicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRegionCount: { value: 0 },
    uRegionRects: {
      value: Array.from({ length: 32 }, () => new THREE.Vector4(0, 0, 0, 0)),
    },
    uRegionPixelSizes: { value: Array.from({ length: 32 }, () => 12) },
    uRegionShapes: { value: Array.from({ length: 32 }, () => 0) },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },

  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform int uRegionCount;
    uniform vec4 uRegionRects[32];
    uniform float uRegionPixelSizes[32];
    uniform float uRegionShapes[32];
    uniform vec2 uResolution;

    void main() {
      vec4 source = texture2D(tDiffuse, vUv);

      for (int i = 0; i < 32; i++) {
        if (i >= uRegionCount) break;
        vec4 r = uRegionRects[i];
        if (r.z <= 0.0 || r.w <= 0.0) continue;

        vec2 local = (vUv - r.xy) / r.zw;
        bool inside = local.x >= 0.0 && local.x <= 1.0 && local.y >= 0.0 && local.y <= 1.0;
        float shape = uRegionShapes[i];

        // Shape 0 is the common rectangle. Shape 1 is an ellipse contained
        // by the same rectangular bounds; additional shapes can reuse these bounds later.
        if (shape > 0.5) {
          vec2 centered = local * 2.0 - 1.0;
          inside = inside && dot(centered, centered) <= 1.0;
        }

        if (inside) {
          float block = max(uRegionPixelSizes[i], 1.0);
          vec2 blockCount = max(floor(uResolution / block), vec2(1.0));
          vec2 blockUv = (floor(vUv * blockCount) + 0.5) / blockCount;
          blockUv = clamp(blockUv, vec2(0.0), vec2(1.0));
          source = texture2D(tDiffuse, blockUv);
        }
      }

      gl_FragColor = source;
    }
  `,
};
