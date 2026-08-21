# Future-Proofing / Design Decisions

This document records decisions intended to prevent later feature requests from requiring large rewrites. It is a planning document; implementation can be staged.

## 1. Project data model

Treat a project as a structured scene document rather than a collection of ad-hoc UI state.

Conceptually:

```text
Project
├─ Scenes
├─ Models
├─ Poses / Animation
├─ Cameras
├─ Lighting / Environment
├─ Semantic mappings
├─ Censorship rules
├─ Focus / Perception settings
└─ Experience settings
```

Stable internal keys should be used for persisted data. UI language must never be baked into saved project data.

Project files should carry an explicit format version so future schema changes can be migrated rather than making older projects unusable.

## 2. Scene is shared by Studio and Experience

Studio and Experience should operate on the same scene representation.

- Studio: unrestricted authoring and camera control.
- Experience: player-oriented interaction and human-view constraints.

Switching between them should be a change of control/view mode, not conversion into a different scene format.

## 3. Camera architecture

Studio camera is intentionally unrestricted: no human-body rotation limits.

Experience cameras may impose human-view constraints such as neck/head rotation, eye/looking limits, and physically plausible placement.

Keep camera control separate from scene/model data so additional viewpoints (for example third-person or VR) can be added without redesigning the scene format.

## 4. Semantic layer is independent from censorship rendering

Mesh/Node meaning and censorship effects must remain separate.

```text
Model Mesh/Node
      ↓
Semantic Region
      ↓
Censorship Rules
      ↓
Censorship Renderer
```

The semantic system identifies what a node represents. Rules decide when it is protected. The renderer decides how protection is displayed.

This permits future effects beyond mosaic and permits semantic regions to be reused by focus, interaction, visibility, clothing, and other systems.

## 5. Focus / Perception is a first-class system

Do not reduce visibility to a single binary "seen/not seen" state.

The architecture should leave room for:

- peripheral visibility / rough recognition
- distance from focus point
- depth-of-field blur
- focused visibility
- immediate-on-enter censorship
- censorship triggered by focus

This is especially important for Experience / first-person play, while remaining usable in Studio photography.

## 6. Visibility is a general capability

Mesh/Node visibility should not be implemented as a special censorship feature.

The same visibility mechanism can support:

- clothing visibility
- accessory visibility
- hair variants
- temporary photography hiding
- test fixtures
- censorship state changes

A visibility change may emit an event consumed by the censorship system when a configured rule requires it.

## 7. Physics and character movement

Full physics is intentionally out of the initial scope, but the architecture should not make later physics integration impossible.

Initial Experience movement can use kinematic movement, collision, gravity/grounding, animation, and constrained character/camera movement.

The system must avoid impossible human states such as arbitrary floating or anatomically impossible camera/body orientations. This constraint belongs to Experience, not Studio.

Future physics can be introduced behind the movement/animation interfaces without replacing the whole scene architecture.

## 8. Input abstraction

PC and mobile should use the same gameplay commands rather than hard-coding keyboard/mouse behavior into gameplay systems.

Conceptually:

```text
Keyboard / Mouse / Gamepad / Touch
              ↓
          Input Layer
              ↓
     Move / Look / Focus / Interact
```

This allows PC-first development while retaining mobile usability without maintaining separate application logic.

## 9. Asset and license metadata

Models and other imported assets should have metadata available for source, author, license, license URL, attribution requirements, and related usage information where available.

This is especially important for bundled test models. A model should not be bundled merely because it is free; redistribution and modification rights must be checked.

## 10. Static web deployment

The production application should be capable of static hosting and should not require an end user's local server.

Initial target: GitHub Pages.

Development may use a local dev server, but runtime architecture should remain compatible with a static build and repository-subpath deployment.

The intended product flow is:

```text
PC authoring
    ↓
GitHub Pages published web app
    ↓
PC or smartphone browser
    ↓
Experience / viewing / light editing
```

## 11. Shareable scenes / URLs

The architecture should leave room for a future share/open-by-URL workflow. This does not require immediate implementation.

Scene identity, serialization, and asset references should therefore not depend entirely on transient UI state.

## 12. Internationalization

Internal identifiers remain English/stable. UI labels are translated through an i18n layer.

Japanese is the initial UI language, with English as the initial secondary language. Additional languages should be addable without changing project data.

## 13. Undo / Redo

Studio editing should be designed so meaningful state changes can eventually participate in Undo/Redo. Do not couple editing logic so tightly to UI widgets that adding command/history tracking later requires rewriting every editor feature.

Full history management is not required in the initial implementation; the important requirement is keeping state changes identifiable and reversible where practical.

## 14. Model references versus scene state

A scene should reference an imported model and store its scene-specific state (transform, pose/animation state, visibility, semantic overrides, etc.) rather than duplicating the model asset itself.

This allows model assets to be reused across scenes and leaves room for model replacement/update workflows later.

## 15. Pose versus Animation

Do not permanently treat a static pose and an animation as the same data type.

A pose is a snapshot/state that can be edited directly. An animation is time-varying behavior that may contain or produce poses.

The scene should be able to reference either without requiring a future rewrite of the model/character representation.

## 16. Presets and default worlds

Leave room for reusable presets and default environments/worlds. A preset should be able to initialize scene content without becoming a special one-off scene format.

This supports the planned workflow of starting from an empty Studio, a prepared preset, or a default game world.

## 17. Error isolation and recovery

Invalid or unsupported models, missing textures, malformed assets, and similar failures should be isolated to the affected asset where possible rather than crashing the entire application.

The UI should be able to report a useful failure and allow the user to continue working on the rest of the project.

## 18. Security boundary for imported assets

User-provided models and external asset URLs must be treated as untrusted input. Asset loading and parsing should be isolated from application control flow and should not assume that model data is safe merely because it is a graphics asset.

## 19. Development diagnostics

Leave room for developer diagnostics such as FPS, draw calls, triangle counts, texture/memory indicators where available, and asset-loading timing. These are diagnostic tools, not user-facing performance requirements.

## 20. Guiding principle

When choosing between a quick implementation and a small abstraction that preserves a clearly foreseeable future feature, prefer the latter when it does not add significant present complexity.

Do not implement speculative features merely for completeness. Preserve clean boundaries now; implement future features when they become necessary.
