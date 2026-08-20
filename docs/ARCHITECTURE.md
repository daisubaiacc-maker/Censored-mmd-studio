# Architecture

## Core layers

### `core/`
Application state, scene management, shared types, and utilities.

### `mmd/`
MMD-specific functionality: PMX/PMD parsing, model loading, bones, morphs, materials, and animation data.

### `renderer/`
Three.js/WebGL rendering, render targets, shaders, post-processing, and viewport rendering.

### `studio/`
User-facing studio functionality: viewport controls, camera, lighting, model selection, posing, and scene controls.

### `censorship/`
Visual censorship system. It should remain independent from the MMD loader so the same effect pipeline can eventually work with different scene objects.

## Design principle

Keep the rendering layer separate from editing state. A model's pose or a censorship region should be represented as scene data first, then rendered by the appropriate subsystem.
