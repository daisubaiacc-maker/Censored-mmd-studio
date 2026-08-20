import * as THREE from 'three';

/** Material boundary for the censorship compositor. */
export class MosaicMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        tScene: { value: null },
        tMask: { value: null },
        uPixelSize: { value: 12.0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
      fragmentShader: `
        uniform sampler2D tScene;
        uniform sampler2D tMask;
        uniform float uPixelSize;
        uniform vec2 uResolution;
        varying vec2 vUv;
        void main(){
          float mask = texture2D(tMask, vUv).r;
          vec2 cell = uPixelSize / uResolution;
          vec2 uv = floor(vUv / cell) * cell + cell * 0.5;
          vec4 original = texture2D(tScene, vUv);
          vec4 mosaic = texture2D(tScene, uv);
          gl_FragColor = mix(original, mosaic, mask);
        }
      `,
      depthWrite: false,
      depthTest: false,
      transparent: false,
    });
  }
}
