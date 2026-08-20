# Roadmap

The project is intentionally **censorship-first**. MMD loading and studio controls exist to support a reliable, editable scene that can be rendered through the censorship pipeline.

## Phase 0 — Foundation

- [x] Browser application shell
- [x] Three.js viewport
- [x] Modular source layout
- [x] Censorship render pipeline boundary
- [x] Extensible censorship region data model

## Phase 1 — MMD foundation

- [x] MMD loading boundary for PMX/PMD
- [ ] Load a real PMX/PMD asset in the browser
- [ ] Model materials and textures
- [ ] Basic model selection
- [ ] Scene reset and model removal
- [ ] Identify model meshes, bones, and stable IDs for future censorship targets

## Phase 2 — Censorship core

- [x] Define censorship regions as scene data
- [x] Screen-space mosaic shader foundation
- [ ] Interactive region creation, move, resize, and delete
- [ ] Multiple simultaneous regions
- [ ] Attach a region to a model mesh
- [ ] Attach a region to an MMD bone and update its projected position every frame
- [ ] Mask/shape-based censorship options
- [ ] Solid-color and blur effects
- [ ] Per-region effect settings and presets
- [ ] Censorship preview toggle that never bypasses the saved scene data

## Phase 3 — Studio controls

- [ ] Orbit/pan/zoom camera controls
- [ ] Transform gizmos
- [ ] Bone selection
- [ ] Bone rotation and posing
- [ ] Basic lighting controls
- [ ] Visualize censorship anchors and region handles in the viewport

## Phase 4 — Scene and export

- [ ] Scene save/load, including censorship regions and bindings
- [ ] Camera presets
- [ ] Screenshot/export workflow using the same censorship pipeline as the viewport
- [ ] Animation timeline
- [ ] Animated censorship regions following bones
- [ ] Performance profiling and optimization

## Architectural rule

Censorship must remain a renderer-level system, not a cosmetic UI layer. Any future export, screenshot, animation render, or alternate renderer should consume the same censorship scene data and produce the same intended protected output.
