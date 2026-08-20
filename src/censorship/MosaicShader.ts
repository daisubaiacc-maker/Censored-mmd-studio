export const MosaicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRegionCount: { value: 0 },
    uRegionRects: { value: Array.from({ length: 32 }, () => [0, 0, 0, 0]) },
    uRegionPixelSizes: { value: Array.from({ length: 32 }, () => 12) },
    uResolution: { value: [1, 1] as [number, number] },
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
    uniform vec2 uResolution;

    void main() {
      vec4 source = texture2D(tDiffuse, vUv);

      for (int i = 0; i < 32; i++) {
        if (i >= uRegionCount) break;
        vec4 r = uRegionRects[i];
        bool inside = vUv.x >= r.x && vUv.x <= r.x + r.z &&
                      vUv.y >= r.y && vUv.y <= r.y + r.w;
        if (inside) {
          float block = max(uRegionPixelSizes[i], 1.0);
          vec2 pixelUv = floor(vUv * uResolution / block) * block / uResolution;
          source = texture2D(tDiffuse, pixelUv);
        }
      }

      gl_FragColor = source;
    }
  `,
};
