# Architecture

## Core layers

### `core/`
Application state, scene management, shared types, and utilities.

### `mmd/`
MMD-specific functionality: PMX/PMD loading, model metadata, meshes, bones, morphs, materials, physics, and animation data. MMD details stay behind this boundary so the studio can evolve without coupling every feature to the file format.

### `renderer/`
Three.js/WebGL rendering, render targets, shaders, post-processing, and viewport rendering.

### `studio/`
User-facing viewport controls, camera, lighting, model selection, posing, and editing tools.

### `censorship/`
**First-class visual protection pipeline.** It owns censorship region data, region projection/binding, mosaic and future effects, and the final post-processing pass. It must not depend on the MMD loader.

## Censorship-first data flow

```text
Model / Bone / Geometry
        │
        ▼
Censorship binding + projection
        │
        ▼
CensorshipRegion[]  ← editable scene data
        │
        ▼
Render scene → censorship passes → Output
        │                         │
        ├── viewport              ├── screenshot
        ├── preview               ├── video frame
        └── animation             └── future export targets
```

A region may start as a screen-space rectangle, but the data model already supports future bindings to a scene object or MMD bone. The binding system can project those anchors into screen space without changing the renderer API.

## Design principles

1. **Censorship is renderer-level, not DOM-level.** It must affect the actual rendered frame so screenshots and exports cannot accidentally omit it.
2. **Scene data is authoritative.** UI controls edit `CensorshipRegion` data; they do not create a separate visual-only overlay.
3. **MMD and censorship are decoupled.** The censorship pipeline should work with any Three.js scene object, not only PMX/PMD models.
4. **Effects are extensible.** Mosaic is the first implementation; solid masks, blur, shaped masks, presets, and future effects should plug into the same region model.
5. **Bindings are future-proof.** Object/bone attachment belongs to the censorship subsystem and can be added without rewriting the PMX loader.
6. **Export uses the same pipeline.** Preview, screenshot, and future animation export should consume the same censorship state.

## Current implementation direction

Three.js' post-processing architecture provides render passes and custom shader passes, which is a good fit for region-based visual effects. The current implementation uses a mosaic pass with a fixed region budget; later versions can move region data to textures or other GPU-friendly structures if larger scenes require it.
