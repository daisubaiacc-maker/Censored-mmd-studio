export const MosaicShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRegions: { value: [] as Array<{ rect: [number, number, number, number]; pixelSize: number }> },
    uRegionCount: { value: 0 },
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
    uniform vec2 uResolution;

    // Fixed-size arrays keep the shader predictable. The CPU can batch more
    // regions in later versions or move to a texture/SSBO-backed region list.
    const int MAX_REGIONS = 32;
    uniform vec4 uRegionRects[MAX_REGIONS];
    uniform float uRegionPixelSizes[MAX_REGIONS];

    void main() {
      vec4 source = texture2D(tDiffuse, vUv);
      vec2 uv = vUv;

      for (int i = 0; i < MAX_REGIONS; i++) {
        if (i >= uRegionCount) break;
        vec4 r = uRegionRects[i];
        bool inside = uv.x >= r.x && uv.x <= r.x + r.z &&
                      uv.y >= r.y && uv.y <= r.y + r.w;
        if (inside) {
          float block = max(uRegionPixelSizes[i], 1.0);
          vec2 pixelUv = floor(uv * uResolution / block) * block / uResolution;
          source = texture2D(tDiffuse, pixelUv);
        }
      }

      gl_FragColor = source;
    }
  `,
};
