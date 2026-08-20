# Architecture

## Core layers

### `core/`
Application state, scene management, shared types, and utilities.

### `mmd/`
MMD-specific functionality: PMX/PMD loading, model metadata, meshes, bones, morphs, materials, physics, and animation data. MMD details stay behind this boundary so the studio can evolve without coupling every feature to the file format.

### `renderer/`
Three.js/WebGL rendering, render targets, shaders, post-processing, viewport rendering, and optical focus effects.

### `studio/`
User-facing viewport controls, camera, lighting, model selection, posing, and editing tools. Pointer-driven focus belongs here as an interaction mode, while its state is consumed by rendering/censorship systems.

### `censorship/`
**First-class visual protection pipeline.** It owns censorship region data, region projection/binding, observation rules, mosaic and future effects, and the final post-processing pass. It must not depend on the MMD loader.

## Censorship-first data flow

```text
Pointer / Camera / Model / Bone / Geometry
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
     Focus state       Censorship binding
          │                   │
          │            CensorshipRegion[]
          │                   │
          └───────┬───────────┘
                  ▼
        Render scene → optical focus → censorship passes → Output
                                                   │
                         ┌─────────────────────────┼───────────────┐
                         ▼                         ▼               ▼
                     viewport                 screenshot       video frame
```

Optical blur and censorship are intentionally separate concepts. A target can be out of focus without being censored. A censorship region can remain protected regardless of focus. An observation rule can connect them explicitly: when pointer focus lands on a protected target, the censorship state may activate.

A region may start as a screen-space rectangle, but the data model supports future bindings to a scene object or MMD bone. The binding system can project those anchors into screen space without changing the renderer API.

## Pointer-focus interaction model

The planned focus mode treats the mouse pointer as the viewer's requested focal point. Raycasting identifies the object under the pointer and produces a persistent focus state. Depth-of-field rendering uses that state to make non-focused objects slightly softer.

Censorship must not be implemented as "blur until the user looks at it". Instead, the systems communicate through explicit state:

```text
pointer → raycast → focus target
                       │
                       ├── optical DOF → natural out-of-focus blur
                       │
                       └── observation rule → censorship activation
```

This distinction allows future interaction rules such as dwell time, focus-lock, deliberate inspection, accessibility controls, or alternate input devices without rewriting the censorship renderer.

## Design principles

1. **Censorship is renderer-level, not DOM-level.** It must affect the actual rendered frame so screenshots and exports cannot accidentally omit it.
2. **Scene data is authoritative.** UI controls edit `CensorshipRegion` data; they do not create a separate visual-only overlay.
3. **Focus is not censorship.** Optical depth-of-field is an independent rendering effect. Only an explicit observation rule can turn focus into a censorship state change.
4. **MMD and censorship are decoupled.** The censorship pipeline should work with any Three.js scene object, not only PMX/PMD models.
5. **Effects are extensible.** Mosaic is the first implementation; solid masks, blur, shaped masks, presets, and future effects should plug into the same region model.
6. **Bindings are future-proof.** Object/bone attachment belongs to the censorship subsystem and can be added without rewriting the PMX loader.
7. **Export uses the same pipeline.** Preview, screenshot, and future animation export should consume the same censorship state.
